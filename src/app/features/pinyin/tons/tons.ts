import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VocabularioService } from '../../../core/dados/vocabulario.service';
import { nomePar, palavrasPorPar } from '../../../core/pinyin/pares-tons';
import { VozService } from '../../../core/voz/voz.service';
import { BotaoAudio } from '../../../shared/botao-audio/botao-audio';
import { DiagramaTom } from '../../../shared/diagrama-tom/diagrama-tom';
import { PinyinColorido } from '../../../shared/pinyin-colorido/pinyin-colorido';
import { TONS } from '../dados-pinyin';

@Component({
  selector: 'app-tons',
  imports: [DiagramaTom, BotaoAudio, PinyinColorido, RouterLink],
  template: `
    <p>
      O mandarim é uma língua <strong>tonal</strong>: a mesma sílaba muda de significado conforme a
      melodia da voz. Existem 4 tons e um tom neutro. As cores abaixo são usadas em todo o site.
    </p>

    <div class="tons">
      @for (t of tons; track t.tom) {
        <article class="cartao tom" [class]="'tom-' + t.tom">
          <header class="cabecalho">
            <h2>{{ t.nome }}</h2>
            <span class="marca" aria-hidden="true">{{ t.marca }}</span>
          </header>
          <app-diagrama-tom [tom]="t.tom" />
          <p class="resumo"><strong>{{ t.resumo }}</strong></p>
          <p class="comparacao">{{ t.comparacao }}</p>
          <button type="button" class="exemplo" (click)="voz.falar(t.exemplo.hanzi)">
            <span class="hanzi" lang="zh-CN">{{ t.exemplo.hanzi }}</span>
            <app-pinyin [texto]="t.exemplo.pinyin" />
            <span class="traducao">{{ t.exemplo.traducao }}</span>
            <span class="visualmente-oculto">— ouvir</span>
          </button>
        </article>
      }
    </div>

    <section class="cartao destaque">
      <h2>Ouça a diferença</h2>
      <p>Uma frase famosa para treinar: “A mamãe xinga o cavalo?”</p>
      <p class="frase">
        <span lang="zh-CN" class="hanzi">妈妈骂马吗？</span><br />
        <app-pinyin texto="Māma mà mǎ ma?" />
      </p>
      <div class="linha">
        <app-botao-audio texto="妈妈骂马吗？" rotulo="Māma mà mǎ ma" legenda="Normal" velocidade="normal" />
        <app-botao-audio texto="妈妈骂马吗？" rotulo="Māma mà mǎ ma" legenda="Devagar" velocidade="lenta" />
      </div>
    </section>

    <section class="cartao">
      <h2>Os tons em pares</h2>
      <p>
        Na fala, os tons quase nunca aparecem sozinhos: a maioria das palavras tem duas sílabas. Treine as 20
        combinações — toque numa palavra para ouvir. Linhas: tom da 1ª sílaba; colunas: tom da 2ª.
      </p>
      <div class="rolagem-x">
        <table class="tabela-pares">
          <thead>
            <tr>
              <th scope="col"><span class="visualmente-oculto">1ª sílaba</span></th>
              @for (b of colunas; track b) {
                <th scope="col" [class]="'tom-' + b">{{ b === 5 ? 'neutro' : b + 'º' }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (a of linhas; track a) {
              <tr>
                <th scope="row" [class]="'tom-' + a">{{ a }}º</th>
                @for (b of colunas; track b) {
                  <td>
                    @if (exemploPar(a, b); as p) {
                      <button type="button" class="celula-par" (click)="voz.falar(p.hanzi)" [attr.aria-label]="nome(a, b) + ': ' + p.hanzi + ', ' + p.pinyin + ', ' + p.traducao">
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
      <p class="suave pequeno">Atenção: 3º + 3º (como 水果) é falado 2º + 3º. E antes de outros tons o 3º fica só grave.</p>
    </section>

    <section class="cartao">
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
    </section>

    <p class="linha proximos">
      <a class="botao botao-primario" routerLink="../treino">Treinar os tons</a>
      <a class="botao" routerLink="../sons">Ver iniciais e finais</a>
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
    return nomePar([a, b] as never);
  }
}
