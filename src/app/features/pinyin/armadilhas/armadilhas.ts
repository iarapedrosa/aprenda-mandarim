import { Component, computed, inject } from '@angular/core';
import { CartaoSom } from '../../../shared/cartao-som/cartao-som';
import { ARMADILHAS, ARMADILHAS_EN } from '../dados-pinyin';
import { IdiomaService } from '../../../core/i18n/idioma.service';

@Component({
  selector: 'app-armadilhas',
  imports: [CartaoSom],
  template: `
    <p>
      {{ i.t('O pinyin usa letras que conhecemos, mas com sons diferentes. Estas são as armadilhas mais comuns para quem fala português — toque nos exemplos e repita em voz alta.', 'Pinyin uses familiar letters, but with different sounds. These are the most common pitfalls for English speakers — tap the examples and repeat out loud.') }}
    </p>
    @for (a of armadilhas(); track a.titulo; let idx = $index) {
      <article class="cartao armadilha">
        <h2><span class="numero" aria-hidden="true">{{ idx + 1 }}</span> {{ a.titulo }}</h2>
        <p>{{ a.explicacao }}</p>
        <div class="exemplos">
          @for (e of a.exemplos; track e.hanzi) {
            <app-cartao-som [hanzi]="e.hanzi" [pinyin]="e.pinyin" [traducao]="i.tr(e, 'traducao')" />
          }
        </div>
      </article>
    }
  `,
  styles: `
    .armadilha h2 {
      display: flex;
      gap: 10px;
      align-items: center;
      font-size: 1.15rem;
    }
    .numero {
      flex: none;
      display: inline-grid;
      place-items: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--cor-primaria);
      color: var(--cor-sobre-primaria);
      font-size: 0.95rem;
    }
    .exemplos {
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 130px), 1fr));
    }
  `,
})
export class ArmadilhasPagina {
  protected readonly i = inject(IdiomaService);
  protected readonly armadilhas = computed(() => (this.i.ingles() ? ARMADILHAS_EN : ARMADILHAS));
}
