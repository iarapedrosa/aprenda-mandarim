import { Component } from '@angular/core';
import { APRENDER, SOBRE } from '../../core/navegacao';
import { ListaDestinos } from '../../shared/lista-destinos/lista-destinos';

@Component({
  selector: 'app-aprender',
  imports: [ListaDestinos],
  template: `
    <section class="pagina">
      <header>
        <h1>Aprender</h1>
        <p class="subtitulo">Explicações, vocabulário e regras — para estudar no seu ritmo.</p>
      </header>
      <app-lista-destinos [destinos]="aprender" />
      <h2 class="titulo-secao">Sobre o estudo</h2>
      <app-lista-destinos [destinos]="sobre" />
    </section>
  `,
  styles: `
    .titulo-secao {
      margin-top: 24px;
      font-size: 1.05rem;
    }
  `,
})
export class AprenderPagina {
  protected readonly aprender = APRENDER;
  protected readonly sobre = SOBRE;
}
