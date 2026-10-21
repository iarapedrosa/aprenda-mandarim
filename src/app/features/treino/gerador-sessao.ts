import { Frase, Palavra } from '../../core/dados/modelos';
import { InfoCaractere, caracteresDe } from '../../core/dados/vocabulario.service';
import { analisarPinyin, silabaComAcento, Tom } from '../../core/pinyin/pinyin';
import { EstadoProgresso } from '../../core/progresso/progresso.model';
import { CartaoSrs, cartoesVencidos } from '../../core/srs/sm2';
import { embaralhar, montarAlternativas, sortear } from '../../core/util/aleatorio';
import { DataISO } from '../../core/util/datas';
import { numero } from '../../core/numeros/numeros';
import { LICOES_PINYIN, LicaoPinyin, exerciciosDaLicao, itemTom } from './curriculo';
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
  /** itens de frase (ditado/shadowing/leitura) gerados por outros módulos */
  itensDeFrase?: (palavrasConhecidas: Palavra[]) => ItemSessao[];
}

export type Etapa = 'pinyin' | 'palavras' | 'frases';

export interface PlanoSessao {
  etapa: Etapa;
  itens: ItemSessao[];
  /** aviso sobre revisões acumuladas, para mostrar na página inicial */
  aviso?: string;
  resumo: { licoes: number; revisoes: number; novas: number; escrita: number; frases: number; minutos: number };
}

/** Quantas lições de pinyin precisam estar prontas para liberar o vocabulário. */
export const LICOES_PARA_LIBERAR_PALAVRAS = 2;
/** Palavras estudadas para liberar frases (ditado, shadowing, leitura) no treino. */
export const PALAVRAS_PARA_LIBERAR_FRASES = 30;
const MAX_LICOES_POR_DIA = 2;
const MAX_ESCRITA_NOVA = 3;

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

type TipoExercicioPalavra = 'reconhecer' | 'audio-hanzi' | 'significado-hanzi' | 'tons-palavra' | 'digitar-pinyin';

function podeTreinarTons(p: Palavra): boolean {
  if (p.hanzi.includes('…')) return false;
  const s = analisarPinyin(p.pinyin);
  return s.length >= 1 && s.length <= 3 && s.some((x) => x.tom !== 5);
}

function tiposPorMaturidade(cartao: CartaoSrs | undefined, p: Palavra): TipoExercicioPalavra[] {
  const rep = cartao?.repeticoes ?? 0;
  const tons = podeTreinarTons(p);
  if (rep <= 1) return ['reconhecer', 'audio-hanzi'];
  if (rep <= 3) return tons ? ['significado-hanzi', 'audio-hanzi', 'tons-palavra'] : ['significado-hanzi', 'audio-hanzi'];
  return p.hanzi.includes('…')
    ? ['significado-hanzi', 'audio-hanzi']
    : ['digitar-pinyin', 'significado-hanzi', ...(tons ? (['tons-palavra'] as const) : [])];
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
  const resposta = { hanzi: p.hanzi, pinyin: p.pinyin, traducao: p.traducao };
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
        pergunta: { hanzi: p.hanzi, pinyin: p.pinyin, audio: p.hanzi },
        opcoes: opcoes.map((o) => ({ valor: o.id, rotulo: o.traducao })),
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
        pergunta: { texto: p.traducao },
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
        pergunta: { hanzi: p.hanzi, audio: p.hanzi, texto: p.traducao },
        opcoes: variacoes.map((v) => ({ valor: v, rotulo: v, pinyin: true })),
        correta,
        cartao: ref,
        tons,
        resposta,
      };
    }
    case 'digitar-pinyin':
      return {
        id: novoId('pin'),
        tipo: 'digitar-pinyin',
        modulo: 'pinyin',
        enunciado: 'Escreva o pinyin (com tons)',
        hanzi: p.hanzi,
        pinyin: p.pinyin,
        traducao: p.traducao,
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
    pergunta: { hanzi: f.hanzi, audio: f.hanzi },
    opcoes: opcoes.map((o) => ({ valor: o.id, rotulo: o.traducao })),
    correta: f.id,
    cartao: { tipo: 'frase', ref: f.id },
    resposta: { hanzi: f.hanzi, pinyin: f.pinyin, traducao: f.traducao },
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
    pergunta: { audio: n.hanzi },
    opcoes: embaralhar([...opcoes]).map((o) => ({ valor: String(o), rotulo: o.toLocaleString('pt-BR') })),
    correta: String(alvo),
    tons: analisarPinyin(n.pinyin).map((s) => s.tom),
    resposta: { hanzi: n.hanzi, pinyin: n.pinyin, traducao: alvo.toLocaleString('pt-BR') },
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
): { limiteRevisoes: number; fatorNovas: number; aviso?: string } {
  if (pendentes <= meta) return { limiteRevisoes: meta, fatorNovas: 1 };
  const limiteRevisoes = Math.min(pendentes, meta * 2);
  if (pendentes > meta * 3) {
    return {
      limiteRevisoes,
      fatorNovas: 0,
      aviso: `Você tem ${pendentes} revisões acumuladas. Hoje o treino foca nelas, sem palavras novas — assim a memória não fica para trás.`,
    };
  }
  if (pendentes > meta * 1.5) {
    return {
      limiteRevisoes,
      fatorNovas: 0.5,
      aviso: `Há ${pendentes} revisões acumuladas: hoje entram menos palavras novas para o acúmulo baixar.`,
    };
  }
  return { limiteRevisoes, fatorNovas: 1 };
}

// ---------------------------------------------------------------------------
// Sessão
// ---------------------------------------------------------------------------

const MINUTOS: Record<ItemSessao['tipo'], number> = {
  licao: 1,
  escolha: 0.35,
  apresentar: 0.6,
  'digitar-pinyin': 0.6,
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
  const resumo = { licoes: 0, revisoes: 0, novas: 0, escrita: 0, frases: 0, minutos: 0 };
  let aviso: string | undefined;

  // 1. Aquecimento de tons
  for (const s of embaralhar(ctx.silabasAquecimento).slice(0, 3)) itens.push(itemTom(s.hanzi, s.pinyin, s.letras));

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

    // 3. Revisões vencidas
    const meta = estado.metas.revisoesPorDia;
    const pendentes = cartoesVencidos(Object.values(estado.cartoes), hoje).filter((c) => c.ultimaRevisao !== hoje).length;
    const acumulo = acumuloDeRevisoes(pendentes, meta);
    // com atraso, o limite cresce até o dobro da meta, para o acúmulo baixar
    const limiteRevisoes = Math.max(0, acumulo.limiteRevisoes - (atividade?.revisoes ?? 0));
    aviso = acumulo.aviso;
    const revisoes: ItemSessao[] = [];
    for (const c of cartoesVencidos(Object.values(estado.cartoes), hoje)) {
      if (revisoes.length >= limiteRevisoes) break;
      if (c.ultimaRevisao === hoje) continue;
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
      if (caracteresNovos.length >= MAX_ESCRITA_NOVA) break;
      if (c.tipo !== 'palavra' || c.revisoes === 0 || c.criadoEm >= hoje) continue;
      const p = porId.get(c.ref);
      for (const ch of p ? caracteresDe(p.hanzi) : []) {
        if (!comEscrita.has(ch) && !caracteresNovos.includes(ch) && caracteresNovos.length < MAX_ESCRITA_NOVA) {
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
      resumo.frases = deFrase.length;
    }
  }

  resumo.minutos = Math.max(1, Math.round(itens.reduce((t, i) => t + MINUTOS[i.tipo], 0)));
  return { etapa, itens, resumo, aviso };
}
