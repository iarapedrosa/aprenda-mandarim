import { Component, computed, inject, signal } from '@angular/core';
import { ProgressoService } from '../../../core/progresso/progresso.service';
import { embaralhar } from '../../../core/util/aleatorio';
import { VozService } from '../../../core/voz/voz.service';
import { BotaoAudio } from '../../../shared/botao-audio/botao-audio';
import { PinyinColorido } from '../../../shared/pinyin-colorido/pinyin-colorido';
import { QUIZ_SANDHI, REGRAS_SANDHI } from '../dados-pinyin';

@Component({
  selector: 'app-sandhi',
  imports: [BotaoAudio, PinyinColorido],
  template: `
    <p>
      <strong>Sandhi tonal</strong> são mudanças de tom que acontecem quando certas sílabas ficam
      juntas. São só três regras — e a voz do site já as aplica, então ouça os exemplos.
    </p>

    @for (r of regras; track r.id) {
      <article class="cartao regra">
        <h2>{{ r.titulo }}</h2>
        <p class="enunciado">{{ r.regra }}</p>
        <ul>
          @for (d of r.detalhes; track d) {
            <li>{{ d }}</li>
          }
        </ul>
        <div class="rolagem-x">
          <table>
            <thead>
              <tr>
                <th scope="col">Palavra</th>
                <th scope="col">Pinyin</th>
                <th scope="col">Como se fala</th>
                <th scope="col"><span class="visualmente-oculto">Ouvir</span></th>
              </tr>
            </thead>
            <tbody>
              @for (e of r.exemplos; track e.hanzi) {
                <tr>
                  <td>
                    <span lang="zh-CN" class="hanzi">{{ e.hanzi }}</span>
                    <span class="traducao">{{ e.traducao }}</span>
                  </td>
                  <td><app-pinyin [texto]="e.pinyin" /></td>
                  <td><app-pinyin [texto]="e.falado" /></td>
                  <td><app-botao-audio [texto]="e.hanzi" [rotulo]="e.pinyin" [compacto]="true" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </article>
    }

    <section class="cartao quiz" aria-labelledby="titulo-quiz">
      <h2 id="titulo-quiz">Teste rápido</h2>
      @if (atual(); as p) {
        <p class="progresso-quiz suave">Pergunta {{ indice() + 1 }} de {{ perguntas().length }}</p>
        <p class="pergunta">{{ p.pergunta }}</p>
        <p class="linha">
          <span lang="zh-CN" class="hanzi-quiz">{{ p.hanzi }}</span>
          <app-botao-audio [texto]="p.hanzi" />
        </p>
        <div class="opcoes" role="group" aria-label="Alternativas">
          @for (o of p.opcoes; track o) {
            <button
              type="button"
              class="opcao"
              [class.correta]="resposta() !== null && o === p.correta"
              [class.errada]="resposta() === o && o !== p.correta"
              [disabled]="resposta() !== null"
              (click)="responder(o)"
            >
              {{ o }}
            </button>
          }
        </div>
        @if (resposta() !== null) {
          <p [class]="resposta() === p.correta ? 'sucesso' : 'erro'" role="status">
            {{ resposta() === p.correta ? 'Isso!' : 'Quase.' }} {{ p.explicacao }}
          </p>
          <button type="button" class="botao botao-primario" (click)="proxima()">
            {{ indice() + 1 < perguntas().length ? 'Próxima' : 'Ver resultado' }}
          </button>
        }
      } @else {
        <p class="sucesso" role="status">
          Você acertou {{ acertos() }} de {{ perguntas().length }}.
        </p>
        <button type="button" class="botao" (click)="reiniciar()">Fazer de novo</button>
      }
    </section>
  `,
  styles: `
    .enunciado {
      font-weight: 600;
    }
    table {
      width: 100%;
      min-width: 420px;
    }
    th,
    td {
      text-align: left;
      padding: 8px 6px;
      border-bottom: 1px solid var(--cor-borda);
      vertical-align: middle;
    }
    th {
      font-size: 0.85rem;
      color: var(--cor-texto-suave);
    }
    .hanzi {
      font-size: 1.3rem;
      margin-right: 6px;
    }
    .traducao {
      display: block;
      font-size: 0.8rem;
      color: var(--cor-texto-suave);
    }
    .pergunta {
      font-weight: 600;
      font-size: 1.1rem;
    }
    .hanzi-quiz {
      font-size: 2.4rem;
    }
    .opcoes {
      margin-bottom: 12px;
    }
  `,
})
export class SandhiPagina {
  private readonly progresso = inject(ProgressoService);
  protected readonly voz = inject(VozService);
  protected readonly regras = REGRAS_SANDHI;

  protected readonly perguntas = signal(embaralhar(QUIZ_SANDHI).slice(0, 6));
  protected readonly indice = signal(0);
  protected readonly resposta = signal<string | null>(null);
  protected readonly acertos = signal(0);
  protected readonly atual = computed(() => this.perguntas()[this.indice()] ?? null);

  protected responder(opcao: string): void {
    const p = this.atual();
    if (!p || this.resposta() !== null) return;
    this.resposta.set(opcao);
    const acertou = opcao === p.correta;
    if (acertou) this.acertos.update((n) => n + 1);
    this.progresso.registrarResposta('pinyin', acertou);
  }

  protected proxima(): void {
    this.resposta.set(null);
    this.indice.update((i) => i + 1);
  }

  protected reiniciar(): void {
    this.perguntas.set(embaralhar(QUIZ_SANDHI).slice(0, 6));
    this.indice.set(0);
    this.acertos.set(0);
    this.resposta.set(null);
  }
}
