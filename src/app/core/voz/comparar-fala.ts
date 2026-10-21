import { pinyin } from 'pinyin-pro';

export type EstadoCaractere = 'certo' | 'homofono' | 'faltou' | 'sobrou';

export interface PedacoComparacao {
  caractere: string;
  estado: EstadoCaractere;
  /** para homófonos: o caractere que o reconhecimento escreveu */
  ouvido?: string;
}

export interface ResultadoFala {
  /** 0–100: proporção de caracteres esperados que foram reconhecidos */
  pontuacao: number;
  pedacos: PedacoComparacao[];
  esperadoLimpo: string;
  ouvidoLimpo: string;
}

const DIGITOS = '零一二三四五六七八九';

/** 25 → 二十五; 10 → 十; 105 → 一百零五 (até 9999). */
export function numeroParaHanzi(n: number): string {
  if (n < 10) return DIGITOS[n];
  if (n < 20) return '十' + (n % 10 ? DIGITOS[n % 10] : '');
  if (n < 100) return DIGITOS[Math.floor(n / 10)] + '十' + (n % 10 ? DIGITOS[n % 10] : '');
  if (n < 1000) {
    const resto = n % 100;
    const r = resto === 0 ? '' : resto < 10 ? '零' + DIGITOS[resto] : resto < 20 ? '一' + numeroParaHanzi(resto) : numeroParaHanzi(resto);
    return DIGITOS[Math.floor(n / 100)] + '百' + r;
  }
  if (n < 10000) {
    const resto = n % 1000;
    const r = resto === 0 ? '' : resto < 100 ? '零' + numeroParaHanzi(resto).replace(/^十/, '一十') : numeroParaHanzi(resto);
    return DIGITOS[Math.floor(n / 1000)] + '千' + r;
  }
  return String(n);
}

/** Só os caracteres chineses, com números arábicos convertidos (o reconhecimento costuma escrever "8点"). */
export function limparParaComparar(texto: string): string {
  return texto
    .replace(/\d+/g, (m) => numeroParaHanzi(Number(m)))
    .replace(/[^\p{Script=Han}]/gu, '');
}

function semTomPinyin(c: string): string {
  return pinyin(c, { toneType: 'none', type: 'array', multiple: true }).join('|');
}

function homofonos(a: string, b: string): boolean {
  if (a === b) return true;
  const pa = new Set(semTomPinyin(a).split('|'));
  return semTomPinyin(b)
    .split('|')
    .some((p) => pa.has(p));
}

/**
 * Compara o texto esperado com o que o reconhecimento de voz transcreveu.
 * Usa alinhamento (LCS) caractere a caractere; caracteres diferentes com o mesmo som
 * (他/她, 在/再) contam como certos, porque o reconhecimento não sabe qual é qual.
 * Atenção: é uma checagem aproximada — os tons não são avaliados com precisão.
 */
export function compararFala(esperado: string, ouvido: string): ResultadoFala {
  const a = [...limparParaComparar(esperado)];
  const b = [...limparParaComparar(ouvido)];
  const igual = (x: string, y: string) => homofonos(x, y);

  // matriz de LCS
  const m = a.length;
  const n = b.length;
  const tabela = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      tabela[i][j] = igual(a[i], b[j]) ? tabela[i + 1][j + 1] + 1 : Math.max(tabela[i + 1][j], tabela[i][j + 1]);
    }
  }

  const pedacos: PedacoComparacao[] = [];
  let i = 0;
  let j = 0;
  while (i < m || j < n) {
    if (i < m && j < n && igual(a[i], b[j])) {
      pedacos.push(a[i] === b[j] ? { caractere: a[i], estado: 'certo' } : { caractere: a[i], estado: 'homofono', ouvido: b[j] });
      i++;
      j++;
    } else if (j < n && (i === m || tabela[i][j + 1] >= tabela[i + 1][j])) {
      pedacos.push({ caractere: b[j], estado: 'sobrou' });
      j++;
    } else {
      pedacos.push({ caractere: a[i], estado: 'faltou' });
      i++;
    }
  }

  const acertos = pedacos.filter((p) => p.estado === 'certo' || p.estado === 'homofono').length;
  const sobras = pedacos.filter((p) => p.estado === 'sobrou').length;
  // sobras pesam metade, para não premiar quem fala "de tudo"
  const base = m === 0 ? 0 : Math.max(0, acertos - sobras * 0.5) / m;
  return {
    pontuacao: Math.round(Math.min(1, base) * 100),
    pedacos,
    esperadoLimpo: a.join(''),
    ouvidoLimpo: b.join(''),
  };
}
