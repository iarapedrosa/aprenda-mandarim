/**
 * Datas no formato `AAAA-MM-DD`, sempre no fuso horário local do aparelho.
 * Trabalhar com strings evita problemas de fuso/horário de verão nos cálculos de dias.
 */
export type DataISO = string;

export function paraDataISO(data: Date): DataISO {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function hoje(): DataISO {
  return paraDataISO(new Date());
}

export function deDataISO(data: DataISO): Date {
  const [ano, mes, dia] = data.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function somarDias(data: DataISO, dias: number): DataISO {
  const d = deDataISO(data);
  d.setDate(d.getDate() + dias);
  return paraDataISO(d);
}

/** Diferença em dias inteiros (b - a). */
export function diferencaEmDias(a: DataISO, b: DataISO): number {
  const umDia = 24 * 60 * 60 * 1000;
  const da = deDataISO(a);
  const db = deDataISO(b);
  // Date.UTC neutraliza a diferença de 1h causada pelo horário de verão.
  const utcA = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate());
  const utcB = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate());
  return Math.round((utcB - utcA) / umDia);
}

/** Número inteiro estável para uma data (útil para escolher "a frase do dia"). */
export function numeroDoDia(data: DataISO): number {
  return diferencaEmDias('2024-01-01', data);
}
