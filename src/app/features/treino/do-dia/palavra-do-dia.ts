import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Palavra } from '../../../core/dados/modelos';
import { ProgressoService } from '../../../core/progresso/progresso.service';
import { estagio } from '../../../core/srs/sm2';
import { CLASSES_EN } from '../../../core/i18n/classes';
import { BotaoAudio } from '../../../shared/botao-audio/botao-audio';
import { PinyinColorido } from '../../../shared/pinyin-colorido/pinyin-colorido';
import { IdiomaService } from '../../../core/i18n/idioma.service';

@Component({
  selector: 'app-palavra-do-dia',
  imports: [BotaoAudio, PinyinColorido, RouterLink],
  template: `
    <article class="cartao do-dia">
      <p class="rotulo"><span lang="zh-CN">每日一词</span> · {{ i.t('Palavra do dia', 'Word of the day') }}</p>
      <div class="palavra">
        <a class="hanzi-palavra" lang="zh-CN" [routerLink]="['/caracteres/palavra', palavra().id]">{{ palavra().hanzi }}</a>
        <div>
          <p class="pinyin-frase"><app-pinyin [texto]="palavra().pinyin" /></p>
          <p class="traducao">{{ i.tr(palavra(), 'traducao') }}</p>
          <p class="suave pequeno">HSK {{ palavra().nivel }} · {{ classe(palavra().classe) }}</p>
        </div>
      </div>
      @if (palavra().exemplo; as ex) {
        <p class="exemplo"><span lang="zh-CN">{{ ex.hanzi }}</span> <span class="suave">— {{ i.tr(ex, 'traducao') }}</span></p>
      }
      <div class="linha">
        <app-botao-audio [texto]="palavra().hanzi" [rotulo]="palavra().pinyin" [legenda]="i.t('Ouvir', 'Listen')" />
        @if (situacao(); as s) {
          <span class="etiqueta">{{ s }}</span>
        } @else {
          <button type="button" class="botao botao-texto" (click)="adicionar()">+ {{ i.t('Aprender no próximo treino', 'Learn in the next training') }}</button>
        }
      </div>
    </article>
  `,
  styleUrl: './do-dia.css',
})
export class PalavraDoDiaCartao {
  protected readonly i = inject(IdiomaService);
  private readonly progresso = inject(ProgressoService);
  readonly palavra = input.required<Palavra>();

  protected readonly situacao = computed(() => {
    const c = this.progresso.estado().cartoes[`palavra:${this.palavra().id}`];
    if (!c) return null;
    const e = estagio(c);
    return e === 'novo'
      ? this.i.t('✓ Entra no próximo treino', '✓ Coming in the next training')
      : e === 'maduro'
        ? this.i.t('✓ Você já domina', '✓ You’ve mastered it')
        : this.i.t('✓ Você está aprendendo', '✓ You’re learning it');
  });

  protected classe(c: string): string {
    return this.i.ingles() ? (CLASSES_EN[c] ?? c) : c;
  }

  protected adicionar(): void {
    this.progresso.adicionarCartao('palavra', this.palavra().id);
  }
}
