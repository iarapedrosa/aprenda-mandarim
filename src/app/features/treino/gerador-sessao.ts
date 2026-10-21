import { LicaoGramatica } from '../../core/dados/gramatica.service';
import { Frase, Palavra } from '../../core/dados/modelos';
import { InfoCaractere, caracteresDe } from '../../core/dados/vocabulario.service';
import { analisarPinyin, silabaComAcento, Tom } from '../../core/pinyin/pinyin';
import { EstadoProgresso } from '../../core/progresso/progresso.model';
import { CartaoSrs, cartoesVencidos } from '../../core/srs/sm2';
import { embaralhar, montarAlternativas, sortear } from '../../core/util/aleatorio';
import { DataISO } from '../../core/util/datas';
import { numero } from '../../core/numeros/numeros';
import { palavrasPorPar } from '../../core/pinyin/pares-tons';
import { pesosDosTons, sortearPonderado } from '../../core/progresso/tons-dificeis';
import { tomDaSilaba } from '../../core/pinyin/pinyin';
import { LICOES_PINYIN, LicaoPinyin, exerciciosDaLicao, itemParDeTons, itemTom } from './curriculo';
import { itensDaLicaoGramatica } from './gramatica-itens';
import { segmentarFrase } from '../../core/dados/segmentar';
import { ItemEscolha, ItemSessao } from './sessao.model';

export interface FraseComId extends Frase {
  id: string;
  nota?: string;
}

export interface SilabaAquecimento {
  hanzi: string;
  pinyin: string;
  letras: string;
}

export interface ContextoSessao {
  hoje: DataISO;
  estado: EstadoProgresso;
  palavras: Palavra[];
  frases: FraseComId[];
  infoCaractere: (c: string) => InfoCaractere;
  silabasAquecimento: SilabaAquecimento[];
  /** mini-lições de gramática (entram aos poucos, conforme o vocabulário) */
  gramatica?: LicaoGramatica[];
  /** itens de frase (ditado/shadowing/leitura) gerados por outros módulos */
  itensDeFrase?: (palavrasConhecidas: Palavra[]) => ItemSessao[];
}

export type Etapa = 'pinyin' | 'palavras' | 'frases';

export interface PlanoSessao {
  etapa: Etapa;
  itens: ItemSessao[];
  /** aviso sobre revisões acumuladas, para mostrar na página inicial */
  aviso?: string;
  avisoEn?: string;
  resumo: { licoes: number; gramatica: number; revisoes: number; novas: number; escrita: number; frases: number; minutos: number };
}

/** Quantas lições de pinyin precisam estar prontas para liberar o vocabulário. */
export const LICOES_PARA_LIBERAR_PALAVRAS = 2;
/** Palavras estudadas para liberar frases (ditado, shadowing, leitura) no treino. */
export const PALAVRAS_PARA_LIBERAR_FRASES = 30;
const MAX_LICOES_POR_DIA = 2;
/** Escrita à mão por modo: caracteres novos e revisões por sessão. */
const ESCRITA = {
  normal: { novos: 3, revisoes: Infinity },
  leve: { novos: 1, revisoes: 3 },
  desligada: { novos: 0, revisoes: 0 },
} as const;

/**
 * O vocabulário entra a partir do dia seguinte ao das primeiras lições de pinyin
 * (pinyin e tons primeiro!), ou na hora, se todas as lições já foram feitas.
 */
export function palavrasLiberadas(estado: EstadoProgresso, hoje: DataISO): boolean {
  const datas = Object.values(estado.licoesPinyin);
  if (datas.length >= LICOES_PINYIN.length) return true;
  return datas.length >= LICOES_PARA_LIBERAR_PALAVRAS && datas.some((d) => d < hoje);
}

export function etapaAtual(estado: EstadoProgresso, hoje: DataISO): Etapa {
  if (!palavrasLiberadas(estado, hoje)) return 'pinyin';
  const estudadas = Object.values(estado.cartoes).filter((c) => c.tipo === 'palavra' && c.revisoes > 0);
  return estudadas.length >= PALAVRAS_PARA_LIBERAR_FRASES ? 'frases' : 'palavras';
}

let contador = 0;
const novoId = (prefixo: string) => `${prefixo}-${Date.now().toString(36)}-${++contador}`;

// ---------------------------------------------------------------------------
// Exercícios de palavra
// ---------------------------------------------------------------------------

type TipoExercicioPalavra = 'reconhecer' | 'audio-hanzi' | 'significado-hanzi' | 'tons-palavra' | 'digitar-pinyin' | 'teclado';

function podeTreinarTons(p: Palavra): boolean {
  if (p.hanzi.includes('…')) return false;
  const s = analisarPinyin(p.pinyin);
  return s.length >= 1 && s.length <= 3 && s.some((x) => x.tom !== 5);
}

function tiposPorMaturidade(cartao: CartaoSrs | undefined, p: Palavra): TipoExercicioPalavra[] {
  const rep = cartao?.repeticoes ?? 0;
  const tons = podeTreinarTons(p);
  if (rep <= 1) return ['reconhecer', 'audio-hanzi'];
  const teclado = p.hanzi.includes('…') ? [] : (['teclado'] as const);
  if (rep <= 3) {
    return tons
      ? ['significado-hanzi', 'audio-hanzi', 'tons-palavra', ...teclado]
      : ['significado-hanzi', 'audio-hanzi', ...teclado];
  }
  return p.hanzi.includes('…')
    ? ['significado-hanzi', 'audio-hanzi']
    : ['digitar-pinyin', 'significado-hanzi', 'teclado', ...(tons ? (['tons-palavra'] as const) : [])];
}

function distratores(p: Palavra, todas: Palavra[]): Palavra[] {
  const outras = todas.filter((o) => o.id !== p.id && o.hanzi !== p.hanzi && o.traducao !== p.traducao);
  const mesmoNivel = outras.filter((o) => o.nivel === p.nivel);
  return mesmoNivel.length >= 6 ? mesmoNivel : outras;
}

/** Variações de tom de uma palavra (para "qual é o tom certo?"). */
function variacoesDeTom(p: Palavra): string[] {
  const silabas = analisarPinyin(p.pinyin);
  const correta = silabas.map((s) => silabaComAcento(s.letras, s.tom)).join(' ');
  const variacoes = new Set<string>([correta]);
  let tentativas = 0;
  while (variacoes.size < 4 && tentativas++ < 40) {
    const nova = silabas
      .map((s) => {
        if (s.tom === 5) return s.letras;
        const tom = Math.random() < 0.6 ? ((Math.floor(Math.random() * 4) + 1) as Tom) : s.tom;
        return silabaComAcento(s.letras, tom);
      })
      .join(' ');
    variacoes.add(nova);
  }
  return embaralhar([...variacoes]);
}

export function exercicioDePalavra(
  p: Palavra,
  cartao: CartaoSrs | undefined,
  todas: Palavra[],
  tipo?: TipoExercicioPalavra,
): ItemSessao {
  const escolhido = tipo ?? sortear(tiposPorMaturidade(cartao, p));
  const ref = { tipo: 'palavra' as const, ref: p.id };
  const resposta = { hanzi: p.hanzi, pinyin: p.pinyin, traducao: p.traducao, traducaoEn: p.traducaoEn };
  const tons = analisarPinyin(p.pinyin)
    .map((s) => s.tom)
    .filter((t) => t !== 5);
  const candidatos = distratores(p, todas);

  switch (escolhido) {
    case 'reconhecer': {
      const opcoes = montarAlternativas(p, candidatos, 4, (o) => o.traducao);
      return {
        id: novoId('rec'),
        tipo: 'escolha',
        modulo: 'caracteres',
        enunciado: 'O que significa?',
        enunciadoEn: 'What does it mean?',
        pergunta: { hanzi: p.hanzi, pinyin: p.pinyin, audio: p.hanzi },
        opcoes: opcoes.map((o) => ({ valor: o.id, rotulo: o.traducao, rotuloEn: o.traducaoEn })),
        correta: p.id,
        cartao: ref,
        resposta,
      };
    }
    case 'audio-hanzi': {
      const opcoes = montarAlternativas(p, candidatos, 4, (o) => o.hanzi);
      return {
        id: novoId('aud'),
        tipo: 'escolha',
        modulo: 'escuta',
        enunciado: 'Ouça e escolha a palavra',
        enunciadoEn: 'Listen and choose the word',
        pergunta: { audio: p.hanzi },
        opcoes: opcoes.map((o) => ({ valor: o.id, rotulo: o.hanzi, hanzi: true })),
        correta: p.id,
        cartao: ref,
        resposta,
      };
    }
    case 'significado-hanzi': {
      const opcoes = montarAlternativas(p, candidatos, 4, (o) => o.hanzi);
      return {
        id: novoId('sig'),
        tipo: 'escolha',
        modulo: 'caracteres',
        enunciado: 'Como se escreve?',
        enunciadoEn: 'How is it written?',
        pergunta: { texto: p.traducao, textoEn: p.traducaoEn },
        opcoes: opcoes.map((o) => ({ valor: o.id, rotulo: o.hanzi, hanzi: true })),
        correta: p.id,
        cartao: ref,
        resposta,
      };
    }
    case 'tons-palavra': {
      const variacoes = variacoesDeTom(p);
      const correta = analisarPinyin(p.pinyin)
        .map((s) => silabaComAcento(s.letras, s.tom))
        .join(' ');
      return {
        id: novoId('ton'),
        tipo: 'escolha',
        modulo: 'tons',
        enunciado: 'Ouça: quais são os tons?',
        enunciadoEn: 'Listen: what are the tones?',
        pergunta: { hanzi: p.hanzi, audio: p.hanzi, texto: p.traducao, textoEn: p.traducaoEn },
        opcoes: variacoes.map((v) => ({ valor: v, rotulo: v, pinyin: true })),
        correta,
        cartao: ref,
        tons,
        resposta,
      };
    }
    case 'teclado':
      return { id: novoId('tec'), tipo: 'teclado', palavra: p, cartao: ref };
    case 'digitar-pinyin':
      return {
        id: novoId('pin'),
        tipo: 'digitar-pinyin',
        modulo: 'pinyin',
        enunciado: 'Escreva o pinyin (com tons)',
        enunciadoEn: 'Type the pinyin (with tones)',
        hanzi: p.hanzi,
        pinyin: p.pinyin,
        traducao: p.traducao,
        traducaoEn: p.traducaoEn,
        soAudio: false,
        cartao: ref,
      };
  }
}

function exercicioDeFrase(f: FraseComId, frases: FraseComId[]): ItemEscolha {
  const opcoes = montarAlternativas(f, frases, 4, (o) => o.traducao);
  return {
    id: novoId('fra'),
    tipo: 'escolha',
    modulo: 'leitura',
    enunciado: 'O que significa esta frase?',
    enunciadoEn: 'What does this sentence mean?',
    pergunta: { hanzi: f.hanzi, audio: f.hanzi },
    opcoes: opcoes.map((o) => ({ valor: o.id, rotulo: o.traducao, rotuloEn: o.traducaoEn })),
    correta: f.id,
    cartao: { tipo: 'frase', ref: f.id },
    resposta: { hanzi: f.hanzi, pinyin: f.pinyin, traducao: f.traducao, traducaoEn: f.traducaoEn },
  };
}

function nivelEscrita(cartao: CartaoSrs | undefined): 'contorno' | 'sem-contorno' | 'memoria' {
  const rep = cartao?.repeticoes ?? 0;
  if (rep <= 1) return 'contorno';
  if (rep <= 3) return 'sem-contorno';
  return 'memoria';
}

/** "Ouça e escolha o número" com alternativas próximas. */
export function itemNumero(maximo: number): ItemEscolha {
  const sortearN = () => Math.floor(Math.random() * (maximo + 1));
  const alvo = sortearN();
  const opcoes = new Set([alvo]);
  while (opcoes.size < 4) opcoes.add(sortearN());
  const n = numero(alvo);
  return {
    id: novoId('num'),
    tipo: 'escolha',
    modulo: 'numeros',
    enunciado: 'Ouça e escolha o número',
    enunciadoEn: 'Listen and choose the number',
    pergunta: { audio: n.hanzi },
    opcoes: embaralhar([...opcoes]).map((o) => ({ valor: String(o), rotulo: o.toLocaleString('pt-BR'), rotuloEn: o.toLocaleString('en-US') })),
    correta: String(alvo),
    tons: analisarPinyin(n.pinyin).map((s) => s.tom),
    resposta: { hanzi: n.hanzi, pinyin: n.pinyin, traducao: alvo.toLocaleString('pt-BR'), traducaoEn: alvo.toLocaleString('en-US') },
  };
}

/**
 * Controle do acúmulo de revisões:
 * - até a meta: tudo normal;
 * - acima da meta: o limite do dia sobe (até 2× a meta);
 * - acima de 1,5× a meta: metade das palavras novas;
 * - acima de 3× a meta: nenhuma palavra nova até o acúmulo baixar ("modo recuperação").
 */
export function acumuloDeRevisoes(
  pendentes: number,
  meta: number,
): { limiteRevisoes: number; fatorNovas: number; aviso?: string; avisoEn?: string } {
  if (pendentes <= meta) return { limiteRevisoes: meta, fatorNovas: 1 };
  const limiteRevisoes = Math.min(pendentes, meta * 2);
  if (pendentes > meta * 3) {
    return {
      limiteRevisoes,
      fatorNovas: 0,
      aviso: `Você tem ${pendentes} revisões acumuladas. Hoje o treino foca nelas, sem palavras novas — assim a memória não fica para trás.`,
      avisoEn: `You have ${pendentes} reviews piled up. Today's training focuses on them, with no new words — so your memory doesn't fall behind.`,
    };
  }
  if (pendentes > meta * 1.5) {
    return {
      limiteRevisoes,
      fatorNovas: 0.5,
      aviso: `Há ${pendentes} revisões acumuladas: hoje entram menos palavras novas para o acúmulo baixar.`,
      avisoEn: `There are ${pendentes} reviews piled up: fewer new words today so the backlog goes down.`,
    };
  }
  return { limiteRevisoes, fatorNovas: 1 };
}

/** Palavras do vocabulário (para separar frases em pedaços). */
export function dicionarioDe(palavras: Palavra[]): Set<string> {
  return new Set(palavras.filter((p) => !p.hanzi.includes('…')).map((p) => p.hanzi));
}

/** "Monte a frase" com o exemplo de uma palavra (só frases de 3 a 8 pedaços). */
export function itemMontar(frase: Frase, dicionario: Set<string>): ItemSessao | null {
  const pedacos = segmentarFrase(frase.hanzi, dicionario);
  if (pedacos.length < 3 || pedacos.length > 8) return null;
  return { id: novoId('mon'), tipo: 'montar', frase, pedacos };
}

// ---------------------------------------------------------------------------
// Sessão
// ---------------------------------------------------------------------------

const MINUTOS: Record<ItemSessao['tipo'], number> = {
  licao: 1,
  gramatica: 1.5,
  escolha: 0.35,
  apresentar: 0.6,
  'digitar-pinyin': 0.6,
  montar: 0.7,
  teclado: 0.5,
  escrever: 0.8,
  falar: 1,
};

/**
 * Monta o "Treino de hoje": aquecimento de tons → lições de pinyin pendentes →
 * revisões vencidas (SM-2) → palavras novas → escrita de caracteres → frases.
 */
export function gerarSessao(ctx: ContextoSessao, opcoes: { extraNovas?: number } = {}): PlanoSessao {
  const { estado, hoje, palavras } = ctx;
  const etapa = etapaAtual(estado, hoje);
  const atividade = estado.atividade[hoje];
  const itens: ItemSessao[] = [];
  const resumo = { licoes: 0, gramatica: 0, revisoes: 0, novas: 0, escrita: 0, frases: 0, minutos: 0 };
  let aviso: string | undefined;
  let avisoEn: string | undefined;

  // 1. Aquecimento de tons: duas sílabas soltas + um par de tons (palavra de 2 sílabas)
  //    Os tons que a pessoa mais confunde aparecem mais (Hao, 2012: 2º × 3º é a confusão clássica).
  const pesos = pesosDosTons(estado.confusaoTons ?? {});
  const porPar = palavrasPorPar(palavras);
  const chavesPar = [...porPar.keys()];
  const par = chavesPar.length
    ? sortear(porPar.get(sortearPonderado(chavesPar, (k) => { const [a, b] = k.split('-').map(Number); return pesos[a as 1] * pesos[b as 1]; }))!)
    : null;
  const quantas = par ? 2 : 3;
  const silabas = [...ctx.silabasAquecimento];
  for (let i = 0; i < quantas && silabas.length; i++) {
    const s = sortearPonderado(silabas, (x) => pesos[tomDaSilaba(x.pinyin)]);
    silabas.splice(silabas.indexOf(s), 1);
    itens.push(itemTom(s.hanzi, s.pinyin, s.letras));
  }
  if (par) itens.push(itemParDeTons(par));

  // 2. Lições de pinyin pendentes (no máximo 2 por dia)
  const feitasHoje = Object.values(estado.licoesPinyin).filter((d) => d === hoje).length;
  const pendentes: LicaoPinyin[] = LICOES_PINYIN.filter((l) => !estado.licoesPinyin[l.id]).slice(
    0,
    Math.max(0, MAX_LICOES_POR_DIA - feitasHoje),
  );
  for (const licao of pendentes) {
    itens.push({ id: novoId('lic'), tipo: 'licao', dados: licao, licao: licao.id });
    for (const ex of exerciciosDaLicao(licao)) itens.push({ ...ex, licao: licao.id });
    resumo.licoes++;
  }

  if (etapa !== 'pinyin') {
    const porId = new Map(palavras.map((p) => [p.id, p]));
    const frasesPorId = new Map(ctx.frases.map((f) => [f.id, f]));

    // 2b. Gramática: no máximo uma lição nova por dia, quando houver vocabulário para ela
    const estudadasAgora = Object.values(estado.cartoes).filter((c) => c.tipo === 'palavra' && c.revisoes > 0).length;
    const gramaticaHoje = Object.values(estado.licoesGramatica ?? {}).some((d) => d === hoje);
    const proximaGramatica = (ctx.gramatica ?? []).find(
      (l) => !estado.licoesGramatica?.[l.id] && l.minPalavras <= estudadasAgora,
    );
    if (proximaGramatica && !gramaticaHoje) {
      itens.push({ id: novoId('gram'), tipo: 'gramatica', dados: proximaGramatica, licao: `gramatica:${proximaGramatica.id}` });
      itens.push(...itensDaLicaoGramatica(proximaGramatica));
      resumo.gramatica = 1;
    }

    // 3. Revisões vencidas
    const meta = estado.metas.revisoesPorDia;
    const pendentes = cartoesVencidos(Object.values(estado.cartoes), hoje).filter((c) => c.ultimaRevisao !== hoje).length;
    const acumulo = acumuloDeRevisoes(pendentes, meta);
    // com atraso, o limite cresce até o dobro da meta, para o acúmulo baixar
    const limiteRevisoes = Math.max(0, acumulo.limiteRevisoes - (atividade?.revisoes ?? 0));
    aviso = acumulo.aviso;
    avisoEn = acumulo.avisoEn;
    const escrita = ESCRITA[estado.metas.escrita ?? 'leve'];
    let revisoesEscrita = 0;
    const revisoes: ItemSessao[] = [];
    for (const c of cartoesVencidos(Object.values(estado.cartoes), hoje)) {
      if (revisoes.length >= limiteRevisoes) break;
      if (c.ultimaRevisao === hoje) continue;
      if (c.tipo === 'escrita' && revisoesEscrita++ >= escrita.revisoes) continue;
      if (c.tipo === 'palavra' && porId.has(c.ref)) {
        revisoes.push(exercicioDePalavra(porId.get(c.ref)!, c, palavras));
      } else if (c.tipo === 'escrita') {
        revisoes.push({
          id: novoId('esc'),
          tipo: 'escrever',
          caractere: ctx.infoCaractere(c.ref),
          nivel: nivelEscrita(c),
          cartao: { tipo: 'escrita', ref: c.ref },
        });
      } else if (c.tipo === 'frase' && frasesPorId.has(c.ref)) {
        revisoes.push(exercicioDeFrase(frasesPorId.get(c.ref)!, ctx.frases));
      }
    }
    itens.push(...embaralhar(revisoes));
    resumo.revisoes = revisoes.length;

    // 4. Palavras novas (primeiro as que a pessoa adicionou, depois na ordem do vocabulário)
    const limiteNovas =
      Math.max(0, Math.floor(estado.metas.novasPorDia * acumulo.fatorNovas) - (atividade?.novas ?? 0)) +
      (opcoes.extraNovas ?? 0);
    const adicionadas = Object.values(estado.cartoes)
      .filter((c) => c.tipo === 'palavra' && c.revisoes === 0 && porId.has(c.ref))
      .map((c) => porId.get(c.ref)!);
    const ineditas = palavras.filter((p) => !estado.cartoes[`palavra:${p.id}`]);
    const novas = [...adicionadas, ...ineditas].slice(0, limiteNovas);
    for (let i = 0; i < novas.length; i += 3) {
      const grupo = novas.slice(i, i + 3);
      for (const p of grupo) itens.push({ id: novoId('apr'), tipo: 'apresentar', palavra: p });
      for (const p of embaralhar(grupo)) itens.push(exercicioDePalavra(p, undefined, palavras, 'reconhecer'));
    }
    resumo.novas = novas.length;

    // 5. Escrita: caracteres de palavras aprendidas em dias anteriores
    const comEscrita = new Set(
      Object.values(estado.cartoes)
        .filter((c) => c.tipo === 'escrita')
        .map((c) => c.ref),
    );
    const caracteresNovos: string[] = [];
    for (const c of Object.values(estado.cartoes)) {
      if (caracteresNovos.length >= escrita.novos) break;
      if (c.tipo !== 'palavra' || c.revisoes === 0 || c.criadoEm >= hoje) continue;
      const p = porId.get(c.ref);
      for (const ch of p ? caracteresDe(p.hanzi) : []) {
        if (!comEscrita.has(ch) && !caracteresNovos.includes(ch) && caracteresNovos.length < escrita.novos) {
          caracteresNovos.push(ch);
        }
      }
    }
    for (const ch of caracteresNovos) {
      itens.push({
        id: novoId('esc'),
        tipo: 'escrever',
        caractere: ctx.infoCaractere(ch),
        nivel: 'contorno',
        cartao: { tipo: 'escrita', ref: ch },
      });
    }
    resumo.escrita = caracteresNovos.length;

    // 5b. Monte a frase: exemplos de palavras já estudadas (frases > palavras soltas)
    const comExemplo = Object.values(estado.cartoes)
      .filter((c) => c.tipo === 'palavra' && c.revisoes > 0 && porId.get(c.ref)?.exemplo)
      .map((c) => porId.get(c.ref)!);
    if (comExemplo.length >= 5) {
      const dicionario = dicionarioDe(palavras);
      const quantidade = etapa === 'frases' ? 2 : 1;
      let adicionadas = 0;
      for (const p of embaralhar(comExemplo)) {
        if (adicionadas >= quantidade) break;
        const item = itemMontar(p.exemplo!, dicionario);
        if (item) {
          itens.push(item);
          adicionadas++;
        }
      }
      resumo.frases += adicionadas;
    }

    // 6. Números: ouvir e reconhecer (as faixas crescem com o vocabulário estudado)
    const estudadas = Object.values(estado.cartoes).filter((c) => c.tipo === 'palavra' && c.revisoes > 0).length;
    const maximo = estudadas < 30 ? 10 : estudadas < 80 ? 99 : 999;
    for (let k = 0; k < 2; k++) itens.push(itemNumero(maximo));

    // 7. Frases (ditado, shadowing…), quando já há vocabulário suficiente
    if (etapa === 'frases' && ctx.itensDeFrase) {
      const conhecidas = Object.values(estado.cartoes)
        .filter((c) => c.tipo === 'palavra' && c.revisoes > 0 && porId.has(c.ref))
        .map((c) => porId.get(c.ref)!);
      const deFrase = ctx.itensDeFrase(conhecidas);
      itens.push(...deFrase);
      resumo.frases += deFrase.length;
    }
  }

  resumo.minutos = Math.max(1, Math.round(itens.reduce((t, i) => t + MINUTOS[i.tipo], 0)));
  return { etapa, itens, resumo, aviso, avisoEn };
}
