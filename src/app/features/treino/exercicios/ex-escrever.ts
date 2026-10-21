import { Component, input, output, signal } from '@angular/core';
import { notaDaEscrita } from '../../../core/srs/sm2';
import { BotaoAudio } from '../../../shared/botao-audio/botao-audio';
import { QuizEscrita, ResultadoEscrita } from '../../../shared/hanzi/quiz-escrita';
import { PinyinColorido } from '../../../shared/pinyin-colorido/pinyin-colorido';
import { ItemEscrever, ResultadoItem } from '../sessao.model';

const TEXTOS_NIVEL = {
  contorno: 'Decalque o caractere',
  'sem-contorno': 'Escreva o caractere sem contorno',
  memoria: 'Escreva de memória',
};

/** Escrever um caractere (quiz do hanzi-writer). */
@Component({
  selector: 'app-ex-escrever',
  imports: [QuizEscrita, BotaoAudio, PinyinColorido],
  template: `
    <p class="enunciado">{{ textos[item().nivel] }}</p>
    <div class="cabecalho">
      @if (item().nivel === 'sem-contorno' || resultado()) {
        <span class="modelo" lang="zh-CN">{{ item().caractere.hanzi }}</span>
      }
      <div>
        @if (item().caractere.pinyin) {
          <p class="pinyin-pergunta"><app-pinyin [texto]="item().caractere.pinyin" /></p>
        }
        <p class="suave">{{ item().caractere.traducao }}</p>
      </div>
      <app-botao-audio [texto]="item().caractere.hanzi" [rotulo]="item().caractere.pinyin" />
    </div>
    <app-quiz-escrita
      [caractere]="item().caractere.hanzi"
      [nivel]="item().nivel"
      [tamanho]="tamanho"
      (concluir)="aoConcluir($event)"
    />
    @if (resultado(); as r) {
      <button type="button" class="botao botao-primario botao-bloco continuar" (click)="emitir(r)">Continuar</button>
    }
  `,
  styleUrl: './exercicios.css',
  styles: `
    .cabecalho {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 14px;
      margin-bottom: 10px;
    }
    .cabecalho p {
      margin: 0;
    }
    .modelo {
      font-family: var(--fonte-hanzi);
      font-size: 3rem;
      line-height: 1;
    }
    .continuar {
      margin-top: 12px;
    }
  `,
})
export class ExEscrever {
  readonly item = input.required<ItemEscrever>();
  readonly concluir = output<ResultadoItem>();
  protected readonly textos = TEXTOS_NIVEL;
  protected readonly resultado = signal<ResultadoEscrita | null>(null);
  protected readonly tamanho = Math.min(280, (typeof window !== 'undefined' ? window.innerWidth : 360) - 80);

  protected aoConcluir(r: ResultadoEscrita): void {
    if (!this.resultado()) this.resultado.set(r);
  }

  protected emitir(r: ResultadoEscrita): void {
    const nota = notaDaEscrita(r.erros, r.ajuda);
    this.concluir.emit({ acertou: nota >= 3, nota });
  }
}
