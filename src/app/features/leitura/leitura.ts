import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LeituraService, coberturaDoTexto, rotuloCobertura } from '../../core/dados/leitura.service';
import { ProgressoService } from '../../core/progresso/progresso.service';
import { IdiomaService } from '../../core/i18n/idioma.service';

@Component({
  selector: 'app-leitura',
  imports: [RouterLink],
  template: `
    <section class="pagina">
      <header>
        <h1>{{ i.t('Leitura', 'Reading') }}</h1>
        <p class="subtitulo">
          {{ i.t('Diálogos do dia a dia e historinhas curtas, do mais fácil ao mais difícil. Toque nas palavras para ver o significado e ouvir.', 'Everyday dialogues and short stories, from easiest to hardest. Tap words to see the meaning and listen.') }}
        </p>
      </header>

      <div class="abas" role="tablist" [attr.aria-label]="i.t('Tipo de texto', 'Text type')">
        <button type="button" role="tab" [class.ativa]="tipo() === 'dialogo'" [attr.aria-selected]="tipo() === 'dialogo'" (click)="tipo.set('dialogo')">{{ i.t('Diálogos', 'Dialogues') }}</button>
        <button type="button" role="tab" [class.ativa]="tipo() === 'historia'" [attr.aria-selected]="tipo() === 'historia'" (click)="tipo.set('historia')">{{ i.t('Historinhas', 'Stories') }}</button>
      </div>

      @if (mostrarCobertura()) {
        <p class="suave pequeno">
          @if (i.ingles()) {
            The percentage shows how many words in each text you have already studied. To read with pleasure you should know
            almost all of them (~98%, per Hu &amp; Nation, 2000) — "ideal" texts give more learning for less effort.
          } @else {
            A porcentagem mostra quantas palavras de cada texto você já estudou. O ideal para ler com prazer é conhecer
            quase todas (~98%, segundo Hu &amp; Nation, 2000) — textos "ideais" rendem mais aprendizado com menos esforço.
          }
        </p>
      }
      @if (!leitura.carregado()) {
        <p class="info">{{ i.t('Carregando textos…', 'Loading texts…') }}</p>
      } @else {
        <ul class="textos">
          @for (t of lista(); track t.id; let idx = $index) {
            <li>
              <a class="cartao texto" [routerLink]="['/leitura', t.id]">
                <span class="numero" aria-hidden="true">{{ idx + 1 }}</span>
                <span class="corpo">
                  <span class="titulo-hanzi" lang="zh-CN">{{ t.tituloHanzi }}</span>
                  <strong>{{ i.tr(t, 'titulo') }}</strong>
                  <span class="suave pequeno">{{ i.tr(t, 'resumo') }}</span>
                </span>
                <span class="lado">
                  <span class="etiqueta">HSK {{ t.nivel }}</span>
                  @if (mostrarCobertura()) {
                    @if (cobertura(t.id); as cob) {
                      <span [class]="'cobertura ' + cob.classe" [title]="i.t('Você já estudou ', 'You have studied ') + cob.pct + i.t('% das palavras', '% of the words')">
                        {{ cob.pct }}% · {{ i.tr(cob, 'texto') }}
                      </span>
                    }
                  }
                  @if (concluidos()[t.id]; as c) {
                    <span class="feito" [attr.aria-label]="i.t('Concluído: ', 'Completed: ') + c.acertos + i.t(' de ', ' of ') + c.total">✓ {{ c.acertos }}/{{ c.total }}</span>
                  }
                </span>
              </a>
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: `
    .textos {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
    }
    .texto {
      display: flex;
      gap: 12px;
      align-items: center;
      color: var(--cor-texto);
      text-decoration: none;
      height: 100%;
    }
    .texto:hover {
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
    .titulo-hanzi {
      font-size: 1.25rem;
    }
    .lado {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
    .cobertura {
      font-size: 0.75rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .cobertura.ideal {
      color: var(--cor-sucesso);
    }
    .cobertura.desafio {
      color: var(--cor-aviso);
    }
    .cobertura.dificil {
      color: var(--cor-texto-suave);
    }
    .feito {
      color: var(--cor-sucesso);
      font-weight: 700;
      font-size: 0.85rem;
    }
  `,
})
export class LeituraPagina {
  protected readonly i = inject(IdiomaService);
  protected readonly leitura = inject(LeituraService);
  private readonly progresso = inject(ProgressoService);
  protected readonly tipo = signal<'dialogo' | 'historia'>('dialogo');
  protected readonly lista = computed(() => this.leitura.textos().filter((t) => t.tipo === this.tipo()));
  protected readonly concluidos = computed(() => this.progresso.estado().textos);
  private readonly conhecidas = computed(() => new Set(this.progresso.palavrasEstudadas().map((c) => c.ref)));
  protected readonly mostrarCobertura = computed(() => this.conhecidas().size >= 10);
  private readonly coberturas = computed(
    () =>
      new Map(
        this.leitura.textos().map((t) => {
          const pct = coberturaDoTexto(t, this.conhecidas());
          return [t.id, { pct, ...rotuloCobertura(pct) }];
        }),
      ),
  );

  protected cobertura(id: string) {
    return this.coberturas().get(id);
  }

  constructor() {
    void this.leitura.carregar();
  }
}
