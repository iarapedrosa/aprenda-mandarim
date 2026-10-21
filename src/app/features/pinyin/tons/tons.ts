import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
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
    code {
      background: var(--cor-superficie-2);
      padding: 1px 6px;
      border-radius: 6px;
    }
  `,
})
export class TonsPagina {
  protected readonly voz = inject(VozService);
  protected readonly tons = TONS;
}
