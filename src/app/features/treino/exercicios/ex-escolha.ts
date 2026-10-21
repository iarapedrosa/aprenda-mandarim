import { Component, HostListener, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { VozService } from '../../../core/voz/voz.service';
import { BotaoAudio } from '../../../shared/botao-audio/botao-audio';
import { DiagramaTom } from '../../../shared/diagrama-tom/diagrama-tom';
import { Tom } from '../../../core/pinyin/pinyin';
import { PinyinColorido } from '../../../shared/pinyin-colorido/pinyin-colorido';
import { ItemEscolha, ResultadoItem } from '../sessao.model';

/** Exercício de múltipla escolha (significado, áudio, tons…). */
@Component({
  selector: 'app-ex-escolha',
  imports: [BotaoAudio, PinyinColorido, DiagramaTom],
  template: `
    <p class="enunciado">{{ item().enunciado }}</p>

    <div class="pergunta">
      @if (item().pergunta.hanzi) {
        <p class="hanzi-pergunta" lang="zh-CN">{{ item().pergunta.hanzi }}</p>
      }
      @if (item().pergunta.pinyin) {
        <p class="pinyin-pergunta"><app-pinyin [texto]="item().pergunta.pinyin!" /></p>
      }
      @if (item().pergunta.texto) {
        <p class="texto-pergunta">{{ item().pergunta.texto }}</p>
      }
      @if (item().pergunta.audio; as audio) {
        <div class="linha centro">
          <app-botao-audio [texto]="audio" legenda="Ouvir" rotulo="a pergunta" />
          <app-botao-audio [texto]="audio" legenda="Devagar" rotulo="a pergunta" velocidade="lenta" />
        </div>
      }
    </div>

    <div class="opcoes" role="group" aria-label="Alternativas">
      @for (o of item().opcoes; track o.valor; let i = $index) {
        <button
          type="button"
          class="opcao"
          [class.correta]="escolha() !== null && o.valor === item().correta"
          [class.errada]="escolha() === o.valor && o.valor !== item().correta"
          [disabled]="escolha() !== null"
          (click)="responder(o.valor)"
        >
          <span class="atalho" aria-hidden="true">{{ i + 1 }}</span>
          @if (o.hanzi) {
            <span class="hanzi-opcao" lang="zh-CN">{{ o.rotulo }}</span>
          } @else if (o.pinyin) {
            <app-pinyin [texto]="o.rotulo" />
          } @else {
            {{ o.rotulo }}
          }
        </button>
      }
    </div>

    @if (escolha() !== null) {
      <div [class]="acertou() ? 'sucesso retorno' : 'erro retorno'" role="status">
        <strong>{{ acertou() ? 'Certo!' : 'Ops!' }}</strong>
        @if (item().resposta; as r) {
          <span class="resposta">
            <span lang="zh-CN" class="hanzi-resposta">{{ r.hanzi }}</span>
            <app-pinyin [texto]="r.pinyin" />
            @if (r.traducao) {
              <span>— {{ r.traducao }}</span>
            }
            <app-botao-audio [texto]="r.hanzi" [rotulo]="r.pinyin" [compacto]="true" />
          </span>
        }
        @if (item().explicacao) {
          <span class="explicacao">{{ item().explicacao }}</span>
        }
        @if (tonsCorretos().length) {
          <span class="gesto">
            @for (t of tonsCorretos(); track $index) {
              <app-diagrama-tom [tom]="t" [class]="'tom-' + t" class="mini-gesto" />
            }
            <span class="pequeno">✋ Ouça de novo e desenhe a curva no ar com a mão enquanto repete.</span>
          </span>
        }
      </div>
      <button type="button" class="botao botao-primario botao-bloco" (click)="continuar()" #botaoContinuar>
        Continuar
      </button>
    }
  `,
  styleUrl: './exercicios.css',
})
export class ExEscolha implements OnInit {
  private readonly voz = inject(VozService);
  readonly item = input.required<ItemEscolha>();
  readonly concluir = output<ResultadoItem>();

  protected readonly escolha = signal<string | null>(null);
  /** Curvas dos tons certos, para o gesto (Baills et al., 2019). */
  protected readonly tonsCorretos = computed<Tom[]>(() =>
    this.item().modulo === 'tons' ? ((this.item().tons ?? []).filter((t) => t >= 1 && t <= 5) as Tom[]) : [],
  );
  protected readonly acertou = signal(false);

  ngOnInit(): void {
    const audio = this.item().pergunta.audio;
    // Só toca sozinho quando o áudio é a própria pergunta (sem caracteres na tela).
    if (audio && !this.item().pergunta.hanzi) void this.voz.falar(audio);
  }

  protected responder(valor: string): void {
    if (this.escolha() !== null) return;
    this.escolha.set(valor);
    this.acertou.set(valor === this.item().correta);
    const r = this.item().resposta;
    if (r && !this.item().pergunta.audio) void this.voz.falar(r.hanzi);
  }

  protected continuar(): void {
    this.concluir.emit({ acertou: this.acertou(), escolha: this.escolha() ?? undefined });
  }

  @HostListener('document:keydown', ['$event'])
  protected teclado(e: KeyboardEvent): void {
    if ((e.target as HTMLElement)?.closest('input, textarea, select')) return;
    if (this.escolha() === null && /^[1-9]$/.test(e.key)) {
      const opcao = this.item().opcoes[Number(e.key) - 1];
      if (opcao) this.responder(opcao.valor);
    } else if (e.key === 'Enter' && this.escolha() !== null && (e.target as HTMLElement)?.tagName !== 'BUTTON') {
      this.continuar();
    } else if (e.key.toLowerCase() === 'r' && this.item().pergunta.audio) {
      void this.voz.falar(this.item().pergunta.audio!);
    }
  }
}
