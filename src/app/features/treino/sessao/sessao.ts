import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FrasesService } from '../../../core/dados/frases.service';
import { GramaticaService } from '../../../core/dados/gramatica.service';
import { VocabularioService } from '../../../core/dados/vocabulario.service';
import { tonsDoValor } from '../../../core/pinyin/pares-tons';
import { semTom } from '../../../core/pinyin/pinyin';
import { SilabasService } from '../../../core/pinyin/silabas.service';
import { ProgressoService } from '../../../core/progresso/progresso.service';
import { notaDoExercicio } from '../../../core/srs/sm2';
import { hoje } from '../../../core/util/datas';
import { ControleVoz } from '../../../shared/controle-voz/controle-voz';
import { exercicioDePalavra, gerarSessao, PlanoSessao, SilabaAquecimento } from '../gerador-sessao';
import { ItemSessao, ResultadoItem } from '../sessao.model';
import { ExApresentar } from '../exercicios/ex-apresentar';
import { ExDigitarPinyin } from '../exercicios/ex-digitar-pinyin';
import { ExEscolha } from '../exercicios/ex-escolha';
import { ExEscrever } from '../exercicios/ex-escrever';
import { ExFalar } from '../exercicios/ex-falar';
import { ExGramatica } from '../exercicios/ex-gramatica';
import { ExMontar } from '../exercicios/ex-montar';
import { ExTeclado } from '../exercicios/ex-teclado';
import { ExLicao } from '../exercicios/ex-licao';
import { ItensDeFraseService } from '../itens-de-frase.service';

const SILABAS_AQUECIMENTO = ['ma', 'ba', 'yi', 'shi', 'wu', 'tang', 'qi', 'tu', 'yan', 'wei', 'ying', 'yu', 'ji', 'xi'];

@Component({
  selector: 'app-sessao',
  imports: [RouterLink, ControleVoz, ExEscolha, ExLicao, ExApresentar, ExDigitarPinyin, ExEscrever, ExFalar, ExGramatica, ExMontar, ExTeclado],
  template: `
    <section class="pagina">
      @if (carregando()) {
        <p class="info">Preparando o treino de hoje…</p>
      } @else if (!terminou()) {
        <div class="barra-topo">
          <a routerLink="/" class="botao botao-texto botao-icone" aria-label="Sair do treino">✕</a>
          <div
            class="barra-progresso"
            role="progressbar"
            aria-label="Progresso do treino"
            [attr.aria-valuenow]="indice()"
            aria-valuemin="0"
            [attr.aria-valuemax]="fila().length"
          >
            <span [style.width.%]="(indice() / fila().length) * 100"></span>
          </div>
          <span class="contador suave pequeno">{{ indice() + 1 }}/{{ fila().length }}</span>
        </div>

        <!-- @for com track por id garante um componente novo a cada exercício -->
        @for (item of atual() ? [atual()!] : []; track item.id) {
          @if (item.reforco) {
            <p class="etiqueta reforco">Revendo o que você errou</p>
          }
          <article class="cartao exercicio">
            @switch (item.tipo) {
              @case ('escolha') {
                <app-ex-escolha [item]="item" (concluir)="registrar(item, $event)" />
              }
              @case ('licao') {
                <app-ex-licao [item]="item" (concluir)="registrar(item, $event)" />
              }
              @case ('apresentar') {
                <app-ex-apresentar [item]="item" (concluir)="registrar(item, $event)" />
              }
              @case ('digitar-pinyin') {
                <app-ex-digitar-pinyin [item]="item" (concluir)="registrar(item, $event)" />
              }
              @case ('escrever') {
                <app-ex-escrever [item]="item" (concluir)="registrar(item, $event)" />
              }
              @case ('gramatica') {
                <app-ex-gramatica [item]="item" (concluir)="registrar(item, $event)" />
              }
              @case ('teclado') {
                <app-ex-teclado [item]="item" (concluir)="registrar(item, $event)" />
              }
              @case ('montar') {
                <app-ex-montar [item]="item" (concluir)="registrar(item, $event)" />
              }
              @case ('falar') {
                <app-ex-falar [item]="item" (concluir)="registrar(item, $event)" />
              }
              @default {
                <p class="info">Exercício indisponível.</p>
                <button type="button" class="botao" (click)="registrar(item, { acertou: true, informativo: true })">Pular</button>
              }
            }
          </article>
        }
        <details class="ajustes">
          <summary>Ajustes de áudio</summary>
          <app-controle-voz />
        </details>
      } @else {
        <article class="cartao fim" aria-live="polite">
          <p class="festa" aria-hidden="true">🎉</p>
          <h1>Treino concluído!</h1>
          <p>
            🔥 Sequência: <strong>{{ progresso.sequencia() }} {{ progresso.sequencia() === 1 ? 'dia' : 'dias' }}</strong>
          </p>
          <ul class="resumo">
            <li><strong>{{ acertos() }}</strong> de {{ respondidas() }} acertos ({{ porcentagem() }}%)</li>
            <li><strong>{{ progresso.atividadeHoje().novas }}</strong> palavras novas hoje</li>
            <li><strong>{{ progresso.atividadeHoje().revisoes }}</strong> revisões hoje</li>
            <li><strong>{{ minutos() }}</strong> min de estudo</li>
          </ul>
          @for (m of mensagensLicoes(); track m) {
            <p class="info">{{ m }}</p>
          }
          <div class="linha centro">
            <a routerLink="/" class="botao botao-primario">Voltar ao início</a>
            @if (plano()?.etapa !== 'pinyin') {
              <button type="button" class="botao" (click)="maisPalavras()">+5 palavras novas</button>
            }
            <a routerLink="/praticar" class="botao">Praticar mais</a>
          </div>
        </article>
      }
    </section>
  `,
  styles: `
    .barra-topo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }
    .barra-topo .barra-progresso {
      flex: 1;
    }
    .contador {
      min-width: 3.5em;
      text-align: right;
    }
    .reforco {
      margin-bottom: 8px;
      background: var(--cor-aviso-suave);
      color: var(--cor-aviso);
    }
    .exercicio {
      min-height: 50vh;
    }
    .ajustes {
      margin-top: 16px;
    }
    .ajustes summary {
      cursor: pointer;
      color: var(--cor-texto-suave);
      margin-bottom: 8px;
    }
    .fim {
      text-align: center;
    }
    .festa {
      font-size: 3rem;
      margin: 0;
    }
    .resumo {
      list-style: none;
      padding: 0;
      margin: 0 0 16px;
      display: grid;
      gap: 6px;
    }
    .centro {
      justify-content: center;
    }
  `,
})
export class SessaoPagina {
  protected readonly progresso = inject(ProgressoService);
  private readonly vocabulario = inject(VocabularioService);
  private readonly frases = inject(FrasesService);
  private readonly silabas = inject(SilabasService);
  private readonly itensDeFrase = inject(ItensDeFraseService);
  private readonly gramatica = inject(GramaticaService);

  protected readonly carregando = signal(true);
  protected readonly plano = signal<PlanoSessao | null>(null);
  protected readonly fila = signal<ItemSessao[]>([]);
  protected readonly indice = signal(0);
  protected readonly atual = computed(() => this.fila()[this.indice()] ?? null);
  protected readonly terminou = computed(() => !this.carregando() && this.indice() >= this.fila().length);
  protected readonly acertos = signal(0);
  protected readonly respondidas = signal(0);
  protected readonly porcentagem = computed(() =>
    this.respondidas() ? Math.round((this.acertos() / this.respondidas()) * 100) : 100,
  );
  protected readonly mensagensLicoes = signal<string[]>([]);
  protected readonly minutos = signal(0);

  private readonly placarLicoes = new Map<string, { acertos: number; total: number }>();
  private inicio = Date.now();
  private tempoRegistrado = false;

  constructor() {
    void this.preparar();
    inject(DestroyRef).onDestroy(() => this.registrarTempo());
  }

  private async preparar(extraNovas = 0): Promise<void> {
    this.carregando.set(true);
    await Promise.all([this.vocabulario.carregar(), this.frases.carregar(), this.silabas.carregar(), this.itensDeFrase.carregar(), this.gramatica.carregar()]);
    const aquecimento: SilabaAquecimento[] = SILABAS_AQUECIMENTO.flatMap((s) =>
      this.silabas
        .tons(s)
        .map((t) => this.silabas.obter(s, t))
        .filter((x) => x && !x.raro)
        .map((x) => ({ hanzi: x!.caractere, pinyin: x!.pinyin, letras: semTom(x!.pinyin) })),
    );
    const plano = gerarSessao(
      {
        hoje: hoje(),
        estado: this.progresso.estado(),
        palavras: this.vocabulario.palavras(),
        frases: this.frases.frases(),
        infoCaractere: (c) => this.vocabulario.infoCaractere(c),
        silabasAquecimento: aquecimento,
        itensDeFrase: (conhecidas) => this.itensDeFrase.gerar(conhecidas),
        gramatica: this.gramatica.licoes(),
      },
      { extraNovas },
    );
    this.plano.set(plano);
    this.fila.set(extraNovas ? plano.itens.filter((i) => i.tipo !== 'escolha' || i.cartao) : plano.itens);
    this.indice.set(0);
    this.carregando.set(false);
  }

  protected registrar(item: ItemSessao, r: ResultadoItem): void {
    if (!r.informativo) {
      this.respondidas.update((n) => n + 1);
      if (r.acertou) this.acertos.update((n) => n + 1);
      const modulo = 'modulo' in item ? item.modulo : item.tipo === 'escrever' || item.tipo === 'teclado' ? 'escrita' : item.tipo === 'falar' ? 'fala' : item.tipo === 'montar' ? 'gramatica' : 'caracteres';
      const tons = item.tipo === 'escolha' ? item.tons : undefined;
      this.progresso.registrarResposta(modulo, r.acertou, tons);
      if (item.tipo === 'escolha' && item.modulo === 'tons' && item.tons && !r.acertou && r.escolha) {
        this.progresso.registrarConfusaoTons(tonsDoValor(item.correta), tonsDoValor(r.escolha));
      }

      if (item.cartao && !item.reforco) {
        this.progresso.revisar(item.cartao.tipo, item.cartao.ref, r.nota ?? notaDoExercicio(r.acertou));
        if (!r.acertou) this.agendarReforco(item);
      }
      if (item.licao) {
        const p = this.placarLicoes.get(item.licao) ?? { acertos: 0, total: 0 };
        this.placarLicoes.set(item.licao, { acertos: p.acertos + (r.acertou ? 1 : 0), total: p.total + 1 });
      }
    }

    const proximo = this.fila()[this.indice() + 1];
    if (item.licao && proximo?.licao !== item.licao) this.encerrarLicao(item.licao);
    this.indice.update((i) => i + 1);
    if (this.indice() >= this.fila().length) this.finalizar();
    window.scrollTo({ top: 0 });
  }

  /** Coloca o item de novo mais adiante na fila (sem mexer de novo no agendamento SM-2). */
  private agendarReforco(item: ItemSessao): void {
    let copia: ItemSessao = { ...item, id: `${item.id}-r`, reforco: true };
    if (item.cartao?.tipo === 'palavra') {
      const palavra = this.vocabulario.porId().get(item.cartao.ref);
      if (palavra) copia = { ...exercicioDePalavra(palavra, undefined, this.vocabulario.palavras()), reforco: true };
    }
    if (copia.tipo === 'escrever') copia = { ...copia, nivel: 'contorno' };
    this.fila.update((f) => {
      const posicao = Math.min(f.length, this.indice() + 4);
      return [...f.slice(0, posicao), copia, ...f.slice(posicao)];
    });
  }

  private encerrarLicao(id: string): void {
    const p = this.placarLicoes.get(id);
    if (!p) return;
    if (p.total === 0 || p.acertos / p.total >= 0.5) {
      if (id.startsWith('gramatica:')) this.progresso.concluirLicaoGramatica(id.slice('gramatica:'.length));
      else this.progresso.concluirLicaoPinyin(id);
    } else {
      this.mensagensLicoes.update((m) => [
        ...m,
        id.startsWith('gramatica:')
          ? 'A lição de gramática fica para outro dia (menos de 50% de acertos). Releia em Praticar › Gramática!'
          : 'Uma lição de pinyin ficou para amanhã (menos de 50% de acertos). Sem problema — repetir faz parte!',
      ]);
    }
  }

  private finalizar(): void {
    this.registrarTempo();
    this.progresso.atualizarDia(() => ({ treinoConcluido: true }));
  }

  private registrarTempo(): void {
    if (this.tempoRegistrado || this.carregando()) return;
    this.tempoRegistrado = true;
    const segundos = Math.min(3600, Math.round((Date.now() - this.inicio) / 1000));
    this.minutos.set(Math.max(1, Math.round(segundos / 60)));
    if (this.respondidas() > 0) this.progresso.atualizarDia((a) => ({ segundos: a.segundos + segundos }));
  }

  protected maisPalavras(): void {
    this.tempoRegistrado = false;
    this.inicio = Date.now();
    this.acertos.set(0);
    this.respondidas.set(0);
    this.mensagensLicoes.set([]);
    void this.preparar(5);
  }
}
