import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ControleVoz } from '../../shared/controle-voz/controle-voz';

@Component({
  selector: 'app-pinyin',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ControleVoz],
  template: `
    <section class="pagina">
      <header>
        <h1>Pinyin e tons</h1>
        <p class="subtitulo">
          O pinyin é a escrita do som do mandarim com letras latinas. Toque em qualquer exemplo para
          ouvir.
        </p>
      </header>

      <nav class="abas" aria-label="Seções de pinyin">
        @for (aba of abas; track aba.rota) {
          <a [routerLink]="aba.rota" routerLinkActive="ativa" ariaCurrentWhenActive="page">{{
            aba.rotulo
          }}</a>
        }
      </nav>

      <app-controle-voz class="controle" />

      <router-outlet />
    </section>
  `,
  styles: `
    .controle {
      margin-bottom: 16px;
    }
  `,
})
export class PinyinPagina {
  protected readonly abas = [
    { rota: 'tons', rotulo: 'Tons' },
    { rota: 'sons', rotulo: 'Iniciais e finais' },
    { rota: 'armadilhas', rotulo: 'Armadilhas' },
    { rota: 'sandhi', rotulo: 'Sandhi' },
    { rota: 'treino', rotulo: 'Treino de tons' },
  ];
}
