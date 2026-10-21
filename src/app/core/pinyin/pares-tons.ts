import { Palavra } from '../dados/modelos';
import { embaralhar, sortear } from '../util/aleatorio';
import { Tom, analisarPinyin, silabaComAcento } from './pinyin';

/** Palavra de duas sílabas com o seu par de tons (ex.: 老师 → [3, 1]). */
export interface PalavraPar {
  hanzi: string;
  pinyin: string;
  traducao: string;
  traducaoEn?: string;
  letras: [string, string];
  tons: [Tom, Tom];
}

/** As 20 combinações: 1º–4º tom na primeira sílaba × 1º–4º ou neutro na segunda. */
export const PARES: [Tom, Tom][] = ([1, 2, 3, 4] as Tom[]).flatMap((a) =>
  ([1, 2, 3, 4, 5] as Tom[]).map((b) => [a, b] as [Tom, Tom]),
);

export function chavePar(tons: [Tom, Tom]): string {
  return `${tons[0]}-${tons[1]}`;
}

export function nomePar(tons: [Tom, Tom]): string {
  const nome = (t: Tom) => (t === 5 ? 'neutro' : `${t}º`);
  return `${nome(tons[0])} + ${nome(tons[1])}`;
}

/** Palavras do vocabulário com exatamente duas sílabas (sem erhua), agrupadas pelo par de tons. */
export function palavrasPorPar(palavras: Palavra[]): Map<string, PalavraPar[]> {
  const mapa = new Map<string, PalavraPar[]>();
  for (const p of palavras) {
    const cs = [...p.hanzi].filter((c) => /\p{Script=Han}/u.test(c));
    const silabas = analisarPinyin(p.pinyin);
    if (cs.length !== 2 || silabas.length !== 2 || silabas[0].tom === 5) continue;
    const par: PalavraPar = {
      hanzi: p.hanzi,
      pinyin: p.pinyin,
      traducao: p.traducao,
      traducaoEn: p.traducaoEn,
      letras: [silabas[0].letras, silabas[1].letras],
      tons: [silabas[0].tom, silabas[1].tom],
    };
    const k = chavePar(par.tons);
    mapa.set(k, [...(mapa.get(k) ?? []), par]);
  }
  return mapa;
}

/** Sorteia uma palavra, escolhendo primeiro a combinação (todas aparecem com a mesma frequência). */
export function sortearPar(mapa: Map<string, PalavraPar[]>): PalavraPar | null {
  const chaves = [...mapa.keys()];
  if (!chaves.length) return null;
  return sortear(mapa.get(sortear(chaves))!);
}

/** Pinyin da palavra com outros tons aplicados (para as alternativas). */
export function pinyinComTons(p: PalavraPar, tons: [Tom, Tom]): string {
  const segunda = silabaComAcento(p.letras[1], tons[1]);
  return silabaComAcento(p.letras[0], tons[0]) + (/^[aeoāáǎàēéěèōóǒò]/.test(segunda) ? "'" : '') + segunda;
}

/** Quatro alternativas (a correta + três pares diferentes, de preferência parecidos). */
export function alternativasDePar(p: PalavraPar): { valor: string; rotulo: string; nome: string }[] {
  const parecidos = PARES.filter(
    (t) => chavePar(t) !== chavePar(p.tons) && (t[0] === p.tons[0] || t[1] === p.tons[1]),
  );
  const escolhidos = [p.tons, ...embaralhar(parecidos).slice(0, 3)];
  return embaralhar(escolhidos).map((t) => ({ valor: chavePar(t), rotulo: pinyinComTons(p, t), nome: nomePar(t) }));
}

/** Observação de sandhi para mostrar depois da resposta. */
export function observacaoPar(p: PalavraPar): string | undefined {
  if (p.tons[0] === 3 && p.tons[1] === 3) return 'Na fala, o primeiro 3º tom vira 2º (sandhi 3+3).';
  if (p.tons[0] === 3) return 'Antes de outro tom, o 3º tom fica só grave (desce e não sobe).';
  return undefined;
}

export function observacaoParEn(p: PalavraPar): string | undefined {
  if (p.tons[0] === 3 && p.tons[1] === 3) return 'In speech, the first 3rd tone becomes a 2nd tone (3+3 sandhi).';
  if (p.tons[0] === 3) return 'Before another tone, the 3rd tone just stays low (dips without rising).';
  return undefined;
}

/** Nome do par em inglês ("3rd + 1st"). */
export function nomeParEn(tons: [Tom, Tom]): string {
  const nome = (t: Tom) => (t === 5 ? 'neutral' : ['1st', '2nd', '3rd', '4th'][t - 1]);
  return `${nome(tons[0])} + ${nome(tons[1])}`;
}

/** Tons de um valor de resposta: "3", "2-4" ou pinyin ("lǎoshī"). */
export function tonsDoValor(valor: string): Tom[] {
  if (/^[1-5](-[1-5])?$/.test(valor)) return valor.split('-').map(Number) as Tom[];
  return analisarPinyin(valor).map((s) => s.tom);
}
