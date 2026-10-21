import { Component, computed, input, inject } from '@angular/core';
import { Tom } from '../../core/pinyin/pinyin';
import { IdiomaService } from '../../core/i18n/idioma.service';

/**
 * Curva de altura (pitch) de cada tom, na escala de 5 níveis de Chao Yuen Ren:
 * 1º = 55 (alto e reto), 2º = 35 (sobe), 3º = 214 (desce e sobe), 4º = 51 (cai), neutro = curto.
 */
const CURVAS: Record<Tom, { caminho: string; descricao: string; descricaoEn: string }> = {
  1: { caminho: 'M 20 20 L 180 20', descricao: 'alto e reto (5→5)', descricaoEn: 'high and level (5→5)' },
  2: { caminho: 'M 20 60 C 80 55, 130 40, 180 20', descricao: 'sobe, do meio para o alto (3→5)', descricaoEn: 'rising, from mid to high (3→5)' },
  3: {
    caminho: 'M 20 80 C 60 100, 90 108, 110 100 S 160 55, 180 40',
    descricao: 'desce até o fundo e volta a subir (2→1→4)',
    descricaoEn: 'dips to the bottom and rises again (2→1→4)',
  },
  4: { caminho: 'M 20 20 C 70 30, 130 70, 180 100', descricao: 'cai rápido, do alto até o fundo (5→1)', descricaoEn: 'falls sharply, from high to low (5→1)' },
  5: { caminho: 'M 90 70 L 110 72', descricao: 'curto e leve, sem curva própria', descricaoEn: 'short and light, no contour of its own' },
};

@Component({
  selector: 'app-diagrama-tom',
  template: `
    <svg
      viewBox="0 0 200 120"
      role="img"
      [attr.aria-label]="i.t('Curva do ', 'Contour of the ') + nome() + ': ' + i.tr(curva(), 'descricao')"
      [class]="'tom-' + tom()"
    >
      @for (nivel of niveis; track nivel.n) {
        <line x1="14" x2="190" [attr.y1]="nivel.y" [attr.y2]="nivel.y" class="guia" />
        <text x="2" [attr.y]="nivel.y + 4" class="numero">{{ nivel.n }}</text>
      }
      <path [attr.d]="curva().caminho" class="curva" />
    </svg>
  `,
  styles: `
    :host {
      display: block;
    }
    svg {
      width: 100%;
      max-width: 220px;
      height: auto;
      color: inherit;
    }
    .guia {
      stroke: var(--cor-borda);
      stroke-width: 1;
      stroke-dasharray: 3 4;
    }
    .numero {
      font-size: 10px;
      fill: var(--cor-texto-suave);
    }
    .curva {
      fill: none;
      stroke: currentColor;
      stroke-width: 7;
      stroke-linecap: round;
    }
  `,
})
export class DiagramaTom {
  protected readonly i = inject(IdiomaService);
  readonly tom = input.required<Tom>();

  protected readonly niveis = [
    { n: 5, y: 20 },
    { n: 4, y: 40 },
    { n: 3, y: 60 },
    { n: 2, y: 80 },
    { n: 1, y: 100 },
  ];

  protected readonly curva = computed(() => CURVAS[this.tom()]);
  protected readonly nome = computed(() =>
    this.tom() === 5 ? this.i.t('tom neutro', 'neutral tone') : this.i.t(`${this.tom()}º tom`, `tone ${this.tom()}`),
  );
}
