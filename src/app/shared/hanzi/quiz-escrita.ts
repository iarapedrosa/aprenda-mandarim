import {
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import HanziWriter from 'hanzi-writer';
import { TemaService } from '../../core/tema/tema.service';
import { carregarTracos } from './carregador-tracos';
import { coresDoTema } from './cores-hanzi';
import { GradeHanzi } from './grade-hanzi';
import { IdiomaService } from '../../core/i18n/idioma.service';

/**
 * - contorno: o caractere aparece em cinza para "decalcar";
 * - sem-contorno: quadro vazio, mas a pessoa vê o caractere antes;
 * - memoria: só pinyin/tradução, sem ver o caractere (o componente pai esconde o modelo).
 */
export type NivelEscrita = 'contorno' | 'sem-contorno' | 'memoria';

export interface ResultadoEscrita {
  caractere: string;
  erros: number;
  tracos: number;
  /** usou "mostrar dica" */
  ajuda: boolean;
}

/**
 * Prática de escrita com o quiz do hanzi-writer: a pessoa desenha com o dedo ou o mouse
 * e cada traço é corrigido na hora.
 */
@Component({
  selector: 'app-quiz-escrita',
  imports: [GradeHanzi],
  template: `
    <div
      class="quadro"
      [style.width.px]="tamanho()"
      [style.height.px]="tamanho()"
      [class.concluido]="concluido()"
    >
      <app-grade-hanzi />
      <div
        #alvo
        class="alvo"
        role="application"
        [attr.aria-label]="i.t('Área de desenho: escreva o caractere traço a traço', 'Drawing area: write the character stroke by stroke')"
      ></div>
    </div>
    <p class="status" aria-live="polite">
      @if (erro()) {
        <span class="erro">{{ erro() }}</span>
      } @else if (concluido()) {
        <strong>{{ i.t('Pronto!', 'Done!') }}</strong> {{ erros() === 0 ? i.t('Sem nenhum erro 🎉', 'No mistakes 🎉') : erros() + i.t(' erro(s).', ' mistake(s).') }}
      } @else if (totalTracos()) {
        {{ i.t('Traço', 'Stroke') }} {{ tracosFeitos() + 1 }} {{ i.t('de', 'of') }} {{ totalTracos() }}
        @if (erros()) {
          · {{ erros() }} {{ i.t('erro(s)', 'mistake(s)') }}
        }
      } @else {
        {{ i.t('Carregando…', 'Loading…') }}
      }
    </p>
    <div class="controles">
      <button type="button" class="botao" (click)="recomecar()">↺ {{ i.t('Recomeçar', 'Restart') }}</button>
      @if (!concluido()) {
        <button type="button" class="botao" (click)="dica()">💡 {{ i.t('Dica', 'Hint') }}</button>
      }
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .quadro {
      position: relative;
      background: var(--cor-superficie);
      border-radius: 8px;
      border: 2px solid transparent;
      touch-action: none;
      max-width: 100%;
    }
    .quadro.concluido {
      border-color: var(--cor-sucesso);
    }
    .alvo {
      position: absolute;
      inset: 0;
    }
    .status {
      margin: 0;
      min-height: 1.5em;
      text-align: center;
    }
    .controles {
      display: flex;
      gap: 8px;
    }
  `,
})
export class QuizEscrita {
  protected readonly i = inject(IdiomaService);
  private readonly tema = inject(TemaService);
  readonly caractere = input.required<string>();
  readonly nivel = input<NivelEscrita>('contorno');
  readonly tamanho = input(260);
  readonly concluir = output<ResultadoEscrita>();

  private readonly alvo = viewChild.required<ElementRef<HTMLDivElement>>('alvo');
  private escritor: HanziWriter | null = null;
  private usouAjuda = false;

  protected readonly totalTracos = signal(0);
  protected readonly tracosFeitos = signal(0);
  protected readonly erros = signal(0);
  protected readonly concluido = signal(false);
  protected readonly erro = signal<string | null>(null);

  constructor() {
    effect(() => {
      const caractere = this.caractere();
      const nivel = this.nivel();
      const tamanho = this.tamanho();
      this.tema.temaAtivo();
      untracked(() => this.criar(caractere, nivel, tamanho));
    });
    inject(DestroyRef).onDestroy(() => this.limpar());
  }

  private limpar(): void {
    this.escritor?.cancelQuiz();
    this.alvo().nativeElement.innerHTML = '';
    this.escritor = null;
  }

  private criar(caractere: string, nivel: NivelEscrita, tamanho: number): void {
    this.limpar();
    this.totalTracos.set(0);
    this.erro.set(null);
    const cores = coresDoTema();
    this.escritor = HanziWriter.create(this.alvo().nativeElement, caractere, {
      width: tamanho,
      height: tamanho,
      padding: 10,
      showCharacter: false,
      showOutline: nivel === 'contorno',
      strokeColor: cores.traco,
      outlineColor: cores.contorno,
      highlightColor: cores.destaque,
      drawingColor: cores.desenho,
      drawingWidth: 6,
      showHintAfterMisses: nivel === 'contorno' ? 2 : 3,
      highlightOnComplete: true,
      leniency: 1.1,
      charDataLoader: (c) => carregarTracos(c),
      onLoadCharDataSuccess: (dados) => this.totalTracos.set(dados.strokes.length),
      onLoadCharDataError: () =>
        this.erro.set(this.i.t('Não foi possível carregar os traços (verifique a conexão).', 'Could not load the strokes (check your connection).')),
    });
    this.iniciarQuiz();
  }

  private iniciarQuiz(): void {
    this.tracosFeitos.set(0);
    this.erros.set(0);
    this.concluido.set(false);
    this.usouAjuda = false;
    void this.escritor?.quiz({
      onMistake: () => this.erros.update((n) => n + 1),
      onCorrectStroke: (d) => this.tracosFeitos.set(d.strokeNum + 1),
      onComplete: (resumo) => {
        this.concluido.set(true);
        this.concluir.emit({
          caractere: this.caractere(),
          erros: resumo.totalMistakes,
          tracos: this.totalTracos(),
          ajuda: this.usouAjuda,
        });
      },
    });
  }

  protected recomecar(): void {
    this.escritor?.cancelQuiz();
    if (this.nivel() === 'contorno') this.escritor?.showOutline();
    else this.escritor?.hideOutline();
    this.escritor?.hideCharacter();
    this.iniciarQuiz();
  }

  /** Mostra o contorno por um instante (conta como ajuda). */
  protected dica(): void {
    this.usouAjuda = true;
    const escritor = this.escritor;
    if (!escritor) return;
    void escritor.showOutline();
    if (this.nivel() !== 'contorno') setTimeout(() => void escritor.hideOutline(), 1500);
  }
}
