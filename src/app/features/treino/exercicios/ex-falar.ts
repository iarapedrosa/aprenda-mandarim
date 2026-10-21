import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { ResultadoFala, compararFala } from '../../../core/voz/comparar-fala';
import { ReconhecimentoService } from '../../../core/voz/reconhecimento.service';
import { VozService } from '../../../core/voz/voz.service';
import { BotaoAudio } from '../../../shared/botao-audio/botao-audio';
import { PinyinColorido } from '../../../shared/pinyin-colorido/pinyin-colorido';
import { ItemFalar, ResultadoItem } from '../sessao.model';
import { IdiomaService } from '../../../core/i18n/idioma.service';

/** Pontuação mínima para considerar a repetição boa. */
const MINIMO = 70;

/** Shadowing: ouvir a frase, repetir e comparar com o reconhecimento de voz. */
@Component({
  selector: 'app-ex-falar',
  imports: [BotaoAudio, PinyinColorido],
  template: `
    <p class="enunciado">{{ i.t('Ouça e repita em voz alta', 'Listen and repeat out loud') }}</p>
    <div class="pergunta">
      <p class="hanzi-frase" lang="zh-CN">{{ item().frase.hanzi }}</p>
      <p><app-pinyin [texto]="item().frase.pinyin" /></p>
      <p class="suave">{{ i.tr(item().frase, 'traducao') }}</p>
      <div class="linha centro">
        <app-botao-audio [texto]="item().frase.hanzi" [rotulo]="item().frase.pinyin" [legenda]="i.t('Ouvir', 'Listen')" />
        <app-botao-audio [texto]="item().frase.hanzi" [rotulo]="item().frase.pinyin" [legenda]="i.t('Devagar', 'Slow')" velocidade="lenta" />
      </div>
    </div>

    @if (reconhecimento.suportado) {
      <div class="gravar">
        <button
          type="button"
          class="botao-microfone"
          [class.ouvindo]="reconhecimento.ouvindo()"
          (click)="gravar()"
          [attr.aria-label]="reconhecimento.ouvindo() ? i.t('Parar gravação', 'Stop recording') : i.t('Gravar minha voz', 'Record my voice')"
        >
          🎙️
        </button>
        <p class="suave pequeno">
          {{ reconhecimento.ouvindo() ? i.t('Ouvindo… fale agora', 'Listening… speak now') : resultado() ? i.t('Toque para tentar de novo', 'Tap to try again') : i.t('Toque e repita a frase', 'Tap and repeat the sentence') }}
        </p>
      </div>

      @if (erro()) {
        <p class="aviso" role="alert">{{ erro() }}</p>
      }

      @if (resultado(); as r) {
        <div [class]="r.pontuacao >= minimo ? 'sucesso retorno' : 'aviso retorno'" role="status">
          <strong>{{ r.pontuacao }}% {{ i.t('de correspondência', 'match') }} — {{ mensagem(r.pontuacao) }}</strong>
          <span class="comparacao" lang="zh-CN">
            @for (p of r.pedacos; track $index) {
              <span [class]="'c ' + p.estado" [title]="titulo(p.estado, p.ouvido)">{{ p.caractere }}</span>
            }
          </span>
          <span class="pequeno ouvido">{{ i.t('O navegador entendeu:', 'The browser heard:') }} <span lang="zh-CN">{{ transcricao() || i.t('(nada)', '(nothing)') }}</span></span>
          <span class="legenda pequeno">
            <span class="c certo">{{ i.t('certo', 'correct') }}</span> <span class="c homofono">{{ i.t('mesmo som', 'same sound') }}</span>
            <span class="c faltou">{{ i.t('faltou', 'missing') }}</span> <span class="c sobrou">{{ i.t('sobrou', 'extra') }}</span>
          </span>
        </div>
      }
    } @else {
      <div class="info">
        <p>
          <strong>{{ i.t('Seu navegador não tem reconhecimento de voz', 'Your browser has no speech recognition') }}</strong>
          {{ i.t('(funciona no Chrome, no Edge e no Safari do iPhone). Sem problema: repita a frase em voz alta algumas vezes, imitando a melodia, e avalie você mesmo.', '(it works in Chrome, Edge and Safari on iPhone). No problem: repeat the sentence out loud a few times, copying the melody, and rate yourself.') }}
        </p>
      </div>
    }

    <p class="suave pequeno aviso-precisao">
      ⚠️ {{ i.t('Checagem aproximada: o reconhecimento transcreve palavras, mas não avalia os tons com precisão. Compare sua melodia com o áudio.', 'Approximate check: recognition transcribes words but does not assess tones precisely. Compare your melody with the audio.') }}
    </p>

    @if (!reconhecimento.suportado) {
      <div class="linha">
        <button type="button" class="botao botao-primario" (click)="concluir.emit({ acertou: true })">{{ i.t('Consegui repetir bem', 'I repeated it well') }}</button>
        <button type="button" class="botao" (click)="concluir.emit({ acertou: false })">{{ i.t('Preciso treinar mais', 'I need more practice') }}</button>
      </div>
    } @else if (resultado() || tentativas() >= 2) {
      <button type="button" class="botao botao-primario botao-bloco" (click)="continuar()">{{ i.t('Continuar', 'Continue') }}</button>
    } @else {
      <button type="button" class="botao botao-texto botao-bloco" (click)="concluir.emit({ acertou: false })">{{ i.t('Pular (não posso falar agora)', 'Skip (can’t speak right now)') }}</button>
    }
  `,
  styleUrl: './exercicios.css',
  styles: `
    .hanzi-frase {
      font-family: var(--fonte-hanzi);
      font-size: 1.8rem;
    }
    .gravar {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      margin-bottom: 12px;
    }
    .botao-microfone {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      border: 0;
      background: var(--cor-primaria);
      font-size: 2rem;
      cursor: pointer;
      box-shadow: var(--sombra);
    }
    .botao-microfone.ouvindo {
      animation: pulsar 1s infinite;
    }
    @keyframes pulsar {
      50% {
        transform: scale(1.08);
        box-shadow: 0 0 0 10px color-mix(in srgb, var(--cor-primaria) 25%, transparent);
      }
    }
    .comparacao {
      flex-basis: 100%;
      font-size: 1.6rem;
    }
    .c {
      padding: 0 2px;
      border-radius: 4px;
    }
    .comparacao .c,
    .legenda .c {
      color: var(--cor-texto);
    }
    .certo {
      background: var(--cor-sucesso-suave);
    }
    .homofono {
      background: var(--cor-aviso-suave);
    }
    .faltou {
      background: var(--cor-erro-suave);
      text-decoration: underline wavy var(--cor-erro);
    }
    .sobrou {
      text-decoration: line-through;
      opacity: 0.7;
    }
    .ouvido,
    .legenda {
      flex-basis: 100%;
      color: var(--cor-texto);
    }
    .aviso-precisao {
      margin: 8px 0 12px;
    }
  `,
})
export class ExFalar implements OnInit {
  protected readonly i = inject(IdiomaService);
  private readonly voz = inject(VozService);
  protected readonly reconhecimento = inject(ReconhecimentoService);
  readonly item = input.required<ItemFalar>();
  readonly concluir = output<ResultadoItem>();

  protected readonly minimo = MINIMO;
  protected readonly resultado = signal<ResultadoFala | null>(null);
  protected readonly transcricao = signal('');
  protected readonly erro = signal<string | null>(null);
  protected readonly tentativas = signal(0);
  private melhor = 0;

  ngOnInit(): void {
    void this.voz.falar(this.item().frase.hanzi);
  }

  protected async gravar(): Promise<void> {
    if (this.reconhecimento.ouvindo()) {
      this.reconhecimento.parar();
      return;
    }
    this.voz.parar();
    this.erro.set(null);
    try {
      const r = await this.reconhecimento.ouvir();
      // escolhe, entre as alternativas do reconhecedor, a que mais se parece com a frase
      const comparacoes = r.alternativas.map((a) => ({ texto: a, res: compararFala(this.item().frase.hanzi, a) }));
      const melhor = comparacoes.sort((x, y) => y.res.pontuacao - x.res.pontuacao)[0];
      this.transcricao.set(melhor.texto);
      this.resultado.set(melhor.res);
      this.melhor = Math.max(this.melhor, melhor.res.pontuacao);
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : this.i.t('Não foi possível gravar.', 'Could not record.'));
    } finally {
      this.tentativas.update((n) => n + 1);
    }
  }

  protected continuar(): void {
    this.concluir.emit({ acertou: this.melhor >= MINIMO });
  }

  protected mensagem(p: number): string {
    if (p >= 90) return this.i.t('excelente!', 'excellent!');
    if (p >= MINIMO) return this.i.t('muito bom!', 'very good!');
    if (p >= 40) return this.i.t('quase lá, tente de novo.', 'almost there, try again.');
    return this.i.t('ouça mais uma vez e repita devagar.', 'listen once more and repeat slowly.');
  }

  protected titulo(estado: string, ouvido?: string): string {
    const nomes: Record<string, [string, string]> = {
      certo: ['certo', 'correct'],
      faltou: ['faltou', 'missing'],
      sobrou: ['sobrou', 'extra'],
    };
    if (estado === 'homofono') return this.i.t(`mesmo som (entendido como ${ouvido})`, `same sound (heard as ${ouvido})`);
    const n = nomes[estado];
    return n ? this.i.t(n[0], n[1]) : estado;
  }
}
