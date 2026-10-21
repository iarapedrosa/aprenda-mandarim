import { DataISO, somarDias } from '../util/datas';

/**
 * Repetição espaçada com o algoritmo SM-2 (SuperMemo 2, Piotr Woźniak, 1987).
 *
 * Cada revisão recebe uma nota de 0 a 5:
 *   5 = perfeito · 4 = certo com alguma hesitação · 3 = certo com dificuldade
 *   2 = errado, mas lembrou ao ver a resposta · 1 = errado · 0 = branco total
 *
 * Notas ≥ 3 aumentam o intervalo (1 dia → 6 dias → intervalo × facilidade).
 * Notas < 3 zeram as repetições e o cartão volta no dia seguinte.
 * A facilidade (EF) começa em 2,5 e nunca fica abaixo de 1,3.
 */
export type Nota = 0 | 1 | 2 | 3 | 4 | 5;

export const FACILIDADE_INICIAL = 2.5;
export const FACILIDADE_MINIMA = 1.3;
export const INTERVALO_MAXIMO = 365;

export interface EstadoSm2 {
  /** revisões corretas seguidas */
  repeticoes: number;
  /** fator de facilidade (EF) */
  facilidade: number;
  /** intervalo atual em dias */
  intervalo: number;
  /** próxima revisão */
  vencimento: DataISO;
}

export type TipoCartao = 'palavra' | 'escrita' | 'frase';

export interface CartaoSrs extends EstadoSm2 {
  /** ex.: "palavra:你好", "escrita:你", "frase:f001" */
  id: string;
  tipo: TipoCartao;
  /** id da palavra, caractere ou frase */
  ref: string;
  criadoEm: DataISO;
  ultimaRevisao?: DataISO;
  /** quantas vezes foi esquecido depois de aprendido */
  lapsos: number;
  /** total de revisões */
  revisoes: number;
}

export function idCartao(tipo: TipoCartao, ref: string): string {
  return `${tipo}:${ref}`;
}

export function novoCartao(tipo: TipoCartao, ref: string, hoje: DataISO): CartaoSrs {
  return {
    id: idCartao(tipo, ref),
    tipo,
    ref,
    repeticoes: 0,
    facilidade: FACILIDADE_INICIAL,
    intervalo: 0,
    vencimento: hoje,
    criadoEm: hoje,
    lapsos: 0,
    revisoes: 0,
  };
}

/** Novo fator de facilidade segundo a fórmula do SM-2. */
export function novaFacilidade(facilidade: number, nota: Nota): number {
  const ef = facilidade + (0.1 - (5 - nota) * (0.08 + (5 - nota) * 0.02));
  return Math.max(FACILIDADE_MINIMA, Math.round(ef * 100) / 100);
}

/** Aplica uma revisão ao estado SM-2 e calcula o próximo vencimento. */
export function revisarSm2<T extends EstadoSm2>(estado: T, nota: Nota, hoje: DataISO): T {
  let { repeticoes, intervalo } = estado;
  if (nota >= 3) {
    if (repeticoes === 0) intervalo = 1;
    else if (repeticoes === 1) intervalo = 6;
    else intervalo = Math.round(intervalo * estado.facilidade);
    repeticoes += 1;
  } else {
    repeticoes = 0;
    intervalo = 1;
  }
  intervalo = Math.min(Math.max(intervalo, 1), INTERVALO_MAXIMO);
  return {
    ...estado,
    repeticoes,
    intervalo,
    facilidade: novaFacilidade(estado.facilidade, nota),
    vencimento: somarDias(hoje, intervalo),
  };
}

/** Revisão completa de um cartão (inclui contadores). */
export function revisarCartao(cartao: CartaoSrs, nota: Nota, hoje: DataISO): CartaoSrs {
  const esquecido = nota < 3 && cartao.repeticoes > 0;
  return {
    ...revisarSm2(cartao, nota, hoje),
    ultimaRevisao: hoje,
    revisoes: cartao.revisoes + 1,
    lapsos: cartao.lapsos + (esquecido ? 1 : 0),
  };
}

export function estaVencido(cartao: CartaoSrs, hoje: DataISO): boolean {
  return cartao.vencimento <= hoje;
}

/** Cartões para revisar hoje: os mais atrasados primeiro, depois os mais difíceis. */
export function cartoesVencidos(cartoes: Iterable<CartaoSrs>, hoje: DataISO): CartaoSrs[] {
  return [...cartoes]
    .filter((c) => c.revisoes > 0 && estaVencido(c, hoje))
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento) || a.facilidade - b.facilidade);
}

/** Converte o resultado de um exercício automático em nota SM-2. */
export function notaDoExercicio(acertou: boolean, opcoes: { hesitou?: boolean } = {}): Nota {
  if (!acertou) return 1;
  return opcoes.hesitou ? 3 : 4;
}

/** Nota para a prática de escrita, a partir dos erros de traço. */
export function notaDaEscrita(erros: number, usouDica: boolean): Nota {
  if (usouDica) return erros <= 2 ? 3 : 2;
  if (erros === 0) return 5;
  if (erros <= 2) return 4;
  if (erros <= 4) return 3;
  return 1;
}

/** Estágio de memorização, para mostrar ao usuário. */
export function estagio(cartao: CartaoSrs): 'novo' | 'aprendendo' | 'jovem' | 'maduro' {
  if (cartao.revisoes === 0) return 'novo';
  if (cartao.repeticoes === 0 || cartao.intervalo < 2) return 'aprendendo';
  if (cartao.intervalo < 21) return 'jovem';
  return 'maduro';
}
