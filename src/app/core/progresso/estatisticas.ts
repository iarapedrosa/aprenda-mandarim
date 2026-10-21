import { DataISO, diferencaEmDias, somarDias } from '../util/datas';
import { AtividadeDia } from './progresso.model';

export function diaAtivo(a: AtividadeDia | undefined): boolean {
  return !!a && a.exercicios > 0;
}

/**
 * Sequência atual de dias praticados. Se hoje ainda não houve prática,
 * a sequência de ontem continua valendo (dá tempo de praticar até meia-noite).
 */
export function sequenciaAtual(atividade: Record<DataISO, AtividadeDia>, hoje: DataISO): number {
  let dia = diaAtivo(atividade[hoje]) ? hoje : somarDias(hoje, -1);
  let total = 0;
  while (diaAtivo(atividade[dia])) {
    total++;
    dia = somarDias(dia, -1);
  }
  return total;
}

/** Maior sequência de dias seguidos já alcançada. */
export function melhorSequencia(atividade: Record<DataISO, AtividadeDia>): number {
  const dias = Object.keys(atividade)
    .filter((d) => diaAtivo(atividade[d]))
    .sort();
  let melhor = 0;
  let atual = 0;
  let anterior: DataISO | null = null;
  for (const dia of dias) {
    atual = anterior && diferencaEmDias(anterior, dia) === 1 ? atual + 1 : 1;
    melhor = Math.max(melhor, atual);
    anterior = dia;
  }
  return melhor;
}

export function taxa(acertos: number, total: number): number | null {
  return total > 0 ? Math.round((acertos / total) * 100) : null;
}
