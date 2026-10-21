import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FrasesService, palavraDoDia } from '../../core/dados/frases.service';
import { GramaticaService } from '../../core/dados/gramatica.service';
import { VocabularioService } from '../../core/dados/vocabulario.service';
import { ProgressoService } from '../../core/progresso/progresso.service';
import { APRENDER, PRATICAR, SOBRE } from '../../core/navegacao';
import { PinyinColorido } from '../../shared/pinyin-colorido/pinyin-colorido';
import { LICOES_PINYIN } from './curriculo';
import { FraseDoDiaCartao } from './do-dia/frase-do-dia';
import { PalavraDoDiaCartao } from './do-dia/palavra-do-dia';
import { ComoUsar } from './do-dia/como-usar';
import { MeuPlano } from './do-dia/meu-plano';
import { PALAVRAS_PARA_LIBERAR_FRASES, etapaAtual, gerarSessao } from './gerador-sessao';
import { IdiomaService } from '../../core/i18n/idioma.service';

@Component({
  selector: 'app-treino',
  imports: [RouterLink, FraseDoDiaCartao, PalavraDoDiaCartao, PinyinColorido, ComoUsar, MeuPlano],
  template: `
    <section class="pagina">
      <header class="saudacao">
        <h1>{{ saudacao() }} <span lang="zh-CN" class="ni-hao">你好！</span></h1>
      </header>

      <div class="painel">
      <div class="coluna principal">
      <section class="cartao chamada" aria-labelledby="titulo-treino">
        <div class="chips" role="list" [attr.aria-label]="i.t('Seu dia', 'Your day')">
          <span class="chip" role="listitem" [title]="i.t('Sequência de dias', 'Day streak')">🔥 <strong>{{ progresso.sequencia() }}</strong> {{ progresso.sequencia() === 1 ? i.t('dia', 'day') : i.t('dias', 'days') }}</span>
          <span class="chip" role="listitem" [title]="i.t('Palavras novas hoje', 'New words today')">🆕 <strong>{{ progresso.atividadeHoje().novas }}/{{ progresso.metas().novasPorDia }}</strong> {{ i.t('novas', 'new') }}</span>
          <span class="chip" role="listitem" [title]="i.t('Revisões hoje', 'Reviews today')">🔁 <strong>{{ progresso.atividadeHoje().revisoes }}/{{ progresso.metas().revisoesPorDia }}</strong> {{ i.t('revisões', 'reviews') }}</span>
        </div>
        @if (progresso.atividadeHoje().treinoConcluido) {
          <h2 id="titulo-treino">✅ {{ i.t('Treino de hoje concluído!', 'Today’s training is done!') }}</h2>
          <p class="suave">{{ i.t('Ótimo trabalho. Se quiser, faça mais uma rodada ou pratique um módulo.', 'Great job. If you like, do another round or practice a module.') }}</p>
        } @else {
          <h2 id="titulo-treino">{{ i.t('Treino de hoje', 'Today’s training') }}</h2>
          @if (resumo(); as r) {
            <p class="suave resumo">
              ≈ {{ r.minutos }} min ·
              @if (r.licoes) { {{ r.licoes }} {{ r.licoes === 1 ? i.t('lição de pinyin', 'pinyin lesson') : i.t('lições de pinyin', 'pinyin lessons') }} · }
              @if (r.gramatica) { {{ i.t('1 lição de gramática', '1 grammar lesson') }} · }
              @if (r.revisoes) { {{ r.revisoes }} {{ i.t('revisões', 'reviews') }} · }
              @if (r.novas) { {{ r.novas }} {{ i.t('palavras novas', 'new words') }} · }
              @if (r.escrita) { {{ r.escrita }} {{ i.t('caracteres para escrever', 'characters to write') }} · }
              @if (r.frases) { {{ r.frases }} {{ i.t('exercícios com frases', 'sentence exercises') }} · }
              {{ i.t('aquecimento de tons', 'tone warm-up') }}
            </p>
          }
        }
        @if (aviso() && !progresso.atividadeHoje().treinoConcluido) {
          <p class="aviso pequeno" role="status">⏳ {{ aviso() }}</p>
        }
        <a routerLink="/treino" class="botao botao-primario botao-bloco grande">
          {{ progresso.atividadeHoje().treinoConcluido ? i.t('Treinar de novo', 'Train again') : i.t('Começar treino', 'Start training') }}
        </a>
      </section>

      @if (iniciante()) {
        <app-como-usar [destaque]="true" />
      }

      <app-meu-plano />

      <section class="cartao etapas" aria-labelledby="titulo-etapas">
        <h2 id="titulo-etapas" class="visualmente-oculto">{{ i.t('Sua jornada', 'Your journey') }}</h2>
        <ol class="jornada">
          <li [class.atual]="etapa() === 'pinyin'" [class.feita]="etapa() !== 'pinyin'">
            <strong>1. {{ i.t('Pinyin e tons', 'Pinyin and tones') }}</strong>
            <span class="suave pequeno">{{ licoesFeitas() }}/{{ totalLicoes }} {{ i.t('lições', 'lessons') }}</span>
          </li>
          <li [class.atual]="etapa() === 'palavras'" [class.feita]="etapa() === 'frases'">
            <strong>2. {{ i.t('Palavras e caracteres', 'Words and characters') }}</strong>
            <span class="suave pequeno">{{ progresso.palavrasEstudadas().length }} {{ i.t('palavras estudadas', 'words studied') }}</span>
          </li>
          <li [class.atual]="etapa() === 'frases'">
            <strong>3. {{ i.t('Frases', 'Sentences') }}</strong>
            <span class="suave pequeno">
              @if (etapa() === 'frases') { {{ i.t('liberado', 'unlocked') }} } @else { {{ i.t('a partir de', 'from') }} {{ palavrasParaFrases }} {{ i.t('palavras', 'words') }} }
            </span>
          </li>
        </ol>
        @if (etapa() === 'pinyin') {
          @if (!confirmarPulo()) {
            <button type="button" class="botao botao-texto pequeno" (click)="confirmarPulo.set(true)">{{ i.t('Já sei pinyin — pular para o vocabulário', 'I already know pinyin — skip to vocabulary') }}</button>
          } @else {
            <div class="aviso pulo" role="alert">
              {{ i.t('Pular as lições de pinyin e começar o vocabulário agora?', 'Skip the pinyin lessons and start vocabulary now?') }}
              <div class="linha">
                <button type="button" class="botao botao-primario" (click)="pularPinyin()">{{ i.t('Sim, pular', 'Yes, skip') }}</button>
                <button type="button" class="botao" (click)="confirmarPulo.set(false)">{{ i.t('Cancelar', 'Cancel') }}</button>
              </div>
            </div>
          }
        }
      </section>

      @if (!iniciante()) {
        <app-como-usar />
      }
      </div>

      <div class="coluna lateral">
        @if (fraseDoDia(); as f) {
          <app-frase-do-dia [frase]="f" />
        }
        @if (palavra(); as p) {
          <app-palavra-do-dia [palavra]="p" />
        }

      @if (anteriores().length) {
        <details class="cartao anteriores">
          <summary>{{ i.t('Frases dos dias anteriores', 'Phrases from previous days') }}</summary>
          <ul>
            @for (a of anteriores(); track a.data) {
              <li>
                <span class="data suave pequeno">{{ formatarData(a.data) }}</span>
                <span lang="zh-CN" class="hanzi-anterior">{{ a.frase.hanzi }}</span>
                <app-pinyin [texto]="a.frase.pinyin" />
                <span class="suave">— {{ i.tr(a.frase, 'traducao') }}</span>
              </li>
            }
          </ul>
        </details>
      }

      </div>
      </div>

      <nav class="atalhos" [attr.aria-label]="i.t('Ir para', 'Go to')">
        @for (m of atalhos; track m.rota) {
          <a [routerLink]="m.rota" class="atalho">
            <span lang="zh-CN" aria-hidden="true">{{ m.icone }}</span>{{ i.tr(m, 'nome') }}
          </a>
        }
      </nav>
    </section>
  `,
  styles: `
    .saudacao h1 {
      margin-bottom: 4px;
    }
    .ni-hao {
      color: var(--cor-primaria);
      font-size: 0.8em;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 10px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 999px;
      background: var(--cor-superficie-2);
      font-size: 0.85rem;
    }
    .resumo {
      margin-bottom: 4px;
    }
    .indicador {
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      text-align: center;
    }
    .indicador + .indicador {
      margin-top: 0;
    }
    .valor {
      font-size: 1.35rem;
      font-weight: 700;
    }
    .barra-progresso {
      height: 6px;
    }
    .chamada h2 {
      margin-bottom: 4px;
    }
    .grande {
      min-height: 56px;
      font-size: 1.15rem;
      margin-top: 8px;
    }
    .jornada {
      list-style: none;
      padding: 0;
      margin: 0 0 8px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .jornada li {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 8px;
      border-radius: var(--raio-p);
      border: 1px dashed var(--cor-borda);
      font-size: 0.9rem;
    }
    .jornada li.atual {
      border: 2px solid var(--cor-primaria);
      background: var(--cor-primaria-suave);
    }
    .jornada li.feita strong::before {
      content: '✓ ';
      color: var(--cor-sucesso);
    }
    .pulo .linha {
      margin-top: 8px;
    }
    .painel {
      display: grid;
      gap: 16px;
      margin-top: 12px;
    }
    .coluna {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 0;
    }
    .coluna > * {
      display: block;
      margin: 0;
    }
    @media (min-width: 1000px) {
      .painel {
        grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
        align-items: start;
        gap: 24px;
      }
      .lateral {
        position: sticky;
        top: 80px;
      }
    }
    .anteriores summary {
      cursor: pointer;
      font-weight: 700;
    }
    .anteriores ul {
      list-style: none;
      padding: 0;
      margin: 8px 0 0;
      display: grid;
      gap: 8px;
    }
    .anteriores li {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 8px;
      align-items: baseline;
    }
    .data {
      min-width: 4.5em;
    }
    .hanzi-anterior {
      font-size: 1.15rem;
    }
    .atalhos {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 8px;
      margin-top: 24px;
    }
    .atalho {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border-radius: var(--raio-p);
      border: 1px solid var(--cor-borda);
      background: var(--cor-superficie);
      color: var(--cor-texto);
      text-decoration: none;
      font-weight: 600;
    }
    .atalho span {
      font-family: var(--fonte-hanzi);
      font-size: 1.3rem;
      color: var(--cor-primaria);
    }
    @media (max-width: 420px) {
      .jornada {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class TreinoPagina {
  protected readonly i = inject(IdiomaService);
  protected readonly progresso = inject(ProgressoService);
  private readonly vocabulario = inject(VocabularioService);
  private readonly frases = inject(FrasesService);
  private readonly gramatica = inject(GramaticaService);

  protected readonly totalLicoes = LICOES_PINYIN.length;
  protected readonly palavrasParaFrases = PALAVRAS_PARA_LIBERAR_FRASES;
  protected readonly confirmarPulo = signal(false);

  /** quem ainda praticou pouco vê a explicação do site aberta, no topo */
  protected readonly iniciante = computed(
    () => Object.values(this.progresso.estado().atividade).reduce((t, a) => t + a.exercicios, 0) < 20,
  );
  protected readonly etapa = computed(() => etapaAtual(this.progresso.estado(), this.progresso.hoje()));
  protected readonly licoesFeitas = computed(() => this.progresso.licoesConcluidas().size);
  protected readonly fraseDoDia = computed(() =>
    this.frases.carregado() ? this.frases.fraseDoDia(this.progresso.hoje()) : null,
  );
  protected readonly anteriores = computed(() =>
    this.frases.carregado() ? this.frases.anteriores(this.progresso.hoje(), 7) : [],
  );
  protected readonly palavra = computed(() => palavraDoDia(this.vocabulario.palavras(), this.progresso.hoje()));

  /** Prévia do treino (mesmo cálculo da sessão, sem as partes aleatórias importarem). */
  private readonly plano = computed(() => {
    if (!this.vocabulario.carregado()) return null;
    return gerarSessao({
      hoje: this.progresso.hoje(),
      estado: this.progresso.estado(),
      palavras: this.vocabulario.palavras(),
      frases: this.frases.frases(),
      gramatica: this.gramatica.licoes(),
      infoCaractere: (c) => ({ hanzi: c, pinyin: '', traducao: '' }),
      silabasAquecimento: [{ hanzi: '妈', pinyin: 'mā', letras: 'ma' }],
    });
  });
  protected readonly resumo = computed(() => this.plano()?.resumo ?? null);
  protected readonly aviso = computed(() => {
    const p = this.plano();
    return p?.aviso ? this.i.t(p.aviso, p.avisoEn ?? p.aviso) : null;
  });

  protected readonly atalhos = [...APRENDER, ...PRATICAR, ...SOBRE].filter((d) => d.rota !== '/caracteres/radicais');

  constructor() {
    void this.vocabulario.carregar();
    void this.frases.carregar();
    void this.gramatica.carregar();
  }

  protected saudacao(): string {
    const h = new Date().getHours();
    return h < 12 ? this.i.t('Bom dia!', 'Good morning!') : h < 18 ? this.i.t('Boa tarde!', 'Good afternoon!') : this.i.t('Boa noite!', 'Good evening!');
  }

  protected pularPinyin(): void {
    for (const l of LICOES_PINYIN) this.progresso.concluirLicaoPinyin(l.id);
    this.confirmarPulo.set(false);
  }

  protected formatarData(data: string): string {
    const [, m, d] = data.split('-');
    return this.i.ingles() ? `${m}/${d}` : `${d}/${m}`;
  }
}
