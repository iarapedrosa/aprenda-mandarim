import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ControleVoz } from '../../shared/controle-voz/controle-voz';
import { IdiomaService } from '../../core/i18n/idioma.service';

@Component({
  selector: 'app-pinyin',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ControleVoz],
  template: `
    <section class="pagina">
      <header>
        <h1>{{ i.t('Pinyin e tons', 'Pinyin and tones') }}</h1>
        <p class="subtitulo">
          {{ i.t('O pinyin é a escrita do som do mandarim com letras latinas. Toque em qualquer exemplo para ouvir.', 'Pinyin writes the sounds of Mandarin with Latin letters. Tap any example to listen.') }}
        </p>
      </header>

      <div class="barra-secao">
      <nav class="abas" [attr.aria-label]="i.t('Seções de pinyin', 'Pinyin sections')">
        @for (aba of abas; track aba.rota) {
          <a [routerLink]="aba.rota" routerLinkActive="ativa" ariaCurrentWhenActive="page">{{ i.tr(aba, 'rotulo') }}</a>
        }
      </nav>
      <app-controle-voz />
      </div>

      <router-outlet />
    </section>
  `,
  styles: `
  `,
})
export class PinyinPagina {
  protected readonly i = inject(IdiomaService);
  protected readonly abas = [
    { rota: 'tons', rotulo: 'Tons', rotuloEn: 'Tones' },
    { rota: 'sons', rotulo: 'Iniciais e finais', rotuloEn: 'Initials & finals' },
    { rota: 'armadilhas', rotulo: 'Armadilhas', rotuloEn: 'Pitfalls' },
    { rota: 'sandhi', rotulo: 'Sandhi', rotuloEn: 'Sandhi' },
    { rota: 'treino', rotulo: 'Treino de tons', rotuloEn: 'Tone drills' },
  ];
}
