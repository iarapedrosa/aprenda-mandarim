import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArmazenamentoService } from '../../../core/armazenamento/armazenamento.service';
import { LeituraService, Token, hanziDaLinha } from '../../../core/dados/leitura.service';
import { ProgressoService } from '../../../core/progresso/progresso.service';
import { embaralhar } from '../../../core/util/aleatorio';
import { VozService } from '../../../core/voz/voz.service';
import { BotaoAudio } from '../../../shared/botao-audio/botao-audio';
import { ControleVoz } from '../../../shared/controle-voz/controle-voz';
import { PinyinColorido } from '../../../shared/pinyin-colorido/pinyin-colorido';

interface PerguntaEmbaralhada {
  pergunta: string;
  opcoes: { texto: string; correta: boolean }[];
}

@Component({
  selector: 'app-texto',
  imports: [RouterLink, BotaoAudio, ControleVoz, PinyinColorido],
  templateUrl: './texto.html',
  styleUrl: './texto.css',
})
export class TextoPagina {
  private readonly leitura = inject(LeituraService);
  private readonly progresso = inject(ProgressoService);
  private readonly armazenamento = inject(ArmazenamentoService);
  protected readonly voz = inject(VozService);

  readonly id = input.required<string>();

  protected readonly texto = computed(() => this.leitura.porId(this.id()) ?? null);
  protected readonly carregado = this.leitura.carregado;
  protected readonly proximo = computed(() => {
    const lista = this.leitura.textos();
    const i = lista.findIndex((t) => t.id === this.id());
    return i >= 0 ? (lista[i + 1] ?? null) : null;
  });

  protected readonly mostrarPinyin = signal(this.armazenamento.ler('leitura-pinyin', true));
  protected readonly mostrarTraducao = signal(this.armazenamento.ler('leitura-traducao', false));
  protected readonly selecionado = signal<Token | null>(null);
  protected readonly linhaTocando = signal<number | null>(null);
  protected readonly narrando = signal(false);

  protected readonly perguntas = signal<PerguntaEmbaralhada[]>([]);
  protected readonly respostas = signal<(number | null)[]>([]);
  protected readonly verificado = signal(false);
  protected readonly acertos = computed(() =>
    this.perguntas().filter((p, i) => p.opcoes[this.respostas()[i] ?? -1]?.correta).length,
  );

  constructor() {
    void this.leitura.carregar();
    effect(() => this.armazenamento.salvar('leitura-pinyin', this.mostrarPinyin()));
    effect(() => this.armazenamento.salvar('leitura-traducao', this.mostrarTraducao()));
    effect(() => {
      const t = this.texto();
      this.pararNarracao();
      this.selecionado.set(null);
      this.verificado.set(false);
      const perguntas = (t?.perguntas ?? []).map((p) => ({
        pergunta: p.pergunta,
        opcoes: embaralhar(p.opcoes.map((texto, i) => ({ texto, correta: i === p.correta }))),
      }));
      this.perguntas.set(perguntas);
      this.respostas.set(perguntas.map(() => null));
    });
    inject(DestroyRef).onDestroy(() => this.pararNarracao());
  }

  protected tocarToken(t: Token): void {
    if (!t.pinyin) return;
    this.selecionado.set(t);
    void this.voz.falar(t.hanzi);
  }

  protected async tocarLinha(i: number): Promise<void> {
    const t = this.texto();
    if (!t) return;
    this.linhaTocando.set(i);
    await this.voz.falar(hanziDaLinha(t.linhas[i]));
    if (!this.narrando()) this.linhaTocando.set(null);
  }

  protected async narrar(): Promise<void> {
    const t = this.texto();
    if (!t) return;
    if (this.narrando()) {
      this.pararNarracao();
      return;
    }
    this.narrando.set(true);
    for (let i = 0; i < t.linhas.length && this.narrando(); i++) {
      this.linhaTocando.set(i);
      document.getElementById(`linha-${i}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      await this.voz.falar(hanziDaLinha(t.linhas[i]));
      await new Promise((r) => setTimeout(r, 350));
    }
    this.narrando.set(false);
    this.linhaTocando.set(null);
  }

  private pararNarracao(): void {
    this.narrando.set(false);
    this.linhaTocando.set(null);
    this.voz.parar();
  }

  protected responder(pergunta: number, opcao: number): void {
    if (this.verificado()) return;
    this.respostas.update((r) => r.map((v, i) => (i === pergunta ? opcao : v)));
  }

  protected verificar(): void {
    const t = this.texto();
    if (!t || this.verificado()) return;
    this.verificado.set(true);
    this.perguntas().forEach((p, i) =>
      this.progresso.registrarResposta('leitura', !!p.opcoes[this.respostas()[i] ?? -1]?.correta),
    );
    this.progresso.concluirTexto(t.id, this.acertos(), this.perguntas().length);
  }

  protected adicionarRevisao(t: Token): void {
    if (t.palavra) this.progresso.adicionarCartao('palavra', t.palavra);
  }

  protected naRevisao(t: Token): boolean {
    return !!t.palavra && !!this.progresso.estado().cartoes[`palavra:${t.palavra}`];
  }

  protected todasRespondidas(): boolean {
    return this.respostas().every((r) => r !== null);
  }
}
