import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FrasesService } from '../../core/dados/frases.service';
import { Frase } from '../../core/dados/modelos';
import { VocabularioService } from '../../core/dados/vocabulario.service';
import { analisarPinyin } from '../../core/pinyin/pinyin';
import { ProgressoService } from '../../core/progresso/progresso.service';
import { montarAlternativas, sortear } from '../../core/util/aleatorio';
import { ControleVoz } from '../../shared/controle-voz/controle-voz';
import { ExDigitarPinyin } from '../treino/exercicios/ex-digitar-pinyin';
import { ExEscolha } from '../treino/exercicios/ex-escolha';
import { ItemDigitarPinyin, ItemEscolha, ResultadoItem } from '../treino/sessao.model';
import { IdiomaService } from '../../core/i18n/idioma.service';

type Conteudo = 'palavras' | 'frases';
type Resposta = 'pinyin' | 'caracteres';
type Fonte = 'estudadas' | 'hsk1' | 'hsk2' | 'todas';

interface Alvo extends Frase {
  chave: string;
}

let contador = 0;

@Component({
  selector: 'app-escuta',
  imports: [FormsModule, ControleVoz, ExDigitarPinyin, ExEscolha],
  template: `
    <section class="pagina">
      <header>
        <h1>{{ i.t('Escuta', 'Listening') }}</h1>
        <p class="subtitulo">
          @if (i.ingles()) {
            Dictation: listen and type in pinyin (with numbers, <code>ni3 hao3</code>, or tone marks, <code>nǐ hǎo</code>) or
            pick the right characters.
          } @else {
            Ditado: ouça e escreva em pinyin (com números, <code>ni3 hao3</code>, ou acentos, <code>nǐ hǎo</code>) ou
            escolha os caracteres certos.
          }
        </p>
      </header>

      <form class="cartao config" (submit)="$event.preventDefault()">
        <fieldset>
          <legend>{{ i.t('O que ouvir', 'What to listen to') }}</legend>
          <label><input type="radio" name="conteudo" value="palavras" [ngModel]="conteudo()" (ngModelChange)="mudar('conteudo', $event)" /> {{ i.t('Palavras', 'Words') }}</label>
          <label><input type="radio" name="conteudo" value="frases" [ngModel]="conteudo()" (ngModelChange)="mudar('conteudo', $event)" /> {{ i.t('Frases', 'Sentences') }}</label>
        </fieldset>
        <fieldset>
          <legend>{{ i.t('Como responder', 'How to answer') }}</legend>
          <label><input type="radio" name="resposta" value="pinyin" [ngModel]="resposta()" (ngModelChange)="mudar('resposta', $event)" /> {{ i.t('Digitar pinyin', 'Type pinyin') }}</label>
          <label><input type="radio" name="resposta" value="caracteres" [ngModel]="resposta()" (ngModelChange)="mudar('resposta', $event)" /> {{ i.t('Escolher caracteres', 'Pick characters') }}</label>
        </fieldset>
        <label class="fonte">
          {{ i.t('Vocabulário', 'Vocabulary') }}
          <select class="campo" name="fonte" [ngModel]="fonte()" (ngModelChange)="mudar('fonte', $event)">
            <option value="estudadas">{{ i.t('Palavras que já estudei', 'Words I’ve studied') }} ({{ estudadas().length }})</option>
            <option value="hsk1">HSK 1</option>
            <option value="hsk2">HSK 2</option>
            <option value="todas">{{ i.t('HSK 1 e 2', 'HSK 1 and 2') }}</option>
          </select>
        </label>
      </form>

      <app-controle-voz class="voz" />

      <section class="cartao rodada" aria-live="polite">
        <p class="placar">{{ i.t('Acertos:', 'Score:') }} <strong>{{ acertos() }}</strong> {{ i.t('de', 'of') }} {{ total() }}</p>
        @if (!iniciado()) {
          <p>{{ i.t('Use fones de ouvido se puder. O áudio toca assim que a rodada começa; você pode repetir e diminuir a velocidade.', 'Use headphones if you can. The audio plays as soon as the round starts; you can replay it and slow it down.') }}</p>
          <button type="button" class="botao botao-primario botao-bloco" (click)="comecar()" [disabled]="!pronto()">
            {{ pronto() ? i.t('Começar ditado', 'Start dictation') : i.t('Carregando…', 'Loading…') }}
          </button>
          @if (fonte() === 'estudadas' && pronto() && estudadas().length < 4) {
            <p class="aviso pequeno">{{ i.t('Você ainda tem poucas palavras estudadas; vamos usar o HSK 1.', 'You have studied only a few words so far; we’ll use HSK 1.') }}</p>
          }
        } @else {
          <!-- @for com track por id recria o exercício a cada rodada -->
          @for (atual of item() ? [item()!] : []; track atual.id) {
            @switch (atual.tipo) {
              @case ('digitar-pinyin') {
                <app-ex-digitar-pinyin [item]="$any(atual)" (concluir)="registrar($event)" />
              }
              @case ('escolha') {
                <app-ex-escolha [item]="$any(atual)" (concluir)="registrar($event)" />
              }
            }
          }
        }
      </section>
    </section>
  `,
  styles: `
    code {
      background: var(--cor-superficie-2);
      padding: 0 5px;
      border-radius: 5px;
    }
    .config {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
      margin-bottom: 12px;
    }
    fieldset {
      border: 0;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    legend {
      font-weight: 700;
      margin-bottom: 4px;
    }
    fieldset label {
      font-weight: 400;
      display: flex;
      gap: 8px;
      align-items: center;
      min-height: 36px;
    }
    fieldset input {
      accent-color: var(--cor-primaria);
    }
    .fonte {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .voz {
      margin-bottom: 12px;
    }
    .placar {
      color: var(--cor-texto-suave);
    }
  `,
})
export class EscutaPagina {
  protected readonly i = inject(IdiomaService);
  private readonly vocabulario = inject(VocabularioService);
  private readonly frases = inject(FrasesService);
  private readonly progresso = inject(ProgressoService);

  protected readonly conteudo = signal<Conteudo>('palavras');
  protected readonly resposta = signal<Resposta>('pinyin');
  protected readonly fonte = signal<Fonte>('estudadas');
  protected readonly iniciado = signal(false);
  protected readonly item = signal<ItemDigitarPinyin | ItemEscolha | null>(null);
  protected readonly acertos = signal(0);
  protected readonly total = signal(0);
  protected readonly pronto = computed(() => this.vocabulario.carregado() && this.frases.carregado());

  protected readonly estudadas = computed(() => {
    const ids = new Set(this.progresso.palavrasEstudadas().map((c) => c.ref));
    return this.vocabulario.palavras().filter((p) => ids.has(p.id));
  });

  /** Palavras da fonte escolhida. */
  private readonly palavras = computed(() => {
    const todas = this.vocabulario.palavras();
    switch (this.fonte()) {
      case 'estudadas':
        return this.estudadas().length >= 4 ? this.estudadas() : todas.filter((p) => p.nivel === 1);
      case 'hsk1':
        return todas.filter((p) => p.nivel === 1);
      case 'hsk2':
        return todas.filter((p) => p.nivel === 2);
      default:
        return todas;
    }
  });

  /** Alvos do ditado: palavras ou frases (exemplos do vocabulário + frases do dia). */
  private readonly alvos = computed<Alvo[]>(() => {
    if (this.conteudo() === 'palavras') {
      return this.palavras()
        .filter((p) => !p.hanzi.includes('…'))
        .map((p) => ({ chave: p.id, hanzi: p.hanzi, pinyin: p.pinyin, traducao: p.traducao, traducaoEn: p.traducaoEn }));
    }
    const exemplos = this.palavras()
      .filter((p) => p.exemplo)
      .map((p) => ({ chave: `ex:${p.id}`, ...p.exemplo! }));
    const doDia =
      this.fonte() === 'hsk2' ? [] : this.frases.frases().map((f) => ({ chave: f.id, hanzi: f.hanzi, pinyin: f.pinyin, traducao: f.traducao, traducaoEn: f.traducaoEn }));
    return [...exemplos, ...doDia];
  });

  constructor() {
    void this.vocabulario.carregar();
    void this.frases.carregar();
  }

  protected mudar(campo: 'conteudo' | 'resposta' | 'fonte', valor: string): void {
    if (campo === 'conteudo') this.conteudo.set(valor as Conteudo);
    if (campo === 'resposta') this.resposta.set(valor as Resposta);
    if (campo === 'fonte') this.fonte.set(valor as Fonte);
    if (this.iniciado()) this.nova();
  }

  protected comecar(): void {
    this.iniciado.set(true);
    this.nova();
  }

  private nova(): void {
    const alvos = this.alvos();
    if (!alvos.length) return;
    let alvo = sortear(alvos);
    const anterior = this.item();
    const hanziAnterior = anterior?.tipo === 'digitar-pinyin' ? anterior.hanzi : anterior?.resposta?.hanzi;
    if (alvos.length > 1 && alvo.hanzi === hanziAnterior) alvo = sortear(alvos);
    const id = `escuta-${++contador}`;
    if (this.resposta() === 'pinyin') {
      this.item.set({
        id,
        tipo: 'digitar-pinyin',
        modulo: 'escuta',
        enunciado: 'Ouça e escreva em pinyin',
        enunciadoEn: 'Listen and type the pinyin',
        hanzi: alvo.hanzi,
        pinyin: alvo.pinyin,
        traducao: alvo.traducao,
        traducaoEn: alvo.traducaoEn,
        soAudio: true,
      });
    } else {
      const opcoes = montarAlternativas(alvo, alvos, 4, (a) => a.hanzi);
      this.item.set({
        id,
        tipo: 'escolha',
        modulo: 'escuta',
        enunciado: 'Ouça e escolha o que foi dito',
        enunciadoEn: 'Listen and choose what was said',
        pergunta: { audio: alvo.hanzi },
        opcoes: opcoes.map((o) => ({ valor: o.chave, rotulo: o.hanzi, hanzi: true })),
        correta: alvo.chave,
        tons: analisarPinyin(alvo.pinyin).map((s) => s.tom),
        resposta: { hanzi: alvo.hanzi, pinyin: alvo.pinyin, traducao: alvo.traducao, traducaoEn: alvo.traducaoEn },
      });
    }
  }

  protected registrar(r: ResultadoItem): void {
    const item = this.item();
    this.total.update((n) => n + 1);
    if (r.acertou) this.acertos.update((n) => n + 1);
    const tons = item?.tipo === 'digitar-pinyin' ? analisarPinyin(item.pinyin).map((s) => s.tom) : item?.tons;
    this.progresso.registrarResposta('escuta', r.acertou, tons);
    this.nova();
  }
}
