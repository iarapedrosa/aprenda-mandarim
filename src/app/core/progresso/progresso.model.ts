import { DataISO } from '../util/datas';

export type Modulo = 'tons' | 'pinyin' | 'caracteres' | 'escrita' | 'leitura' | 'escuta' | 'fala';

export const NOMES_MODULOS: Record<Modulo, string> = {
  tons: 'Tons',
  pinyin: 'Pinyin',
  caracteres: 'Caracteres',
  escrita: 'Escrita',
  leitura: 'Leitura',
  escuta: 'Escuta',
  fala: 'Fala',
};

export interface Placar {
  acertos: number;
  total: number;
}

export interface AtividadeDia {
  exercicios: number;
  acertos: number;
  /** palavras novas aprendidas no dia */
  novas: number;
  /** revisões de repetição espaçada feitas no dia */
  revisoes: number;
  treinoConcluido: boolean;
}

export interface Metas {
  novasPorDia: number;
  revisoesPorDia: number;
}

export const METAS_PADRAO: Metas = { novasPorDia: 10, revisoesPorDia: 20 };

export type ChaveTom = '1' | '2' | '3' | '4' | '5';

export interface EstadoProgresso {
  versao: 1;
  inicio: DataISO;
  metas: Metas;
  atividade: Record<DataISO, AtividadeDia>;
  porModulo: Partial<Record<Modulo, Placar>>;
  porTom: Partial<Record<ChaveTom, Placar>>;
  /** ids das lições de pinyin concluídas */
  licoesPinyin: string[];
  /** textos de leitura concluídos (id → resultado) */
  textos: Record<string, { data: DataISO; acertos: number; total: number }>;
}
