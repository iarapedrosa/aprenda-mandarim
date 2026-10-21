import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LeituraService } from '../../core/dados/leitura.service';
import { ProgressoService } from '../../core/progresso/progresso.service';

@Component({
  selector: 'app-leitura',
  imports: [RouterLink],
  template: `
    <section class="pagina">
      <header>
        <h1>Leitura</h1>
        <p class="subtitulo">
          Diálogos do dia a dia e historinhas curtas, do mais fácil ao mais difícil. Toque nas palavras para ver o
          significado e ouvir.
        </p>
      </header>

      <div class="abas" role="tablist" aria-label="Tipo de texto">
        <button type="button" role="tab" [class.ativa]="tipo() === 'dialogo'" [attr.aria-selected]="tipo() === 'dialogo'" (click)="tipo.set('dialogo')">Diálogos</button>
        <button type="button" role="tab" [class.ativa]="tipo() === 'historia'" [attr.aria-selected]="tipo() === 'historia'" (click)="tipo.set('historia')">Historinhas</button>
      </div>

      @if (!leitura.carregado()) {
        <p class="info">Carregando textos…</p>
      } @else {
        <ul class="textos">
          @for (t of lista(); track t.id; let i = $index) {
            <li>
              <a class="cartao texto" [routerLink]="['/leitura', t.id]">
                <span class="numero" aria-hidden="true">{{ i + 1 }}</span>
                <span class="corpo">
                  <span class="titulo-hanzi" lang="zh-CN">{{ t.tituloHanzi }}</span>
                  <strong>{{ t.titulo }}</strong>
                  <span class="suave pequeno">{{ t.resumo }}</span>
                </span>
                <span class="lado">
                  <span class="etiqueta">HSK {{ t.nivel }}</span>
                  @if (concluidos()[t.id]; as c) {
                    <span class="feito" [attr.aria-label]="'Concluído: ' + c.acertos + ' de ' + c.total">✓ {{ c.acertos }}/{{ c.total }}</span>
                  }
                </span>
              </a>
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: `
    .textos {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
    }
    .texto {
      display: flex;
      gap: 12px;
      align-items: center;
      color: var(--cor-texto);
      text-decoration: none;
      height: 100%;
    }
    .texto:hover {
      border-color: var(--cor-primaria);
    }
    .numero {
      flex: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: var(--cor-primaria-suave);
      color: var(--cor-primaria);
      font-weight: 700;
    }
    .corpo {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .titulo-hanzi {
      font-size: 1.25rem;
    }
    .lado {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
    .feito {
      color: var(--cor-sucesso);
      font-weight: 700;
      font-size: 0.85rem;
    }
  `,
})
export class LeituraPagina {
  protected readonly leitura = inject(LeituraService);
  private readonly progresso = inject(ProgressoService);
  protected readonly tipo = signal<'dialogo' | 'historia'>('dialogo');
  protected readonly lista = computed(() => this.leitura.textos().filter((t) => t.tipo === this.tipo()));
  protected readonly concluidos = computed(() => this.progresso.estado().textos);

  constructor() {
    void this.leitura.carregar();
  }
}
