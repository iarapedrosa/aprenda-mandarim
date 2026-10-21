import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { caracteresDe, VocabularioService } from '../../../core/dados/vocabulario.service';
import { BotaoAudio } from '../../../shared/botao-audio/botao-audio';
import { AnimacaoTracos } from '../../../shared/hanzi/animacao-tracos';
import { PinyinColorido } from '../../../shared/pinyin-colorido/pinyin-colorido';
import { NotaMnemonica } from '../../../shared/nota-mnemonica/nota-mnemonica';
import { IdiomaService } from '../../../core/i18n/idioma.service';

@Component({
  selector: 'app-palavra',
  imports: [RouterLink, BotaoAudio, AnimacaoTracos, PinyinColorido, NotaMnemonica],
  template: `
    <section class="pagina">
      <p><a routerLink="/caracteres">← {{ i.t('Voltar ao vocabulário', 'Back to vocabulary') }}</a></p>

      @if (!vocabulario.carregado()) {
        <p class="info">{{ i.t('Carregando…', 'Loading…') }}</p>
      } @else if (palavra(); as p) {
        <article class="cartao principal">
          <span class="etiqueta">HSK {{ p.nivel }} · {{ i.classe(p.classe) }}</span>
          <h1 class="hanzi-grande" lang="zh-CN">{{ p.hanzi }}</h1>
          <p class="pinyin-grande"><app-pinyin [texto]="p.pinyin" /></p>
          <p class="traducao">{{ i.tr(p, 'traducao') }}</p>
          <div class="linha centro">
            <app-botao-audio [texto]="p.hanzi" [rotulo]="p.pinyin" [legenda]="i.t('Ouvir', 'Listen')" />
            <app-botao-audio [texto]="p.hanzi" [rotulo]="p.pinyin" [legenda]="i.t('Devagar', 'Slow')" velocidade="lenta" />
          </div>
          <app-nota-mnemonica [palavraId]="p.id" class="nota" />
        </article>

        @if (p.exemplo; as ex) {
          <section class="cartao">
            <h2>{{ i.t('Exemplo', 'Example') }}</h2>
            <p class="frase-hanzi" lang="zh-CN">{{ ex.hanzi }}</p>
            <p><app-pinyin [texto]="ex.pinyin" /></p>
            <p class="suave">{{ i.tr(ex, 'traducao') }}</p>
            <div class="linha">
              <app-botao-audio [texto]="ex.hanzi" [rotulo]="ex.pinyin" [legenda]="i.t('Ouvir frase', 'Listen to sentence')" />
              <app-botao-audio [texto]="ex.hanzi" [rotulo]="ex.pinyin" [legenda]="i.t('Devagar', 'Slow')" velocidade="lenta" />
            </div>
          </section>
        }

        <section class="cartao">
          <h2>{{ caracteres().length > 1 ? i.t('Os caracteres', 'The characters') : i.t('O caractere', 'The character') }}</h2>
          <div class="caracteres">
            @for (c of caracteres(); track $index) {
              <div class="caractere">
                <app-animacao-tracos [caractere]="c.hanzi" [tamanho]="180" />
                @if (c.sozinho; as s) {
                  <p class="sozinho">
                    <span lang="zh-CN">{{ s.hanzi }}</span> <app-pinyin [texto]="s.pinyin" /> — {{ i.tr(s, 'traducao') }}
                  </p>
                }
                @if (c.radical; as r) {
                  <p class="radical suave pequeno">
                    Radical <strong lang="zh-CN">{{ r.forma }}</strong> ({{ i.tr(r, 'significado') }})
                  </p>
                }
                @if (c.outras.length) {
                  <p class="pequeno">
                    {{ i.t('Também em:', 'Also in:') }}
                    @for (o of c.outras; track o.id) {
                      <a [routerLink]="['/caracteres/palavra', o.id]" lang="zh-CN" class="outra">{{ o.hanzi }}</a>
                    }
                  </p>
                }
              </div>
            }
          </div>
        </section>

        <p class="linha">
          <a class="botao botao-primario" routerLink="/escrita" [queryParams]="{ texto: p.hanzi }">✍️ {{ i.t('Praticar a escrita', 'Practice writing') }}</a>
          @if (anterior(); as a) {
            <a class="botao" [routerLink]="['/caracteres/palavra', a.id]" [attr.aria-label]="i.t('Palavra anterior', 'Previous word')">← <span lang="zh-CN">{{ a.hanzi }}</span></a>
          }
          @if (proxima(); as n) {
            <a class="botao" [routerLink]="['/caracteres/palavra', n.id]" [attr.aria-label]="i.t('Próxima palavra', 'Next word')"><span lang="zh-CN">{{ n.hanzi }}</span> →</a>
          }
        </p>
      } @else {
        <p class="erro">{{ i.t('Palavra não encontrada.', 'Word not found.') }}</p>
      }
    </section>
  `,
  styles: `
    .principal {
      text-align: center;
    }
    .principal h1 {
      margin: 8px 0 0;
    }
    .pinyin-grande {
      font-size: 1.6rem;
      margin: 0;
    }
    .traducao {
      font-size: 1.15rem;
    }
    .centro {
      justify-content: center;
    }
    .nota {
      margin-top: 12px;
    }
    .frase-hanzi {
      font-size: 1.6rem;
      margin-bottom: 4px;
    }
    .caracteres {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
    .caractere {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .sozinho {
      margin: 8px 0 0;
    }
    .radical {
      margin: 4px 0 0;
    }
    .outra {
      font-size: 1.15rem;
      margin: 0 4px;
    }
  `,
})
export class PalavraPagina {
  protected readonly i = inject(IdiomaService);
  protected readonly vocabulario = inject(VocabularioService);
  readonly id = input.required<string>();

  protected readonly palavra = computed(() => this.vocabulario.porId().get(this.id()) ?? null);

  protected readonly caracteres = computed(() => {
    const p = this.palavra();
    if (!p) return [];
    return caracteresDe(p.hanzi).map((hanzi) => ({
      hanzi,
      sozinho: caracteresDe(p.hanzi).length > 1 ? this.vocabulario.caractereIsolado().get(hanzi) : undefined,
      radical: this.vocabulario.radicais().find((r) => r.exemplos.includes(hanzi)),
      outras: (this.vocabulario.porCaractere().get(hanzi) ?? []).filter((o) => o.id !== p.id).slice(0, 6),
    }));
  });

  private readonly indice = computed(() =>
    this.vocabulario.palavras().findIndex((p) => p.id === this.id()),
  );
  protected readonly anterior = computed(() => this.vocabulario.palavras()[this.indice() - 1] ?? null);
  protected readonly proxima = computed(() => {
    const n = this.indice();
    return n >= 0 ? (this.vocabulario.palavras()[n + 1] ?? null) : null;
  });

  constructor() {
    void this.vocabulario.carregar();
  }
}
