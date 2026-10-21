import { Injectable, computed, inject, signal } from '@angular/core';
import { DataISO, numeroDoDia, somarDias } from '../util/datas';
import { geradorComSemente, embaralhar } from '../util/aleatorio';
import { DadosService } from './dados.service';
import { Frase, Palavra } from './modelos';

export interface FraseDoDia extends Frase {
  id: string;
  nota?: string;
  notaEn?: string;
}

/** Frase do dia (public/data/frases-do-dia.json) e palavra do dia (do vocabulário). */
@Injectable({ providedIn: 'root' })
export class FrasesService {
  private readonly dados = inject(DadosService);
  readonly frases = signal<FraseDoDia[]>([]);
  readonly carregado = computed(() => this.frases().length > 0);
  private carregamento: Promise<void> | null = null;

  carregar(): Promise<void> {
    this.carregamento ??= this.dados
      .carregar<FraseDoDia[]>('frases-do-dia.json')
      .then((f) => this.frases.set(f))
      .catch(() => {
        this.carregamento = null;
      });
    return this.carregamento;
  }

  /** A mesma frase o dia inteiro; muda à meia-noite e percorre a lista toda. */
  fraseDoDia(data: DataISO): FraseDoDia | null {
    const lista = this.frases();
    if (!lista.length) return null;
    const n = ((numeroDoDia(data) % lista.length) + lista.length) % lista.length;
    return lista[n];
  }

  /** Frases dos últimos dias (mais recente primeiro, sem incluir hoje). */
  anteriores(data: DataISO, dias: number): { data: DataISO; frase: FraseDoDia }[] {
    return Array.from({ length: dias }, (_, i) => somarDias(data, -(i + 1)))
      .map((d) => ({ data: d, frase: this.fraseDoDia(d)! }))
      .filter((x) => x.frase);
  }
}

/** Palavra do dia: ordem embaralhada fixa (mesma para todos os dias), avançando 1 por dia. */
export function palavraDoDia(palavras: Palavra[], data: DataISO): Palavra | null {
  if (!palavras.length) return null;
  const ordem = embaralhar(palavras, geradorComSemente(2026));
  const n = ((numeroDoDia(data) % ordem.length) + ordem.length) % ordem.length;
  return ordem[n];
}
