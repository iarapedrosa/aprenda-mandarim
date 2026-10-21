import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VocabularioService } from '../../../core/dados/vocabulario.service';
import { nomePar, nomeParEn, palavrasPorPar } from '../../../core/pinyin/pares-tons';
import { VozService } from '../../../core/voz/voz.service';
import { BotaoAudio } from '../../../shared/botao-audio/botao-audio';
import { DiagramaTom } from '../../../shared/diagrama-tom/diagrama-tom';
import { PinyinColorido } from '../../../shared/pinyin-colorido/pinyin-colorido';
import { TONS } from '../dados-pinyin';
import { IdiomaService } from '../../../core/i18n/idioma.service';

@Component({
  selector: 'app-tons',
  imports: [DiagramaTom, BotaoAudio, PinyinColorido, RouterLink],
  template: `
    <p>
      @if (i.ingles()) {
        Mandarin is a <strong>tonal</strong> language: the same syllable changes meaning depending on the
        melody of the voice. There are 4 tones plus a neutral tone. The colors below are used across the site.
      } @else {
        O mandarim é uma língua <strong>tonal</strong>: a mesma sílaba muda de significado conforme a
        melodia da voz. Existem 4 tons e um tom neutro. As cores abaixo são usadas em todo o site.
      }
    </p>

    <div class="tons">
      @for (t of tons; track t.tom) {
        <article class="cartao tom" [class]="'tom-' + t.tom">
          <header class="cabecalho">
            <h2>{{ i.tr(t, 'nome') }}</h2>
            <span class="marca" aria-hidden="true">{{ t.marca }}</span>
          </header>
          <app-diagrama-tom [tom]="t.tom" />
          <p class="resumo"><strong>{{ i.tr(t, 'resumo') }}</strong></p>
          <p class="comparacao">{{ i.tr(t, 'comparacao') }}</p>
          <button type="button" class="exemplo" (click)="voz.falar(t.exemplo.hanzi)">
            <span class="hanzi" lang="zh-CN">{{ t.exemplo.hanzi }}</span>
            <app-pinyin [texto]="t.exemplo.pinyin" />
            <span class="traducao">{{ i.tr(t.exemplo, 'traducao') }}</span>
            <span class="visualmente-oculto">— {{ i.t('ouvir', 'listen') }}</span>
          </button>
        </article>
      }
    </div>

    <section class="cartao">
      <h2>✋ {{ i.t('Use as mãos', 'Use your hands') }}</h2>
      <p>
        {{ i.t('Desenhar a curva do tom no ar com a mão enquanto ouve e repete ajuda a aprender os tons e as palavras — um experimento com 106 iniciantes mostrou ganho tanto observando quanto fazendo os gestos (Baills et al., 2019).', 'Drawing the tone contour in the air with your hand while you listen and repeat helps you learn tones and words — an experiment with 106 beginners found gains both from watching and from making the gestures (Baills et al., 2019).') }}
      </p>
      <ul class="gestos">
        <li><strong class="tom-1">{{ i.t('1º', '1st') }}</strong> {{ i.t('mão reta, parada no alto, da esquerda para a direita', 'flat hand, held high, moving left to right') }}</li>
        <li><strong class="tom-2">{{ i.t('2º', '2nd') }}</strong> {{ i.t('mão subindo na diagonal, como quem pergunta', 'hand rising diagonally, like asking a question') }}</li>
        <li><strong class="tom-3">{{ i.t('3º', '3rd') }}</strong> {{ i.t('mão desce até embaixo e volta a subir (um "✓")', 'hand dips down and comes back up (a "✓")') }}</li>
        <li><strong class="tom-4">{{ i.t('4º', '4th') }}</strong> {{ i.t('mão cai rápido de cima para baixo, firme', 'hand drops fast from top to bottom, firmly') }}</li>
        <li><strong class="tom-5">{{ i.t('neutro', 'neutral') }}</strong> {{ i.t('um toquinho leve e curto, sem curva', 'a light, short tap, no curve') }}</li>
      </ul>
    </section>

    <section class="cartao destaque">
      <h2>{{ i.t('Ouça a diferença', 'Hear the difference') }}</h2>
      <p>{{ i.t('Uma frase famosa para treinar: “A mamãe xinga o cavalo?”', 'A famous practice sentence: “Does mom scold the horse?”') }}</p>
      <p class="frase">
        <span lang="zh-CN" class="hanzi">妈妈骂马吗？</span><br />
        <app-pinyin texto="Māma mà mǎ ma?" />
      </p>
      <div class="linha">
        <app-botao-audio texto="妈妈骂马吗？" rotulo="Māma mà mǎ ma" [legenda]="i.t('Normal', 'Normal')" velocidade="normal" />
        <app-botao-audio texto="妈妈骂马吗？" rotulo="Māma mà mǎ ma" [legenda]="i.t('Devagar', 'Slow')" velocidade="lenta" />
      </div>
    </section>

    <section class="cartao">
      <h2>{{ i.t('Os tons em pares', 'Tones in pairs') }}</h2>
      <p>
        {{ i.t('Na fala, os tons quase nunca aparecem sozinhos: a maioria das palavras tem duas sílabas. Treine as 20 combinações — toque numa palavra para ouvir. Linhas: tom da 1ª sílaba; colunas: tom da 2ª.', 'In speech, tones almost never appear alone: most words have two syllables. Practice the 20 combinations — tap a word to listen. Rows: tone of the 1st syllable; columns: tone of the 2nd.') }}
      </p>
      <div class="rolagem-x">
        <table class="tabela-pares">
          <thead>
            <tr>
              <th scope="col"><span class="visualmente-oculto">{{ i.t('1ª sílaba', '1st syllable') }}</span></th>
              @for (b of colunas; track b) {
                <th scope="col" [class]="'tom-' + b">{{ b === 5 ? i.t('neutro', 'neutral') : ordinal(b) }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (a of linhas; track a) {
              <tr>
                <th scope="row" [class]="'tom-' + a">{{ ordinal(a) }}</th>
                @for (b of colunas; track b) {
                  <td>
                    @if (exemploPar(a, b); as p) {
                      <button type="button" class="celula-par" (click)="voz.falar(p.hanzi)" [attr.aria-label]="nome(a, b) + ': ' + p.hanzi + ', ' + p.pinyin + ', ' + i.tr(p, 'traducao')">
                        <span lang="zh-CN">{{ p.hanzi }}</span>
                        <app-pinyin [texto]="p.pinyin" />
                      </button>
                    }
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
      <p class="suave pequeno">{{ i.t('Atenção: 3º + 3º (como 水果) é falado 2º + 3º. E antes de outros tons o 3º fica só grave.', 'Note: 3rd + 3rd (like 水果) is spoken 2nd + 3rd. And before other tones the 3rd tone just stays low.') }}</p>
    </section>

    <section class="cartao">
      @if (i.ingles()) {
        <h2>Where does the tone mark go?</h2>
        <ol>
          <li>If there is an <strong>a</strong> or <strong>e</strong>, the mark goes on it: hǎo, xiè.</li>
          <li>In <strong>ou</strong>, it goes on the <strong>o</strong>: gǒu.</li>
          <li>Otherwise, it goes on the <strong>last vowel</strong>: liù, guì.</li>
        </ol>
        <h3>Typing tones with numbers</h3>
        <p>
          In the exercises you can type the tone as a number after the syllable:
          <code>ma1 ma2 ma3 ma4</code> = mā má mǎ mà. Use <code>5</code> (or nothing) for the neutral tone and
          <code>v</code> for ü: <code>lv4</code> = lǜ.
        </p>
      } @else {
        <h2>Onde vai o acento?</h2>
        <ol>
          <li>Se houver <strong>a</strong> ou <strong>e</strong>, o acento vai nele: hǎo, xiè.</li>
          <li>Em <strong>ou</strong>, vai no <strong>o</strong>: gǒu.</li>
          <li>Nos outros casos, vai na <strong>última vogal</strong>: liù, guì.</li>
        </ol>
        <h3>Digitando tons com números</h3>
        <p>
          Nos exercícios você pode digitar o tom como número depois da sílaba:
          <code>ma1 ma2 ma3 ma4</code> = mā má mǎ mà. Use <code>5</code> (ou nada) para o tom neutro e
          <code>v</code> para o ü: <code>lv4</code> = lǜ.
        </p>
      }
    </section>

    <p class="linha proximos">
      <a class="botao botao-primario" routerLink="../treino">{{ i.t('Treinar os tons', 'Practice tones') }}</a>
      <a class="botao" routerLink="../sons">{{ i.t('Ver iniciais e finais', 'See initials and finals') }}</a>
    </p>
  `,
  styles: `
    .tons {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr));
      margin-bottom: 16px;
    }
    .tom {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .cabecalho {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .cabecalho h2 {
      color: var(--cor-texto);
      margin: 0;
    }
    .marca {
      font-size: 2rem;
      font-weight: 700;
    }
    .resumo,
    .comparacao {
      color: var(--cor-texto);
      margin: 0;
    }
    .comparacao {
      color: var(--cor-texto-suave);
    }
    .exemplo {
      margin-top: auto;
      display: flex;
      align-items: baseline;
      gap: 10px;
      flex-wrap: wrap;
      padding: 10px 12px;
      border-radius: var(--raio-p);
      border: 1px solid var(--cor-borda);
      background: var(--cor-superficie-2);
      color: var(--cor-texto);
      font: inherit;
      cursor: pointer;
    }
    .exemplo:hover {
      border-color: currentColor;
    }
    .exemplo .hanzi {
      font-size: 1.8rem;
    }
    .traducao {
      color: var(--cor-texto-suave);
      font-size: 0.9rem;
    }
    .destaque .frase {
      font-size: 1.2rem;
    }
    .frase .hanzi {
      font-size: 2rem;
    }
    .gestos {
      padding-left: 18px;
    }
    .gestos li {
      margin-bottom: 4px;
    }
    .proximos {
      margin-top: 16px;
    }
    .tabela-pares {
      min-width: 520px;
      width: 100%;
    }
    .tabela-pares th {
      font-weight: 700;
      padding: 4px;
    }
    .tabela-pares td {
      padding: 3px;
    }
    .celula-par {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 6px 4px;
      border-radius: 8px;
      border: 1px solid var(--cor-borda);
      background: var(--cor-superficie-2);
      color: var(--cor-texto);
      font: inherit;
      font-size: 0.85rem;
      cursor: pointer;
    }
    .celula-par [lang='zh-CN'] {
      font-size: 1.2rem;
    }
    .celula-par:hover {
      border-color: var(--cor-primaria);
    }
    code {
      background: var(--cor-superficie-2);
      padding: 1px 6px;
      border-radius: 6px;
    }
  `,
})
export class TonsPagina {
  protected readonly i = inject(IdiomaService);
  protected readonly voz = inject(VozService);
  private readonly vocabulario = inject(VocabularioService);
  protected readonly tons = TONS;
  protected readonly linhas = [1, 2, 3, 4] as const;
  protected readonly colunas = [1, 2, 3, 4, 5] as const;
  private readonly pares = computed(() => palavrasPorPar(this.vocabulario.palavras()));

  constructor() {
    void this.vocabulario.carregar();
  }

  protected exemploPar(a: number, b: number) {
    return this.pares().get(`${a}-${b}`)?.[0] ?? null;
  }

  protected nome(a: number, b: number): string {
    return this.i.ingles() ? nomeParEn([a, b] as never) : nomePar([a, b] as never);
  }

  protected ordinal(t: number): string {
    return this.i.t(`${t}º`, ['1st', '2nd', '3rd', '4th'][t - 1]);
  }
}
