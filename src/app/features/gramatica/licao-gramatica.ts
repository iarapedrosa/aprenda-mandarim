import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GramaticaService } from '../../core/dados/gramatica.service';
import { ProgressoService } from '../../core/progresso/progresso.service';
import { ExEscolha } from '../treino/exercicios/ex-escolha';
import { itensDaLicaoGramatica } from '../treino/gramatica-itens';
import { ItemEscolha, ResultadoItem } from '../treino/sessao.model';
import { ExemplosGramatica } from './exemplos-gramatica';

@Component({
  selector: 'app-licao-gramatica',
  imports: [RouterLink, ExEscolha, ExemplosGramatica],
  template: `
    <section class="pagina">
      <p><a routerLink="/gramatica">← Todas as lições</a></p>
      @if (!gramatica.carregado()) {
        <p class="info">Carregando…</p>
      } @else if (licao(); as l) {
        <header>
          <h1>{{ l.titulo }}</h1>
        </header>
        <p class="estrutura">{{ l.estrutura }}</p>
        <section class="cartao">
          @for (p of l.explicacao; track p) {
            <p>{{ p }}</p>
          }
          <h2>Exemplos</h2>
          <app-exemplos-gramatica [exemplos]="l.exemplos" />
        </section>

        <section class="cartao pratica" aria-live="polite">
          <h2>Pratique</h2>
          @for (item of atual() ? [atual()!] : []; track item.id) {
            <p class="suave pequeno">Exercício {{ indice() + 1 }} de {{ itens().length }}</p>
            <app-ex-escolha [item]="item" (concluir)="registrar($event)" />
          } @empty {
            <p [class]="acertos() >= itens().length / 2 ? 'sucesso' : 'info'" role="status">
              Você acertou {{ acertos() }} de {{ itens().length }}.
              {{ acertos() >= itens().length / 2 ? 'Lição concluída! ✓' : 'Releia a explicação e tente de novo.' }}
            </p>
            <div class="linha">
              <button type="button" class="botao" (click)="reiniciar()">Praticar de novo</button>
              @if (proxima(); as n) {
                <a class="botao botao-primario" [routerLink]="['/gramatica', n.id]">Próxima: {{ n.titulo }} →</a>
              }
            </div>
          }
        </section>
      } @else {
        <p class="erro">Lição não encontrada.</p>
      }
    </section>
  `,
  styles: `
    .estrutura {
      font-weight: 700;
      padding: 10px 14px;
      border-radius: var(--raio-p);
      background: var(--cor-primaria-suave);
      color: var(--cor-primaria);
    }
    h2 {
      margin-top: 12px;
    }
    .pratica {
      margin-top: 12px;
    }
  `,
})
export class LicaoGramaticaPagina {
  protected readonly gramatica = inject(GramaticaService);
  private readonly progresso = inject(ProgressoService);
  readonly id = input.required<string>();

  protected readonly licao = computed(() => this.gramatica.porId(this.id()) ?? null);
  protected readonly proxima = computed(() => {
    const lista = this.gramatica.licoes();
    const i = lista.findIndex((l) => l.id === this.id());
    return i >= 0 ? (lista[i + 1] ?? null) : null;
  });

  protected readonly itens = signal<ItemEscolha[]>([]);
  protected readonly indice = signal(0);
  protected readonly acertos = signal(0);
  protected readonly atual = computed(() => this.itens()[this.indice()] ?? null);

  constructor() {
    void this.gramatica.carregar();
    effect(() => {
      const l = this.licao();
      if (l) this.iniciar();
    });
  }

  private iniciar(): void {
    const l = this.licao();
    this.itens.set(l ? itensDaLicaoGramatica(l) : []);
    this.indice.set(0);
    this.acertos.set(0);
  }

  protected reiniciar(): void {
    this.iniciar();
  }

  protected registrar(r: ResultadoItem): void {
    this.progresso.registrarResposta('gramatica', r.acertou);
    if (r.acertou) this.acertos.update((n) => n + 1);
    this.indice.update((i) => i + 1);
    const l = this.licao();
    if (l && this.indice() >= this.itens().length && this.acertos() >= this.itens().length / 2) {
      this.progresso.concluirLicaoGramatica(l.id);
    }
  }
}
