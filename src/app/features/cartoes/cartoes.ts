import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArmazenamentoService } from '../../core/armazenamento/armazenamento.service';
import { FrasesService } from '../../core/dados/frases.service';
import { VocabularioService } from '../../core/dados/vocabulario.service';
import { ProgressoService } from '../../core/progresso/progresso.service';
import { Nota, idCartao, novoCartao, revisarSm2 } from '../../core/srs/sm2';
import { VozService } from '../../core/voz/voz.service';
import { BotaoAudio } from '../../shared/botao-audio/botao-audio';
import { PinyinColorido } from '../../shared/pinyin-colorido/pinyin-colorido';
import { NotaMnemonica } from '../../shared/nota-mnemonica/nota-mnemonica';
import { Baralho, ConteudoCartao, contar, deFrase, deVocabulario, exportarParaAnki } from './baralhos';
import { IdiomaService } from '../../core/i18n/idioma.service';

type Frente = 'hanzi' | 'portugues' | 'audio';

interface Botao {
  nota: Nota;
  rotulo: string;
  rotuloEn: string;
  tecla: string;
  classe: string;
}

const BOTOES: Botao[] = [
  { nota: 1, rotulo: 'Errei', rotuloEn: 'Again', tecla: '1', classe: 'errei' },
  { nota: 3, rotulo: 'Difícil', rotuloEn: 'Hard', tecla: '2', classe: 'dificil' },
  { nota: 4, rotulo: 'Bom', rotuloEn: 'Good', tecla: '3', classe: 'bom' },
  { nota: 5, rotulo: 'Fácil', rotuloEn: 'Easy', tecla: '4', classe: 'facil' },
];

@Component({
  selector: 'app-cartoes',
  imports: [RouterLink, BotaoAudio, PinyinColorido, NotaMnemonica],
  templateUrl: './cartoes.html',
  styleUrl: './cartoes.css',
})
export class CartoesPagina {
  protected readonly i = inject(IdiomaService);
  private readonly vocabulario = inject(VocabularioService);
  private readonly frases = inject(FrasesService);
  protected readonly progresso = inject(ProgressoService);
  private readonly voz = inject(VozService);
  private readonly armazenamento = inject(ArmazenamentoService);

  protected readonly botoes = BOTOES;
  protected readonly frente = signal<Frente>(this.armazenamento.ler<Frente>('cartoes-frente', 'hanzi'));
  protected readonly novosPorSessao = signal(this.armazenamento.ler('cartoes-novos', 10));

  protected readonly baralhos = computed<Baralho[]>(() => {
    const porNivel = this.vocabulario.niveis().map((n, i) => ({
      id: n.id,
      nome: n.nome,
      descricao: n.descricao ?? '',
      descricaoEn: n.descricaoEn,
      itens: this.vocabulario
        .palavras()
        .filter((p) => p.nivel === i + 1)
        .map(deVocabulario),
    }));
    const frases: Baralho = {
      id: 'frases',
      nome: 'Frases do dia',
      descricao: 'Expressões úteis do dia a dia.',
      nomeEn: 'Daily phrases',
      descricaoEn: 'Useful everyday expressions.',
      itens: this.frases.frases().map(deFrase),
    };
    return [...porNivel, frases];
  });

  protected readonly contagens = computed(() => {
    const estado = this.progresso.estado();
    return new Map(this.baralhos().map((b) => [b.id, contar(b, estado.cartoes, this.progresso.hoje())]));
  });

  protected readonly totalVencidos = computed(() =>
    [...this.contagens().values()].reduce((t, c) => t + c.vencidos, 0),
  );

  // ------------------------------------------------------------------ estudo
  protected readonly estudando = signal<string | null>(null);
  protected readonly fila = signal<ConteudoCartao[]>([]);
  protected readonly virado = signal(false);
  protected readonly feitos = signal(0);
  private readonly errados = new Set<string>();
  protected readonly atual = computed(() => this.fila()[0] ?? null);

  /** Prévia do próximo intervalo de cada botão (como no Anki). */
  protected readonly previsoes = computed(() => {
    const c = this.atual();
    if (!c) return new Map<Nota, string>();
    const hoje = this.progresso.hoje();
    const cartao = this.progresso.estado().cartoes[idCartao(c.tipo, c.ref)] ?? novoCartao(c.tipo, c.ref, hoje);
    return new Map(
      BOTOES.map((b) => {
        if (b.nota < 3) return [b.nota, this.i.t('de novo', 'again')];
        const dias = revisarSm2(cartao, b.nota, hoje).intervalo;
        const meses = Math.round(dias / 30);
        return [
          b.nota,
          dias === 1
            ? this.i.t('1 dia', '1 day')
            : dias < 30
              ? this.i.t(`${dias} dias`, `${dias} days`)
              : this.i.t(`${meses} mês(es)`, `${meses} month(s)`),
        ];
      }),
    );
  });

  constructor() {
    void this.vocabulario.carregar();
    void this.frases.carregar();
    effect(() => this.armazenamento.salvar('cartoes-frente', this.frente()));
    effect(() => this.armazenamento.salvar('cartoes-novos', this.novosPorSessao()));
  }

  protected estudar(baralhoId: string | 'vencidos'): void {
    const hoje = this.progresso.hoje();
    const cartoes = this.progresso.estado().cartoes;
    const baralhos = baralhoId === 'vencidos' ? this.baralhos() : this.baralhos().filter((b) => b.id === baralhoId);
    const vencidos: ConteudoCartao[] = [];
    const novos: ConteudoCartao[] = [];
    for (const b of baralhos) {
      for (const item of b.itens) {
        const c = cartoes[idCartao(item.tipo, item.ref)];
        if (c && c.revisoes > 0) {
          if (c.vencimento <= hoje && c.ultimaRevisao !== hoje) vencidos.push(item);
        } else if (baralhoId !== 'vencidos') {
          novos.push(item);
        }
      }
    }
    vencidos.sort((a, b) =>
      cartoes[idCartao(a.tipo, a.ref)].vencimento.localeCompare(cartoes[idCartao(b.tipo, b.ref)].vencimento),
    );
    this.errados.clear();
    this.feitos.set(0);
    this.fila.set([...vencidos, ...novos.slice(0, this.novosPorSessao())]);
    this.virado.set(false);
    this.estudando.set(baralhoId);
    this.tocarFrente();
  }

  protected sair(): void {
    this.estudando.set(null);
    this.fila.set([]);
    this.voz.parar();
  }

  protected virar(): void {
    if (this.virado() || !this.atual()) return;
    this.virado.set(true);
    void this.voz.falar(this.atual()!.hanzi);
  }

  protected avaliar(nota: Nota): void {
    const c = this.atual();
    if (!c || !this.virado()) return;
    const chave = idCartao(c.tipo, c.ref);
    if (!this.errados.has(chave)) {
      // a primeira resposta do dia é a que conta para o agendamento
      this.progresso.adicionarCartao(c.tipo, c.ref);
      this.progresso.revisar(c.tipo, c.ref, nota);
      this.progresso.registrarResposta(c.tipo === 'frase' ? 'leitura' : 'caracteres', nota >= 3);
    }
    this.feitos.update((n) => n + 1);
    this.fila.update(([primeiro, ...resto]) => {
      if (nota < 3) {
        // "Errei": volta daqui a alguns cartões, como no Anki
        this.errados.add(chave);
        const pos = Math.min(resto.length, 3);
        return [...resto.slice(0, pos), primeiro, ...resto.slice(pos)];
      }
      return resto;
    });
    this.virado.set(false);
    this.tocarFrente();
  }

  private tocarFrente(): void {
    const c = this.atual();
    if (c && this.frente() === 'audio') setTimeout(() => void this.voz.falar(c.hanzi), 150);
  }

  protected exportar(b: Baralho): void {
    const url = URL.createObjectURL(new Blob([exportarParaAnki(b, this.i.ingles())], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `aprenda-mandarim-${b.id}-anki.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  protected nomeEstudo(): string {
    const id = this.estudando();
    const b = this.baralhos().find((x) => x.id === id);
    return id === 'vencidos' ? this.i.t('Revisões de hoje', 'Today’s reviews') : b ? this.i.tr(b, 'nome') : '';
  }

  @HostListener('document:keydown', ['$event'])
  protected teclado(e: KeyboardEvent): void {
    if (!this.estudando() || (e.target as HTMLElement)?.closest('input, select, textarea')) return;
    if ((e.key === ' ' || e.key === 'Enter') && !this.virado()) {
      e.preventDefault();
      this.virar();
    } else if (this.virado()) {
      const botao = BOTOES.find((b) => b.tecla === e.key);
      if (botao) this.avaliar(botao.nota);
    }
  }
}
