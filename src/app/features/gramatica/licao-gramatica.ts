import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GramaticaService } from '../../core/dados/gramatica.service';
import { ProgressoService } from '../../core/progresso/progresso.service';
import { ExEscolha } from '../treino/exercicios/ex-escolha';
import { itensDaLicaoGramatica } from '../treino/gramatica-itens';
import { ItemEscolha, ResultadoItem } from '../treino/sessao.model';
import { ExemplosGramatica } from './exemplos-gramatica';
import { IdiomaService } from '../../core/i18n/idioma.service';

@Component({
  selector: 'app-licao-gramatica',
  imports: [RouterLink, ExEscolha, ExemplosGramatica],
  template: `
    <section class="pagina">
      <p><a routerLink="/gramatica">← {{ i.t('Todas as lições', 'All lessons') }}</a></p>
      @if (!gramatica.carregado()) {
        <p class="info">{{ i.t('Carregando…', 'Loading…') }}</p>
      } @else if (licao(); as l) {
        <header>
          <h1>{{ i.tr(l, 'titulo') }}</h1>
        </header>
        <p class="estrutura">{{ i.tr(l, 'estrutura') }}</p>
        <section class="cartao">
          @for (p of i.trLista(l, 'explicacao'); track p) {
            <p>{{ p }}</p>
          }
          <h2>{{ i.t('Exemplos', 'Examples') }}</h2>
          <app-exemplos-gramatica [exemplos]="l.exemplos" />
        </section>

        <section class="cartao pratica" aria-live="polite">
          <h2>{{ i.t('Pratique', 'Practice') }}</h2>
          @for (item of atual() ? [atual()!] : []; track item.id) {
            <p class="suave pequeno">{{ i.t('Exercício', 'Exercise') }} {{ indice() + 1 }} {{ i.t('de', 'of') }} {{ itens().length }}</p>
            <app-ex-escolha [item]="item" (concluir)="registrar($event)" />
          } @empty {
            <p [class]="acertos() >= itens().length / 2 ? 'sucesso' : 'info'" role="status">
              {{ i.t('Você acertou', 'You got') }} {{ acertos() }} {{ i.t('de', 'of') }} {{ itens().length }}{{ i.t('.', ' right.') }}
              {{ acertos() >= itens().length / 2 ? i.t('Lição concluída! ✓', 'Lesson complete! ✓') : i.t('Releia a explicação e tente de novo.', 'Reread the explanation and try again.') }}
            </p>
            <div class="linha">
              <button type="button" class="botao" (click)="reiniciar()">{{ i.t('Praticar de novo', 'Practice again') }}</button>
              @if (proxima(); as n) {
                <a class="botao botao-primario" [routerLink]="['/gramatica', n.id]">{{ i.t('Próxima:', 'Next:') }} {{ i.tr(n, 'titulo') }} →</a>
              }
            </div>
          }
        </section>
      } @else {
        <p class="erro">{{ i.t('Lição não encontrada.', 'Lesson not found.') }}</p>
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
  protected readonly i = inject(IdiomaService);
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
