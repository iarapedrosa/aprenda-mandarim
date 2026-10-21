import { Component, input, output } from '@angular/core';
import { CartaoSom } from '../../../shared/cartao-som/cartao-som';
import { ItemLicao, ResultadoItem } from '../sessao.model';

/** Explicação curta de uma lição de pinyin, com exemplos para ouvir. */
@Component({
  selector: 'app-ex-licao',
  imports: [CartaoSom],
  template: `
    <p class="etiqueta">Lição de pinyin</p>
    <h2>{{ item().dados.titulo }}</h2>
    @for (p of item().dados.texto; track p) {
      <p>{{ p }}</p>
    }
    <p class="suave pequeno">Toque nos exemplos para ouvir e repita em voz alta:</p>
    <div class="exemplos">
      @for (e of item().dados.exemplos; track e.hanzi + e.pinyin) {
        <app-cartao-som [hanzi]="e.hanzi" [pinyin]="e.pinyin" [traducao]="e.traducao" />
      }
    </div>
    <button type="button" class="botao botao-primario botao-bloco" (click)="concluir.emit({ acertou: true, informativo: true })">
      Entendi, vamos praticar
    </button>
  `,
  styles: `
    :host {
      display: block;
    }
    h2 {
      margin-top: 8px;
    }
    .exemplos {
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 130px), 1fr));
      margin-bottom: 16px;
    }
  `,
})
export class ExLicao {
  readonly item = input.required<ItemLicao>();
  readonly concluir = output<ResultadoItem>();
}
