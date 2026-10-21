import { Component, computed, inject, signal } from '@angular/core';
import { Tom } from '../../../core/pinyin/pinyin';
import { SilabasService } from '../../../core/pinyin/silabas.service';
import { VozService } from '../../../core/voz/voz.service';
import { CartaoSom } from '../../../shared/cartao-som/cartao-som';
import {
  FINAIS_TABELA,
  GRUPOS_FINAIS,
  GRUPOS_INICIAIS,
  INICIAIS_TABELA,
  escreverSilaba,
} from '../dados-pinyin';

@Component({
  selector: 'app-sons',
  imports: [CartaoSom],
  template: `
    <p>
      Uma sílaba em mandarim é formada por <strong>inicial</strong> (consoante do começo) +
      <strong>final</strong> (o resto) + <strong>tom</strong>. Ex.: <em>m</em> + <em>a</em> + 3º tom
      = mǎ (马, cavalo). Como a voz do navegador lê caracteres, cada som é tocado através de um
      caractere de exemplo.
    </p>

    <h2 id="iniciais">Iniciais (21)</h2>
    @for (grupo of gruposIniciais; track grupo.nome) {
      <section class="grupo">
        <h3>{{ grupo.nome }}</h3>
        <p class="suave pequeno">{{ grupo.descricao }}</p>
        <div class="grade-sons">
          @for (i of grupo.iniciais; track i.letra) {
            <div class="item">
              <app-cartao-som
                [destaque]="i.letra"
                [hanzi]="i.exemplo.hanzi"
                [pinyin]="i.exemplo.pinyin"
                [traducao]="i.exemplo.traducao"
              />
              <p class="dica">{{ i.dica }}</p>
            </div>
          }
        </div>
      </section>
    }

    <h2 id="finais">Finais</h2>
    @for (grupo of gruposFinais; track grupo.nome) {
      <section class="grupo">
        <h3>{{ grupo.nome }}</h3>
        <p class="suave pequeno">{{ grupo.descricao }}</p>
        <div class="grade-sons">
          @for (f of grupo.finais; track f.final) {
            <div class="item">
              <app-cartao-som
                [destaque]="f.final + (f.sozinha ? ' (' + f.sozinha + ')' : '')"
                [hanzi]="f.exemplo.hanzi"
                [pinyin]="f.exemplo.pinyin"
                [traducao]="f.exemplo.traducao"
              />
              <p class="dica">{{ f.dica }}</p>
            </div>
          }
        </div>
      </section>
    }

    <h2 id="tabela">Tabela de sílabas</h2>
    <p>Escolha uma inicial para ver todas as sílabas que ela forma. Toque numa sílaba e escolha o tom.</p>

    @if (!silabas.carregado()) {
      <p class="info">Carregando sílabas…</p>
    } @else {
      <div class="seletor" role="radiogroup" aria-label="Inicial">
        @for (i of iniciaisTabela; track i) {
          <button
            type="button"
            role="radio"
            [attr.aria-checked]="inicial() === i"
            [class.ativo]="inicial() === i"
            (click)="escolherInicial(i)"
          >
            {{ i || '—' }}
          </button>
        }
      </div>
      <p class="suave pequeno">“—” = sílabas sem consoante inicial (escritas com y- ou w-).</p>

      <div class="silabas">
        @for (s of silabasDaInicial(); track s.escrita) {
          <button
            type="button"
            class="silaba"
            [class.ativo]="silabaEscolhida() === s.escrita"
            [attr.aria-expanded]="silabaEscolhida() === s.escrita"
            (click)="silabaEscolhida.set(s.escrita)"
          >
            <span class="escrita">{{ s.escrita }}</span>
            <span class="final suave">{{ s.final }}</span>
          </button>
        }
      </div>

      @if (silabaEscolhida(); as escolhida) {
        <div class="cartao tons-silaba" aria-live="polite">
          <h3>{{ escolhida }}</h3>
          <div class="botoes-tons">
            @for (t of tonsDaEscolhida(); track t.tom) {
              <button type="button" class="botao" [class]="'botao tom-' + t.tom" (click)="tocar(t.caractere)">
                <span class="pinyin-tom">{{ t.pinyin }}</span>
                <span lang="zh-CN" class="hanzi">{{ t.caractere }}</span>
              </button>
            }
          </div>
          @if (tonsDaEscolhida().length < 4) {
            <p class="suave pequeno">Os tons que faltam não têm caractere comum com esse som.</p>
          }
        </div>
      }
    }
  `,
  styles: `
    .grupo {
      margin-bottom: 20px;
    }
    .grupo h3 {
      margin-bottom: 0;
    }
    .grade-sons {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr));
    }
    .item {
      display: flex;
      flex-direction: column;
    }
    .dica {
      font-size: 0.85rem;
      color: var(--cor-texto-suave);
      margin: 6px 2px 0;
    }
    .seletor {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 4px;
    }
    .seletor button {
      min-width: 44px;
      min-height: 44px;
      border-radius: 10px;
      border: 1px solid var(--cor-borda);
      background: var(--cor-superficie);
      color: var(--cor-texto);
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }
    .seletor button.ativo {
      background: var(--cor-primaria);
      border-color: var(--cor-primaria);
      color: var(--cor-sobre-primaria);
    }
    .silabas {
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
      margin: 12px 0;
    }
    .silaba {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 4px;
      border-radius: 10px;
      border: 1px solid var(--cor-borda);
      background: var(--cor-superficie);
      color: var(--cor-texto);
      font: inherit;
      cursor: pointer;
    }
    .silaba.ativo {
      border-color: var(--cor-primaria);
      background: var(--cor-primaria-suave);
    }
    .escrita {
      font-weight: 700;
      font-size: 1.1rem;
    }
    .final {
      font-size: 0.75rem;
    }
    .tons-silaba {
      position: sticky;
      bottom: calc(var(--altura-nav) + 8px + env(safe-area-inset-bottom, 0px));
    }
    .botoes-tons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 8px;
    }
    .botoes-tons .botao {
      border-radius: var(--raio-p);
      justify-content: space-between;
    }
    .pinyin-tom {
      font-size: 1.2rem;
    }
    .hanzi {
      font-size: 1.4rem;
      color: var(--cor-texto);
    }
    @media (min-width: 900px) {
      .tons-silaba {
        bottom: 8px;
      }
    }
  `,
})
export class SonsPagina {
  protected readonly silabas = inject(SilabasService);
  private readonly voz = inject(VozService);

  protected readonly gruposIniciais = GRUPOS_INICIAIS;
  protected readonly gruposFinais = GRUPOS_FINAIS;
  protected readonly iniciaisTabela = INICIAIS_TABELA;

  protected readonly inicial = signal('m');
  protected readonly silabaEscolhida = signal<string | null>(null);

  protected readonly silabasDaInicial = computed(() => {
    if (!this.silabas.carregado()) return [];
    const inicial = this.inicial();
    const vistas = new Set<string>();
    return FINAIS_TABELA.map((final) => ({ final, escrita: escreverSilaba(inicial, final) })).filter(
      (s) => {
        if (vistas.has(s.escrita) || this.silabas.tons(s.escrita).length === 0) return false;
        // b/p/m/f + o ("bo"), e os demais + uo ("duo"): mantém a grafia real
        vistas.add(s.escrita);
        return true;
      },
    );
  });

  protected readonly tonsDaEscolhida = computed(() => {
    const s = this.silabaEscolhida();
    if (!s) return [];
    return ([1, 2, 3, 4] as Tom[]).map((t) => this.silabas.obter(s, t)).filter((x) => x !== null);
  });

  constructor() {
    void this.silabas.carregar();
  }

  protected escolherInicial(inicial: string): void {
    this.inicial.set(inicial);
    this.silabaEscolhida.set(null);
  }

  protected tocar(caractere: string): void {
    void this.voz.falar(caractere);
  }
}
