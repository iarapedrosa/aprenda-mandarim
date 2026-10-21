import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GramaticaService } from '../../core/dados/gramatica.service';
import { VocabularioService } from '../../core/dados/vocabulario.service';
import { ProgressoService } from '../../core/progresso/progresso.service';
import { sortear } from '../../core/util/aleatorio';
import { ExMontar } from '../treino/exercicios/ex-montar';
import { dicionarioDe, itemMontar } from '../treino/gerador-sessao';
import { ItemMontar, ResultadoItem } from '../treino/sessao.model';
import { IdiomaService } from '../../core/i18n/idioma.service';

@Component({
  selector: 'app-gramatica',
  imports: [RouterLink, ExMontar],
  template: `
    <section class="pagina">
      <header>
        <h1>{{ i.t('Gramática', 'Grammar') }} <span lang="zh-CN" class="hanzi-titulo">语法</span></h1>
        <p class="subtitulo">
          {{ i.t('A gramática do mandarim é enxuta: sem conjugação, sem plural, sem gênero. Mas a ordem das palavras e algumas partículas fazem toda a diferença. As lições entram no treino diário conforme você aprende palavras — e você pode estudá-las aqui quando quiser.', 'Mandarin grammar is lean: no conjugation, no plural, no gender. But word order and a few particles make all the difference. Lessons join your daily training as you learn words — and you can study them here any time.') }}
        </p>
      </header>

      @if (!gramatica.carregado()) {
        <p class="info">{{ i.t('Carregando…', 'Loading…') }}</p>
      } @else {
        <ol class="licoes">
          @for (l of gramatica.licoes(); track l.id; let idx = $index) {
            <li>
              <a class="cartao licao" [routerLink]="['/gramatica', l.id]">
                <span class="numero" aria-hidden="true">{{ idx + 1 }}</span>
                <span class="corpo">
                  <strong>{{ i.tr(l, 'titulo') }}</strong>
                  <span class="suave pequeno">{{ i.tr(l, 'estrutura') }}</span>
                </span>
                @if (concluidas()[l.id]) {
                  <span class="feito" [attr.aria-label]="i.t('Concluída', 'Completed')">✓</span>
                } @else if (l.minPalavras > estudadas()) {
                  <span class="etiqueta" [title]="i.t('Entra no treino diário a partir dessa quantidade de palavras', 'Joins daily training once you know this many words')">{{ l.minPalavras }} {{ i.t('palavras', 'words') }}</span>
                }
              </a>
            </li>
          }
        </ol>
      }

      <section class="cartao montar" aria-live="polite">
        <h2>{{ i.t('Monte frases', 'Build sentences') }}</h2>
        <p class="suave pequeno">
          {{ i.t('Coloque as palavras na ordem certa. As frases vêm dos exemplos das palavras que você já estudou (ou do HSK 1). Acertos:', 'Put the words in the right order. Sentences come from examples of words you have studied (or HSK 1). Score:') }} {{ acertos() }} {{ i.t('de', 'of') }} {{ total() }}.
        </p>
        @if (!montarIniciado()) {
          <button type="button" class="botao botao-primario" (click)="proximaFrase()" [disabled]="!vocabulario.carregado()">{{ i.t('Começar', 'Start') }}</button>
        } @else {
          @for (item of montar() ? [montar()!] : []; track item.id) {
            <app-ex-montar [item]="item" (concluir)="registrarMontar($event)" />
          }
        }
      </section>
    </section>
  `,
  styles: `
    .hanzi-titulo {
      color: var(--cor-primaria);
      font-size: 0.8em;
    }
    .licoes {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
    }
    .licao {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--cor-texto);
      text-decoration: none;
      height: 100%;
    }
    .licao:hover {
      border-color: var(--cor-primaria);
    }
    .numero {
      flex: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: var(--cor-primaria-suave);
      color: var(--cor-primaria);
      font-weight: 700;
    }
    .corpo {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .montar {
      margin-top: 16px;
    }
    .feito {
      color: var(--cor-sucesso);
      font-weight: 700;
      font-size: 1.3rem;
    }
  `,
})
export class GramaticaPagina {
  protected readonly i = inject(IdiomaService);
  protected readonly gramatica = inject(GramaticaService);
  private readonly progresso = inject(ProgressoService);
  protected readonly concluidas = computed(() => this.progresso.estado().licoesGramatica ?? {});
  protected readonly estudadas = computed(() => this.progresso.palavrasEstudadas().length);

  protected readonly vocabulario = inject(VocabularioService);
  protected readonly montar = signal<ItemMontar | null>(null);
  protected readonly montarIniciado = signal(false);
  protected readonly acertos = signal(0);
  protected readonly total = signal(0);

  constructor() {
    void this.gramatica.carregar();
    void this.vocabulario.carregar();
  }

  protected proximaFrase(): void {
    const estudadas = new Set(this.progresso.palavrasEstudadas().map((c) => c.ref));
    const palavras = this.vocabulario.palavras().filter((p) => p.exemplo);
    const conhecidas = palavras.filter((p) => estudadas.has(p.id));
    const fonte = conhecidas.length >= 5 ? conhecidas : palavras.filter((p) => p.nivel === 1);
    const dicionario = dicionarioDe(this.vocabulario.palavras());
    for (let t = 0; t < 20; t++) {
      const item = itemMontar(sortear(fonte).exemplo!, dicionario);
      if (item && item.tipo === 'montar') {
        this.montar.set(item);
        break;
      }
    }
    this.montarIniciado.set(true);
  }

  protected registrarMontar(r: ResultadoItem): void {
    this.total.update((n) => n + 1);
    if (r.acertou) this.acertos.update((n) => n + 1);
    this.progresso.registrarResposta('gramatica', r.acertou);
    this.proximaFrase();
  }
}
