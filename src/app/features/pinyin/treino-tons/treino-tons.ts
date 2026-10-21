import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tom, silabaComAcento, tomDaSilaba } from '../../../core/pinyin/pinyin';
import { SilabasService } from '../../../core/pinyin/silabas.service';
import { VocabularioService } from '../../../core/dados/vocabulario.service';
import { alternativasDePar, chavePar, observacaoPar, palavrasPorPar, tonsDoValor } from '../../../core/pinyin/pares-tons';
import { pesosDosTons, sortearPonderado } from '../../../core/progresso/tons-dificeis';
import { ProgressoService } from '../../../core/progresso/progresso.service';
import { embaralhar, sortear } from '../../../core/util/aleatorio';
import { VozService } from '../../../core/voz/voz.service';
import { DiagramaTom } from '../../../shared/diagrama-tom/diagrama-tom';
import { PinyinColorido } from '../../../shared/pinyin-colorido/pinyin-colorido';
import { ExemploSom, GrupoPares, PARES_SONS, PARES_TONS } from '../dados-pinyin';

type Modo = 'tom' | 'combinacoes' | 'pares-tons' | 'pares-sons';

interface Opcao {
  rotulo: string;
  valor: string;
  tom?: Tom;
  /** ex.: "3º + 1º" */
  nome?: string;
}

interface Rodada {
  alvo: ExemploSom;
  opcoes: Opcao[];
  correta: string;
  tons: number[];
  nota?: string;
}

/** Sílabas comuns e fáceis de ouvir para quem está começando. */
const SILABAS_INICIANTE = ['ma', 'ba', 'yi', 'shi', 'wu', 'tang', 'qi', 'tu', 'yan', 'you', 'wei', 'ying', 'yu', 'ji', 'xi', 'hu'];

@Component({
  selector: 'app-treino-tons',
  imports: [FormsModule, DiagramaTom, PinyinColorido],
  template: `
    <div class="modos" role="radiogroup" aria-label="Tipo de treino">
      <label class="modo">
        <input type="radio" name="modo" value="tom" [ngModel]="modo()" (ngModelChange)="mudarModo($event)" />
        <span><strong>Qual é o tom?</strong><br /><small>Ouça uma sílaba e diga o tom</small></span>
      </label>
      <label class="modo">
        <input type="radio" name="modo" value="combinacoes" [ngModel]="modo()" (ngModelChange)="mudarModo($event)" />
        <span><strong>Pares de tons</strong><br /><small>Palavras de 2 sílabas: 老师 = 3º + 1º</small></span>
      </label>
      <label class="modo">
        <input type="radio" name="modo" value="pares-tons" [ngModel]="modo()" (ngModelChange)="mudarModo($event)" />
        <span><strong>Pares mínimos</strong><br /><small>mā, má, mǎ ou mà?</small></span>
      </label>
      <label class="modo">
        <input type="radio" name="modo" value="pares-sons" [ngModel]="modo()" (ngModelChange)="mudarModo($event)" />
        <span><strong>Sons parecidos</strong><br /><small>shì ou sì? lù ou lǜ?</small></span>
      </label>
    </div>

    @if (modo() === 'tom') {
      <label class="opcao-linha">
        <input type="checkbox" [ngModel]="todasSilabas()" (ngModelChange)="todasSilabas.set($event); nova()" />
        Usar todas as sílabas (mais difícil)
      </label>
    } @else if (modo() === 'combinacoes') {
      <p class="suave pequeno">
        Na fala, os tons quase sempre vêm em pares. São 20 combinações (4 tons × 4 tons + neutro), sorteadas por igual.
      </p>
    } @else {
      <label class="grupo-pares">
        <span>Grupo:</span>
        <select class="campo" [ngModel]="grupoId()" (ngModelChange)="grupoId.set($event); nova()">
          <option value="">Misturar todos</option>
          @for (g of grupos(); track g.id) {
            <option [value]="g.id">{{ g.titulo }}</option>
          }
        </select>
      </label>
    }

    <section class="cartao treino" aria-live="polite">
      <p class="placar">
        <span>Acertos: <strong>{{ acertos() }}</strong> de {{ total() }}</span>
        @if (sequencia() >= 3) {
          <span class="etiqueta">🔥 {{ sequencia() }} seguidos</span>
        }
      </p>

      @if (!iniciado()) {
        <p>Toque em <strong>Começar</strong> e ouça com atenção. Dica: use fones de ouvido.</p>
        <button type="button" class="botao botao-primario botao-bloco" (click)="comecar()">Começar</button>
      } @else if (rodada(); as r) {
        <div class="ouvir">
          <button type="button" class="botao botao-primario" (click)="tocar()">🔊 Ouvir de novo</button>
          <button type="button" class="botao" (click)="tocar('lenta')">🐢 Devagar</button>
        </div>

        <div class="opcoes" role="group" aria-label="Alternativas">
          @for (o of r.opcoes; track o.valor; let i = $index) {
            <button
              type="button"
              class="opcao"
              [class.correta]="respondido() && o.valor === r.correta"
              [class.errada]="escolha() === o.valor && o.valor !== r.correta"
              [disabled]="respondido()"
              (click)="responder(o.valor)"
            >
              <span class="atalho" aria-hidden="true">{{ i + 1 }}</span>
              @if (modo() === 'tom' && o.tom) {
                <app-diagrama-tom [tom]="o.tom" [class]="'tom-' + o.tom" class="mini" />
              }
              <app-pinyin [texto]="o.rotulo" />
              @if (o.nome) {
                <span class="nome-par">{{ o.nome }}</span>
              }
            </button>
          }
        </div>

        @if (respondido()) {
          <div [class]="escolha() === r.correta ? 'sucesso resultado' : 'erro resultado'" role="status">
            <strong>{{ escolha() === r.correta ? 'Acertou!' : 'Não foi dessa vez.' }}</strong>
            Era <span lang="zh-CN" class="hanzi">{{ r.alvo.hanzi }}</span>
            <app-pinyin [texto]="r.alvo.pinyin" />
            @if (r.alvo.traducao) {
              <span>({{ r.alvo.traducao }})</span>
            }
            @if (r.nota) {
              <span class="nota-par">{{ r.nota }}</span>
            }
          </div>
          <button type="button" class="botao botao-primario botao-bloco" (click)="nova(true)">
            Próxima <span class="suave pequeno">(Enter)</span>
          </button>
        }
        <p class="suave pequeno teclas">Teclado: 1–4 para responder · R para repetir · Enter para continuar</p>
      } @else {
        <p class="info">Carregando sílabas…</p>
      }
    </section>
  `,
  styles: `
    .nome-par {
      font-size: 0.75rem;
      color: var(--cor-texto-suave);
    }
    .nota-par {
      flex-basis: 100%;
      color: var(--cor-texto);
    }
    .modos {
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(4, 1fr);
      margin-bottom: 12px;
    }
    .modo {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      padding: 12px;
      border-radius: var(--raio-p);
      border: 2px solid var(--cor-borda);
      background: var(--cor-superficie);
      font-weight: 400;
      cursor: pointer;
    }
    .modo:has(input:checked) {
      border-color: var(--cor-primaria);
      background: var(--cor-primaria-suave);
    }
    .modo input {
      margin-top: 4px;
      accent-color: var(--cor-primaria);
    }
    .opcao-linha,
    .grupo-pares {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 12px;
      font-weight: 400;
    }
    .grupo-pares .campo {
      max-width: 320px;
    }
    .placar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ouvir {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }
    .opcoes {
      margin-bottom: 12px;
    }
    .opcao {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      font-size: 1.3rem;
    }
    .atalho {
      position: absolute;
      top: 4px;
      left: 8px;
      font-size: 0.7rem;
      color: var(--cor-texto-suave);
    }
    .mini {
      width: 70px;
    }
    .resultado {
      margin-bottom: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: baseline;
    }
    .resultado .hanzi {
      font-size: 1.5rem;
    }
    .teclas {
      margin: 10px 0 0;
    }
    @media (max-width: 599px) {
      .modos {
        grid-template-columns: repeat(2, 1fr);
      }
      .modo {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 4px;
        padding: 8px 6px;
        font-size: 0.9rem;
      }
      .modo small {
        display: none;
      }
      .modo input {
        margin: 0;
      }
    }
  `,
})
export class TreinoTonsPagina {
  private readonly silabas = inject(SilabasService);
  private readonly vocabulario = inject(VocabularioService);
  private readonly pares = computed(() => palavrasPorPar(this.vocabulario.palavras()));
  private readonly voz = inject(VozService);
  private readonly progresso = inject(ProgressoService);

  protected readonly modo = signal<Modo>('tom');
  protected readonly todasSilabas = signal(false);
  protected readonly grupoId = signal('');
  protected readonly iniciado = signal(false);
  protected readonly rodada = signal<Rodada | null>(null);
  protected readonly escolha = signal<string | null>(null);
  protected readonly respondido = computed(() => this.escolha() !== null);
  protected readonly acertos = signal(0);
  protected readonly total = signal(0);
  protected readonly sequencia = signal(0);

  protected readonly grupos = computed<GrupoPares[]>(() =>
    this.modo() === 'pares-sons' ? PARES_SONS : PARES_TONS,
  );

  constructor() {
    void Promise.all([this.silabas.carregar(), this.vocabulario.carregar()]).then(() => this.nova());
  }

  protected mudarModo(modo: Modo): void {
    this.modo.set(modo);
    this.grupoId.set('');
    this.nova();
  }

  protected comecar(): void {
    this.iniciado.set(true);
    this.nova(true);
  }

  protected nova(tocar = false): void {
    this.escolha.set(null);
    const r =
      this.modo() === 'tom' ? this.rodadaDeTom() : this.modo() === 'combinacoes' ? this.rodadaDeCombinacao() : this.rodadaDePares();
    this.rodada.set(r);
    if (tocar && r) void this.tocar();
  }

  protected tocar(velocidade?: 'lenta'): Promise<void> {
    const r = this.rodada();
    return r ? this.voz.falar(r.alvo.hanzi, { velocidade }) : Promise.resolve();
  }

  protected responder(valor: string): void {
    const r = this.rodada();
    if (!r || this.respondido()) return;
    this.escolha.set(valor);
    const acertou = valor === r.correta;
    this.total.update((n) => n + 1);
    this.acertos.update((n) => n + (acertou ? 1 : 0));
    this.sequencia.update((n) => (acertou ? n + 1 : 0));
    this.progresso.registrarResposta(this.modo() === 'pares-sons' ? 'pinyin' : 'tons', acertou, r.tons);
    if (!acertou && this.modo() !== 'pares-sons') {
      this.progresso.registrarConfusaoTons(tonsDoValor(r.correta), tonsDoValor(valor));
    }
  }

  private rodadaDeTom(): Rodada | null {
    if (!this.silabas.carregado()) return null;
    const lista = this.todasSilabas()
      ? this.silabas.todas()
      : SILABAS_INICIANTE.flatMap((s) =>
          ([1, 2, 3, 4] as Tom[]).map((t) => this.silabas.obter(s, t)).filter((x) => x && !x.raro),
        );
    if (!lista.length) return null;
    const pesos = pesosDosTons(this.progresso.estado().confusaoTons ?? {});
    const alvo = sortearPonderado(lista, (x) => pesos[x!.tom])!;
    return {
      alvo: { hanzi: alvo.caractere, pinyin: alvo.pinyin },
      opcoes: ([1, 2, 3, 4] as Tom[]).map((t) => ({
        rotulo: silabaComAcento(alvo.letras, t),
        valor: String(t),
        tom: t,
      })),
      correta: String(alvo.tom),
      tons: [alvo.tom],
    };
  }

  private rodadaDeCombinacao(): Rodada | null {
    const pares = this.pares();
    const chaves = [...pares.keys()];
    if (!chaves.length) return null;
    const pesos = pesosDosTons(this.progresso.estado().confusaoTons ?? {});
    const chave = sortearPonderado(chaves, (k) => { const [a, b] = k.split('-').map(Number); return pesos[a as 1] * pesos[b as 1]; });
    const p = sortear(pares.get(chave)!);
    return {
      alvo: { hanzi: p.hanzi, pinyin: p.pinyin, traducao: p.traducao },
      opcoes: alternativasDePar(p),
      correta: chavePar(p.tons),
      tons: p.tons,
      nota: observacaoPar(p),
    };
  }

  private rodadaDePares(): Rodada {
    const grupos = this.grupos();
    const grupo = grupos.find((g) => g.id === this.grupoId()) ?? sortear(grupos);
    const alvo = sortear(grupo.itens);
    const itens = this.modo() === 'pares-tons' ? grupo.itens : embaralhar(grupo.itens);
    return {
      alvo,
      opcoes: itens.map((i) => ({ rotulo: i.pinyin, valor: i.pinyin })),
      correta: alvo.pinyin,
      tons: [tomDaSilaba(alvo.pinyin)],
    };
  }

  @HostListener('document:keydown', ['$event'])
  protected aoTeclar(evento: KeyboardEvent): void {
    const alvo = evento.target as HTMLElement | null;
    if (!this.iniciado() || alvo?.closest('input, select, textarea')) return;
    const r = this.rodada();
    if (!r) return;
    if (/^[1-4]$/.test(evento.key) && !this.respondido()) {
      const opcao = r.opcoes[Number(evento.key) - 1];
      if (opcao) this.responder(opcao.valor);
    } else if (evento.key.toLowerCase() === 'r') {
      void this.tocar();
    } else if (evento.key === 'Enter' && this.respondido() && alvo?.tagName !== 'BUTTON') {
      this.nova(true);
    }
  }
}
