import type { CharacterJson } from 'hanzi-writer';

const CDN = 'https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1';
const cache = new Map<string, Promise<CharacterJson>>();

/**
 * Carrega os dados de traços de um caractere: primeiro da cópia local (public/hanzi, que
 * funciona offline), depois do CDN do hanzi-writer-data se o caractere não estiver no site.
 */
export function carregarTracos(caractere: string): Promise<CharacterJson> {
  let promessa = cache.get(caractere);
  if (!promessa) {
    const codigo = caractere.codePointAt(0)!.toString(16);
    promessa = fetch(`hanzi/${codigo}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('local'))))
      .catch(() =>
        fetch(`${CDN}/${encodeURIComponent(caractere)}.json`).then((r) => {
          if (!r.ok) throw new Error(`Sem dados de traço para ${caractere}`);
          return r.json();
        }),
      ) as Promise<CharacterJson>;
    promessa.catch(() => cache.delete(caractere));
    cache.set(caractere, promessa);
  }
  return promessa;
}
