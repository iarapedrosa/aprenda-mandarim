import {
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
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
 * Mostra um caractere e anima a ordem dos traços (hanzi-writer).
 */
@Component({
  selector: 'app-animacao-tracos',
  imports: [GradeHanzi],
  template: `
    <div class="quadro" [style.width.px]="tamanho()" [style.height.px]="tamanho()">
      <app-grade-hanzi />
      <div #alvo class="alvo" role="img" [attr.aria-label]="i.t('Ordem dos traços de ', 'Stroke order of ') + caractere()"></div>
    </div>
    @if (erro()) {
      <p class="erro pequeno">{{ erro() }}</p>
    } @else {
      <div class="controles">
        <button type="button" class="botao" (click)="animar()" [disabled]="!pronto()">▶ {{ i.t('Animar', 'Animate') }}</button>
        <button type="button" class="botao" (click)="proximoTraco()" [disabled]="!pronto()">
          {{ i.t('Traço a traço', 'Stroke by stroke') }}
          @if (passo() > 0) {
            ({{ passo() }}/{{ totalTracos() }})
          }
        </button>
      </div>
      @if (totalTracos()) {
        <p class="suave pequeno total">{{ totalTracos() }} {{ i.t('traços', 'strokes') }}</p>
      }
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .quadro {
      position: relative;
      background: var(--cor-superficie);
      border-radius: 8px;
      max-width: 100%;
    }
    .alvo {
      position: absolute;
      inset: 0;
    }
    .controles {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .total {
      margin: 0;
    }
  `,
})
export class AnimacaoTracos {
  protected readonly i = inject(IdiomaService);
  private readonly tema = inject(TemaService);
  readonly caractere = input.required<string>();
  readonly tamanho = input(200);
  /** anima automaticamente ao carregar */
  readonly autoAnimar = input(false);

  private readonly alvo = viewChild.required<ElementRef<HTMLDivElement>>('alvo');
  private escritor: HanziWriter | null = null;
  protected readonly pronto = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly totalTracos = signal(0);
  protected readonly passo = signal(0);

  constructor() {
    effect(() => {
      const caractere = this.caractere();
      const tamanho = this.tamanho();
      this.tema.temaAtivo();
      untracked(() => this.criar(caractere, tamanho));
    });
    inject(DestroyRef).onDestroy(() => this.limpar());
  }

  private limpar(): void {
    this.alvo().nativeElement.innerHTML = '';
    this.escritor = null;
  }

  private criar(caractere: string, tamanho: number): void {
    this.limpar();
    this.pronto.set(false);
    this.erro.set(null);
    this.passo.set(0);
    const cores = coresDoTema();
    this.escritor = HanziWriter.create(this.alvo().nativeElement, caractere, {
      width: tamanho,
      height: tamanho,
      padding: 8,
      strokeColor: cores.traco,
      outlineColor: cores.contorno,
      radicalColor: cores.radical,
      highlightColor: cores.destaque,
      strokeAnimationSpeed: 1.2,
      delayBetweenStrokes: 220,
      charDataLoader: (c) => carregarTracos(c),
      onLoadCharDataSuccess: (dados) => {
        this.totalTracos.set(dados.strokes.length);
        this.pronto.set(true);
        if (this.autoAnimar()) this.animar();
      },
      onLoadCharDataError: () =>
        this.erro.set(this.i.t('Não foi possível carregar os traços (verifique a conexão).', 'Could not load the strokes (check your connection).')),
    });
  }

  protected animar(): void {
    this.passo.set(0);
    void this.escritor?.animateCharacter();
  }

  protected proximoTraco(): void {
    const escritor = this.escritor;
    if (!escritor) return;
    if (this.passo() === 0 || this.passo() >= this.totalTracos()) {
      escritor.hideCharacter();
      this.passo.set(0);
    }
    const indice = this.passo();
    void escritor.animateStroke(indice);
    this.passo.set(indice + 1);
  }
}
