import { Injectable } from '@angular/core';
import { Palavra } from '../../core/dados/modelos';
import { ItemSessao } from './sessao.model';

/**
 * Gera os exercícios com frases (ditado, shadowing…) que entram no treino diário
 * quando a pessoa já conhece vocabulário suficiente.
 */
@Injectable({ providedIn: 'root' })
export class ItensDeFraseService {
  carregar(): Promise<void> {
    return Promise.resolve();
  }

  gerar(_palavrasConhecidas: Palavra[]): ItemSessao[] {
    return [];
  }
}
