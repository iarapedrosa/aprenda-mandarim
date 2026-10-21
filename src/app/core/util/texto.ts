import { semTom } from '../pinyin/pinyin';

/** Normaliza texto para busca: sem acentos, minúsculo, sem espaços extras. */
export function paraBusca(texto: string): string {
  return semTom(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ü/g, 'u')
    .toLowerCase();
}

/** Verifica se a palavra combina com a busca (hanzi, pinyin com ou sem tom, ou português). */
export function combinaBusca(busca: string, ...campos: string[]): boolean {
  const termo = paraBusca(busca.trim());
  if (!termo) return true;
  const termoSemEspaco = termo.replace(/[\s']/g, '');
  return campos.some((campo) => {
    const valor = paraBusca(campo);
    return valor.includes(termo) || valor.replace(/[\s']/g, '').includes(termoSemEspaco);
  });
}
