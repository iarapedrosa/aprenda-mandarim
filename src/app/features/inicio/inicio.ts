import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FrasesService, palavraDoDia } from '../../core/dados/frases.service';
import { VocabularioService } from '../../core/dados/vocabulario.service';
import { IdiomaService } from '../../core/i18n/idioma.service';
import { ProgressoService } from '../../core/progresso/progresso.service';
import { VozService } from '../../core/voz/voz.service';
import { PinyinColorido } from '../../shared/pinyin-colorido/pinyin-colorido';
import { FraseDoDiaCartao } from '../treino/do-dia/frase-do-dia';
import { PalavraDoDiaCartao } from '../treino/do-dia/palavra-do-dia';

interface Objetivo {
  rota: string;
  icone: string;
  titulo: string;
  tituloEn: string;
  texto: string;
  textoEn: string;
  destaque?: boolean;
}

/** "O que você quer aprender hoje?": cada objetivo leva a uma parte do site. */
const OBJETIVOS: Objetivo[] = [
  { rota: '/hoje', icone: '今', destaque: true, titulo: 'Um pouco de tudo, no ritmo certo', tituloEn: 'A bit of everything, at the right pace', texto: 'O treino guiado de 15–20 min: o site escolhe o que revisar e o que é novo.', textoEn: 'The 15–20 min guided session: the site picks what to review and what’s new.' },
  { rota: '/pinyin', icone: '音', titulo: 'Pronunciar os sons e os 4 tons', tituloEn: 'Pronounce the sounds and the 4 tones', texto: 'Pinyin, iniciais e finais, armadilhas de pronúncia e sandhi.', textoEn: 'Pinyin, initials and finals, pronunciation pitfalls and sandhi.' },
  { rota: '/pinyin/treino', icone: '声', titulo: 'Treinar o ouvido para os tons', tituloEn: 'Train your ear for tones', texto: 'Qual é o tom? Pares de tons e pares mínimos.', textoEn: 'Which tone? Tone pairs and minimal pairs.' },
  { rota: '/caracteres', icone: '字', titulo: 'Aprender palavras e caracteres', tituloEn: 'Learn words and characters', texto: 'HSK 1 e 2 com áudio, exemplos, radicais e ordem dos traços.', textoEn: 'HSK 1 and 2 with audio, examples, radicals and stroke order.' },
  { rota: '/escrita', icone: '写', titulo: 'Escrever à mão', tituloEn: 'Write by hand', texto: 'Desenhe os caracteres com correção traço a traço.', textoEn: 'Draw characters with stroke-by-stroke feedback.' },
  { rota: '/leitura', icone: '读', titulo: 'Ler textos curtos', tituloEn: 'Read short texts', texto: 'Diálogos e historinhas com pinyin e tradução quando quiser.', textoEn: 'Dialogues and stories with pinyin and translation when you want.' },
  { rota: '/escuta', icone: '听', titulo: 'Entender o que ouço', tituloEn: 'Understand what I hear', texto: 'Ditado de palavras e frases.', textoEn: 'Dictation of words and sentences.' },
  { rota: '/fala', icone: '说', titulo: 'Falar e imitar frases', tituloEn: 'Speak and shadow sentences', texto: 'Shadowing e trava-línguas com reconhecimento de voz.', textoEn: 'Shadowing and tongue twisters with speech recognition.' },
  { rota: '/gramatica', icone: '语', titulo: 'Montar frases', tituloEn: 'Build sentences', texto: 'Mini-lições de gramática: ordem da frase, 的, 了, classificadores…', textoEn: 'Grammar mini-lessons: word order, 的, 了, measure words…' },
  { rota: '/numeros', icone: '数', titulo: 'Números, preços e horas', tituloEn: 'Numbers, prices and times', texto: 'Regras, conversor com áudio e prática.', textoEn: 'Rules, a converter with audio and practice.' },
  { rota: '/cartoes', icone: '卡', titulo: 'Revisar com flashcards', tituloEn: 'Review with flashcards', texto: 'Cartões estilo Anki com revisão espaçada.', textoEn: 'Anki-style cards with spaced repetition.' },
];

/** Os 4 tons de "ma", para ouvir logo de cara. */
const TONS_MA = [
  { tom: 1, hanzi: '妈', pinyin: 'mā', traducao: 'mãe', traducaoEn: 'mom' },
  { tom: 2, hanzi: '麻', pinyin: 'má', traducao: 'cânhamo', traducaoEn: 'hemp' },
  { tom: 3, hanzi: '马', pinyin: 'mǎ', traducao: 'cavalo', traducaoEn: 'horse' },
  { tom: 4, hanzi: '骂', pinyin: 'mà', traducao: 'xingar', traducaoEn: 'to scold' },
];

/** Página inicial: apresenta o projeto e pergunta o que a pessoa quer estudar. */
@Component({
  selector: 'app-inicio',
  imports: [RouterLink, PinyinColorido, FraseDoDiaCartao, PalavraDoDiaCartao],
  template: `
    <section class="pagina">
      <div class="heroi">
        <div class="apresentacao">
          <p class="selo-topo"><span lang="zh-CN">学中文</span> · {{ i.t('mandarim do zero', 'Mandarin from scratch') }}</p>
          <h1>{{ i.t('Aprenda mandarim um pouco por dia', 'Learn Mandarin a little every day') }}</h1>
          <p class="subtitulo">
            {{
              i.t(
                'Pronúncia e tons, caracteres, leitura, escuta e fala — com áudio, revisão espaçada e explicações em português.',
                'Pronunciation and tones, characters, reading, listening and speaking — with audio, spaced repetition and explanations in English.'
              )
            }}
          </p>
          <div class="acoes">
            <a routerLink="/hoje" class="botao botao-primario grande">
              {{ comecou() ? i.t('Continuar meu treino', 'Continue my training') : i.t('Começar o treino guiado', 'Start the guided training') }}
            </a>
            <a routerLink="/" fragment="o-que-aprender" class="botao grande">{{ i.t('Escolher o que estudar', 'Choose what to study') }}</a>
          </div>
          @if (comecou()) {
            <p class="situacao suave pequeno">
              🔥 {{ progresso.sequencia() }} {{ progresso.sequencia() === 1 ? i.t('dia seguido', 'day in a row') : i.t('dias seguidos', 'days in a row') }}
              · {{ progresso.palavrasEstudadas().length }} {{ i.t('palavras estudadas', 'words studied') }}
            </p>
          }
          <ul class="selos pequeno">
            <li>✓ {{ i.t('Grátis e sem cadastro', 'Free, no sign-up') }}</li>
            <li>✓ {{ i.t('Funciona offline', 'Works offline') }}</li>
            <li>✓ <a routerLink="/metodo">{{ i.t('Baseado em pesquisa', 'Research-based') }}</a></li>
          </ul>
        </div>

        <aside class="cartao demo" [attr.aria-label]="i.t('Experimente os tons', 'Try the tones')">
          <p class="rotulo-demo">{{ i.t('Experimente: a mesma sílaba, 4 tons, 4 significados', 'Try it: same syllable, 4 tones, 4 meanings') }}</p>
          <div class="tons-ma">
            @for (t of tonsMa; track t.tom) {
              <button type="button" class="tom-ma" [class]="'tom-ma tom-' + t.tom" (click)="ouvir(t.hanzi)">
                <span class="hanzi-ma" lang="zh-CN">{{ t.hanzi }}</span>
                <app-pinyin [texto]="t.pinyin" />
                <span class="suave pequeno">{{ i.tr(t, 'traducao') }}</span>
              </button>
            }
          </div>
          <p class="suave pequeno dica-demo">🔊 {{ i.t('Toque para ouvir.', 'Tap to listen.') }} <a routerLink="/pinyin/tons">{{ i.t('Aprenda os tons →', 'Learn the tones →') }}</a></p>
        </aside>
      </div>

      <section id="o-que-aprender" class="objetivos-secao" aria-labelledby="titulo-objetivos">
        <h2 id="titulo-objetivos">{{ i.t('O que você quer aprender hoje?', 'What do you want to learn today?') }}</h2>
        <ul class="objetivos">
          @for (o of objetivos; track o.rota) {
            <li>
              <a [routerLink]="o.rota" class="objetivo" [class.destaque]="o.destaque">
                <span class="icone-objetivo" lang="zh-CN" aria-hidden="true">{{ o.icone }}</span>
                <span class="textos">
                  <strong>{{ i.tr(o, 'titulo') }}</strong>
                  <span class="suave pequeno">{{ i.tr(o, 'texto') }}</span>
                  @if (o.destaque) {
                    <span class="etiqueta recomendado">{{ i.t('Recomendado para começar', 'Recommended to start') }}</span>
                  }
                </span>
              </a>
            </li>
          }
        </ul>
      </section>

      <section class="do-dia-secao" aria-labelledby="titulo-do-dia">
        <h2 id="titulo-do-dia">{{ i.t('Para hoje', 'For today') }}</h2>
        <div class="do-dia">
          @if (fraseDoDia(); as f) {
            <app-frase-do-dia [frase]="f" />
          }
          @if (palavra(); as p) {
            <app-palavra-do-dia [palavra]="p" />
          }
        </div>
        @if (anteriores().length) {
          <details class="cartao anteriores">
            <summary>{{ i.t('Frases dos dias anteriores', 'Phrases from previous days') }}</summary>
            <ul>
              @for (a of anteriores(); track a.data) {
                <li>
                  <span class="data suave pequeno">{{ formatarData(a.data) }}</span>
                  <span lang="zh-CN" class="hanzi-anterior">{{ a.frase.hanzi }}</span>
                  <app-pinyin [texto]="a.frase.pinyin" />
                  <span class="suave">— {{ i.tr(a.frase, 'traducao') }}</span>
                </li>
              }
            </ul>
          </details>
        }
      </section>
    </section>
  `,
  styles: `
    .heroi {
      display: grid;
      gap: 20px;
      align-items: center;
      padding: 8px 0 8px;
    }
    @media (min-width: 900px) {
      .heroi {
        grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
        gap: 40px;
        padding: 24px 0 16px;
      }
    }
    .selo-topo {
      margin: 0 0 8px;
      color: var(--cor-primaria);
      font-weight: 700;
      font-size: 0.9rem;
      letter-spacing: 0.02em;
    }
    h1 {
      font-size: clamp(1.8rem, 4.5vw, 2.8rem);
      line-height: 1.15;
      margin-bottom: 12px;
    }
    .subtitulo {
      font-size: 1.05rem;
      margin: 0 0 20px;
    }
    .acoes {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .grande {
      min-height: 52px;
      padding: 12px 24px;
      font-size: 1.05rem;
    }
    .situacao {
      margin: 12px 0 0;
    }
    .selos {
      list-style: none;
      padding: 0;
      margin: 16px 0 0;
      display: flex;
      flex-wrap: wrap;
      gap: 6px 18px;
      color: var(--cor-texto-suave);
    }
    .demo {
      margin: 0;
    }
    .rotulo-demo {
      margin: 0 0 12px;
      font-weight: 600;
    }
    .tons-ma {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
    }
    .tom-ma {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 10px 4px;
      border-radius: var(--raio-p);
      border: 1px solid var(--cor-borda);
      background: var(--cor-superficie-2);
      color: var(--cor-texto);
      font: inherit;
      cursor: pointer;
    }
    .tom-ma:hover {
      border-color: currentColor;
    }
    .hanzi-ma {
      font-family: var(--fonte-hanzi);
      font-size: 2rem;
      line-height: 1.2;
    }
    .dica-demo {
      margin: 12px 0 0;
    }
    .objetivos-secao,
    .do-dia-secao {
      margin-top: 32px;
      scroll-margin-top: 80px;
    }
    h2 {
      font-size: 1.35rem;
      margin-bottom: 14px;
    }
    .objetivos {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
    }
    .objetivos li {
      display: flex;
    }
    @media (min-width: 900px) {
      .objetivos li:has(.destaque) {
        grid-column: span 2;
      }
    }
    .objetivo {
      flex: 1;
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 14px;
      border-radius: var(--raio);
      border: 1px solid var(--cor-borda);
      background: var(--cor-superficie);
      color: var(--cor-texto);
      text-decoration: none;
      box-shadow: var(--sombra);
      transition: border-color 0.15s, transform 0.15s;
    }
    .objetivo:hover {
      border-color: var(--cor-primaria);
      transform: translateY(-1px);
    }
    .objetivo.destaque {
      border: 2px solid var(--cor-primaria);
      background: var(--cor-primaria-suave);
    }
    .icone-objetivo {
      flex: none;
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--cor-primaria-suave);
      color: var(--cor-primaria);
      font-family: var(--fonte-hanzi);
      font-size: 1.5rem;
    }
    .objetivo.destaque .icone-objetivo {
      background: var(--cor-primaria);
      color: var(--cor-sobre-primaria);
    }
    .textos {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .recomendado {
      align-self: flex-start;
      margin-top: 6px;
      border-color: var(--cor-primaria);
      color: var(--cor-primaria);
    }
    .do-dia {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
    }
    .anteriores {
      margin-top: 16px;
    }
    .anteriores summary {
      cursor: pointer;
      font-weight: 700;
    }
    .anteriores ul {
      list-style: none;
      padding: 0;
      margin: 8px 0 0;
      display: grid;
      gap: 8px;
    }
    .anteriores li {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 8px;
      align-items: baseline;
    }
    .data {
      min-width: 4.5em;
    }
    .hanzi-anterior {
      font-size: 1.15rem;
    }
    @media (max-width: 599px) {
      .acoes .botao {
        flex: 1 1 100%;
      }
      .objetivos-secao,
      .do-dia-secao {
        margin-top: 24px;
      }
    }
  `,
})
export class InicioPagina {
  protected readonly i = inject(IdiomaService);
  protected readonly progresso = inject(ProgressoService);
  private readonly voz = inject(VozService);
  private readonly vocabulario = inject(VocabularioService);
  private readonly frases = inject(FrasesService);

  protected readonly objetivos = OBJETIVOS;
  protected readonly tonsMa = TONS_MA;

  /** já começou a estudar? (muda o texto do botão principal) */
  protected readonly comecou = computed(
    () => this.progresso.palavrasEstudadas().length > 0 || this.progresso.licoesConcluidas().size > 0,
  );
  protected readonly fraseDoDia = computed(() =>
    this.frases.carregado() ? this.frases.fraseDoDia(this.progresso.hoje()) : null,
  );
  protected readonly anteriores = computed(() =>
    this.frases.carregado() ? this.frases.anteriores(this.progresso.hoje(), 7) : [],
  );
  protected readonly palavra = computed(() => palavraDoDia(this.vocabulario.palavras(), this.progresso.hoje()));

  constructor() {
    void this.vocabulario.carregar();
    void this.frases.carregar();
  }

  protected ouvir(hanzi: string): void {
    void this.voz.falar(hanzi);
  }

  protected formatarData(data: string): string {
    const [, m, d] = data.split('-');
    return this.i.ingles() ? `${m}/${d}` : `${d}/${m}`;
  }
}
