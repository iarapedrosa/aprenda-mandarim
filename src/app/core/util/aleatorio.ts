/** Embaralha uma cópia do array (Fisher–Yates). */
export function embaralhar<T>(itens: readonly T[], aleatorio: () => number = Math.random): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function sortear<T>(itens: readonly T[], aleatorio: () => number = Math.random): T {
  return itens[Math.floor(aleatorio() * itens.length)];
}

/** Escolhe `n` itens distintos. */
export function amostra<T>(itens: readonly T[], n: number, aleatorio: () => number = Math.random): T[] {
  return embaralhar(itens, aleatorio).slice(0, n);
}

/** Gerador pseudoaleatório determinístico (mulberry32) — mesma semente, mesma sequência. */
export function geradorComSemente(semente: number): () => number {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Monta alternativas de múltipla escolha: a correta + distratores únicos, embaralhados.
 */
export function montarAlternativas<T>(
  correta: T,
  candidatos: readonly T[],
  quantidade: number,
  chave: (item: T) => string,
): T[] {
  const vistos = new Set([chave(correta)]);
  const distratores: T[] = [];
  for (const c of embaralhar(candidatos)) {
    if (distratores.length >= quantidade - 1) break;
    const k = chave(c);
    if (!vistos.has(k)) {
      vistos.add(k);
      distratores.push(c);
    }
  }
  return embaralhar([correta, ...distratores]);
}
