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
import { ExTeclado } from '../treino/exercicios/ex-teclado';
import { ItemTeclado, ResultadoItem } from '../treino/sessao.model';
import { sortear } from '../../core/util/aleatorio';
import { IdiomaService } from '../../core/i18n/idioma.service';

const NIVEIS: { id: NivelEscrita; nome: string; descricao: string; nomeEn: string; descricaoEn: string }[] = [
  { id: 'contorno', nome: '1. Com contorno', descricao: 'Decalque o caractere cinza.', nomeEn: '1. With outline', descricaoEn: 'Trace over the gray character.' },
  { id: 'sem-contorno', nome: '2. Sem contorno', descricao: 'Veja o modelo e escreva no quadro vazio.', nomeEn: '2. No outline', descricaoEn: 'Look at the model and write in the empty box.' },
  { id: 'memoria', nome: '3. De memória', descricao: 'Só pinyin e tradução: escreva de cabeça.', nomeEn: '3. From memory', descricaoEn: 'Only pinyin and meaning: write it from memory.' },
];

@Component({
  selector: 'app-escrita',
  imports: [FormsModule, RouterLink, QuizEscrita, PinyinColorido, BotaoAudio, ExTeclado],
  template: `
    <section class="pagina">
      <header>
        <h1>{{ i.t('Escrita', 'Writing') }}</h1>
        <p class="subtitulo">
          {{ i.t('Desenhe com o dedo ou o mouse. Cada traço é corrigido na hora — ordem e direção contam!', 'Draw with your finger or mouse. Each stroke is checked right away — order and direction count!') }}
        </p>
      </header>

      <div class="abas" role="tablist" [attr.aria-label]="i.t('Forma de escrever', 'Writing mode')">
        <button type="button" role="tab" [class.ativa]="forma() === 'mao'" [attr.aria-selected]="forma() === 'mao'" (click)="forma.set('mao')">✍️ {{ i.t('À mão', 'By hand') }}</button>
        <button type="button" role="tab" [class.ativa]="forma() === 'teclado'" [attr.aria-selected]="forma() === 'teclado'" (click)="forma.set('teclado'); proximoTeclado()">⌨️ {{ i.t('Teclado chinês', 'Chinese keyboard') }}</button>
      </div>

      @if (forma() === 'teclado') {
        <section class="cartao" aria-live="polite">
          <p class="suave pequeno">
            {{ i.t('É assim que se escreve em chinês no dia a dia: digite o pinyin sem tons e escolha o caractere. Acertos:', 'This is how people write Chinese every day: type pinyin without tones and pick the character. Score:') }}
            {{ tecladoAcertos() }} {{ i.t('de', 'of') }} {{ tecladoTotal() }}.
          </p>
          @for (item of itemTeclado() ? [itemTeclado()!] : []; track item.id) {
            <app-ex-teclado [item]="item" (concluir)="registrarTeclado($event)" />
          }
        </section>
      } @else {
      <div class="niveis" role="radiogroup" [attr.aria-label]="i.t('Nível', 'Level')">
        @for (n of niveis; track n.id) {
          <label class="nivel">
            <input type="radio" name="nivel" [value]="n.id" [ngModel]="nivel()" (ngModelChange)="nivel.set($event)" />
            <span><strong>{{ i.tr(n, 'nome') }}</strong><br /><small>{{ i.tr(n, 'descricao') }}</small></span>
          </label>
        }
      </div>

      @if (!vocabulario.carregado()) {
        <p class="info">{{ i.t('Carregando…', 'Loading…') }}</p>
      } @else if (fila().length === 0) {
        <section class="cartao">
          <h2>{{ i.t('O que vamos praticar?', 'What shall we practice?') }}</h2>
          <div class="escolhas">
            @for (n of vocabulario.niveis(); track n.id; let idx = $index) {
              <button type="button" class="botao" (click)="sortear(idx + 1)">{{ i.t('5 caracteres do', '5 characters from') }} {{ n.nome }}</button>
            }
          </div>
          <form class="proprios" (submit)="$event.preventDefault(); usarTexto(textoProprio())">
            <label for="texto-proprio">{{ i.t('Ou digite/cole os caracteres:', 'Or type/paste characters:') }}</label>
            <div class="linha">
              <input id="texto-proprio" class="campo" lang="zh-CN" [ngModel]="textoProprio()" (ngModelChange)="textoProprio.set($event)" name="texto" [placeholder]="i.t('ex.: 你好', 'e.g. 你好')" />
              <button type="submit" class="botao botao-primario">{{ i.t('Praticar', 'Practice') }}</button>
            </div>
          </form>
        </section>
      } @else if (atual(); as c) {
        <section class="cartao pratica">
          <p class="progresso-fila suave">{{ i.t('Caractere', 'Character') }} {{ indice() + 1 }} {{ i.t('de', 'of') }} {{ fila().length }}</p>
          <div class="enunciado">
            @if (nivel() === 'sem-contorno' || revelado()) {
              <span class="modelo" lang="zh-CN">{{ c.hanzi }}</span>
            }
            <div>
              @if (c.pinyin) {
                <p class="pinyin-enunciado"><app-pinyin [texto]="c.pinyin" /></p>
              }
              <p class="suave">{{ i.tr(c, 'traducao') || i.t('Escreva o caractere', 'Write the character') }}</p>
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
              {{ indice() + 1 < fila().length ? i.t('Próximo caractere', 'Next character') : i.t('Ver resultado', 'See result') }}
            </button>
          }
        </section>
      } @else {
        <section class="cartao">
          <h2>{{ i.t('Resultado', 'Result') }}</h2>
          <ul class="resultados">
            @for (r of resultados(); track $index) {
              <li>
                <span lang="zh-CN" class="hanzi">{{ r.caractere }}</span>
                @if (r.erros === 0 && !r.ajuda) {
                  <span class="sucesso">{{ i.t('perfeito', 'perfect') }}</span>
                } @else {
                  <span class="aviso">{{ r.erros }} {{ i.t('erro(s)', 'mistake(s)') }}{{ r.ajuda ? i.t(' + dica', ' + hint') : '' }}</span>
                }
              </li>
            }
          </ul>
          <div class="linha">
            <button type="button" class="botao botao-primario" (click)="repetir()">{{ i.t('Praticar de novo', 'Practice again') }}</button>
            <button type="button" class="botao" (click)="novaEscolha()">{{ i.t('Escolher outros', 'Pick others') }}</button>
          </div>
        </section>
      }

      }

      <p class="suave pequeno rodape">
        {{ i.t('Dica: comece pelo nível 1 e só avance quando acertar sem dicas.', 'Tip: start at level 1 and only move up when you get it right without hints.') }}
        <a routerLink="/caracteres">{{ i.t('Ver todo o vocabulário', 'See all vocabulary') }}</a>
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
  protected readonly i = inject(IdiomaService);
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

  protected readonly forma = signal<'mao' | 'teclado'>('mao');
  protected readonly itemTeclado = signal<ItemTeclado | null>(null);
  protected readonly tecladoAcertos = signal(0);
  protected readonly tecladoTotal = signal(0);
  private contadorTeclado = 0;

  protected proximoTeclado(): void {
    const estudadas = new Set(this.progresso.palavrasEstudadas().map((c) => c.ref));
    const palavras = this.vocabulario.palavras().filter((p) => !p.hanzi.includes('…'));
    const conhecidas = palavras.filter((p) => estudadas.has(p.id));
    const fonte = conhecidas.length >= 5 ? conhecidas : palavras.filter((p) => p.nivel === 1);
    if (fonte.length) this.itemTeclado.set({ id: `tec-${++this.contadorTeclado}`, tipo: 'teclado', palavra: sortear(fonte) });
  }

  protected registrarTeclado(r: ResultadoItem): void {
    this.tecladoTotal.update((n) => n + 1);
    if (r.acertou) this.tecladoAcertos.update((n) => n + 1);
    this.progresso.registrarResposta('escrita', r.acertou);
    this.proximoTeclado();
  }

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
    this.indice.update((n) => n + 1);
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
