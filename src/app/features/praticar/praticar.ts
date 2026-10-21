import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PRATICAR } from '../../core/navegacao';
import { ListaDestinos } from '../../shared/lista-destinos/lista-destinos';

@Component({
  selector: 'app-praticar',
  imports: [ListaDestinos, RouterLink],
  template: `
    <section class="pagina">
      <header>
        <h1>Praticar</h1>
        <p class="subtitulo">
          Treine cada habilidade livremente. Para o treino completo do dia, use o
          <a routerLink="/">Treino de hoje</a>.
        </p>
      </header>
      <app-lista-destinos [destinos]="praticar" />
    </section>
  `,
})
export class PraticarPagina {
  protected readonly praticar = PRATICAR;
}
