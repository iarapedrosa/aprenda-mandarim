import { semTom } from './pinyin';

/** Um candidato da barra do teclado (como nos teclados chineses do celular). */
export interface Candidato {
  hanzi: string;
  pinyin: string;
}

/** Como se digita no teclado chinês: sem tons, sem espaços e com v no lugar de ü. "nǚ'ér" → "nver". */
export function chaveTeclado(pinyin: string): string {
  return semTom(pinyin)
    .replace(/ü/g, 'v')
    .replace(/[^a-z]/g, '');
}

/**
 * Candidatos para o que foi digitado: primeiro os que batem exatamente (inclusive homófonos),
 * depois os que começam com as letras digitadas — como num teclado chinês de verdade.
 */
export function candidatosTeclado(digitado: string, fonte: readonly Candidato[], limite = 8): Candidato[] {
  const chave = chaveTeclado(digitado);
  if (!chave) return [];
  const vistos = new Set<string>();
  const exatos: Candidato[] = [];
  const prefixos: Candidato[] = [];
  for (const c of fonte) {
    if (vistos.has(c.hanzi)) continue;
    const k = chaveTeclado(c.pinyin);
    if (k === chave) {
      exatos.push(c);
      vistos.add(c.hanzi);
    } else if (k.startsWith(chave)) {
      prefixos.push(c);
      vistos.add(c.hanzi);
    }
  }
  return [...exatos, ...prefixos.sort((a, b) => chaveTeclado(a.pinyin).length - chaveTeclado(b.pinyin).length)].slice(
    0,
    limite,
  );
}
