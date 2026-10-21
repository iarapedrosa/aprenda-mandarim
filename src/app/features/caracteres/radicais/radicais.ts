import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VocabularioService } from '../../../core/dados/vocabulario.service';
import { AnimacaoTracos } from '../../../shared/hanzi/animacao-tracos';
import { IdiomaService } from '../../../core/i18n/idioma.service';

@Component({
  selector: 'app-radicais',
  imports: [RouterLink, AnimacaoTracos],
  template: `
    <section class="pagina">
      <header>
        <h1>{{ i.t('Radicais', 'Radicals') }}</h1>
        <p class="subtitulo">
          {{ i.t('Radicais são as "peças" que formam os caracteres e costumam dar uma pista do significado. Conhecer os mais comuns ajuda muito a memorizar.', 'Radicals are the "building blocks" of characters and often hint at the meaning. Knowing the common ones helps a lot with memorizing.') }}
        </p>
      </header>

      <nav class="abas" [attr.aria-label]="i.t('Seções de caracteres', 'Character sections')">
        <a routerLink="/caracteres">{{ i.t('Vocabulário', 'Vocabulary') }}</a>
        <a routerLink="/caracteres/radicais" class="ativa" aria-current="page">{{ i.t('Radicais', 'Radicals') }}</a>
        <a routerLink="/escrita">{{ i.t('Praticar escrita', 'Practice writing') }}</a>
      </nav>

      <p class="info pequeno">
        @if (i.ingles()) {
          Example: <span lang="zh-CN">氵</span> (water) + <span lang="zh-CN">先</span> = <span lang="zh-CN">洗</span>
          (to wash). Many characters combine a <strong>meaning</strong> radical with a part that gives
          the <strong>sound</strong>: <span lang="zh-CN">妈</span> = <span lang="zh-CN">女</span> (woman) +
          <span lang="zh-CN">马</span> (sound "ma").
        } @else {
          Exemplo: <span lang="zh-CN">氵</span> (água) + <span lang="zh-CN">先</span> = <span lang="zh-CN">洗</span>
          (lavar). Muitos caracteres juntam um radical de <strong>significado</strong> com uma parte que dá
          o <strong>som</strong>: <span lang="zh-CN">妈</span> = <span lang="zh-CN">女</span> (mulher) +
          <span lang="zh-CN">马</span> (som "ma").
        }
      </p>

      @if (!vocabulario.carregado()) {
        <p class="info">{{ i.t('Carregando…', 'Loading…') }}</p>
      } @else {
        <ul class="radicais">
          @for (r of vocabulario.radicais(); track r.forma) {
            <li class="cartao radical">
              <button
                type="button"
                class="cabecalho"
                [attr.aria-expanded]="aberto() === r.forma"
                (click)="aberto.set(aberto() === r.forma ? null : r.forma)"
              >
                <span class="forma" lang="zh-CN">{{ r.forma }}</span>
                <span class="textos">
                  <strong>{{ i.tr(r, 'significado') }}</strong>
                  <span class="suave pequeno">
                    {{ r.pinyin }}
                    @if (r.completo !== r.forma) {
                      · {{ i.t('forma completa', 'full form') }} <span lang="zh-CN">{{ r.completo }}</span>
                    }
                  </span>
                </span>
                <span aria-hidden="true">{{ aberto() === r.forma ? '▴' : '▾' }}</span>
              </button>
              @if (aberto() === r.forma) {
                <div class="detalhes">
                  <app-animacao-tracos [caractere]="r.forma" [tamanho]="140" [autoAnimar]="true" />
                  <p>{{ i.tr(r, 'dica') }}</p>
                </div>
              }
              <p class="exemplos">
                @for (c of r.exemplos; track c) {
                  @if (palavraDe(c); as p) {
                    <a [routerLink]="['/caracteres/palavra', p.id]" lang="zh-CN" [title]="p.pinyin + ' — ' + i.tr(p, 'traducao')">{{ c }}</a>
                  } @else {
                    <span lang="zh-CN">{{ c }}</span>
                  }
                }
              </p>
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: `
    .radicais {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
      align-items: start;
    }
    .radical {
      padding: 12px;
    }
    .radical + .radical {
      margin-top: 0;
    }
    .cabecalho {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      border: 0;
      background: none;
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
      padding: 0;
    }
    .forma {
      font-family: var(--fonte-hanzi);
      font-size: 2.2rem;
      color: var(--cor-primaria);
      min-width: 1.3em;
      text-align: center;
    }
    .textos {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .detalhes {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 10px;
    }
    .exemplos {
      margin: 8px 0 0;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      font-size: 1.4rem;
    }
    .exemplos a {
      text-decoration: none;
    }
  `,
})
export class RadicaisPagina {
  protected readonly i = inject(IdiomaService);
  protected readonly vocabulario = inject(VocabularioService);
  protected readonly aberto = signal<string | null>(null);

  constructor() {
    void this.vocabulario.carregar();
  }

  /** Palavra do vocabulário que tem esse caractere (prefere a palavra de 1 caractere). */
  protected palavraDe(c: string) {
    return this.vocabulario.caractereIsolado().get(c) ?? this.vocabulario.porCaractere().get(c)?.[0];
  }
}
