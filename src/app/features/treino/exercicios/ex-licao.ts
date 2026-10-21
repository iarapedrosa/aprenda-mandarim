import { Component, input, output, inject } from '@angular/core';
import { CartaoSom } from '../../../shared/cartao-som/cartao-som';
import { ItemLicao, ResultadoItem } from '../sessao.model';
import { IdiomaService } from '../../../core/i18n/idioma.service';

/** Explicação curta de uma lição de pinyin, com exemplos para ouvir. */
@Component({
  selector: 'app-ex-licao',
  imports: [CartaoSom],
  template: `
    <p class="etiqueta">{{ i.t('Lição de pinyin', 'Pinyin lesson') }}</p>
    <h2>{{ i.tr(item().dados, 'titulo') }}</h2>
    @for (p of i.trLista(item().dados, 'texto'); track p) {
      <p>{{ p }}</p>
    }
    <p class="suave pequeno">{{ i.t('Toque nos exemplos para ouvir e repita em voz alta:', 'Tap the examples to listen and repeat out loud:') }}</p>
    <div class="exemplos">
      @for (e of item().dados.exemplos; track e.hanzi + e.pinyin) {
        <app-cartao-som [hanzi]="e.hanzi" [pinyin]="e.pinyin" [traducao]="i.tr(e, 'traducao')" />
      }
    </div>
    <button type="button" class="botao botao-primario botao-bloco" (click)="concluir.emit({ acertou: true, informativo: true })">
      {{ i.t('Entendi, vamos praticar', 'Got it, let’s practice') }}
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
  protected readonly i = inject(IdiomaService);
  readonly item = input.required<ItemLicao>();
  readonly concluir = output<ResultadoItem>();
}
