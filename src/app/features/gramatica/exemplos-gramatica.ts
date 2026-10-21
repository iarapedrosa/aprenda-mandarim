import { Component, input } from '@angular/core';
import { Frase } from '../../core/dados/modelos';
import { BotaoAudio } from '../../shared/botao-audio/botao-audio';
import { PinyinColorido } from '../../shared/pinyin-colorido/pinyin-colorido';

/** Lista de frases de exemplo com pinyin, tradução e áudio. */
@Component({
  selector: 'app-exemplos-gramatica',
  imports: [BotaoAudio, PinyinColorido],
  template: `
    <ul class="exemplos">
      @for (e of exemplos(); track e.hanzi) {
        <li>
          <app-botao-audio [texto]="e.hanzi" [rotulo]="e.pinyin" [compacto]="true" />
          <div>
            <p class="hanzi" lang="zh-CN">{{ e.hanzi }}</p>
            <p><app-pinyin [texto]="e.pinyin" /></p>
            <p class="suave">{{ e.traducao }}</p>
          </div>
        </li>
      }
    </ul>
  `,
  styles: `
    .exemplos {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 10px;
    }
    li {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      padding: 10px;
      border-radius: var(--raio-p);
      background: var(--cor-superficie-2);
    }
    p {
      margin: 0;
    }
    .hanzi {
      font-size: 1.3rem;
    }
  `,
})
export class ExemplosGramatica {
  readonly exemplos = input.required<Frase[]>();
}
