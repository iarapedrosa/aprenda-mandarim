import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { caracteresDe, VocabularioService } from '../../../core/dados/vocabulario.service';
import { BotaoAudio } from '../../../shared/botao-audio/botao-audio';
import { AnimacaoTracos } from '../../../shared/hanzi/animacao-tracos';
import { PinyinColorido } from '../../../shared/pinyin-colorido/pinyin-colorido';

@Component({
  selector: 'app-palavra',
  imports: [RouterLink, BotaoAudio, AnimacaoTracos, PinyinColorido],
  template: `
    <section class="pagina">
      <p><a routerLink="/caracteres">← Voltar ao vocabulário</a></p>

      @if (!vocabulario.carregado()) {
        <p class="info">Carregando…</p>
      } @else if (palavra(); as p) {
        <article class="cartao principal">
          <span class="etiqueta">HSK {{ p.nivel }} · {{ p.classe }}</span>
          <h1 class="hanzi-grande" lang="zh-CN">{{ p.hanzi }}</h1>
          <p class="pinyin-grande"><app-pinyin [texto]="p.pinyin" /></p>
          <p class="traducao">{{ p.traducao }}</p>
          <div class="linha centro">
            <app-botao-audio [texto]="p.hanzi" [rotulo]="p.pinyin" legenda="Ouvir" />
            <app-botao-audio [texto]="p.hanzi" [rotulo]="p.pinyin" legenda="Devagar" velocidade="lenta" />
          </div>
        </article>

        @if (p.exemplo; as ex) {
          <section class="cartao">
            <h2>Exemplo</h2>
            <p class="frase-hanzi" lang="zh-CN">{{ ex.hanzi }}</p>
            <p><app-pinyin [texto]="ex.pinyin" /></p>
            <p class="suave">{{ ex.traducao }}</p>
            <div class="linha">
              <app-botao-audio [texto]="ex.hanzi" [rotulo]="ex.pinyin" legenda="Ouvir frase" />
              <app-botao-audio [texto]="ex.hanzi" [rotulo]="ex.pinyin" legenda="Devagar" velocidade="lenta" />
            </div>
          </section>
        }

        <section class="cartao">
          <h2>{{ caracteres().length > 1 ? 'Os caracteres' : 'O caractere' }}</h2>
          <div class="caracteres">
            @for (c of caracteres(); track $index) {
              <div class="caractere">
                <app-animacao-tracos [caractere]="c.hanzi" [tamanho]="180" />
                @if (c.sozinho; as s) {
                  <p class="sozinho">
                    <span lang="zh-CN">{{ s.hanzi }}</span> <app-pinyin [texto]="s.pinyin" /> — {{ s.traducao }}
                  </p>
                }
                @if (c.radical; as r) {
                  <p class="radical suave pequeno">
                    Radical <strong lang="zh-CN">{{ r.forma }}</strong> ({{ r.significado }})
                  </p>
                }
                @if (c.outras.length) {
                  <p class="pequeno">
                    Também em:
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
          <a class="botao botao-primario" routerLink="/escrita" [queryParams]="{ texto: p.hanzi }">✍️ Praticar a escrita</a>
          @if (anterior(); as a) {
            <a class="botao" [routerLink]="['/caracteres/palavra', a.id]" aria-label="Palavra anterior">← <span lang="zh-CN">{{ a.hanzi }}</span></a>
          }
          @if (proxima(); as n) {
            <a class="botao" [routerLink]="['/caracteres/palavra', n.id]" aria-label="Próxima palavra"><span lang="zh-CN">{{ n.hanzi }}</span> →</a>
          }
        </p>
      } @else {
        <p class="erro">Palavra não encontrada.</p>
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
    const i = this.indice();
    return i >= 0 ? (this.vocabulario.palavras()[i + 1] ?? null) : null;
  });

  constructor() {
    void this.vocabulario.carregar();
  }
}
