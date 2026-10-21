import { Component, computed, inject, input } from '@angular/core';
import { Velocidade, VozService } from '../../core/voz/voz.service';

/**
 * Botão que pronuncia um texto em mandarim.
 * Uso: <app-botao-audio texto="你好" rotulo="nǐ hǎo" />
 */
@Component({
  selector: 'app-botao-audio',
  template: `
    <button
      type="button"
      class="botao-audio"
      [class.compacto]="compacto()"
      [class.lento]="velocidade() === 'lenta'"
      [disabled]="!voz.suportado"
      (click)="tocar($event)"
      [attr.aria-label]="rotuloAcessivel()"
      [title]="rotuloAcessivel()"
    >
      @if (velocidade() === 'lenta') {
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M19 11.5c0-3.6-3-6.5-6.8-6.5S5.4 7.9 5.4 11.5H4a1 1 0 0 0 0 2h1.7l-.6 2.2a1 1 0 0 0 1.9.6l.8-2.8h8.5l.8 2.8a1 1 0 0 0 1.9-.6l-.6-2.2H21a1 1 0 0 0 0-2h-2Zm-6.8-4.5c2.5 0 4.6 1.8 4.8 4.5H7.4c.2-2.7 2.3-4.5 4.8-4.5Z"
          />
        </svg>
      } @else {
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4Z" />
          <path
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
          />
        </svg>
      }
      @if (legenda()) {
        <span class="legenda">{{ legenda() }}</span>
      }
    </button>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
    .botao-audio {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-width: 44px;
      min-height: 44px;
      padding: 8px 12px;
      border-radius: 999px;
      border: 1px solid var(--cor-borda);
      background: var(--cor-primaria-suave);
      color: var(--cor-primaria);
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      justify-content: center;
    }
    .botao-audio:hover {
      border-color: var(--cor-primaria);
    }
    .botao-audio:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .botao-audio.compacto {
      min-width: 36px;
      min-height: 36px;
      padding: 6px;
    }
    svg {
      width: 22px;
      height: 22px;
    }
    .compacto svg {
      width: 18px;
      height: 18px;
    }
  `,
})
export class BotaoAudio {
  protected readonly voz = inject(VozService);

  /** texto em chinês a ser falado */
  readonly texto = input.required<string>();
  /** descrição para leitores de tela (ex.: o pinyin) */
  readonly rotulo = input<string>('');
  /** texto visível ao lado do ícone */
  readonly legenda = input<string>('');
  /** força uma velocidade (senão usa a preferência global) */
  readonly velocidade = input<Velocidade | undefined>(undefined);
  readonly compacto = input(false);

  protected readonly rotuloAcessivel = computed(() => {
    const base = this.velocidade() === 'lenta' ? 'Ouvir devagar' : 'Ouvir';
    return `${base}: ${this.rotulo() || this.texto()}`;
  });

  protected tocar(evento: Event): void {
    evento.stopPropagation();
    void this.voz.falar(this.texto(), { velocidade: this.velocidade() });
  }
}
