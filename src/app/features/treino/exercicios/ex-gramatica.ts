import { Component, input, output, inject } from '@angular/core';
import { ExemplosGramatica } from '../../gramatica/exemplos-gramatica';
import { ItemGramatica, ResultadoItem } from '../sessao.model';
import { IdiomaService } from '../../../core/i18n/idioma.service';

/** Explicação curta de um ponto de gramática, antes dos exercícios. */
@Component({
  selector: 'app-ex-gramatica',
  imports: [ExemplosGramatica],
  template: `
    <p class="etiqueta">{{ i.t('Gramática', 'Grammar') }}</p>
    <h2>{{ i.tr(item().dados, 'titulo') }}</h2>
    <p class="estrutura">{{ i.tr(item().dados, 'estrutura') }}</p>
    @for (p of i.trLista(item().dados, 'explicacao'); track p) {
      <p>{{ p }}</p>
    }
    <app-exemplos-gramatica [exemplos]="item().dados.exemplos" />
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
    .estrutura {
      font-weight: 700;
      padding: 8px 12px;
      border-radius: var(--raio-p);
      background: var(--cor-primaria-suave);
      color: var(--cor-primaria);
    }
    app-exemplos-gramatica {
      display: block;
      margin: 12px 0 16px;
    }
  `,
})
export class ExGramatica {
  protected readonly i = inject(IdiomaService);
  readonly item = input.required<ItemGramatica>();
  readonly concluir = output<ResultadoItem>();
}
