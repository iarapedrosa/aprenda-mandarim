import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GramaticaService } from '../../core/dados/gramatica.service';
import { ProgressoService } from '../../core/progresso/progresso.service';

@Component({
  selector: 'app-gramatica',
  imports: [RouterLink],
  template: `
    <section class="pagina">
      <header>
        <h1>Gramática <span lang="zh-CN" class="hanzi-titulo">语法</span></h1>
        <p class="subtitulo">
          A gramática do mandarim é enxuta: sem conjugação, sem plural, sem gênero. Mas a ordem das palavras e algumas
          partículas fazem toda a diferença. As lições entram no treino diário conforme você aprende palavras — e você
          pode estudá-las aqui quando quiser.
        </p>
      </header>

      @if (!gramatica.carregado()) {
        <p class="info">Carregando…</p>
      } @else {
        <ol class="licoes">
          @for (l of gramatica.licoes(); track l.id; let i = $index) {
            <li>
              <a class="cartao licao" [routerLink]="['/gramatica', l.id]">
                <span class="numero" aria-hidden="true">{{ i + 1 }}</span>
                <span class="corpo">
                  <strong>{{ l.titulo }}</strong>
                  <span class="suave pequeno">{{ l.estrutura }}</span>
                </span>
                @if (concluidas()[l.id]) {
                  <span class="feito" aria-label="Concluída">✓</span>
                } @else if (l.minPalavras > estudadas()) {
                  <span class="etiqueta" title="Entra no treino diário a partir dessa quantidade de palavras">{{ l.minPalavras }} palavras</span>
                }
              </a>
            </li>
          }
        </ol>
      }
    </section>
  `,
  styles: `
    .hanzi-titulo {
      color: var(--cor-primaria);
      font-size: 0.8em;
    }
    .licoes {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
    }
    .licao {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--cor-texto);
      text-decoration: none;
      height: 100%;
    }
    .licao:hover {
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
    .feito {
      color: var(--cor-sucesso);
      font-weight: 700;
      font-size: 1.3rem;
    }
  `,
})
export class GramaticaPagina {
  protected readonly gramatica = inject(GramaticaService);
  private readonly progresso = inject(ProgressoService);
  protected readonly concluidas = computed(() => this.progresso.estado().licoesGramatica ?? {});
  protected readonly estudadas = computed(() => this.progresso.palavrasEstudadas().length);

  constructor() {
    void this.gramatica.carregar();
  }
}
