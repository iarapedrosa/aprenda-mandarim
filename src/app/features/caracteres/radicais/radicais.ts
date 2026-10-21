import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VocabularioService } from '../../../core/dados/vocabulario.service';
import { AnimacaoTracos } from '../../../shared/hanzi/animacao-tracos';

@Component({
  selector: 'app-radicais',
  imports: [RouterLink, AnimacaoTracos],
  template: `
    <section class="pagina">
      <header>
        <h1>Radicais</h1>
        <p class="subtitulo">
          Radicais são as "peças" que formam os caracteres e costumam dar uma pista do significado.
          Conhecer os mais comuns ajuda muito a memorizar.
        </p>
      </header>

      <nav class="abas" aria-label="Seções de caracteres">
        <a routerLink="/caracteres">Vocabulário</a>
        <a routerLink="/caracteres/radicais" class="ativa" aria-current="page">Radicais</a>
        <a routerLink="/escrita">Praticar escrita</a>
      </nav>

      <p class="info pequeno">
        Exemplo: <span lang="zh-CN">氵</span> (água) + <span lang="zh-CN">先</span> = <span lang="zh-CN">洗</span>
        (lavar). Muitos caracteres juntam um radical de <strong>significado</strong> com uma parte que dá
        o <strong>som</strong>: <span lang="zh-CN">妈</span> = <span lang="zh-CN">女</span> (mulher) +
        <span lang="zh-CN">马</span> (som "ma").
      </p>

      @if (!vocabulario.carregado()) {
        <p class="info">Carregando…</p>
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
                  <strong>{{ r.significado }}</strong>
                  <span class="suave pequeno">
                    {{ r.pinyin }}
                    @if (r.completo !== r.forma) {
                      · forma completa <span lang="zh-CN">{{ r.completo }}</span>
                    }
                  </span>
                </span>
                <span aria-hidden="true">{{ aberto() === r.forma ? '▴' : '▾' }}</span>
              </button>
              @if (aberto() === r.forma) {
                <div class="detalhes">
                  <app-animacao-tracos [caractere]="r.forma" [tamanho]="140" [autoAnimar]="true" />
                  <p>{{ r.dica }}</p>
                </div>
              }
              <p class="exemplos">
                @for (c of r.exemplos; track c) {
                  @if (palavraDe(c); as p) {
                    <a [routerLink]="['/caracteres/palavra', p.id]" lang="zh-CN" [title]="p.pinyin + ' — ' + p.traducao">{{ c }}</a>
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
