import { Component, inject, input } from '@angular/core';
import { VozService } from '../../core/voz/voz.service';
import { PinyinColorido } from '../pinyin-colorido/pinyin-colorido';
import { IdiomaService } from '../../core/i18n/idioma.service';

/** Botão grande com caractere, pinyin e tradução; ao tocar, pronuncia. */
@Component({
  selector: 'app-cartao-som',
  imports: [PinyinColorido],
  template: `
    <button
      type="button"
      class="cartao-som"
      (click)="voz.falar(hanzi())"
      [attr.aria-label]="i.t('Ouvir ', 'Listen to ') + hanzi() + ', ' + pinyin() + (traducao() ? ', ' + traducao() : '')"
    >
      @if (destaque()) {
        <span class="destaque">{{ destaque() }}</span>
      }
      <span class="hanzi" lang="zh-CN">{{ hanzi() }}</span>
      <app-pinyin [texto]="pinyin()" />
      @if (traducao()) {
        <span class="traducao">{{ traducao() }}</span>
      }
    </button>
  `,
  styles: `
    :host {
      display: block;
    }
    .cartao-som {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 12px 8px;
      border-radius: var(--raio-p);
      border: 1px solid var(--cor-borda);
      background: var(--cor-superficie);
      color: var(--cor-texto);
      font: inherit;
      cursor: pointer;
      text-align: center;
    }
    .cartao-som:hover {
      border-color: var(--cor-primaria);
      background: var(--cor-primaria-suave);
    }
    .destaque {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--cor-primaria);
    }
    .hanzi {
      font-size: 1.9rem;
      line-height: 1.2;
    }
    .traducao {
      font-size: 0.8rem;
      color: var(--cor-texto-suave);
    }
  `,
})
export class CartaoSom {
  protected readonly i = inject(IdiomaService);
  protected readonly voz = inject(VozService);
  readonly hanzi = input.required<string>();
  readonly pinyin = input.required<string>();
  readonly traducao = input<string | undefined>('');
  /** texto em destaque acima (ex.: a letra da inicial) */
  readonly destaque = input<string>('');
}
