import { Injectable, signal } from '@angular/core';

/** Tipos mínimos da Web Speech API (SpeechRecognition ainda não está no lib.dom de todos). */
interface ResultadoAlternativo {
  transcript: string;
  confidence: number;
}
interface EventoResultado {
  results: ArrayLike<ArrayLike<ResultadoAlternativo> & { isFinal: boolean }>;
}
interface EventoErro {
  error: string;
}
interface Reconhecedor {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: EventoResultado) => void) | null;
  onerror: ((e: EventoErro) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type ConstrutorReconhecedor = new () => Reconhecedor;

export interface ResultadoReconhecimento {
  texto: string;
  alternativas: string[];
  confianca: number;
}

const MENSAGENS_ERRO: Record<string, string> = {
  'not-allowed': 'O acesso ao microfone foi negado. Libere o microfone nas configurações do navegador.',
  'service-not-allowed': 'O navegador bloqueou o reconhecimento de voz neste site.',
  'no-speech': 'Não ouvi nada. Tente falar mais perto do microfone.',
  'audio-capture': 'Nenhum microfone encontrado.',
  network: 'O reconhecimento de voz precisa de internet neste navegador.',
  'language-not-supported': 'Este navegador não reconhece mandarim (zh-CN).',
  aborted: 'Gravação cancelada.',
};

/**
 * Reconhecimento de fala (SpeechRecognition) com lang = 'zh-CN'.
 * Suportado no Chrome/Edge (desktop e Android) e no Safari (iOS 14.5+). Não funciona no Firefox.
 */
@Injectable({ providedIn: 'root' })
export class ReconhecimentoService {
  private readonly Construtor: ConstrutorReconhecedor | null = (() => {
    if (typeof window === 'undefined') return null;
    const w = window as unknown as Record<string, unknown>;
    return (w['SpeechRecognition'] ?? w['webkitSpeechRecognition'] ?? null) as ConstrutorReconhecedor | null;
  })();
  private atual: Reconhecedor | null = null;

  readonly suportado = this.Construtor !== null;
  readonly ouvindo = signal(false);

  ouvir(): Promise<ResultadoReconhecimento> {
    if (!this.Construtor) {
      return Promise.reject(new Error('Seu navegador não suporta reconhecimento de voz.'));
    }
    this.atual?.abort();
    const rec = new this.Construtor();
    this.atual = rec;
    rec.lang = 'zh-CN';
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 5;

    return new Promise((resolve, reject) => {
      let resolvido = false;
      rec.onresult = (e) => {
        const resultado = e.results[0];
        if (!resultado) return;
        const alternativas = Array.from({ length: resultado.length }, (_, i) => resultado[i].transcript);
        resolvido = true;
        resolve({
          texto: resultado[0].transcript,
          alternativas,
          confianca: resultado[0].confidence,
        });
      };
      rec.onerror = (e) => {
        resolvido = true;
        reject(new Error(MENSAGENS_ERRO[e.error] ?? `Erro no reconhecimento de voz (${e.error}).`));
      };
      rec.onend = () => {
        this.ouvindo.set(false);
        if (!resolvido) reject(new Error(MENSAGENS_ERRO['no-speech']));
      };
      try {
        rec.start();
        this.ouvindo.set(true);
      } catch (erro) {
        this.ouvindo.set(false);
        reject(erro instanceof Error ? erro : new Error(String(erro)));
      }
    });
  }

  parar(): void {
    this.atual?.stop();
  }
}
