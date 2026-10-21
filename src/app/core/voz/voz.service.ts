import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ArmazenamentoService } from '../armazenamento/armazenamento.service';

export type Velocidade = 'lenta' | 'normal';

const TAXAS: Record<Velocidade, number> = { lenta: 0.6, normal: 0.95 };

/** Preferência de vozes conhecidas (melhores primeiro) por plataforma. */
const VOZES_PREFERIDAS = [
  'xiaoxiao', // Edge / Windows (neural)
  'xiaoyi',
  'yunxi',
  'google 普通话', // Chrome
  'google mandarin',
  'tingting', // iOS / macOS
  'ting-ting',
  'lili',
  'meijia',
];

/**
 * Pronúncia com a Web Speech API (speechSynthesis) usando uma voz zh-CN.
 */
@Injectable({ providedIn: 'root' })
export class VozService {
  private readonly armazenamento = inject(ArmazenamentoService);
  private readonly sintese: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

  readonly suportado = this.sintese !== null;
  readonly vozes = signal<SpeechSynthesisVoice[]>([]);
  readonly velocidade = signal<Velocidade>(this.armazenamento.ler<Velocidade>('velocidade-voz', 'normal'));
  readonly nomeVozEscolhida = signal<string | null>(this.armazenamento.ler<string | null>('voz', null));
  readonly falando = signal(false);
  /** Último problema ao tocar áudio (para avisar a pessoa em vez de ficar em silêncio). */
  readonly problema = signal<{ erro: string; voz: string | null; quando: number } | null>(null);
  /** Vozes que falharam nesta sessão (ex.: vozes online bloqueadas pela rede). */
  private readonly vozesComFalha = signal<Set<string>>(new Set());
  /** alternar entre as vozes de mandarim do aparelho (treino com várias vozes) */
  readonly variarVozes = signal(this.armazenamento.ler('variar-vozes', true));

  /** Vozes de mandarim disponíveis (zh-CN primeiro; depois outras variantes de chinês). */
  readonly vozesChinesas = computed(() => {
    const chinesas = this.vozes().filter((v) => /^(zh|cmn)/i.test(v.lang));
    const pontuacao = (v: SpeechSynthesisVoice) => {
      const lang = v.lang.replace('_', '-').toLowerCase();
      let p = lang === 'zh-cn' || lang.startsWith('cmn') ? 100 : lang === 'zh-tw' ? 40 : 20;
      const nome = v.name.toLowerCase();
      const indice = VOZES_PREFERIDAS.findIndex((n) => nome.includes(n));
      if (indice >= 0) p += 50 - indice;
      if (/hk|yue|cantonese|粤/i.test(lang + nome)) p -= 80;
      return p;
    };
    return [...chinesas].sort((a, b) => pontuacao(b) - pontuacao(a));
  });

  readonly voz = computed<SpeechSynthesisVoice | null>(() => {
    const nome = this.nomeVozEscolhida();
    const falhas = this.vozesComFalha();
    const lista = this.vozesChinesas().filter((v) => !falhas.has(v.name));
    return lista.find((v) => v.name === nome) ?? lista[0] ?? null;
  });

  /** Vozes de mandarim da China continental (as usadas na variação). */
  readonly vozesMandarim = computed(() =>
    this.vozesChinesas().filter((v) => {
      if (this.vozesComFalha().has(v.name)) return false;
      const lang = v.lang.replace('_', '-').toLowerCase();
      return (lang === 'zh-cn' || lang.startsWith('cmn')) && !/hk|yue|cantonese|粤/i.test(v.name);
    }),
  );

  /** Há mais de uma voz para alternar? */
  readonly podeVariar = computed(() => this.vozesMandarim().length > 1);

  /** true quando o navegador fala, mas não tem voz chinesa instalada. */
  readonly semVozChinesa = computed(() => this.suportado && this.vozes().length > 0 && this.vozesChinesas().length === 0);

  constructor() {
    if (this.sintese) {
      const carregar = () => this.vozes.set(this.sintese!.getVoices());
      carregar();
      this.sintese.addEventListener?.('voiceschanged', carregar);
      // Alguns navegadores (Safari antigo) só preenchem a lista depois de um tempo.
      setTimeout(carregar, 500);
      setTimeout(carregar, 2000);
    }
    effect(() => this.armazenamento.salvar('velocidade-voz', this.velocidade()));
    effect(() => this.armazenamento.salvar('voz', this.nomeVozEscolhida()));
    effect(() => this.armazenamento.salvar('variar-vozes', this.variarVozes()));
  }

  /**
   * Fala o texto em mandarim. Resolve quando termina (ou imediatamente se não houver suporte).
   */
  falar(texto: string, opcoes: { velocidade?: Velocidade } = {}): Promise<void> {
    const sintese = this.sintese;
    if (!sintese || !texto.trim()) return Promise.resolve();
    // encerra a fala anterior (alguns navegadores nem avisam que ela foi cancelada)
    this.encerrarAnterior?.();
    const velocidade = opcoes.velocidade ?? this.velocidade();
    const voz = this.escolherVoz();
    if (sintese.speaking || sintese.pending) {
      // Safari descarta uma fala pedida no mesmo instante de um cancel(): espera um pouco
      sintese.cancel();
      return new Promise((resolve) =>
        setTimeout(() => void this.tentarFalar(sintese, texto, velocidade, voz, true).then(resolve), 80),
      );
    }
    return this.tentarFalar(sintese, texto, velocidade, voz, true);
  }

  /**
   * Uma tentativa de fala. Se a voz falhar (ex.: voz online bloqueada pela rede da empresa),
   * marca a voz como problemática e tenta de novo uma vez com outra voz chinesa.
   */
  /** termina a promessa da fala em andamento quando outra começa */
  private encerrarAnterior: (() => void) | null = null;
  /** fala atual (os temporizadores de uma fala antiga não podem mexer na nova) */
  private falaAtual: SpeechSynthesisUtterance | null = null;

  private tentarFalar(
    sintese: SpeechSynthesis,
    texto: string,
    velocidade: Velocidade,
    voz: SpeechSynthesisVoice | null,
    podeRepetir: boolean,
  ): Promise<void> {
    return new Promise((resolve) => {
      const fala = new SpeechSynthesisUtterance(texto);
      fala.lang = 'zh-CN';
      if (voz) fala.voice = voz;
      fala.rate = TAXAS[velocidade];
      fala.pitch = 1;
      let terminou = false;
      let comecou = false;
      const terminar = () => {
        if (terminou) return;
        terminou = true;
        if (this.falaAtual === fala) {
          this.falaAtual = null;
          this.encerrarAnterior = null;
          this.falando.set(false);
        }
        resolve();
      };
      this.falaAtual = fala;
      this.encerrarAnterior = terminar;
      fala.onstart = () => {
        comecou = true;
        this.problema.set(null);
      };
      fala.onend = terminar;
      fala.onerror = (e) => {
        // cancelar/interromper (outra fala começou) não é problema
        if (e.error === 'canceled' || e.error === 'interrupted') return terminar();
        if (voz) this.vozesComFalha.update((s) => new Set(s).add(voz.name));
        const outra = this.escolherVoz();
        if (podeRepetir && !terminou && outra && outra.name !== voz?.name) {
          terminou = true;
          void this.tentarFalar(sintese, texto, velocidade, outra, false).then(resolve);
          return;
        }
        this.problema.set({ erro: e.error, voz: voz?.name ?? null, quando: Date.now() });
        terminar();
      };
      this.falando.set(true);
      sintese.resume(); // destrava navegadores que ficam "pausados" depois de um cancel()
      sintese.speak(fala);
      // Se nada começar em alguns segundos, o áudio provavelmente não vai tocar.
      setTimeout(() => {
        if (!comecou && !terminou && this.falaAtual === fala) {
          this.problema.set({ erro: 'sem-resposta', voz: voz?.name ?? null, quando: Date.now() });
          sintese.cancel();
          terminar();
        }
      }, 6000);
      // Proteção: alguns navegadores não disparam onend.
      setTimeout(terminar, 6000 + texto.length * 700);
    });
  }

  /** Descrição das vozes disponíveis (para o diagnóstico em Progresso). */
  diagnostico(): { total: number; chinesas: { nome: string; lang: string; local: boolean; falhou: boolean }[] } {
    const falhas = this.vozesComFalha();
    return {
      total: this.vozes().length,
      chinesas: this.vozesChinesas().map((v) => ({ nome: v.name, lang: v.lang, local: v.localService, falhou: falhas.has(v.name) })),
    };
  }

  /** Uma voz por fala: sorteada entre as vozes de mandarim, se a variação estiver ligada. */
  private escolherVoz(): SpeechSynthesisVoice | null {
    const opcoes = this.vozesMandarim();
    if (this.variarVozes() && opcoes.length > 1) {
      return opcoes[Math.floor(Math.random() * opcoes.length)];
    }
    return this.voz();
  }

  parar(): void {
    this.encerrarAnterior?.();
    this.sintese?.cancel();
    this.falando.set(false);
  }

  alternarVelocidade(): void {
    this.velocidade.update((v) => (v === 'lenta' ? 'normal' : 'lenta'));
  }
}
