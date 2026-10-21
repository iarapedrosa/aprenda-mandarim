/**
 * Números em chinês (caracteres + pinyin), para o módulo de números.
 *
 * Regras usadas:
 * - o chinês agrupa de 4 em 4 casas: 万 (wàn) = 10.000, então 100.000 = 十万;
 * - 11–19 começam direto com 十 (十五), mas dentro de números maiores vem 一十 (一百一十);
 * - zeros no meio viram um único 零; zeros no fim somem (一百零五, 一千零二十);
 * - o 2 no começo, antes de 百/千/万, é falado 两 (两百, 两千, 两万);
 * - 一 antes de 百/千 é falado yì e antes de 万, yí (sandhi); no resto, yī.
 */

export interface NumeroChines {
  hanzi: string;
  pinyin: string;
}

const DIGITOS = '零一二三四五六七八九';
const PINYIN: Record<string, string> = {
  零: 'líng', 一: 'yī', 二: 'èr', 两: 'liǎng', 三: 'sān', 四: 'sì', 五: 'wǔ', 六: 'liù', 七: 'qī',
  八: 'bā', 九: 'jiǔ', 十: 'shí', 百: 'bǎi', 千: 'qiān', 万: 'wàn', 点: 'diǎn', 幺: 'yāo',
};
const UNIDADES = ['', '十', '百', '千'];
export const NUMERO_MAXIMO = 99_999_999;

/** 0–9999 em caracteres. `completo` = dentro de um número maior (mantém 一十). */
function grupoDeQuatro(n: number, completo: boolean): string {
  if (n === 0) return '';
  const digitos = String(n).padStart(4, '0').split('').map(Number);
  let saida = '';
  let zeroPendente = false;
  digitos.forEach((d, i) => {
    const unidade = UNIDADES[3 - i];
    if (d === 0) {
      if (saida) zeroPendente = true;
      return;
    }
    if (zeroPendente) saida += '零';
    zeroPendente = false;
    if (unidade === '十' && d === 1 && !saida && !completo) saida += '十';
    else saida += DIGITOS[d] + unidade;
  });
  return saida;
}

/** Número inteiro (0 a 99.999.999) em caracteres: 2026 → 两千零二十六. */
export function numeroParaChines(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > NUMERO_MAXIMO) throw new RangeError('Número fora do intervalo.');
  if (n === 0) return '零';
  const alto = Math.floor(n / 10_000);
  const baixo = n % 10_000;
  let hanzi = '';
  if (alto) hanzi = grupoDeQuatro(alto, false) + '万';
  if (baixo) {
    if (alto && baixo < 1000) hanzi += '零';
    hanzi += grupoDeQuatro(baixo, !!alto);
  }
  // 两 para o 2 inicial antes de 百/千/万
  return hanzi.replace(/^二(?=[百千万])/, '两');
}

/** Pinyin de um texto numérico em caracteres, com o sandhi de 一 e quebras legíveis. */
export function pinyinDeNumero(hanzi: string): string {
  const cs = [...hanzi];
  const partes: string[] = [];
  let grupo = '';
  cs.forEach((c, i) => {
    let p = PINYIN[c] ?? c;
    const proximo = cs[i + 1];
    if (c === '一' && (proximo === '百' || proximo === '千')) p = 'yì';
    if (c === '一' && proximo === '万') p = 'yí';
    if (c === '零') {
      if (grupo) partes.push(grupo);
      partes.push(p);
      grupo = '';
      return;
    }
    // apóstrofo antes de sílaba que começa com vogal (èr, ...)
    grupo += (grupo && /^[aeoāáǎàēéěèōóǒò]/.test(p) ? "'" : '') + p;
    if ('百千万'.includes(c) || c === '点') {
      partes.push(grupo);
      grupo = '';
    }
  });
  if (grupo) partes.push(grupo);
  return partes.join(' ');
}

export function numero(n: number): NumeroChines {
  const hanzi = numeroParaChines(n);
  return { hanzi, pinyin: pinyinDeNumero(hanzi) };
}

/** Dígito a dígito, como em telefones (1 = 幺 yāo) ou anos (sem 幺). */
export function digitoADigito(texto: string, telefone: boolean): NumeroChines {
  const cs = [...texto.replace(/\D/g, '')].map((d) => (telefone && d === '1' ? '幺' : DIGITOS[Number(d)]));
  return { hanzi: cs.join(''), pinyin: cs.map((c) => PINYIN[c]).join(' ') };
}

/** Ano: 2026 → 二零二六年 (èr líng èr liù nián). */
export function ano(a: number): NumeroChines {
  const d = digitoADigito(String(a), false);
  return { hanzi: d.hanzi + '年', pinyin: d.pinyin + ' nián' };
}

/** Preço em yuans: 12,50 → 十二块五 (毛 fica implícito no fim). */
export function preco(valor: number): NumeroChines {
  const centavos = Math.round(valor * 100);
  const kuai = Math.floor(centavos / 100);
  const mao = Math.floor((centavos % 100) / 10);
  const fen = centavos % 10;
  const partes: NumeroChines[] = [];
  if (kuai) partes.push(juntar(numero(kuai), { hanzi: '块', pinyin: 'kuài' }));
  if (mao) partes.push(fen || !kuai ? juntar(numero(mao), { hanzi: '毛', pinyin: 'máo' }) : numero(mao));
  if (kuai && !mao && fen) partes.push({ hanzi: '零', pinyin: 'líng' });
  if (fen) partes.push(juntar(numero(fen), { hanzi: '分', pinyin: 'fēn' }));
  if (!partes.length) return { hanzi: '零块', pinyin: 'líng kuài' };
  // 两 para 2 antes de 块/毛/分 (两块, 两毛)
  return {
    hanzi: partes.map((p) => p.hanzi.replace(/^二(?=[块毛分])/, '两')).join(''),
    pinyin: partes.map((p) => p.pinyin.replace(/^èr(?= (kuài|máo|fēn))/, 'liǎng')).join(' '),
  };
}

/** Hora: 8h30 → 八点半; 8h05 → 八点零五分; 2h → 两点. */
export function hora(h: number, m: number): NumeroChines {
  const horas = h === 2 ? { hanzi: '两', pinyin: 'liǎng' } : numero(h);
  const base = juntar(horas, { hanzi: '点', pinyin: 'diǎn' });
  if (m === 0) return base;
  if (m === 30) return juntar(base, { hanzi: '半', pinyin: 'bàn' });
  const minutos = m < 10 ? juntar({ hanzi: '零', pinyin: 'líng' }, numero(m)) : numero(m);
  return juntar(juntar(base, minutos), { hanzi: '分', pinyin: 'fēn' });
}

function juntar(a: NumeroChines, b: NumeroChines): NumeroChines {
  return { hanzi: a.hanzi + b.hanzi, pinyin: `${a.pinyin} ${b.pinyin}` };
}

/** Lê algarismos digitados pela pessoa ("1.250", "1 250", "12,5"). */
export function lerNumeroDigitado(texto: string): number | null {
  let limpo = texto.trim().replace(/\s/g, '');
  const separadores = limpo.match(/[.,]/g) ?? [];
  if (new Set(separadores).size === 2) {
    // "1.250,50" ou "1,250.50": o último separador é o decimal
    const decimal = limpo.lastIndexOf(',') > limpo.lastIndexOf('.') ? ',' : '.';
    limpo = limpo.split(decimal === ',' ? '.' : ',').join('').replace(decimal, '.');
  } else if (separadores.length > 1 || /^\d{1,3}[.,]\d{3}$/.test(limpo)) {
    // "1.250", "1,250" ou "1.000.000": separador de milhar (pt-BR ou inglês)
    limpo = limpo.replace(/[.,]/g, '');
  } else {
    limpo = limpo.replace(',', '.');
  }
  if (!/^\d+(\.\d+)?$/.test(limpo)) return null;
  return Number(limpo);
}
