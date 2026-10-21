import { Component } from '@angular/core';
import { CartaoSom } from '../../../shared/cartao-som/cartao-som';
import { ARMADILHAS } from '../dados-pinyin';

@Component({
  selector: 'app-armadilhas',
  imports: [CartaoSom],
  template: `
    <p>
      O pinyin usa letras que conhecemos, mas com sons diferentes. Estas são as armadilhas mais comuns
      para quem fala português — toque nos exemplos e repita em voz alta.
    </p>
    @for (a of armadilhas; track a.titulo; let i = $index) {
      <article class="cartao armadilha">
        <h2><span class="numero" aria-hidden="true">{{ i + 1 }}</span> {{ a.titulo }}</h2>
        <p>{{ a.explicacao }}</p>
        <div class="exemplos">
          @for (e of a.exemplos; track e.hanzi) {
            <app-cartao-som [hanzi]="e.hanzi" [pinyin]="e.pinyin" [traducao]="e.traducao" />
          }
        </div>
      </article>
    }
  `,
  styles: `
    .armadilha h2 {
      display: flex;
      gap: 10px;
      align-items: center;
      font-size: 1.15rem;
    }
    .numero {
      flex: none;
      display: inline-grid;
      place-items: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--cor-primaria);
      color: var(--cor-sobre-primaria);
      font-size: 0.95rem;
    }
    .exemplos {
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 130px), 1fr));
    }
  `,
})
export class ArmadilhasPagina {
  protected readonly armadilhas = ARMADILHAS;
}
