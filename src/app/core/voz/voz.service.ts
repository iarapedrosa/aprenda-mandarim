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
    const lista = this.vozesChinesas();
    return lista.find((v) => v.name === nome) ?? lista[0] ?? null;
  });

  /** true quando o navegador fala, mas não tem voz chinesa instalada. */
  readonly semVozChinesa = computed(() => this.suportado && this.vozes().length > 0 && !this.voz());

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
  }

  /**
   * Fala o texto em mandarim. Resolve quando termina (ou imediatamente se não houver suporte).
   */
  falar(texto: string, opcoes: { velocidade?: Velocidade } = {}): Promise<void> {
    const sintese = this.sintese;
    if (!sintese || !texto.trim()) return Promise.resolve();
    sintese.cancel();
    return new Promise((resolve) => {
      const fala = new SpeechSynthesisUtterance(texto);
      fala.lang = 'zh-CN';
      const voz = this.voz();
      if (voz) fala.voice = voz;
      fala.rate = TAXAS[opcoes.velocidade ?? this.velocidade()];
      fala.pitch = 1;
      const terminar = () => {
        this.falando.set(false);
        resolve();
      };
      fala.onend = terminar;
      fala.onerror = terminar;
      this.falando.set(true);
      sintese.speak(fala);
      // Proteção: alguns navegadores não disparam onend.
      setTimeout(terminar, 1500 + texto.length * 700);
    });
  }

  parar(): void {
    this.sintese?.cancel();
    this.falando.set(false);
  }

  alternarVelocidade(): void {
    this.velocidade.update((v) => (v === 'lenta' ? 'normal' : 'lenta'));
  }
}
