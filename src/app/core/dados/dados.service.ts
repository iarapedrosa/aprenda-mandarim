import { Injectable } from '@angular/core';

/**
 * Carrega os arquivos JSON de public/data (vocabulário, textos, sílabas...).
 * Cada arquivo é buscado uma única vez; o service worker os guarda para uso offline.
 */
@Injectable({ providedIn: 'root' })
export class DadosService {
  private readonly cache = new Map<string, Promise<unknown>>();

  carregar<T>(caminho: string): Promise<T> {
    let promessa = this.cache.get(caminho);
    if (!promessa) {
      promessa = fetch(`data/${caminho}`).then((resposta) => {
        if (!resposta.ok) throw new Error(`Não foi possível carregar ${caminho} (${resposta.status}).`);
        return resposta.json();
      });
      promessa.catch(() => this.cache.delete(caminho));
      this.cache.set(caminho, promessa);
    }
    return promessa as Promise<T>;
  }
}
