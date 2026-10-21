import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ControleVoz } from '../../shared/controle-voz/controle-voz';
import { IdiomaService } from '../../core/i18n/idioma.service';

@Component({
  selector: 'app-numeros',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ControleVoz],
  template: `
    <section class="pagina">
      <header>
        <h1>{{ i.t('Números', 'Numbers') }} <span lang="zh-CN" class="hanzi-titulo">数字</span></h1>
        <p class="subtitulo">{{ i.t('Contar, preços, horas, datas e telefones — com áudio e pinyin.', 'Counting, prices, times, dates and phone numbers — with audio and pinyin.') }}</p>
      </header>
      <nav class="abas" [attr.aria-label]="i.t('Seções de números', 'Number sections')">
        <a routerLink="aprender" routerLinkActive="ativa" ariaCurrentWhenActive="page">{{ i.t('Aprender', 'Learn') }}</a>
        <a routerLink="conversor" routerLinkActive="ativa" ariaCurrentWhenActive="page">{{ i.t('Conversor', 'Converter') }}</a>
        <a routerLink="praticar" routerLinkActive="ativa" ariaCurrentWhenActive="page">{{ i.t('Praticar', 'Practice') }}</a>
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
export class NumerosPagina {
  protected readonly i = inject(IdiomaService);
}
