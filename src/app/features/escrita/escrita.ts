import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InfoCaractere, VocabularioService, caracteresDe } from '../../core/dados/vocabulario.service';
import { ProgressoService } from '../../core/progresso/progresso.service';
import { amostra } from '../../core/util/aleatorio';
import { VozService } from '../../core/voz/voz.service';
import { BotaoAudio } from '../../shared/botao-audio/botao-audio';
import { NivelEscrita, QuizEscrita, ResultadoEscrita } from '../../shared/hanzi/quiz-escrita';
import { PinyinColorido } from '../../shared/pinyin-colorido/pinyin-colorido';

const NIVEIS: { id: NivelEscrita; nome: string; descricao: string }[] = [
  { id: 'contorno', nome: '1. Com contorno', descricao: 'Decalque o caractere cinza.' },
  { id: 'sem-contorno', nome: '2. Sem contorno', descricao: 'Veja o modelo e escreva no quadro vazio.' },
  { id: 'memoria', nome: '3. De memória', descricao: 'Só pinyin e tradução: escreva de cabeça.' },
];

@Component({
  selector: 'app-escrita',
  imports: [FormsModule, RouterLink, QuizEscrita, PinyinColorido, BotaoAudio],
  template: `
    <section class="pagina">
      <header>
        <h1>Escrita</h1>
        <p class="subtitulo">
          Desenhe com o dedo ou o mouse. Cada traço é corrigido na hora — ordem e direção contam!
        </p>
      </header>

      <div class="niveis" role="radiogroup" aria-label="Nível">
        @for (n of niveis; track n.id) {
          <label class="nivel">
            <input type="radio" name="nivel" [value]="n.id" [ngModel]="nivel()" (ngModelChange)="nivel.set($event)" />
            <span><strong>{{ n.nome }}</strong><br /><small>{{ n.descricao }}</small></span>
          </label>
        }
      </div>

      @if (!vocabulario.carregado()) {
        <p class="info">Carregando…</p>
      } @else if (fila().length === 0) {
        <section class="cartao">
          <h2>O que vamos praticar?</h2>
          <div class="escolhas">
            @for (n of vocabulario.niveis(); track n.id; let i = $index) {
              <button type="button" class="botao" (click)="sortear(i + 1)">5 caracteres do {{ n.nome }}</button>
            }
          </div>
          <form class="proprios" (submit)="$event.preventDefault(); usarTexto(textoProprio())">
            <label for="texto-proprio">Ou digite/cole os caracteres:</label>
            <div class="linha">
              <input id="texto-proprio" class="campo" lang="zh-CN" [ngModel]="textoProprio()" (ngModelChange)="textoProprio.set($event)" name="texto" placeholder="ex.: 你好" />
              <button type="submit" class="botao botao-primario">Praticar</button>
            </div>
          </form>
        </section>
      } @else if (atual(); as c) {
        <section class="cartao pratica">
          <p class="progresso-fila suave">Caractere {{ indice() + 1 }} de {{ fila().length }}</p>
          <div class="enunciado">
            @if (nivel() === 'sem-contorno' || revelado()) {
              <span class="modelo" lang="zh-CN">{{ c.hanzi }}</span>
            }
            <div>
              @if (c.pinyin) {
                <p class="pinyin-enunciado"><app-pinyin [texto]="c.pinyin" /></p>
              }
              <p class="suave">{{ c.traducao || 'Escreva o caractere' }}</p>
            </div>
            <app-botao-audio [texto]="c.hanzi" [rotulo]="c.pinyin" />
          </div>

          <app-quiz-escrita
            [caractere]="c.hanzi"
            [nivel]="nivel()"
            [tamanho]="tamanho"
            (concluir)="aoConcluir($event)"
          />

          @if (resultadoAtual()) {
            <button type="button" class="botao botao-primario botao-bloco proximo" (click)="proximo()">
              {{ indice() + 1 < fila().length ? 'Próximo caractere' : 'Ver resultado' }}
            </button>
          }
        </section>
      } @else {
        <section class="cartao">
          <h2>Resultado</h2>
          <ul class="resultados">
            @for (r of resultados(); track $index) {
              <li>
                <span lang="zh-CN" class="hanzi">{{ r.caractere }}</span>
                @if (r.erros === 0 && !r.ajuda) {
                  <span class="sucesso">perfeito</span>
                } @else {
                  <span class="aviso">{{ r.erros }} erro(s){{ r.ajuda ? ' + dica' : '' }}</span>
                }
              </li>
            }
          </ul>
          <div class="linha">
            <button type="button" class="botao botao-primario" (click)="repetir()">Praticar de novo</button>
            <button type="button" class="botao" (click)="novaEscolha()">Escolher outros</button>
          </div>
        </section>
      }

      <p class="suave pequeno rodape">
        Dica: comece pelo nível 1 e só avance quando acertar sem dicas.
        <a routerLink="/caracteres">Ver todo o vocabulário</a>
      </p>
    </section>
  `,
  styles: `
    .niveis {
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(3, 1fr);
      margin-bottom: 12px;
    }
    .nivel {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      padding: 10px 12px;
      border-radius: var(--raio-p);
      border: 2px solid var(--cor-borda);
      background: var(--cor-superficie);
      font-weight: 400;
      cursor: pointer;
    }
    .nivel:has(input:checked) {
      border-color: var(--cor-primaria);
      background: var(--cor-primaria-suave);
    }
    .nivel input {
      accent-color: var(--cor-primaria);
      margin-top: 4px;
    }
    .escolhas {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    .proprios .linha {
      flex-wrap: nowrap;
      margin-top: 6px;
    }
    .pratica {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .progresso-fila {
      align-self: flex-start;
      margin: 0;
    }
    .enunciado {
      display: flex;
      align-items: center;
      gap: 14px;
      margin: 8px 0 12px;
    }
    .enunciado p {
      margin: 0;
    }
    .modelo {
      font-family: var(--fonte-hanzi);
      font-size: 3rem;
      line-height: 1;
    }
    .pinyin-enunciado {
      font-size: 1.4rem;
    }
    .proximo {
      margin-top: 12px;
    }
    .resultados {
      list-style: none;
      padding: 0;
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    }
    .resultados li {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .resultados .hanzi {
      font-size: 1.8rem;
    }
    .resultados .sucesso,
    .resultados .aviso {
      padding: 2px 8px;
      font-size: 0.85rem;
    }
    .rodape {
      margin-top: 16px;
    }
    @media (max-width: 599px) {
      .nivel {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 4px;
        padding: 8px 6px;
        font-size: 0.9rem;
      }
      .nivel small {
        display: none;
      }
      .nivel input {
        margin: 0;
      }
    }
  `,
})
export class EscritaPagina {
  protected readonly vocabulario = inject(VocabularioService);
  private readonly progresso = inject(ProgressoService);
  private readonly voz = inject(VozService);

  /** ?texto=你好 (vindo da página de uma palavra) */
  readonly texto = input<string>('');

  protected readonly niveis = NIVEIS;
  protected readonly nivel = signal<NivelEscrita>('contorno');
  protected readonly textoProprio = signal('');
  protected readonly fila = signal<InfoCaractere[]>([]);
  protected readonly indice = signal(0);
  protected readonly resultados = signal<ResultadoEscrita[]>([]);
  protected readonly atual = computed(() => this.fila()[this.indice()] ?? null);
  protected readonly resultadoAtual = computed(() => this.resultados()[this.indice()] ?? null);
  protected readonly revelado = computed(() => this.nivel() === 'memoria' && !!this.resultadoAtual());

  protected readonly tamanho = Math.min(300, (typeof window !== 'undefined' ? window.innerWidth : 360) - 72);

  constructor() {
    void this.vocabulario.carregar().then(() => {
      if (this.texto()) this.usarTexto(this.texto());
    });
  }

  protected sortear(nivel: number): void {
    const caracteres = [
      ...new Set(
        this.vocabulario
          .palavras()
          .filter((p) => p.nivel === nivel)
          .flatMap((p) => caracteresDe(p.hanzi)),
      ),
    ];
    this.iniciar(amostra(caracteres, 5));
  }

  protected usarTexto(texto: string): void {
    const caracteres = [...new Set(caracteresDe(texto))];
    if (caracteres.length) this.iniciar(caracteres);
  }

  private iniciar(caracteres: string[]): void {
    this.fila.set(caracteres.map((c) => this.vocabulario.infoCaractere(c)));
    this.indice.set(0);
    this.resultados.set([]);
  }

  protected aoConcluir(r: ResultadoEscrita): void {
    if (this.resultadoAtual()) return;
    this.resultados.update((lista) => [...lista, r]);
    this.progresso.registrarResposta('escrita', r.erros <= 2 && !r.ajuda);
    void this.voz.falar(r.caractere);
  }

  protected proximo(): void {
    this.indice.update((i) => i + 1);
  }

  protected repetir(): void {
    this.indice.set(0);
    this.resultados.set([]);
  }

  protected novaEscolha(): void {
    this.fila.set([]);
    this.resultados.set([]);
    this.indice.set(0);
  }
}
