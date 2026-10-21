import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VocabularioService } from '../../core/dados/vocabulario.service';
import { combinaBusca } from '../../core/util/texto';
import { PinyinColorido } from '../../shared/pinyin-colorido/pinyin-colorido';

@Component({
  selector: 'app-caracteres',
  imports: [RouterLink, PinyinColorido],
  template: `
    <section class="pagina">
      <header>
        <h1>Caracteres</h1>
        <p class="subtitulo">
          Vocabulário do HSK 1 e 2 com pinyin, tradução, exemplo e ordem dos traços.
        </p>
      </header>

      <nav class="abas" aria-label="Seções de caracteres">
        <a routerLink="/caracteres" class="ativa" aria-current="page">Vocabulário</a>
        <a routerLink="/caracteres/radicais">Radicais</a>
        <a routerLink="/escrita">Praticar escrita</a>
      </nav>

      <div class="filtros">
        <label class="busca">
          <span class="visualmente-oculto">Buscar</span>
          <input
            class="campo"
            type="search"
            placeholder="Buscar: 你好, ni hao, olá…"
            [value]="busca()"
            (input)="busca.set($any($event.target).value)"
          />
        </label>
        <div class="niveis" role="radiogroup" aria-label="Nível">
          <button type="button" role="radio" [attr.aria-checked]="nivel() === 0" [class.ativo]="nivel() === 0" (click)="nivel.set(0)">
            Todos
          </button>
          @for (n of vocabulario.niveis(); track n.id; let idx = $index) {
            <button
              type="button"
              role="radio"
              [attr.aria-checked]="nivel() === idx + 1"
              [class.ativo]="nivel() === idx + 1"
              (click)="nivel.set(idx + 1)"
            >
              {{ n.nome }}
            </button>
          }
        </div>
      </div>

      @if (vocabulario.erro(); as erro) {
        <p class="erro">{{ erro }}</p>
      } @else if (!vocabulario.carregado()) {
        <p class="info">Carregando vocabulário…</p>
      } @else {
        <p class="suave pequeno" aria-live="polite">{{ filtradas().length }} palavra(s)</p>
        <ul class="lista">
          @for (p of filtradas(); track p.id) {
            <li>
              <a class="item" [routerLink]="['/caracteres/palavra', p.id]">
                <span class="hanzi" lang="zh-CN">{{ p.hanzi }}</span>
                <span class="textos">
                  <app-pinyin [texto]="p.pinyin" />
                  <span class="traducao">{{ p.traducao }}</span>
                </span>
                <span class="etiqueta">HSK {{ p.nivel }}</span>
              </a>
            </li>
          } @empty {
            <li class="info">Nenhuma palavra encontrada.</li>
          }
        </ul>
      }
    </section>
  `,
  styles: `
    .filtros {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 8px;
    }
    .niveis {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .niveis button {
      min-height: 40px;
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid var(--cor-borda);
      background: var(--cor-superficie);
      color: var(--cor-texto);
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }
    .niveis button.ativo {
      background: var(--cor-texto);
      color: var(--cor-fundo);
    }
    .lista {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
    }
    .item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: var(--raio-p);
      border: 1px solid var(--cor-borda);
      background: var(--cor-superficie);
      color: var(--cor-texto);
      text-decoration: none;
    }
    .item:hover {
      border-color: var(--cor-primaria);
    }
    .hanzi {
      font-size: 1.8rem;
      min-width: 2.4em;
      text-align: center;
    }
    .textos {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }
    .traducao {
      color: var(--cor-texto-suave);
      font-size: 0.9rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,
})
export class CaracteresPagina {
  protected readonly vocabulario = inject(VocabularioService);
  protected readonly busca = signal('');
  protected readonly nivel = signal(0);

  protected readonly filtradas = computed(() => {
    const nivel = this.nivel();
    const busca = this.busca();
    return this.vocabulario
      .palavras()
      .filter((p) => (nivel === 0 || p.nivel === nivel) && combinaBusca(busca, p.hanzi, p.pinyin, p.traducao));
  });

  constructor() {
    void this.vocabulario.carregar();
  }
}
