import { Component } from '@angular/core';

/** Grade 米字格 (quadrado com linhas guia) usada no fundo da escrita. */
@Component({
  selector: 'app-grade-hanzi',
  template: `
    <svg viewBox="0 0 100 100" aria-hidden="true" preserveAspectRatio="none">
      <rect x="0.5" y="0.5" width="99" height="99" class="borda" />
      <line x1="0" y1="0" x2="100" y2="100" />
      <line x1="100" y1="0" x2="0" y2="100" />
      <line x1="50" y1="0" x2="50" y2="100" />
      <line x1="0" y1="50" x2="100" y2="50" />
    </svg>
  `,
  styles: `
    :host {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    svg {
      width: 100%;
      height: 100%;
    }
    line {
      stroke: var(--cor-borda);
      stroke-width: 0.5;
      stroke-dasharray: 2 2;
      vector-effect: non-scaling-stroke;
    }
    .borda {
      fill: none;
      stroke: var(--cor-borda);
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
  `,
})
export class GradeHanzi {}
