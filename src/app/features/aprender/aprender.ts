import { Component, inject } from '@angular/core';
import { APRENDER, SOBRE } from '../../core/navegacao';
import { ListaDestinos } from '../../shared/lista-destinos/lista-destinos';
import { IdiomaService } from '../../core/i18n/idioma.service';

@Component({
  selector: 'app-aprender',
  imports: [ListaDestinos],
  template: `
    <section class="pagina">
      <header>
        <h1>{{ i.t('Aprender', 'Learn') }}</h1>
        <p class="subtitulo">{{ i.t('Explicações, vocabulário e regras — para estudar no seu ritmo.', 'Explanations, vocabulary and rules — to study at your own pace.') }}</p>
      </header>
      <app-lista-destinos [destinos]="aprender" />
      <h2 class="titulo-secao">{{ i.t('Sobre o estudo', 'About studying') }}</h2>
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
  protected readonly i = inject(IdiomaService);
  protected readonly aprender = APRENDER;
  protected readonly sobre = SOBRE;
}
