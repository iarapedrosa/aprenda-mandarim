import { Injectable, computed, inject, signal } from '@angular/core';
import { DadosService } from './dados.service';

/** Uma palavra (ou pontuação) do texto. Pontuação só tem "hanzi". */
export interface Token {
  hanzi: string;
  pinyin?: string;
  traducao?: string;
  traducaoEn?: string;
  /** id da palavra no vocabulário, se existir */
  palavra?: string;
}

export interface LinhaTexto {
  falante?: { hanzi: string; pinyin: string };
  tokens: Token[];
  traducao: string;
  traducaoEn?: string;
}

export interface PerguntaTexto {
  pergunta: string;
  perguntaEn?: string;
  opcoes: string[];
  opcoesEn?: string[];
  /** índice da opção correta (no arquivo, sempre 0; o site embaralha) */
  correta: number;
}

export interface Texto {
  id: string;
  tipo: 'dialogo' | 'historia';
  nivel: number;
  titulo: string;
  tituloEn?: string;
  tituloHanzi: string;
  resumo: string;
  resumoEn?: string;
  nota?: string;
  notaEn?: string;
  linhas: LinhaTexto[];
  perguntas: PerguntaTexto[];
}

/** Texto em chinês de uma linha (para a voz e para exercícios). */
export function hanziDaLinha(linha: LinhaTexto): string {
  return linha.tokens.map((t) => t.hanzi).join('');
}

const PONTUACAO: Record<string, string> = { '，': ',', '。': '.', '！': '!', '？': '?', '：': ':', '、': ',', '”': '"', '…': '…' };

/** Pinyin de uma linha, com pontuação ocidental e maiúscula no começo das frases. */
export function pinyinDaLinha(linha: LinhaTexto): string {
  let saida = '';
  let maiuscula = true;
  let aposAspas = false;
  for (const t of linha.tokens) {
    if (t.pinyin) {
      const p = maiuscula ? t.pinyin.charAt(0).toUpperCase() + t.pinyin.slice(1) : t.pinyin;
      saida += (saida && !aposAspas ? ' ' : '') + p;
      maiuscula = false;
      aposAspas = false;
    } else if (t.hanzi === '“') {
      saida += (saida ? ' ' : '') + '"';
      aposAspas = true;
      maiuscula = true;
    } else {
      saida += PONTUACAO[t.hanzi] ?? t.hanzi;
      if (/[。！？]/.test(t.hanzi)) maiuscula = true;
    }
  }
  return saida;
}

/**
 * Porcentagem das palavras do texto que a pessoa já estudou (nomes próprios contam como conhecidos).
 * Para ler com compreensão confortável, recomenda-se conhecer ~98% das palavras
 * (Hu & Nation, 2000, Reading in a Foreign Language).
 */
export function coberturaDoTexto(texto: Texto, conhecidas: ReadonlySet<string>): number {
  const palavras = texto.linhas.flatMap((l) => l.tokens).filter((t) => t.pinyin);
  if (!palavras.length) return 0;
  const sabidas = palavras.filter(
    (t) => (t.palavra && conhecidas.has(t.palavra)) || /\(nome\)/.test(t.traducao ?? ''),
  ).length;
  return Math.round((sabidas / palavras.length) * 100);
}

export function rotuloCobertura(pct: number): { texto: string; textoEn: string; classe: 'ideal' | 'desafio' | 'dificil' } {
  if (pct >= 95) return { texto: 'ideal para ler', textoEn: 'ideal to read', classe: 'ideal' };
  if (pct >= 85) return { texto: 'bom desafio', textoEn: 'good challenge', classe: 'desafio' };
  return { texto: 'difícil por enquanto', textoEn: 'hard for now', classe: 'dificil' };
}

/** Diálogos e historinhas de public/data/leitura. */
@Injectable({ providedIn: 'root' })
export class LeituraService {
  private readonly dados = inject(DadosService);
  readonly textos = signal<Texto[]>([]);
  readonly carregado = computed(() => this.textos().length > 0);
  private carregamento: Promise<void> | null = null;

  carregar(): Promise<void> {
    this.carregamento ??= Promise.all([
      this.dados.carregar<Texto[]>('leitura/dialogos.json'),
      this.dados.carregar<Texto[]>('leitura/historias.json'),
    ])
      .then(([d, h]) => this.textos.set([...d, ...h]))
      .catch(() => {
        this.carregamento = null;
      });
    return this.carregamento;
  }

  porId(id: string): Texto | undefined {
    return this.textos().find((t) => t.id === id);
  }
}
