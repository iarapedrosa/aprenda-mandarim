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
import { IdiomaService } from '../../../core/i18n/idioma.service';

type Modo = 'ouvir' | 'ler' | 'pinyin';

const MODOS: { id: Modo; nome: string; descricao: string; nomeEn: string; descricaoEn: string }[] = [
  { id: 'ouvir', nome: 'Ouvir', descricao: 'Ouça e digite o número', nomeEn: 'Listen', descricaoEn: 'Listen and type the number' },
  { id: 'ler', nome: 'Ler', descricao: 'Leia os caracteres e digite', nomeEn: 'Read', descricaoEn: 'Read the characters and type' },
  { id: 'pinyin', nome: 'Falar', descricao: 'Veja o número e escolha o pinyin', nomeEn: 'Speak', descricaoEn: 'See the number and pick the pinyin' },
];

let contador = 0;

@Component({
  selector: 'app-praticar-numeros',
  imports: [FormsModule, BotaoAudio, PinyinColorido, ExEscolha],
  template: `
    @if (!iniciado() || ajustando()) {
      <div class="segmentado" role="radiogroup" [attr.aria-label]="i.t('Tipo de prática', 'Practice type')">
        @for (m of modos; track m.id) {
          <label>
            <input type="radio" name="modo-numeros" [value]="m.id" [ngModel]="modo()" (ngModelChange)="modo.set($event); nova()" />
            {{ i.tr(m, 'nome') }}
          </label>
        }
      </div>
      <p class="suave pequeno descricao-modo">{{ descricaoModo() }}</p>

      <div class="categorias chips-rolagem" role="group" [attr.aria-label]="i.t('Que números praticar', 'Which numbers to practice')">
        @for (c of categorias; track c.id) {
          <button type="button" [class.ativo]="categoria() === c.id" [attr.aria-pressed]="categoria() === c.id" (click)="categoria.set(c.id); nova()">
            {{ i.tr(c, 'nome') }}
          </button>
        }
      </div>
      @if (iniciado()) {
        <button type="button" class="botao botao-texto pequeno pronto" (click)="ajustando.set(false)">{{ i.t('Pronto', 'Done') }}</button>
      }
    } @else {
      <div class="resumo-ajustes">
        <span>
          <strong>{{ i.tr(modoAtual(), 'nome') }}</strong> · {{ i.tr(categoriaAtual(), 'nome') }}
        </span>
        <button type="button" class="botao botao-texto pequeno" (click)="ajustando.set(true)">⚙️ {{ i.t('Mudar', 'Change') }}</button>
      </div>
    }

    <section class="cartao rodada" aria-live="polite">
      <p class="placar suave">{{ i.t('Acertos:', 'Score:') }} <strong>{{ acertos() }}</strong> {{ i.t('de', 'of') }} {{ total() }}</p>

      @if (!iniciado()) {
        <button type="button" class="botao botao-primario botao-bloco" (click)="comecar()">{{ i.t('Começar', 'Start') }}</button>
      } @else if (alvo(); as a) {
        @if (modo() === 'pinyin') {
          @for (item of itemEscolha() ? [itemEscolha()!] : []; track item.id) {
            <app-ex-escolha [item]="item" (concluir)="registrarEscolha($event)" />
          }
        } @else {
          <p class="enunciado">{{ modo() === 'ouvir' ? i.t('Ouça e digite em algarismos', 'Listen and type it in digits') : i.t('Leia e digite em algarismos', 'Read and type it in digits') }}</p>
          <div class="pergunta">
            @if (modo() === 'ler' || resposta() !== null) {
              <p class="hanzi-alvo" lang="zh-CN">{{ a.hanzi }}</p>
            }
            <div class="linha centro">
              <app-botao-audio [texto]="a.hanzi" [legenda]="i.t('Ouvir', 'Listen')" [rotulo]="i.t('o número', 'the number')" />
              <app-botao-audio [texto]="a.hanzi" [legenda]="i.t('Devagar', 'Slow')" [rotulo]="i.t('o número', 'the number')" velocidade="lenta" />
            </div>
          </div>
          <form (submit)="$event.preventDefault(); verificar()">
            <label for="resposta-numero" class="visualmente-oculto">{{ i.t('Sua resposta em algarismos', 'Your answer in digits') }}</label>
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
              <button type="submit" class="botao botao-primario verificar" [disabled]="!texto().trim()">{{ i.t('Verificar', 'Check') }}</button>
            }
          </form>
          @if (resposta() !== null) {
            <div [class]="resposta() ? 'sucesso retorno' : 'erro retorno'" role="status">
              <strong>{{ resposta() ? i.t('Certo!', 'Correct!') : i.t('Era ', 'It was ') + i.tr(a, 'exibicao') }}</strong>
              <span><app-pinyin [texto]="a.pinyin" /></span>
            </div>
            <button type="button" class="botao botao-primario botao-bloco" (click)="nova()">{{ i.t('Próximo', 'Next') }}</button>
          }
        }
      }
    </section>
  `,
  styleUrl: '../../treino/exercicios/exercicios.css',
  styles: `
    .resumo-ajustes {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 0.95rem;
    }
    .resumo-ajustes .botao,
    .pronto {
      min-height: 32px;
      padding: 2px 8px;
    }
    .pronto {
      margin: -4px 0 8px;
    }
    .categorias button {
      min-height: 34px;
      padding: 2px 12px;
      font-size: 0.9rem;
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
  `,
})
export class PraticarNumerosPagina {
  protected readonly i = inject(IdiomaService);
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

  /** depois de começar, o modo e a faixa viram uma linha de resumo (o exercício fica em foco) */
  protected readonly ajustando = signal(false);
  protected readonly modoAtual = computed(() => MODOS.find((m) => m.id === this.modo())!);
  protected readonly categoriaAtual = computed(() => CATEGORIAS.find((c) => c.id === this.categoria())!);
  protected readonly descricaoModo = computed(() => this.i.tr(MODOS.find((m) => m.id === this.modo())!, 'descricao'));

  protected readonly dica = computed(() => {
    const dicas = this.i.ingles()
      ? { precos: 'e.g. 12.50', horas: 'e.g. 8:30', telefones: 'digits only', anos: 'e.g. 1990' }
      : { precos: 'ex.: 12,50', horas: 'ex.: 8:30', telefones: 'só os dígitos', anos: 'ex.: 1990' };
    return dicas[this.categoria() as 'precos'] ?? this.i.t('ex.: 25', 'e.g. 25');
  });

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
        enunciadoEn: 'How do you say it?',
        pergunta: { texto: alvo.exibicao, textoEn: alvo.exibicaoEn },
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
