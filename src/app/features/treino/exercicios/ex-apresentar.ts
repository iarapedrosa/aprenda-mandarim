import { Component, OnInit, computed, inject, input, output } from '@angular/core';
import { caracteresDe } from '../../../core/dados/vocabulario.service';
import { CLASSES_EN } from '../../../core/i18n/classes';
import { VozService } from '../../../core/voz/voz.service';
import { BotaoAudio } from '../../../shared/botao-audio/botao-audio';
import { AnimacaoTracos } from '../../../shared/hanzi/animacao-tracos';
import { PinyinColorido } from '../../../shared/pinyin-colorido/pinyin-colorido';
import { NotaMnemonica } from '../../../shared/nota-mnemonica/nota-mnemonica';
import { ItemApresentar, ResultadoItem } from '../sessao.model';
import { IdiomaService } from '../../../core/i18n/idioma.service';

/** Apresenta uma palavra nova: caracteres, pinyin, áudio, tradução, traços e exemplo. */
@Component({
  selector: 'app-ex-apresentar',
  imports: [BotaoAudio, AnimacaoTracos, PinyinColorido, NotaMnemonica],
  template: `
    <p class="etiqueta novo">{{ i.t('Palavra nova', 'New word') }} · HSK {{ item().palavra.nivel }}</p>
    <div class="topo">
      <p class="hanzi-pergunta" lang="zh-CN">{{ item().palavra.hanzi }}</p>
      <p class="pinyin-pergunta"><app-pinyin [texto]="item().palavra.pinyin" /></p>
      <p class="texto-pergunta">{{ i.tr(item().palavra, 'traducao') }}</p>
      <p class="suave pequeno">{{ classe() }}</p>
      <div class="linha centro">
        <app-botao-audio [texto]="item().palavra.hanzi" [rotulo]="item().palavra.pinyin" [legenda]="i.t('Ouvir', 'Listen')" />
        <app-botao-audio [texto]="item().palavra.hanzi" [rotulo]="item().palavra.pinyin" [legenda]="i.t('Devagar', 'Slow')" velocidade="lenta" />
      </div>
    </div>

    <div class="tracos">
      @for (c of caracteres(); track $index) {
        <app-animacao-tracos [caractere]="c" [tamanho]="120" />
      }
    </div>

    @if (item().palavra.exemplo; as ex) {
      <div class="info exemplo">
        <p class="frase" lang="zh-CN">{{ ex.hanzi }}</p>
        <p><app-pinyin [texto]="ex.pinyin" /></p>
        <p class="suave">{{ i.tr(ex, 'traducao') }}</p>
        <app-botao-audio [texto]="ex.hanzi" [rotulo]="ex.pinyin" [legenda]="i.t('Ouvir exemplo', 'Listen to example')" />
      </div>
    }

    <app-nota-mnemonica [palavraId]="item().palavra.id" class="nota" />

    <button type="button" class="botao botao-primario botao-bloco" (click)="concluir.emit({ acertou: true, informativo: true })">
      {{ i.t('Próxima', 'Next') }}
    </button>
  `,
  styleUrl: './exercicios.css',
  styles: `
    .novo {
      background: var(--cor-primaria-suave);
      color: var(--cor-primaria);
      border-color: transparent;
    }
    .topo {
      text-align: center;
    }
    .topo p {
      margin: 0 0 4px;
    }
    .tracos {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
      margin: 16px 0;
    }
    .exemplo {
      margin-bottom: 12px;
    }
    .nota {
      margin-bottom: 12px;
    }
    .exemplo p {
      margin: 0 0 4px;
    }
    .frase {
      font-family: var(--fonte-hanzi);
      font-size: 1.4rem;
    }
  `,
})
export class ExApresentar implements OnInit {
  protected readonly i = inject(IdiomaService);
  private readonly voz = inject(VozService);
  readonly item = input.required<ItemApresentar>();
  readonly concluir = output<ResultadoItem>();
  protected readonly caracteres = computed(() => caracteresDe(this.item().palavra.hanzi));
  protected readonly classe = computed(() => {
    const c = this.item().palavra.classe;
    return this.i.ingles() ? (CLASSES_EN[c] ?? c) : c;
  });

  ngOnInit(): void {
    void this.voz.falar(this.item().palavra.hanzi);
  }
}
