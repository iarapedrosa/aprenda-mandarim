import { Frase, Palavra } from '../../core/dados/modelos';
import { InfoCaractere } from '../../core/dados/vocabulario.service';
import { Modulo } from '../../core/progresso/progresso.model';
import { TipoCartao } from '../../core/srs/sm2';
import { NivelEscrita } from '../../shared/hanzi/quiz-escrita';
import type { LicaoGramatica } from '../../core/dados/gramatica.service';
import type { LicaoPinyin } from './curriculo';

/** Cartão de repetição espaçada ligado a um exercício. */
export interface RefCartao {
  tipo: TipoCartao;
  ref: string;
}

interface ItemBase {
  id: string;
  /** item repetido no fim da sessão porque a pessoa errou */
  reforco?: boolean;
  cartao?: RefCartao;
  /** lição a que o item pertence (pinyin: "tons"; gramática: "gramatica:g01") */
  licao?: string;
}

export interface OpcaoEscolha {
  valor: string;
  rotulo: string;
  /** mostrar com fonte chinesa */
  hanzi?: boolean;
  /** mostrar colorido como pinyin */
  pinyin?: boolean;
}

export interface ItemEscolha extends ItemBase {
  tipo: 'escolha';
  modulo: Modulo;
  enunciado: string;
  pergunta: {
    hanzi?: string;
    pinyin?: string;
    texto?: string;
    /** texto em chinês a ser falado */
    audio?: string;
  };
  opcoes: OpcaoEscolha[];
  correta: string;
  /** tons envolvidos (estatística por tom) */
  tons?: number[];
  /** mostrado depois de responder */
  resposta?: { hanzi: string; pinyin: string; traducao?: string };
  explicacao?: string;
}

export interface ItemLicao extends ItemBase {
  tipo: 'licao';
  dados: LicaoPinyin;
}

export interface ItemGramatica extends ItemBase {
  tipo: 'gramatica';
  dados: LicaoGramatica;
}

export interface ItemApresentar extends ItemBase {
  tipo: 'apresentar';
  palavra: Palavra;
}

export interface ItemDigitarPinyin extends ItemBase {
  tipo: 'digitar-pinyin';
  modulo: Modulo;
  enunciado: string;
  hanzi: string;
  pinyin: string;
  traducao: string;
  /** só áudio (ditado) ou mostra os caracteres */
  soAudio: boolean;
}

export interface ItemEscrever extends ItemBase {
  tipo: 'escrever';
  caractere: InfoCaractere;
  nivel: NivelEscrita;
}

/** Digitar como no teclado chinês: pinyin sem tons → escolher o caractere. */
export interface ItemTeclado extends ItemBase {
  tipo: 'teclado';
  palavra: Palavra;
}

export interface ItemMontar extends ItemBase {
  tipo: 'montar';
  frase: Frase;
  /** palavras na ordem certa */
  pedacos: string[];
}

export interface ItemFalar extends ItemBase {
  tipo: 'falar';
  frase: Frase;
}

export type ItemSessao =
  | ItemEscolha
  | ItemLicao
  | ItemGramatica
  | ItemApresentar
  | ItemDigitarPinyin
  | ItemEscrever
  | ItemMontar
  | ItemTeclado
  | ItemFalar;

/** Resultado que cada exercício devolve à sessão. */
export interface ResultadoItem {
  acertou: boolean;
  /** nota SM-2 explícita (escrita); senão é calculada a partir de "acertou" */
  nota?: 0 | 1 | 2 | 3 | 4 | 5;
  /** itens informativos (apresentação, lição) não contam nas estatísticas */
  informativo?: boolean;
}
