import { NumeroChines, ano, digitoADigito, hora, lerNumeroDigitado, numero, preco } from '../../core/numeros/numeros';

export type Categoria = 'ate10' | 'ate99' | 'ate999' | 'grandes' | 'precos' | 'horas' | 'telefones' | 'anos';

export const CATEGORIAS: { id: Categoria; nome: string }[] = [
  { id: 'ate10', nome: '0 a 10' },
  { id: 'ate99', nome: '11 a 99' },
  { id: 'ate999', nome: '100 a 999' },
  { id: 'grandes', nome: '1.000 a 99.999' },
  { id: 'precos', nome: 'Preços' },
  { id: 'horas', nome: 'Horas' },
  { id: 'telefones', nome: 'Telefones' },
  { id: 'anos', nome: 'Anos' },
];

/** Um número a praticar: como aparece em algarismos e como se diz em chinês. */
export interface AlvoNumero extends NumeroChines {
  categoria: Categoria;
  /** como mostrar em algarismos (ex.: "R$"-like "12,50 yuans", "08:30") */
  exibicao: string;
  /** forma canônica para comparar respostas digitadas */
  chave: string;
}

const entre = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const formatar = (n: number) => n.toLocaleString('pt-BR');

/** Normaliza o que a pessoa digitou para comparar com a chave do alvo. */
export function normalizarResposta(categoria: Categoria, texto: string): string {
  if (categoria === 'precos') {
    const v = lerNumeroDigitado(texto);
    return v === null ? '' : v.toFixed(2);
  }
  if (categoria === 'horas') {
    const m = /^(\d{1,2})\D*(\d{2})?$/.exec(texto.trim().replace(/h/i, ':'));
    if (!m) return '';
    return `${Number(m[1])}:${(m[2] ?? '00').padStart(2, '0')}`;
  }
  if (categoria === 'telefones' || categoria === 'anos') return texto.replace(/\D/g, '');
  const v = lerNumeroDigitado(texto);
  return v === null ? '' : String(v);
}

export function sortearAlvo(categoria: Categoria): AlvoNumero {
  switch (categoria) {
    case 'precos': {
      const valor = Math.random() < 0.5 ? entre(1, 200) : entre(10, 9990) / 10;
      const v = Math.round(valor * 10) / 10;
      return { categoria, ...preco(v), exibicao: `${v.toFixed(2).replace('.', ',')} yuans`, chave: v.toFixed(2) };
    }
    case 'horas': {
      const h = entre(1, 12);
      const m = [0, 30, 15, 45, 5, 10, 20, 50][entre(0, 7)];
      return { categoria, ...hora(h, m), exibicao: `${h}:${String(m).padStart(2, '0')}`, chave: `${h}:${String(m).padStart(2, '0')}` };
    }
    case 'telefones': {
      const digitos = '1' + String(entre(30, 89)) + String(entre(0, 99_999_999)).padStart(8, '0');
      return {
        categoria,
        ...digitoADigito(digitos, true),
        exibicao: `${digitos.slice(0, 3)} ${digitos.slice(3, 7)} ${digitos.slice(7)}`,
        chave: digitos,
      };
    }
    case 'anos': {
      const a = entre(1949, 2035);
      return { categoria, ...ano(a), exibicao: String(a), chave: String(a) };
    }
    default: {
      const [min, max] = { ate10: [0, 10], ate99: [11, 99], ate999: [100, 999], grandes: [1000, 99_999] }[categoria];
      const n = entre(min, max);
      return { categoria, ...numero(n), exibicao: formatar(n), chave: String(n) };
    }
  }
}

/** Alternativas parecidas (para "escolha o pinyin certo"). */
export function distratores(alvo: AlvoNumero, quantidade = 3): AlvoNumero[] {
  const vistos = new Set([alvo.hanzi]);
  const saida: AlvoNumero[] = [];
  let tentativas = 0;
  while (saida.length < quantidade && tentativas++ < 60) {
    const outro = sortearAlvo(alvo.categoria);
    if (!vistos.has(outro.hanzi)) {
      vistos.add(outro.hanzi);
      saida.push(outro);
    }
  }
  return saida;
}
