import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FrasesService, palavraDoDia } from '../../core/dados/frases.service';
import { GramaticaService } from '../../core/dados/gramatica.service';
import { VocabularioService } from '../../core/dados/vocabulario.service';
import { ProgressoService } from '../../core/progresso/progresso.service';
import { PinyinColorido } from '../../shared/pinyin-colorido/pinyin-colorido';
import { LICOES_PINYIN } from './curriculo';
import { FraseDoDiaCartao } from './do-dia/frase-do-dia';
import { PalavraDoDiaCartao } from './do-dia/palavra-do-dia';
import { PALAVRAS_PARA_LIBERAR_FRASES, etapaAtual, gerarSessao } from './gerador-sessao';

@Component({
  selector: 'app-treino',
  imports: [RouterLink, FraseDoDiaCartao, PalavraDoDiaCartao, PinyinColorido],
  template: `
    <section class="pagina">
      <header class="saudacao">
        <h1>{{ saudacao() }} <span lang="zh-CN" class="ni-hao">你好！</span></h1>
        <p class="subtitulo">Seu treino de hoje leva uns 15–20 minutos. Um pouquinho por dia faz toda a diferença.</p>
      </header>

      <div class="painel">
        <div class="cartao indicador">
          <span class="valor">🔥 {{ progresso.sequencia() }}</span>
          <span class="suave pequeno">{{ progresso.sequencia() === 1 ? 'dia seguido' : 'dias seguidos' }}</span>
        </div>
        <div class="cartao indicador">
          <span class="valor">{{ progresso.atividadeHoje().novas }}/{{ progresso.metas().novasPorDia }}</span>
          <span class="suave pequeno">palavras novas</span>
          <div class="barra-progresso"><span [style.width.%]="pct(progresso.atividadeHoje().novas, progresso.metas().novasPorDia)"></span></div>
        </div>
        <div class="cartao indicador">
          <span class="valor">{{ progresso.atividadeHoje().revisoes }}/{{ progresso.metas().revisoesPorDia }}</span>
          <span class="suave pequeno">revisões</span>
          <div class="barra-progresso"><span [style.width.%]="pct(progresso.atividadeHoje().revisoes, progresso.metas().revisoesPorDia)"></span></div>
        </div>
      </div>

      <section class="cartao chamada">
        @if (progresso.atividadeHoje().treinoConcluido) {
          <h2>✅ Treino de hoje concluído!</h2>
          <p>Ótimo trabalho. Se quiser, faça mais uma rodada ou pratique um módulo.</p>
        } @else {
          <h2>Treino de hoje</h2>
          @if (resumo(); as r) {
            <p class="suave">
              ≈ {{ r.minutos }} min ·
              @if (r.licoes) { {{ r.licoes }} {{ r.licoes === 1 ? 'lição' : 'lições' }} de pinyin · }
              @if (r.gramatica) { 1 lição de gramática · }
              @if (r.revisoes) { {{ r.revisoes }} revisões · }
              @if (r.novas) { {{ r.novas }} palavras novas · }
              @if (r.escrita) { {{ r.escrita }} caracteres para escrever · }
              @if (r.frases) { {{ r.frases }} exercícios com frases · }
              aquecimento de tons
            </p>
          }
        }
        @if (aviso() && !progresso.atividadeHoje().treinoConcluido) {
          <p class="aviso pequeno" role="status">⏳ {{ aviso() }}</p>
        }
        <a routerLink="/treino" class="botao botao-primario botao-bloco grande">
          {{ progresso.atividadeHoje().treinoConcluido ? 'Treinar de novo' : 'Começar treino' }}
        </a>
      </section>

      <section class="cartao etapas" aria-labelledby="titulo-etapas">
        <h2 id="titulo-etapas" class="visualmente-oculto">Sua jornada</h2>
        <ol class="jornada">
          <li [class.atual]="etapa() === 'pinyin'" [class.feita]="etapa() !== 'pinyin'">
            <strong>1. Pinyin e tons</strong>
            <span class="suave pequeno">{{ licoesFeitas() }}/{{ totalLicoes }} lições</span>
          </li>
          <li [class.atual]="etapa() === 'palavras'" [class.feita]="etapa() === 'frases'">
            <strong>2. Palavras e caracteres</strong>
            <span class="suave pequeno">{{ progresso.palavrasEstudadas().length }} palavras estudadas</span>
          </li>
          <li [class.atual]="etapa() === 'frases'">
            <strong>3. Frases</strong>
            <span class="suave pequeno">
              @if (etapa() === 'frases') { liberado } @else { a partir de {{ palavrasParaFrases }} palavras }
            </span>
          </li>
        </ol>
        @if (etapa() === 'pinyin') {
          @if (!confirmarPulo()) {
            <button type="button" class="botao botao-texto pequeno" (click)="confirmarPulo.set(true)">Já sei pinyin — pular para o vocabulário</button>
          } @else {
            <div class="aviso pulo" role="alert">
              Pular as lições de pinyin e começar o vocabulário agora?
              <div class="linha">
                <button type="button" class="botao botao-primario" (click)="pularPinyin()">Sim, pular</button>
                <button type="button" class="botao" (click)="confirmarPulo.set(false)">Cancelar</button>
              </div>
            </div>
          }
        }
      </section>

      <div class="do-dia">
        @if (fraseDoDia(); as f) {
          <app-frase-do-dia [frase]="f" />
        }
        @if (palavra(); as p) {
          <app-palavra-do-dia [palavra]="p" />
        }
      </div>

      @if (anteriores().length) {
        <details class="cartao anteriores">
          <summary>Frases dos dias anteriores</summary>
          <ul>
            @for (a of anteriores(); track a.data) {
              <li>
                <span class="data suave pequeno">{{ formatarData(a.data) }}</span>
                <span lang="zh-CN" class="hanzi-anterior">{{ a.frase.hanzi }}</span>
                <app-pinyin [texto]="a.frase.pinyin" />
                <span class="suave">— {{ a.frase.traducao }}</span>
              </li>
            }
          </ul>
        </details>
      }

      <nav class="atalhos" aria-label="Módulos">
        @for (m of atalhos; track m.rota) {
          <a [routerLink]="m.rota" class="atalho">
            <span lang="zh-CN" aria-hidden="true">{{ m.icone }}</span>{{ m.nome }}
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
    .painel {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 12px;
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
    .do-dia {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
      margin-top: 12px;
    }
    .anteriores {
      margin-top: 12px;
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
      margin-top: 16px;
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
  protected readonly progresso = inject(ProgressoService);
  private readonly vocabulario = inject(VocabularioService);
  private readonly frases = inject(FrasesService);
  private readonly gramatica = inject(GramaticaService);

  protected readonly totalLicoes = LICOES_PINYIN.length;
  protected readonly palavrasParaFrases = PALAVRAS_PARA_LIBERAR_FRASES;
  protected readonly confirmarPulo = signal(false);

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
  protected readonly aviso = computed(() => this.plano()?.aviso ?? null);

  protected readonly atalhos = [
    { rota: '/pinyin', icone: '音', nome: 'Pinyin' },
    { rota: '/caracteres', icone: '字', nome: 'Caracteres' },
    { rota: '/escrita', icone: '写', nome: 'Escrita' },
    { rota: '/leitura', icone: '读', nome: 'Leitura' },
    { rota: '/escuta', icone: '听', nome: 'Escuta' },
    { rota: '/fala', icone: '说', nome: 'Fala' },
    { rota: '/gramatica', icone: '语', nome: 'Gramática' },
    { rota: '/numeros', icone: '数', nome: 'Números' },
    { rota: '/cartoes', icone: '卡', nome: 'Cartões' },
    { rota: '/recursos', icone: '书', nome: 'Recursos' },
  ];

  constructor() {
    void this.vocabulario.carregar();
    void this.frases.carregar();
    void this.gramatica.carregar();
  }

  protected saudacao(): string {
    const h = new Date().getHours();
    return h < 12 ? 'Bom dia!' : h < 18 ? 'Boa tarde!' : 'Boa noite!';
  }

  protected pct(valor: number, meta: number): number {
    return meta > 0 ? Math.min(100, (valor / meta) * 100) : 100;
  }

  protected pularPinyin(): void {
    for (const l of LICOES_PINYIN) this.progresso.concluirLicaoPinyin(l.id);
    this.confirmarPulo.set(false);
  }

  protected formatarData(data: string): string {
    const [, m, d] = data.split('-');
    return `${d}/${m}`;
  }
}
