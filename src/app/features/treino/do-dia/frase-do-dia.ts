import { Component, computed, inject, input } from '@angular/core';
import { FraseDoDia } from '../../../core/dados/frases.service';
import { ProgressoService } from '../../../core/progresso/progresso.service';
import { BotaoAudio } from '../../../shared/botao-audio/botao-audio';
import { PinyinColorido } from '../../../shared/pinyin-colorido/pinyin-colorido';

@Component({
  selector: 'app-frase-do-dia',
  imports: [BotaoAudio, PinyinColorido],
  template: `
    <article class="cartao do-dia">
      <p class="rotulo"><span lang="zh-CN">每日一句</span> · Frase do dia</p>
      <p class="hanzi-frase" lang="zh-CN">{{ frase().hanzi }}</p>
      <p class="pinyin-frase"><app-pinyin [texto]="frase().pinyin" /></p>
      <p class="traducao">{{ frase().traducao }}</p>
      @if (frase().nota) {
        <p class="nota">💡 {{ frase().nota }}</p>
      }
      <div class="linha">
        <app-botao-audio [texto]="frase().hanzi" [rotulo]="frase().pinyin" legenda="Ouvir" />
        <app-botao-audio [texto]="frase().hanzi" [rotulo]="frase().pinyin" legenda="Devagar" velocidade="lenta" />
        @if (naRevisao()) {
          <span class="etiqueta">✓ Na sua revisão</span>
        } @else {
          <button type="button" class="botao botao-texto" (click)="adicionar()">+ Revisar depois</button>
        }
      </div>
    </article>
  `,
  styleUrl: './do-dia.css',
})
export class FraseDoDiaCartao {
  private readonly progresso = inject(ProgressoService);
  readonly frase = input.required<FraseDoDia>();
  protected readonly naRevisao = computed(() => !!this.progresso.estado().cartoes[`frase:${this.frase().id}`]);

  protected adicionar(): void {
    // A frase entra direto como revisada hoje, para voltar amanhã.
    this.progresso.adicionarCartao('frase', this.frase().id);
    this.progresso.revisar('frase', this.frase().id, 4);
  }
}
