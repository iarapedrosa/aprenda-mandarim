import { Tom } from '../pinyin/pinyin';

export interface ConfusaoTom {
  a: Tom;
  b: Tom;
  vezes: number;
}

/**
 * Pares de tons que a pessoa mais confunde (somando os dois sentidos: 2→3 e 3→2).
 * Aprendizes de línguas não tonais confundem sobretudo 2º × 3º (Hao, 2012, Journal of Phonetics).
 */
export function confusoesFrequentes(confusao: Record<string, number>, limite = 3): ConfusaoTom[] {
  const somas = new Map<string, number>();
  for (const [chave, vezes] of Object.entries(confusao)) {
    const [x, y] = chave.split('>').map(Number);
    const [a, b] = x < y ? [x, y] : [y, x];
    somas.set(`${a}-${b}`, (somas.get(`${a}-${b}`) ?? 0) + vezes);
  }
  return [...somas.entries()]
    .map(([k, vezes]) => {
      const [a, b] = k.split('-').map(Number) as [Tom, Tom];
      return { a, b, vezes };
    })
    .sort((x, y) => y.vezes - x.vezes)
    .slice(0, limite);
}

/**
 * Peso de cada tom para sortear exercícios: tons envolvidos em mais confusões aparecem mais
 * (até 3× mais), para o treino se concentrar no que é difícil para você.
 */
export function pesosDosTons(confusao: Record<string, number>): Record<Tom, number> {
  const erros: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const [chave, vezes] of Object.entries(confusao)) {
    const [x, y] = chave.split('>').map(Number);
    erros[x] += vezes;
    erros[y] += vezes;
  }
  const maximo = Math.max(1, ...Object.values(erros));
  return Object.fromEntries(
    Object.entries(erros).map(([t, e]) => [t, 1 + (2 * e) / maximo]),
  ) as unknown as Record<Tom, number>;
}

/** Sorteio com pesos. */
export function sortearPonderado<T>(itens: readonly T[], peso: (item: T) => number, aleatorio = Math.random): T {
  const pesos = itens.map(peso);
  const total = pesos.reduce((s, p) => s + p, 0);
  let r = aleatorio() * total;
  for (let i = 0; i < itens.length; i++) {
    r -= pesos[i];
    if (r <= 0) return itens[i];
  }
  return itens[itens.length - 1];
}
