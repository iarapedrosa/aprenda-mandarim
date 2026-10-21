import { Tom, semTom, silabaComAcento, tomDaSilaba } from '../../core/pinyin/pinyin';
import { embaralhar, montarAlternativas } from '../../core/util/aleatorio';
import {
  ExemploSom,
  GRUPOS_FINAIS,
  GRUPOS_INICIAIS,
  PARES_SONS,
  QUIZ_SANDHI,
  TONS,
} from '../pinyin/dados-pinyin';
import { ItemEscolha } from './sessao.model';

/** Lição curta de pinyin, usada no começo da jornada (antes do vocabulário). */
export interface LicaoPinyin {
  id: string;
  titulo: string;
  /** parágrafos de explicação */
  texto: string[];
  /** exemplos para ouvir */
  exemplos: ExemploSom[];
  /** link para estudar mais */
  saibaMais: string;
}

const exemplosIniciais = (grupos: number[]) =>
  grupos.flatMap((g) => GRUPOS_INICIAIS[g].iniciais.map((i) => ({ ...i.exemplo, traducao: `${i.letra} — ${i.dica}` })));

const exemplosFinais = (grupos: number[]) =>
  grupos.flatMap((g) => GRUPOS_FINAIS[g].finais.map((f) => ({ ...f.exemplo, traducao: `${f.final} — ${f.dica}` })));

export const LICOES_PINYIN: LicaoPinyin[] = [
  {
    id: 'tons',
    titulo: 'Os 4 tons (e o neutro)',
    texto: [
      'Em mandarim, a melodia da voz muda o significado: mā (妈, mãe) e mǎ (马, cavalo) são palavras diferentes.',
      '1º tom: alto e reto · 2º: sobe ("Hã?") · 3º: desce e sobe ("Hmmm…") · 4º: cai firme ("Não!") · neutro: curto e leve.',
    ],
    exemplos: TONS.map((t) => t.exemplo),
    saibaMais: '/pinyin/tons',
  },
  {
    id: 'iniciais-1',
    titulo: 'Iniciais: b p m f · d t n l',
    texto: [
      'b, d são SEM sopro; p, t são COM sopro forte. A diferença não é a vibração da garganta, como no português.',
      'Atenção: "ti" e "di" nunca viram "tchi" e "dji"!',
    ],
    exemplos: exemplosIniciais([0, 1]),
    saibaMais: '/pinyin/sons',
  },
  {
    id: 'iniciais-2',
    titulo: 'Iniciais: g k h · j q x',
    texto: [
      'h é raspado na garganta (como o "r" de "rato" carioca).',
      'j ≈ "dj", q ≈ "tch" com sopro, x é um chiado fino — sempre com a língua atrás dos dentes de baixo.',
    ],
    exemplos: exemplosIniciais([2, 3]),
    saibaMais: '/pinyin/sons',
  },
  {
    id: 'iniciais-3',
    titulo: 'Iniciais: zh ch sh r · z c s',
    texto: [
      'zh, ch, sh, r: língua enrolada para trás. z, c, s: língua atrás dos dentes.',
      'c é "ts" com sopro; o r não é nenhum "r" do português.',
    ],
    exemplos: exemplosIniciais([4, 5]),
    saibaMais: '/pinyin/armadilhas',
  },
  {
    id: 'finais-1',
    titulo: 'Finais: vogais simples e compostas',
    texto: [
      'O e sozinho é um som do fundo da garganta (não é "é"). O ü é um "i" com bico.',
      'ao é "au" (nunca "ão"); ei é "ei" de "lei".',
    ],
    exemplos: exemplosFinais([0, 1]),
    saibaMais: '/pinyin/sons',
  },
  {
    id: 'finais-2',
    titulo: 'Finais nasais e com i, u, ü',
    texto: [
      '-n termina com a língua nos dentes; -ng termina no fundo da boca, como em "gongo".',
      'ian soa "iên"; iu, ui e un são abreviações de iou, uei e uen.',
    ],
    exemplos: exemplosFinais([2, 3, 4, 5]),
    saibaMais: '/pinyin/sons',
  },
  {
    id: 'sandhi',
    titulo: 'Sandhi: quando os tons mudam',
    texto: [
      '3º + 3º → o primeiro vira 2º (nǐ hǎo soa "ní hǎo").',
      '不 vira bú antes de 4º tom; 一 vira yí antes de 4º e yì antes dos outros.',
    ],
    exemplos: [
      { hanzi: '你好', pinyin: 'nǐ hǎo', traducao: 'fala-se ní hǎo' },
      { hanzi: '不是', pinyin: 'bú shì', traducao: 'não é' },
      { hanzi: '一个', pinyin: 'yí gè', traducao: 'um (classificador)' },
      { hanzi: '一起', pinyin: 'yìqǐ', traducao: 'juntos' },
    ],
    saibaMais: '/pinyin/sandhi',
  },
];

let contador = 0;
const novoId = (prefixo: string) => `${prefixo}-${++contador}`;

/** "Ouça e escolha o tom" para uma sílaba (usa o caractere como áudio). */
export function itemTom(hanzi: string, pinyin: string, letras: string): ItemEscolha {
  const tom = tomDaSilaba(pinyin);
  return {
    id: novoId('tom'),
    tipo: 'escolha',
    modulo: 'tons',
    enunciado: 'Qual tom você ouviu?',
    pergunta: { audio: hanzi },
    opcoes: ([1, 2, 3, 4] as Tom[]).map((t) => ({ valor: String(t), rotulo: silabaComAcento(letras, t), pinyin: true })),
    correta: String(tom),
    tons: [tom],
    resposta: { hanzi, pinyin },
  };
}

/** "Ouça e escolha o pinyin" entre exemplos parecidos. */
function itemOuvirPinyin(alvo: ExemploSom, grupo: ExemploSom[], modulo: 'pinyin' | 'tons'): ItemEscolha {
  const opcoes = montarAlternativas(alvo, grupo, 4, (e) => e.pinyin);
  return {
    id: novoId('ouvir'),
    tipo: 'escolha',
    modulo,
    enunciado: 'Ouça e escolha o que foi dito',
    pergunta: { audio: alvo.hanzi },
    opcoes: opcoes.map((o) => ({ valor: o.pinyin, rotulo: o.pinyin, pinyin: true })),
    correta: alvo.pinyin,
    tons: [tomDaSilaba(alvo.pinyin)],
    resposta: { hanzi: alvo.hanzi, pinyin: alvo.pinyin },
  };
}

/** Exercícios de uma lição de pinyin (4–6 itens). */
export function exerciciosDaLicao(licao: LicaoPinyin): ItemEscolha[] {
  if (licao.id === 'tons') {
    const silabas: [string, string][] = [['妈', 'mā'], ['麻', 'má'], ['马', 'mǎ'], ['骂', 'mà'], ['八', 'bā'], ['十', 'shí'], ['五', 'wǔ'], ['四', 'sì']];
    return embaralhar(silabas)
      .slice(0, 6)
      .map(([h, p]) => itemTom(h, p, semTom(p)));
  }
  if (licao.id === 'sandhi') {
    return embaralhar(QUIZ_SANDHI)
      .slice(0, 4)
      .map((q) => ({
        id: novoId('sandhi'),
        tipo: 'escolha' as const,
        modulo: 'tons' as const,
        enunciado: q.pergunta,
        pergunta: { hanzi: q.hanzi, audio: q.hanzi },
        opcoes: q.opcoes.map((o) => ({ valor: o, rotulo: o, pinyin: true })),
        correta: q.correta,
        explicacao: q.explicacao,
      }));
  }
  const pares = PARES_SONS.filter((p) =>
    p.itens.every((i) => licao.exemplos.some((e) => e.pinyin.startsWith(i.pinyin.slice(0, 1)))),
  );
  const daLicao = embaralhar(licao.exemplos)
    .slice(0, 4)
    .map((alvo) => itemOuvirPinyin(alvo, licao.exemplos, 'pinyin'));
  const dePares = embaralhar(pares)
    .slice(0, 2)
    .map((p) => itemOuvirPinyin(embaralhar(p.itens)[0], p.itens, 'pinyin'));
  return embaralhar([...daLicao, ...dePares]);
}
