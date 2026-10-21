import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Palavra } from '../../../core/dados/modelos';
import { ProgressoService } from '../../../core/progresso/progresso.service';
import { estagio } from '../../../core/srs/sm2';
import { BotaoAudio } from '../../../shared/botao-audio/botao-audio';
import { PinyinColorido } from '../../../shared/pinyin-colorido/pinyin-colorido';

@Component({
  selector: 'app-palavra-do-dia',
  imports: [BotaoAudio, PinyinColorido, RouterLink],
  template: `
    <article class="cartao do-dia">
      <p class="rotulo"><span lang="zh-CN">每日一词</span> · Palavra do dia</p>
      <div class="palavra">
        <a class="hanzi-palavra" lang="zh-CN" [routerLink]="['/caracteres/palavra', palavra().id]">{{ palavra().hanzi }}</a>
        <div>
          <p class="pinyin-frase"><app-pinyin [texto]="palavra().pinyin" /></p>
          <p class="traducao">{{ palavra().traducao }}</p>
          <p class="suave pequeno">HSK {{ palavra().nivel }} · {{ palavra().classe }}</p>
        </div>
      </div>
      @if (palavra().exemplo; as ex) {
        <p class="exemplo"><span lang="zh-CN">{{ ex.hanzi }}</span> <span class="suave">— {{ ex.traducao }}</span></p>
      }
      <div class="linha">
        <app-botao-audio [texto]="palavra().hanzi" [rotulo]="palavra().pinyin" legenda="Ouvir" />
        @if (situacao(); as s) {
          <span class="etiqueta">{{ s }}</span>
        } @else {
          <button type="button" class="botao botao-texto" (click)="adicionar()">+ Aprender no próximo treino</button>
        }
      </div>
    </article>
  `,
  styleUrl: './do-dia.css',
})
export class PalavraDoDiaCartao {
  private readonly progresso = inject(ProgressoService);
  readonly palavra = input.required<Palavra>();

  protected readonly situacao = computed(() => {
    const c = this.progresso.estado().cartoes[`palavra:${this.palavra().id}`];
    if (!c) return null;
    const e = estagio(c);
    return e === 'novo' ? '✓ Entra no próximo treino' : e === 'maduro' ? '✓ Você já domina' : '✓ Você está aprendendo';
  });

  protected adicionar(): void {
    this.progresso.adicionarCartao('palavra', this.palavra().id);
  }
}
