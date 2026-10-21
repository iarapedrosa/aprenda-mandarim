import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { analisarPinyin } from '../../../core/pinyin/pinyin';
import { ProgressoService } from '../../../core/progresso/progresso.service';
import { embaralhar } from '../../../core/util/aleatorio';
import { VozService } from '../../../core/voz/voz.service';
import { BotaoAudio } from '../../../shared/botao-audio/botao-audio';
import { PinyinColorido } from '../../../shared/pinyin-colorido/pinyin-colorido';
import { ExEscolha } from '../../treino/exercicios/ex-escolha';
import { ItemEscolha, ResultadoItem } from '../../treino/sessao.model';
import { AlvoNumero, CATEGORIAS, Categoria, distratores, normalizarResposta, sortearAlvo } from '../alvos';

type Modo = 'ouvir' | 'ler' | 'pinyin';

const MODOS: { id: Modo; nome: string; descricao: string }[] = [
  { id: 'ouvir', nome: 'Ouvir', descricao: 'Ouça e digite o número' },
  { id: 'ler', nome: 'Ler', descricao: 'Leia os caracteres e digite' },
  { id: 'pinyin', nome: 'Falar', descricao: 'Veja o número e escolha o pinyin' },
];

let contador = 0;

@Component({
  selector: 'app-praticar-numeros',
  imports: [FormsModule, BotaoAudio, PinyinColorido, ExEscolha],
  template: `
    <div class="modos" role="radiogroup" aria-label="Tipo de prática">
      @for (m of modos; track m.id) {
        <label class="modo">
          <input type="radio" name="modo-numeros" [value]="m.id" [ngModel]="modo()" (ngModelChange)="modo.set($event); nova()" />
          <span><strong>{{ m.nome }}</strong><br /><small>{{ m.descricao }}</small></span>
        </label>
      }
    </div>

    <div class="categorias" role="group" aria-label="Que números praticar">
      @for (c of categorias; track c.id) {
        <button type="button" [class.ativo]="categoria() === c.id" [attr.aria-pressed]="categoria() === c.id" (click)="categoria.set(c.id); nova()">
          {{ c.nome }}
        </button>
      }
    </div>

    <section class="cartao rodada" aria-live="polite">
      <p class="placar suave">Acertos: <strong>{{ acertos() }}</strong> de {{ total() }}</p>

      @if (!iniciado()) {
        <button type="button" class="botao botao-primario botao-bloco" (click)="comecar()">Começar</button>
      } @else if (alvo(); as a) {
        @if (modo() === 'pinyin') {
          @for (item of itemEscolha() ? [itemEscolha()!] : []; track item.id) {
            <app-ex-escolha [item]="item" (concluir)="registrarEscolha($event)" />
          }
        } @else {
          <p class="enunciado">{{ modo() === 'ouvir' ? 'Ouça e digite em algarismos' : 'Leia e digite em algarismos' }}</p>
          <div class="pergunta">
            @if (modo() === 'ler' || resposta() !== null) {
              <p class="hanzi-alvo" lang="zh-CN">{{ a.hanzi }}</p>
            }
            <div class="linha centro">
              <app-botao-audio [texto]="a.hanzi" legenda="Ouvir" rotulo="o número" />
              <app-botao-audio [texto]="a.hanzi" legenda="Devagar" rotulo="o número" velocidade="lenta" />
            </div>
          </div>
          <form (submit)="$event.preventDefault(); verificar()">
            <label for="resposta-numero" class="visualmente-oculto">Sua resposta em algarismos</label>
            <input
              id="resposta-numero"
              class="campo grande"
              inputmode="decimal"
              autocomplete="off"
              [placeholder]="dica()"
              [ngModel]="texto()"
              (ngModelChange)="texto.set($event)"
              name="resposta"
              [disabled]="resposta() !== null"
            />
            @if (resposta() === null) {
              <button type="submit" class="botao botao-primario verificar" [disabled]="!texto().trim()">Verificar</button>
            }
          </form>
          @if (resposta() !== null) {
            <div [class]="resposta() ? 'sucesso retorno' : 'erro retorno'" role="status">
              <strong>{{ resposta() ? 'Certo!' : 'Era ' + a.exibicao }}</strong>
              <span><app-pinyin [texto]="a.pinyin" /></span>
            </div>
            <button type="button" class="botao botao-primario botao-bloco" (click)="nova()">Próximo</button>
          }
        }
      }
    </section>
  `,
  styleUrl: '../../treino/exercicios/exercicios.css',
  styles: `
    .modos {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .modo {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      padding: 10px;
      border-radius: var(--raio-p);
      border: 2px solid var(--cor-borda);
      background: var(--cor-superficie);
      font-weight: 400;
      cursor: pointer;
    }
    .modo:has(input:checked) {
      border-color: var(--cor-primaria);
      background: var(--cor-primaria-suave);
    }
    .modo input {
      accent-color: var(--cor-primaria);
      margin-top: 4px;
    }
    .categorias {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
    }
    .categorias button {
      min-height: 38px;
      padding: 4px 12px;
      border-radius: 999px;
      border: 1px solid var(--cor-borda);
      background: var(--cor-superficie);
      color: var(--cor-texto);
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }
    .categorias button.ativo {
      background: var(--cor-texto);
      color: var(--cor-fundo);
    }
    .hanzi-alvo {
      font-family: var(--fonte-hanzi);
      font-size: clamp(2rem, 10vw, 3rem);
      margin: 0 0 8px;
    }
    .grande {
      font-size: 1.4rem;
      font-weight: 700;
      text-align: center;
    }
    .verificar {
      margin-top: 10px;
    }
    .retorno {
      margin-top: 12px;
    }
    @media (max-width: 599px) {
      .modo {
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 8px 4px;
      }
      .modo small {
        display: none;
      }
    }
  `,
})
export class PraticarNumerosPagina {
  private readonly voz = inject(VozService);
  private readonly progresso = inject(ProgressoService);

  protected readonly modos = MODOS;
  protected readonly categorias = CATEGORIAS;
  protected readonly modo = signal<Modo>('ouvir');
  protected readonly categoria = signal<Categoria>('ate10');
  protected readonly iniciado = signal(false);
  protected readonly alvo = signal<AlvoNumero | null>(null);
  protected readonly itemEscolha = signal<ItemEscolha | null>(null);
  protected readonly texto = signal('');
  protected readonly resposta = signal<boolean | null>(null);
  protected readonly acertos = signal(0);
  protected readonly total = signal(0);

  protected readonly dica = computed(() =>
    ({ precos: 'ex.: 12,50', horas: 'ex.: 8:30', telefones: 'só os dígitos', anos: 'ex.: 1990' })[
      this.categoria() as 'precos'
    ] ?? 'ex.: 25',
  );

  protected comecar(): void {
    this.iniciado.set(true);
    this.nova();
  }

  protected nova(): void {
    if (!this.iniciado()) return;
    const alvo = sortearAlvo(this.categoria());
    this.alvo.set(alvo);
    this.texto.set('');
    this.resposta.set(null);
    if (this.modo() === 'pinyin') {
      const opcoes = embaralhar([alvo, ...distratores(alvo)]);
      this.itemEscolha.set({
        id: `num-${++contador}`,
        tipo: 'escolha',
        modulo: 'numeros',
        enunciado: 'Como se fala?',
        pergunta: { texto: alvo.exibicao },
        opcoes: opcoes.map((o) => ({ valor: o.hanzi, rotulo: o.pinyin, pinyin: true })),
        correta: alvo.hanzi,
        resposta: { hanzi: alvo.hanzi, pinyin: alvo.pinyin },
      });
    } else if (this.modo() === 'ouvir') {
      void this.voz.falar(alvo.hanzi);
    }
  }

  protected verificar(): void {
    const alvo = this.alvo();
    if (!alvo || this.resposta() !== null || !this.texto().trim()) return;
    const acertou = normalizarResposta(alvo.categoria, this.texto()) === alvo.chave;
    this.contar(acertou, alvo);
    this.resposta.set(acertou);
    if (this.modo() === 'ler') void this.voz.falar(alvo.hanzi);
  }

  protected registrarEscolha(r: ResultadoItem): void {
    const alvo = this.alvo();
    if (alvo) this.contar(r.acertou, alvo);
    this.nova();
  }

  private contar(acertou: boolean, alvo: AlvoNumero): void {
    this.total.update((n) => n + 1);
    if (acertou) this.acertos.update((n) => n + 1);
    this.progresso.registrarResposta('numeros', acertou, analisarPinyin(alvo.pinyin).map((s) => s.tom));
  }
}
