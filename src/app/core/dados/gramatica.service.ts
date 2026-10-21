import { Injectable, computed, inject, signal } from '@angular/core';
import { DadosService } from './dados.service';
import { Frase } from './modelos';

export interface ExercicioGramatica {
  pergunta: string;
  perguntaEn?: string;
  /** frase com lacuna (___), se houver */
  frase?: string;
  opcoes: string[];
  /** índice da opção correta (no arquivo, sempre 0; o site embaralha) */
  correta: number;
  explicacao: string;
  explicacaoEn?: string;
}

/** Mini-lição de gramática (public/data/gramatica.json). */
export interface LicaoGramatica {
  id: string;
  titulo: string;
  tituloEn?: string;
  /** palavras estudadas para a lição entrar no treino diário */
  minPalavras: number;
  estrutura: string;
  estruturaEn?: string;
  explicacao: string[];
  explicacaoEn?: string[];
  exemplos: Frase[];
  exercicios: ExercicioGramatica[];
}

@Injectable({ providedIn: 'root' })
export class GramaticaService {
  private readonly dados = inject(DadosService);
  readonly licoes = signal<LicaoGramatica[]>([]);
  readonly carregado = computed(() => this.licoes().length > 0);
  private carregamento: Promise<void> | null = null;

  carregar(): Promise<void> {
    this.carregamento ??= this.dados
      .carregar<LicaoGramatica[]>('gramatica.json')
      .then((l) => this.licoes.set(l))
      .catch(() => {
        this.carregamento = null;
      });
    return this.carregamento;
  }

  porId(id: string): LicaoGramatica | undefined {
    return this.licoes().find((l) => l.id === id);
  }
}
