import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ControleVoz } from '../../shared/controle-voz/controle-voz';

@Component({
  selector: 'app-numeros',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ControleVoz],
  template: `
    <section class="pagina">
      <header>
        <h1>Números <span lang="zh-CN" class="hanzi-titulo">数字</span></h1>
        <p class="subtitulo">Contar, preços, horas, datas e telefones — com áudio e pinyin.</p>
      </header>
      <nav class="abas" aria-label="Seções de números">
        <a routerLink="aprender" routerLinkActive="ativa" ariaCurrentWhenActive="page">Aprender</a>
        <a routerLink="conversor" routerLinkActive="ativa" ariaCurrentWhenActive="page">Conversor</a>
        <a routerLink="praticar" routerLinkActive="ativa" ariaCurrentWhenActive="page">Praticar</a>
      </nav>
      <app-controle-voz class="voz" />
      <router-outlet />
    </section>
  `,
  styles: `
    .hanzi-titulo {
      color: var(--cor-primaria);
      font-size: 0.8em;
    }
    .voz {
      display: block;
      margin-bottom: 16px;
    }
  `,
})
export class NumerosPagina {}
