/** Frase com pinyin e tradução. */
export interface Frase {
  hanzi: string;
  pinyin: string;
  traducao: string;
}

/** Uma palavra do vocabulário (public/data/vocabulario/*.json). */
export interface Palavra {
  /** identificador único (normalmente os próprios caracteres) */
  id: string;
  hanzi: string;
  pinyin: string;
  traducao: string;
  classe: string;
  /** nível HSK */
  nivel: number;
  exemplo?: Frase;
}

export interface NivelVocabulario {
  id: string;
  nome: string;
  arquivo: string;
  descricao?: string;
}

export interface IndiceVocabulario {
  niveis: NivelVocabulario[];
}

export interface Radical {
  /** forma usada dentro dos caracteres (ex.: 氵) */
  forma: string;
  /** forma completa/independente (ex.: 水) */
  completo: string;
  pinyin: string;
  significado: string;
  dica: string;
  /** caracteres do vocabulário que usam o radical */
  exemplos: string[];
}
