import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DadosService } from '../../core/dados/dados.service';
import { FrasesService } from '../../core/dados/frases.service';
import { LeituraService, hanziDaLinha, pinyinDaLinha } from '../../core/dados/leitura.service';
import { Frase } from '../../core/dados/modelos';
import { VocabularioService } from '../../core/dados/vocabulario.service';
import { ProgressoService } from '../../core/progresso/progresso.service';
import { sortear } from '../../core/util/aleatorio';
import { ReconhecimentoService } from '../../core/voz/reconhecimento.service';
import { ControleVoz } from '../../shared/controle-voz/controle-voz';
import { ExFalar } from '../treino/exercicios/ex-falar';
import { ItemFalar, ResultadoItem } from '../treino/sessao.model';

interface TravaLinguas extends Frase {
  id: string;
  foco: string;
}

type Fonte = 'frases-do-dia' | 'exemplos' | 'dialogos';
let contador = 0;

@Component({
  selector: 'app-fala',
  imports: [FormsModule, ControleVoz, ExFalar],
  template: `
    <section class="pagina">
      <header>
        <h1>Fala</h1>
        <p class="subtitulo">
          <strong>Shadowing</strong>: ouça a frase, repita imitando a melodia e veja o que o reconhecimento de voz
          entendeu.
        </p>
      </header>

      @if (!reconhecimento.suportado) {
        <p class="aviso">
          Seu navegador não tem reconhecimento de voz (use Chrome, Edge ou Safari no iPhone para a correção automática).
          Você ainda pode praticar: ouça, repita em voz alta e avalie você mesmo.
        </p>
      }

      <div class="abas" role="tablist" aria-label="Tipo de prática">
        <button type="button" role="tab" [class.ativa]="aba() === 'shadowing'" [attr.aria-selected]="aba() === 'shadowing'" (click)="aba.set('shadowing')">Shadowing</button>
        <button type="button" role="tab" [class.ativa]="aba() === 'trava'" [attr.aria-selected]="aba() === 'trava'" (click)="aba.set('trava')">Trava-línguas</button>
      </div>

      <app-controle-voz class="voz" />

      @if (aba() === 'shadowing') {
        <label class="fonte">
          Praticar com
          <select class="campo" [ngModel]="fonte()" (ngModelChange)="fonte.set($event); proxima()">
            <option value="frases-do-dia">Frases do dia (expressões úteis)</option>
            <option value="exemplos">Exemplos do vocabulário</option>
            <option value="dialogos">Falas dos diálogos</option>
          </select>
        </label>
        <section class="cartao" aria-live="polite">
          <p class="placar suave">Frases praticadas: {{ total() }} · boas: {{ boas() }}</p>
          @for (item of atual() ? [atual()!] : []; track item.id) {
            <app-ex-falar [item]="item" (concluir)="registrar($event)" />
          } @empty {
            <p class="info">Carregando frases…</p>
          }
        </section>
      } @else {
        <p>
          Trava-línguas (<span lang="zh-CN">绕口令</span>, ràokǒulìng) são ótimos para treinar sons parecidos. Comece
          na velocidade lenta!
        </p>
        <div class="travas">
          @for (t of travas(); track t.id) {
            <button type="button" class="trava" [class.ativa]="travaAtual()?.frase?.hanzi === t.hanzi" (click)="escolherTrava(t)">
              <span lang="zh-CN" class="hanzi-trava">{{ t.hanzi }}</span>
              <span class="suave pequeno">Treina: {{ t.foco }}</span>
            </button>
          }
        </div>
        @if (travaAtual(); as item) {
          <section class="cartao pratica-trava" aria-live="polite">
            @for (i of [item]; track i.id) {
              <app-ex-falar [item]="i" (concluir)="registrarTrava($event)" />
            }
          </section>
        }
      }
    </section>
  `,
  styles: `
    .voz {
      display: block;
      margin-bottom: 12px;
    }
    .fonte {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
      max-width: 420px;
    }
    .travas {
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
      margin-bottom: 12px;
    }
    .trava {
      display: flex;
      flex-direction: column;
      gap: 4px;
      text-align: left;
      padding: 12px;
      border-radius: var(--raio-p);
      border: 2px solid var(--cor-borda);
      background: var(--cor-superficie);
      color: var(--cor-texto);
      font: inherit;
      cursor: pointer;
    }
    .trava.ativa {
      border-color: var(--cor-primaria);
      background: var(--cor-primaria-suave);
    }
    .hanzi-trava {
      font-size: 1.2rem;
    }
  `,
})
export class FalaPagina {
  protected readonly reconhecimento = inject(ReconhecimentoService);
  private readonly dados = inject(DadosService);
  private readonly frases = inject(FrasesService);
  private readonly vocabulario = inject(VocabularioService);
  private readonly leitura = inject(LeituraService);
  private readonly progresso = inject(ProgressoService);

  protected readonly aba = signal<'shadowing' | 'trava'>('shadowing');
  protected readonly fonte = signal<Fonte>('frases-do-dia');
  protected readonly atual = signal<ItemFalar | null>(null);
  protected readonly total = signal(0);
  protected readonly boas = signal(0);
  protected readonly travas = signal<TravaLinguas[]>([]);
  protected readonly travaAtual = signal<ItemFalar | null>(null);

  private readonly candidatas = computed<Frase[]>(() => {
    switch (this.fonte()) {
      case 'exemplos': {
        const estudadas = new Set(this.progresso.palavrasEstudadas().map((c) => c.ref));
        const palavras = this.vocabulario.palavras().filter((p) => p.exemplo);
        const conhecidas = palavras.filter((p) => estudadas.has(p.id));
        return (conhecidas.length >= 5 ? conhecidas : palavras.filter((p) => p.nivel === 1)).map((p) => p.exemplo!);
      }
      case 'dialogos':
        return this.leitura
          .textos()
          .filter((t) => t.tipo === 'dialogo')
          .flatMap((t) => t.linhas.map((l) => ({ hanzi: hanziDaLinha(l), pinyin: pinyinDaLinha(l), traducao: l.traducao })));
      default:
        return this.frases.frases();
    }
  });

  constructor() {
    void Promise.all([this.frases.carregar(), this.vocabulario.carregar(), this.leitura.carregar()]).then(() =>
      this.proxima(),
    );
    void this.dados.carregar<TravaLinguas[]>('fala/trava-linguas.json').then((t) => this.travas.set(t));
  }

  protected proxima(): void {
    const lista = this.candidatas();
    if (!lista.length) return;
    let frase = sortear(lista);
    if (lista.length > 1 && frase.hanzi === this.atual()?.frase.hanzi) frase = sortear(lista);
    this.atual.set({ id: `fala-${++contador}`, tipo: 'falar', frase });
  }

  protected registrar(r: ResultadoItem): void {
    this.total.update((n) => n + 1);
    if (r.acertou) this.boas.update((n) => n + 1);
    this.progresso.registrarResposta('fala', r.acertou);
    this.proxima();
  }

  protected escolherTrava(t: TravaLinguas): void {
    this.travaAtual.set({ id: `trava-${++contador}`, tipo: 'falar', frase: t });
  }

  protected registrarTrava(r: ResultadoItem): void {
    this.progresso.registrarResposta('fala', r.acertou);
    const atual = this.travaAtual();
    if (atual) this.travaAtual.set({ ...atual, id: `trava-${++contador}` });
  }
}
