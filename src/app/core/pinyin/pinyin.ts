import { SILABAS_VALIDAS, TAMANHO_MAXIMO_SILABA } from './silabas-validas';

/** 1–4 = tons; 5 = tom neutro (leve). */
export type Tom = 1 | 2 | 3 | 4 | 5;

export interface Silaba {
  /** letras sem tom, ex.: "hao", "lü", "nar" (com r de erhua) */
  letras: string;
  tom: Tom;
}

const VOGAIS_COM_TOM: Record<string, string[]> = {
  a: ['ā', 'á', 'ǎ', 'à'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  u: ['ū', 'ú', 'ǔ', 'ù'],
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
};

/** 'ǎ' → ['a', 3] */
const MARCA_PARA_VOGAL = new Map<string, [string, Tom]>();
for (const [vogal, marcadas] of Object.entries(VOGAIS_COM_TOM)) {
  marcadas.forEach((m, i) => MARCA_PARA_VOGAL.set(m, [vogal, (i + 1) as Tom]));
}
// Variantes raras de "m" e "n" com tom (ḿ, ǹ, ň).
MARCA_PARA_VOGAL.set('ḿ', ['m', 2]);
MARCA_PARA_VOGAL.set('ń', ['n', 2]);
MARCA_PARA_VOGAL.set('ň', ['n', 3]);
MARCA_PARA_VOGAL.set('ǹ', ['n', 4]);

/**
 * Padroniza a escrita: minúsculas, NFC, "v"/"u:" → "ü", aspas tipográficas → apóstrofo.
 */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFC')
    .toLowerCase()
    .replace(/u:/g, 'ü')
    .replace(/v/g, 'ü')
    .replace(/[’‘`´]/g, "'")
    .trim();
}

/** Remove os acentos de tom, mantendo o ü. "nǚ'ér" → "nü'er" */
export function semTom(texto: string): string {
  let saida = '';
  for (const c of normalizar(texto)) saida += MARCA_PARA_VOGAL.get(c)?.[0] ?? c;
  return saida;
}

/** Tom de uma sílaba escrita com acento (5 se não houver acento). */
export function tomDaSilaba(silaba: string): Tom {
  for (const c of silaba.normalize('NFC').toLowerCase()) {
    const marca = MARCA_PARA_VOGAL.get(c);
    if (marca) return marca[1];
  }
  return 5;
}

/**
 * Coloca o acento do tom na vogal certa: a/e sempre levam o acento; em "ou" vai no o;
 * nos demais casos, na última vogal (liù, guǐ).
 */
export function silabaComAcento(letras: string, tom: Tom): string {
  if (tom === 5) return letras;
  let indice = letras.search(/[ae]/);
  if (indice < 0) indice = letras.indexOf('ou');
  if (indice < 0) {
    for (let i = letras.length - 1; i >= 0; i--) {
      if ('iouü'.includes(letras[i])) {
        indice = i;
        break;
      }
    }
  }
  if (indice < 0) return letras;
  const vogal = letras[indice];
  return letras.slice(0, indice) + VOGAIS_COM_TOM[vogal][tom - 1] + letras.slice(indice + 1);
}

/** "ni3 hao3" → "nǐ hǎo"; "lv4" → "lǜ"; aceita 5 ou 0 para o tom neutro. */
export function numerosParaAcentos(texto: string): string {
  return normalizar(texto).replace(/([a-zü]+)([0-5])/g, (_, letras: string, n: string) =>
    silabaComAcento(letras, (Number(n) === 0 ? 5 : Number(n)) as Tom),
  );
}

/** "nǐ hǎo" → "ni3 hao3" (tom neutro sem número). */
export function acentosParaNumeros(texto: string): string {
  return analisarPinyin(texto)
    .map((s) => (s.tom === 5 ? s.letras : `${s.letras}${s.tom}`))
    .join(' ');
}

// ---------------------------------------------------------------------------
// Leitura de pinyin (com acentos ou números, separado ou junto)
// ---------------------------------------------------------------------------

interface EntradaAnalisada {
  /** só as letras, sem tom e sem separadores */
  letras: string;
  /** índice da letra acentuada → tom */
  marcas: Map<number, Tom>;
  /** quantidade de letras antes do número → tom (ex.: "ni3" → 2 → 3) */
  numeros: Map<number, Tom>;
  /** posições onde a pessoa separou sílabas (espaço, apóstrofo, número) */
  fronteiras: Set<number>;
}

function analisarEntrada(texto: string): EntradaAnalisada {
  const resultado: EntradaAnalisada = {
    letras: '',
    marcas: new Map(),
    numeros: new Map(),
    fronteiras: new Set(),
  };
  const normalizado = [...normalizar(texto)];
  let indice = 0;
  const restante = () => normalizado.slice(indice + 1).join('');
  for (; indice < normalizado.length; indice++) {
    const c = normalizado[indice];
    const posicao = resultado.letras.length;
    const marca = MARCA_PARA_VOGAL.get(c);
    if (marca) {
      resultado.marcas.set(posicao, marca[1]);
      resultado.letras += marca[0];
    } else if (/[a-zü]/.test(c)) {
      resultado.letras += c;
    } else if (/[0-5]/.test(c)) {
      resultado.numeros.set(posicao, (c === '0' ? 5 : Number(c)) as Tom);
      if (!/^r(?![a-zāáǎàēéěèīíǐìōóǒòūúǔùüǖǘǚǜ])/.test(restante())) resultado.fronteiras.add(posicao);
    } else {
      // espaço, apóstrofo, hífen, pontuação: separadores
      resultado.fronteiras.add(posicao);
    }
  }
  resultado.fronteiras.delete(0);
  resultado.fronteiras.delete(resultado.letras.length);
  return resultado;
}

function ehSilaba(trecho: string): boolean {
  if (SILABAS_VALIDAS.has(trecho)) return true;
  // erhua: sílaba + r (nǎr, yìdiǎnr, zhèr) — "er" já é sílaba própria
  return trecho.length > 1 && trecho.endsWith('r') && SILABAS_VALIDAS.has(trecho.slice(0, -1));
}

/**
 * Separa letras em sílabas válidas, respeitando as fronteiras informadas.
 * Prefere sílabas longas, mas volta atrás quando necessário ("xian" vs "xi'an" depende do apóstrofo).
 * Retorna os pontos de corte (fim de cada sílaba) ou null se não for possível.
 */
export function segmentar(letras: string, fronteiras: ReadonlySet<number> = new Set()): number[] | null {
  const memo = new Map<number, number[] | null>();
  const resolver = (inicio: number): number[] | null => {
    if (inicio === letras.length) return [];
    if (memo.has(inicio)) return memo.get(inicio)!;
    let resposta: number[] | null = null;
    const limite = Math.min(letras.length, inicio + TAMANHO_MAXIMO_SILABA + 1);
    for (let fim = limite; fim > inicio; fim--) {
      // não pode atravessar uma fronteira marcada
      let atravessa = false;
      for (let k = inicio + 1; k < fim; k++) {
        if (fronteiras.has(k)) {
          atravessa = true;
          break;
        }
      }
      if (atravessa) continue;
      // Sem separador, uma sílaba no meio da palavra não começa com a/o/e (senão viria apóstrofo):
      // "kěnéng" = ke + neng, nunca ken + eng.
      if (inicio > 0 && !fronteiras.has(inicio) && /[aoe]/.test(letras[inicio])) continue;
      if (!ehSilaba(letras.slice(inicio, fim))) continue;
      const resto = resolver(fim);
      if (resto) {
        resposta = [fim, ...resto];
        break;
      }
    }
    memo.set(inicio, resposta);
    return resposta;
  };
  return resolver(0);
}

function tomNoIntervalo(entrada: EntradaAnalisada, inicio: number, fim: number): Tom | undefined {
  for (let i = inicio; i < fim; i++) {
    const t = entrada.marcas.get(i);
    if (t) return t;
  }
  // número logo após a sílaba (ni3) ou antes do r de erhua (dian3r)
  for (let p = fim; p > inicio; p--) {
    const t = entrada.numeros.get(p);
    if (t) return t;
  }
  return undefined;
}

/**
 * Lê um texto em pinyin ("Běijīng", "nǐ hǎo", "ni3hao3", "nǚ'ér") e devolve as sílabas.
 * Trechos que não formam sílabas válidas são devolvidos inteiros (tom 5).
 */
export function analisarPinyin(texto: string): Silaba[] {
  const entrada = analisarEntrada(texto);
  const cortes = segmentar(entrada.letras, entrada.fronteiras);
  if (!cortes) {
    return entrada.letras ? [{ letras: entrada.letras, tom: 5 }] : [];
  }
  const silabas: Silaba[] = [];
  let inicio = 0;
  for (const fim of cortes) {
    silabas.push({ letras: entrada.letras.slice(inicio, fim), tom: tomNoIntervalo(entrada, inicio, fim) ?? 5 });
    inicio = fim;
  }
  return silabas;
}

// ---------------------------------------------------------------------------
// Correção de respostas (ditado)
// ---------------------------------------------------------------------------

export type EstadoSilaba = 'certo' | 'tom-errado' | 'sem-tom' | 'letras-erradas';

export interface ComparacaoSilaba {
  esperada: string;
  digitada: string | null;
  estado: EstadoSilaba;
  nota?: string;
}

export interface ResultadoPinyin {
  correto: boolean;
  letrasCorretas: boolean;
  tonsInformados: boolean;
  silabas: ComparacaoSilaba[];
  mensagem: string;
}

export interface OpcoesComparacao {
  /** caracteres correspondentes ao pinyin esperado (ativa a tolerância de sandhi de 一 e 不) */
  hanzi?: string;
  /** se false, letras certas sem tom contam como acerto */
  exigirTons?: boolean;
  /** mensagens em inglês */
  ingles?: boolean;
}

/** Associa cada sílaba a um caractere (sílabas com erhua consomem também o 儿). */
function alinharHanzi(hanzi: string | undefined, silabas: Silaba[]): (string | undefined)[] {
  if (!hanzi) return silabas.map(() => undefined);
  const caracteres = [...hanzi].filter((c) => /\p{Script=Han}/u.test(c));
  const alinhados: (string | undefined)[] = [];
  let i = 0;
  for (const s of silabas) {
    alinhados.push(caracteres[i]);
    i += s.letras !== 'er' && s.letras.endsWith('r') && caracteres[i + 1] === '儿' ? 2 : 1;
  }
  return i === caracteres.length ? alinhados : silabas.map(() => undefined);
}

/** Tons aceitos para a sílaba esperada, considerando sandhi e tom neutro. */
function tonsAceitos(
  esperada: Silaba,
  proxima: Silaba | undefined,
  caractere: string | undefined,
  ingles = false,
): { aceitos: Set<Tom>; notas: Map<Tom, string> } {
  const txt = (pt: string, en: string) => (ingles ? en : pt);
  const aceitos = new Set<Tom>([esperada.tom]);
  const notas = new Map<Tom, string>();
  if (esperada.tom === 5) {
    // Tom neutro: aceitamos qualquer tom (muitas vezes a pessoa escreve o tom original).
    ([1, 2, 3, 4] as Tom[]).forEach((t) => {
      aceitos.add(t);
      notas.set(t, txt('Aqui a sílaba é pronunciada no tom neutro (leve).', 'Here the syllable is said in the neutral (light) tone.'));
    });
  }
  if (caractere === '一' && esperada.letras === 'yi') {
    ([1, 2, 4] as Tom[]).forEach((t) => {
      if (t !== esperada.tom) {
        aceitos.add(t);
        notas.set(t, txt(`Certo! Por causa do sandhi de 一, aqui se fala ${silabaComAcento('yi', esperada.tom)}.`, `Correct! Because of 一 sandhi, here it is said ${silabaComAcento('yi', esperada.tom)}.`));
      }
    });
  }
  if (caractere === '不' && esperada.letras === 'bu') {
    ([2, 4] as Tom[]).forEach((t) => {
      if (t !== esperada.tom) {
        aceitos.add(t);
        notas.set(t, txt(`Certo! Por causa do sandhi de 不, aqui se fala ${silabaComAcento('bu', esperada.tom)}.`, `Correct! Because of 不 sandhi, here it is said ${silabaComAcento('bu', esperada.tom)}.`));
      }
    });
  }
  if (esperada.tom === 3 && proxima?.tom === 3) {
    aceitos.add(2);
    notas.set(2, txt('Na fala vira 2º tom (sandhi 3+3), mas na escrita o pinyin mantém o 3º tom.', 'In speech it becomes a 2nd tone (3+3 sandhi), but written pinyin keeps the 3rd tone.'));
  }
  return { aceitos, notas };
}

/**
 * Compara a resposta digitada com o pinyin esperado.
 * Aceita números de tom ("ni3 hao3"), acentos ("nǐ hǎo"), sem espaços, com "v" no lugar de "ü".
 */
export function compararPinyin(
  digitado: string,
  esperado: string,
  opcoes: OpcoesComparacao = {},
): ResultadoPinyin {
  const exigirTons = opcoes.exigirTons ?? true;
  const txt = (pt: string, en: string) => (opcoes.ingles ? en : pt);
  const silabasEsperadas = analisarPinyin(esperado);
  const hanziAlinhado = alinharHanzi(opcoes.hanzi, silabasEsperadas);
  const entrada = analisarEntrada(digitado);
  const tonsInformados = entrada.marcas.size + entrada.numeros.size > 0;

  if (!entrada.letras) {
    return {
      correto: false,
      letrasCorretas: false,
      tonsInformados: false,
      silabas: silabasEsperadas.map((s) => ({
        esperada: silabaComAcento(s.letras, s.tom),
        digitada: null,
        estado: 'letras-erradas',
      })),
      mensagem: txt('Digite o pinyin do que você ouviu.', 'Type the pinyin of what you heard.'),
    };
  }

  const letrasEsperadas = silabasEsperadas.map((s) => s.letras).join('');

  // Quando as letras batem, usamos os cortes da resposta certa (mesmo que a pessoa não separe).
  let cortes: number[] | null;
  if (entrada.letras === letrasEsperadas) {
    cortes = [];
    let soma = 0;
    for (const s of silabasEsperadas) cortes.push((soma += s.letras.length));
  } else {
    cortes = segmentar(entrada.letras, entrada.fronteiras);
  }

  const silabasDigitadas: { letras: string; tom: Tom | undefined }[] = [];
  if (cortes) {
    let inicio = 0;
    for (const fim of cortes) {
      silabasDigitadas.push({ letras: entrada.letras.slice(inicio, fim), tom: tomNoIntervalo(entrada, inicio, fim) });
      inicio = fim;
    }
  }

  const silabas: ComparacaoSilaba[] = silabasEsperadas.map((esperada, i) => {
    const digitada = silabasDigitadas[i];
    const textoEsperado = silabaComAcento(esperada.letras, esperada.tom);
    if (!digitada || digitada.letras !== esperada.letras) {
      return {
        esperada: textoEsperado,
        digitada: digitada ? silabaComAcento(digitada.letras, digitada.tom ?? 5) : null,
        estado: 'letras-erradas',
      };
    }
    const textoDigitado = silabaComAcento(digitada.letras, digitada.tom ?? 5);
    if (digitada.tom === undefined) {
      const ok = esperada.tom === 5 || !exigirTons;
      return { esperada: textoEsperado, digitada: textoDigitado, estado: ok ? 'certo' : 'sem-tom' };
    }
    const { aceitos, notas } = tonsAceitos(esperada, silabasEsperadas[i + 1], hanziAlinhado[i], opcoes.ingles);
    if (aceitos.has(digitada.tom)) {
      return { esperada: textoEsperado, digitada: textoDigitado, estado: 'certo', nota: notas.get(digitada.tom) };
    }
    return { esperada: textoEsperado, digitada: textoDigitado, estado: 'tom-errado' };
  });

  const sobrando = silabasDigitadas.length > silabasEsperadas.length;
  const letrasCorretas = !sobrando && silabas.every((s) => s.estado !== 'letras-erradas');
  const correto = letrasCorretas && silabas.every((s) => s.estado === 'certo');

  let mensagem: string;
  if (correto) {
    mensagem = txt('Correto!', 'Correct!');
  } else if (!letrasCorretas) {
    mensagem = sobrando
      ? txt('Você digitou sílabas a mais.', 'You typed extra syllables.')
      : txt('Algumas sílabas estão diferentes.', 'Some syllables are different.');
  } else if (!tonsInformados) {
    mensagem = txt(
      'As letras estão certas, mas faltaram os tons. Use números (ni3 hao3) ou acentos (nǐ hǎo).',
      'The letters are right, but the tones are missing. Use numbers (ni3 hao3) or tone marks (nǐ hǎo).',
    );
  } else if (silabas.some((s) => s.estado === 'sem-tom')) {
    mensagem = txt('As letras estão certas, mas faltou o tom em alguma sílaba.', 'The letters are right, but a syllable is missing its tone.');
  } else {
    mensagem = txt('As letras estão certas, mas há tom errado.', 'The letters are right, but a tone is wrong.');
  }

  return { correto, letrasCorretas, tonsInformados, silabas, mensagem };
}
