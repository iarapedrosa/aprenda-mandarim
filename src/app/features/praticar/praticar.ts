import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PRATICAR } from '../../core/navegacao';
import { ListaDestinos } from '../../shared/lista-destinos/lista-destinos';
import { IdiomaService } from '../../core/i18n/idioma.service';

@Component({
  selector: 'app-praticar',
  imports: [ListaDestinos, RouterLink],
  template: `
    <section class="pagina">
      <header>
        <h1>{{ i.t('Praticar', 'Practice') }}</h1>
        <p class="subtitulo">
          {{ i.t('Treine cada habilidade livremente. Para o treino completo do dia, use o', 'Practice each skill freely. For the full daily workout, use') }}
          <a routerLink="/">{{ i.t('Treino de hoje', 'Today’s training') }}</a>.
        </p>
      </header>
      <app-lista-destinos [destinos]="praticar" />
    </section>
  `,
})
export class PraticarPagina {
  protected readonly i = inject(IdiomaService);
  protected readonly praticar = PRATICAR;
}
