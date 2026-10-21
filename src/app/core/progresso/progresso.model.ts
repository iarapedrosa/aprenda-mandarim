import { CartaoSrs } from '../srs/sm2';
import { DataISO } from '../util/datas';

export type Modulo = 'tons' | 'pinyin' | 'caracteres' | 'escrita' | 'leitura' | 'escuta' | 'fala' | 'numeros' | 'gramatica';

export const NOMES_MODULOS: Record<Modulo, string> = {
  tons: 'Tons',
  pinyin: 'Pinyin',
  caracteres: 'Caracteres',
  escrita: 'Escrita',
  leitura: 'Leitura',
  escuta: 'Escuta',
  fala: 'Fala',
  numeros: 'Números',
  gramatica: 'Gramática',
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
  /** tempo de estudo no treino diário */
  segundos: number;
}

export interface Metas {
  novasPorDia: number;
  revisoesPorDia: number;
  /** a pessoa mudou as metas (senão, acompanhamos o padrão recomendado) */
  personalizadas?: boolean;
}

/**
 * Regra prática: cada palavra nova por dia gera ~10 revisões diárias depois de algumas semanas.
 * 6 novas/dia cabe num treino de 15–20 minutos.
 */
export const METAS_PADRAO: Metas = { novasPorDia: 6, revisoesPorDia: 20 };
/** padrão antigo, migrado automaticamente se a pessoa nunca mexeu nas metas */
export const METAS_PADRAO_ANTIGO: Metas = { novasPorDia: 10, revisoesPorDia: 20 };
export const LIMITES_METAS = {
  novasPorDia: { min: 0, max: 30 },
  revisoesPorDia: { min: 5, max: 200 },
};

export type ChaveTom = '1' | '2' | '3' | '4' | '5';

export interface EstadoProgresso {
  versao: 1;
  inicio: DataISO;
  metas: Metas;
  atividade: Record<DataISO, AtividadeDia>;
  porModulo: Partial<Record<Modulo, Placar>>;
  porTom: Partial<Record<ChaveTom, Placar>>;
  /** cartões de repetição espaçada (id → cartão) */
  cartoes: Record<string, CartaoSrs>;
  /** lições de pinyin concluídas (id → data) */
  licoesPinyin: Record<string, DataISO>;
  /** lições de gramática concluídas (id → data) */
  licoesGramatica: Record<string, DataISO>;
  /** textos de leitura concluídos (id → resultado) */
  textos: Record<string, { data: DataISO; acertos: number; total: number }>;
}

/** Formato do arquivo de backup (exportar/importar). */
export interface Backup {
  app: 'aprenda-mandarim';
  versao: 1;
  exportadoEm: string;
  progresso: EstadoProgresso;
  preferencias?: Record<string, unknown>;
}
