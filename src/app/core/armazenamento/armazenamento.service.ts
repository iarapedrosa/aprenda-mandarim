import { Injectable } from '@angular/core';

const PREFIXO = 'aprenda-mandarim:';

/**
 * Acesso tipado ao localStorage. Nunca lança exceção: se o armazenamento estiver
 * indisponível (modo privado, cota cheia), o app continua funcionando em memória.
 */
@Injectable({ providedIn: 'root' })
export class ArmazenamentoService {
  private readonly memoria = new Map<string, string>();

  ler<T>(chave: string, padrao: T): T {
    const bruto = this.lerBruto(chave);
    if (bruto === null) return padrao;
    try {
      return JSON.parse(bruto) as T;
    } catch {
      return padrao;
    }
  }

  salvar<T>(chave: string, valor: T): boolean {
    const bruto = JSON.stringify(valor);
    this.memoria.set(chave, bruto);
    try {
      localStorage.setItem(PREFIXO + chave, bruto);
      return true;
    } catch {
      return false;
    }
  }

  remover(chave: string): void {
    this.memoria.delete(chave);
    try {
      localStorage.removeItem(PREFIXO + chave);
    } catch {
      /* ignorado */
    }
  }

  private lerBruto(chave: string): string | null {
    try {
      const valor = localStorage.getItem(PREFIXO + chave);
      if (valor !== null) return valor;
    } catch {
      /* ignorado */
    }
    return this.memoria.get(chave) ?? null;
  }
}
