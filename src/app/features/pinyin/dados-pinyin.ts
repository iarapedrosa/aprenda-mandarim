import { Tom } from '../../core/pinyin/pinyin';

/** Um som de exemplo: o caractere é o que a voz vai ler. */
export interface ExemploSom {
  hanzi: string;
  pinyin: string;
  traducao?: string;
  traducaoEn?: string;
}

export interface Inicial {
  letra: string;
  exemplo: ExemploSom;
  dica: string;
  dicaEn?: string;
  /** par aspirado/não aspirado, se houver */
  aspirada?: boolean;
}

export interface GrupoIniciais {
  nome: string;
  nomeEn?: string;
  descricao: string;
  descricaoEn?: string;
  iniciais: Inicial[];
}

export const GRUPOS_INICIAIS: GrupoIniciais[] = [
  {
    nome: 'Lábios',
    descricao: 'b, p, m, f — feitos com os lábios.',
    nomeEn: 'Lips',
    descricaoEn: 'b, p, m, f — made with the lips.',
    iniciais: [
      { letra: 'b', exemplo: { hanzi: '波', pinyin: 'bō', traducao: 'onda', traducaoEn: 'wave' }, dica: 'Parece um "p" sem sopro. Não vibra a garganta como o "b" de "bola".', dicaEn: 'Like the "p" in "spin" — no puff of air, and not voiced like English "b".' },
      { letra: 'p', exemplo: { hanzi: '坡', pinyin: 'pō', traducao: 'ladeira', traducaoEn: 'slope' }, dica: '"p" com um sopro forte de ar. Com a mão na frente da boca, você sente o ar.', aspirada: true, dicaEn: 'Like the "p" in "pin" with a strong puff of air. Hold your hand in front of your mouth to feel it.' },
      { letra: 'm', exemplo: { hanzi: '摸', pinyin: 'mō', traducao: 'tocar', traducaoEn: 'to touch' }, dica: 'Igual ao "m" do português.', dicaEn: 'Same as English "m".' },
      { letra: 'f', exemplo: { hanzi: '佛', pinyin: 'fó', traducao: 'Buda', traducaoEn: 'Buddha' }, dica: 'Igual ao "f" do português.', dicaEn: 'Same as English "f".' },
    ],
  },
  {
    nome: 'Ponta da língua',
    descricao: 'd, t, n, l — ponta da língua atrás dos dentes de cima.',
    nomeEn: 'Tongue tip',
    descricaoEn: 'd, t, n, l — tongue tip behind the upper teeth.',
    iniciais: [
      { letra: 'd', exemplo: { hanzi: '德', pinyin: 'dé', traducao: 'virtude', traducaoEn: 'virtue' }, dica: 'Um "t" sem sopro, bem seco. Antes de "i" NÃO vira "dj": 弟 dì é "di", não "dji".', dicaEn: 'Like the "t" in "stop" — crisp, no puff of air.' },
      { letra: 't', exemplo: { hanzi: '特', pinyin: 'tè', traducao: 'especial', traducaoEn: 'special' }, dica: '"t" com sopro forte. Antes de "i" NÃO vira "tch": 天 tiān é "tiên", não "tchiên".', aspirada: true, dicaEn: 'Like the "t" in "top", with a strong puff of air.' },
      { letra: 'n', exemplo: { hanzi: '呢', pinyin: 'ne', traducao: '(partícula)', traducaoEn: '(particle)' }, dica: 'Igual ao "n" do português.', dicaEn: 'Same as English "n".' },
      { letra: 'l', exemplo: { hanzi: '拉', pinyin: 'lā', traducao: 'puxar', traducaoEn: 'to pull' }, dica: 'Igual ao "l" de "lua".', dicaEn: 'Same as English "l" in "let".' },
    ],
  },
  {
    nome: 'Fundo da boca',
    descricao: 'g, k, h — feitos com a parte de trás da língua.',
    nomeEn: 'Back of the mouth',
    descricaoEn: 'g, k, h — made with the back of the tongue.',
    iniciais: [
      { letra: 'g', exemplo: { hanzi: '哥', pinyin: 'gē', traducao: 'irmão mais velho', traducaoEn: 'older brother' }, dica: 'Um "k" sem sopro; soa como um "g" seco de "gato". Nunca vira "j" (gē não é "jê").', dicaEn: 'Like the "k" in "skin" — no puff of air.' },
      { letra: 'k', exemplo: { hanzi: '科', pinyin: 'kē', traducao: 'disciplina', traducaoEn: 'subject (of study)' }, dica: '"k" com sopro forte.', aspirada: true, dicaEn: 'Like the "k" in "kite", with a strong puff of air.' },
      { letra: 'h', exemplo: { hanzi: '喝', pinyin: 'hē', traducao: 'beber', traducaoEn: 'to drink' }, dica: 'Som raspado na garganta, parecido com o "r" de "rato" ou "carro" no sotaque carioca. Não é mudo!', dicaEn: 'Rough, from the throat — like the "ch" in Scottish "loch". Stronger than English "h".' },
    ],
  },
  {
    nome: 'Língua achatada',
    descricao: 'j, q, x — ponta da língua atrás dos dentes de BAIXO, lábios esticados.',
    nomeEn: 'Flat tongue',
    descricaoEn: 'j, q, x — tongue tip behind the LOWER teeth, lips spread.',
    iniciais: [
      { letra: 'j', exemplo: { hanzi: '机', pinyin: 'jī', traducao: 'máquina', traducaoEn: 'machine' }, dica: 'Parecido com o "dj" de "dia" (como se fala no Rio/SP), sem sopro. Não é o "j" de "já"!', dicaEn: 'Like the "j" in "jeep", but with the tongue tip down behind the lower teeth. No puff of air.' },
      { letra: 'q', exemplo: { hanzi: '七', pinyin: 'qī', traducao: 'sete', traducaoEn: 'seven' }, dica: 'Parecido com o "tch" de "tia" (tchia), com sopro forte. Nada a ver com o "q" de "queijo".', aspirada: true, dicaEn: 'Like the "ch" in "cheap", with the tongue tip down behind the lower teeth and a puff of air.' },
      { letra: 'x', exemplo: { hanzi: '西', pinyin: 'xī', traducao: 'oeste', traducaoEn: 'west' }, dica: 'Um chiado fino, entre "s" e "x" de "xícara", com a língua achatada e sorrindo.', dicaEn: 'Between "s" and "sh": tongue tip behind the lower teeth, lips spread in a smile.' },
    ],
  },
  {
    nome: 'Língua enrolada (retroflexas)',
    descricao: 'zh, ch, sh, r — ponta da língua curvada para trás, no céu da boca.',
    nomeEn: 'Curled tongue (retroflex)',
    descricaoEn: 'zh, ch, sh, r — tongue tip curled back to the roof of the mouth.',
    iniciais: [
      { letra: 'zh', exemplo: { hanzi: '知', pinyin: 'zhī', traducao: 'saber', traducaoEn: 'to know' }, dica: 'Como "dj", mas com a língua enrolada para trás. Sem sopro.', dicaEn: 'Like the "j" in "judge" but with the tongue curled back. No puff of air.' },
      { letra: 'ch', exemplo: { hanzi: '吃', pinyin: 'chī', traducao: 'comer', traducaoEn: 'to eat' }, dica: 'Como "tch", com a língua enrolada para trás e sopro forte.', aspirada: true, dicaEn: 'Like the "ch" in "church" with the tongue curled back and a strong puff of air.' },
      { letra: 'sh', exemplo: { hanzi: '诗', pinyin: 'shī', traducao: 'poema', traducaoEn: 'poem' }, dica: 'Como o "x" de "xícara", mas com a língua enrolada para trás. Mais "grosso" que o x do pinyin.', dicaEn: 'Like the "sh" in "shirt", tongue curled back.' },
      { letra: 'r', exemplo: { hanzi: '日', pinyin: 'rì', traducao: 'sol, dia', traducaoEn: 'sun; day' }, dica: 'Não é nenhum "r" do português! Fica entre o "j" de "já" e o "r" do inglês: língua enrolada, vibrando a voz.', dicaEn: 'Not the English "r": curl the tongue back like "sh" and add voice — close to the "s" in "pleasure".' },
    ],
  },
  {
    nome: 'Atrás dos dentes (sibilantes)',
    descricao: 'z, c, s — ponta da língua atrás dos dentes de cima.',
    nomeEn: 'Behind the teeth (sibilants)',
    descricaoEn: 'z, c, s — tongue tip behind the upper teeth.',
    iniciais: [
      { letra: 'z', exemplo: { hanzi: '资', pinyin: 'zī', traducao: 'recursos', traducaoEn: 'resources' }, dica: 'Como o "ds" de "cidades" falado rápido, sem sopro. Não é o "z" de "zebra".', dicaEn: 'Like the "ds" in "kids" — not like English "z".' },
      { letra: 'c', exemplo: { hanzi: '词', pinyin: 'cí', traducao: 'palavra', traducaoEn: 'word' }, dica: 'Como o "ts" de "tsunami", com sopro forte. Nunca "k" nem "s"!', aspirada: true, dicaEn: 'Like the "ts" in "cats", with a puff of air. Never "k" or "s"!' },
      { letra: 's', exemplo: { hanzi: '思', pinyin: 'sī', traducao: 'pensar', traducaoEn: 'to think' }, dica: 'Igual ao "s" de "sapo".', dicaEn: 'Same as English "s" in "sun".' },
    ],
  },
];

export interface Final {
  final: string;
  dicaEn?: string;
  /** como se escreve quando não há inicial (ex.: i → yi) */
  sozinha?: string;
  exemplo: ExemploSom;
  dica: string;
}

export interface GrupoFinais {
  nome: string;
  nomeEn?: string;
  descricao: string;
  descricaoEn?: string;
  finais: Final[];
}

export const GRUPOS_FINAIS: GrupoFinais[] = [
  {
    nome: 'Vogais simples',
    descricao: 'As seis vogais básicas.',
    nomeEn: 'Simple vowels',
    descricaoEn: 'The six basic vowels.',
    finais: [
      { final: 'a', exemplo: { hanzi: '八', pinyin: 'bā', traducao: 'oito', traducaoEn: 'eight' }, dica: '"a" aberto, como em "pá".', dicaEn: '"ah" as in "father".' },
      { final: 'o', exemplo: { hanzi: '我', pinyin: 'wǒ', traducao: 'eu', traducaoEn: 'I' }, dica: 'Soa quase como "uô". Depois de b, p, m, f aparece um "u" leve: bō ≈ "buô".', dicaEn: 'Close to "waw": after b, p, m, f a light "w" slips in (bō ≈ "bwaw").' },
      { final: 'e', exemplo: { hanzi: '饿', pinyin: 'è', traducao: 'com fome', traducaoEn: 'hungry' }, dica: 'NÃO é "é" nem "ê": diga "ô" sem arredondar os lábios. Som do fundo da garganta, parecido com "â".', dicaEn: 'Not "eh"! A "uh" from the back of the throat — like "duh", but further back.' },
      { final: 'i', sozinha: 'yi', exemplo: { hanzi: '一', pinyin: 'yī', traducao: 'um', traducaoEn: 'one' }, dica: '"i" de "vida". Atenção: em zhi, chi, shi, ri, zi, ci, si o "i" é só um zumbido da consoante.', dicaEn: '"ee" as in "see". Careful: in zhi, chi, shi, ri, zi, ci, si the i is just a buzz of the consonant.' },
      { final: 'u', sozinha: 'wu', exemplo: { hanzi: '五', pinyin: 'wǔ', traducao: 'cinco', traducaoEn: 'five' }, dica: '"u" de "lua", com bico.', dicaEn: '"oo" as in "food", with rounded lips.' },
      { final: 'ü', sozinha: 'yu', exemplo: { hanzi: '鱼', pinyin: 'yú', traducao: 'peixe', traducaoEn: 'fish' }, dica: 'Diga "i" e, sem mexer a língua, faça bico de "u". Depois de j, q, x, y escreve-se só "u" (qù, xué, yú).', dicaEn: 'Say "ee" and round your lips like "oo" without moving your tongue (like German ü). After j, q, x, y it is written just "u" (qù, xué, yú).' },
    ],
  },
  {
    nome: 'Vogais compostas',
    descricao: 'Duas vogais que deslizam uma na outra.',
    nomeEn: 'Compound vowels',
    descricaoEn: 'Two vowels gliding into each other.',
    finais: [
      { final: 'ai', exemplo: { hanzi: '爱', pinyin: 'ài', traducao: 'amar', traducaoEn: 'to love' }, dica: 'Como "ai" de "pai".', dicaEn: 'Like "eye".' },
      { final: 'ei', exemplo: { hanzi: '杯', pinyin: 'bēi', traducao: 'copo', traducaoEn: 'cup' }, dica: 'Como "ei" de "lei".', dicaEn: 'Like the "ay" in "say".' },
      { final: 'ao', exemplo: { hanzi: '好', pinyin: 'hǎo', traducao: 'bom', traducaoEn: 'good' }, dica: 'Como "au" de "mau". Nunca "ão"!', dicaEn: 'Like the "ow" in "cow".' },
      { final: 'ou', exemplo: { hanzi: '欧', pinyin: 'ōu', traducao: 'Europa', traducaoEn: 'Europe' }, dica: 'Como "ôu", com o "u" bem audível.', dicaEn: 'Like "oh".' },
      { final: 'er', exemplo: { hanzi: '二', pinyin: 'èr', traducao: 'dois', traducaoEn: 'two' }, dica: 'Um "âr" com a língua enrolada, parecido com o "r" caipira de "porta".', dicaEn: 'Like the American "are" with the tongue curled.' },
    ],
  },
  {
    nome: 'Nasais',
    descricao: 'Terminam em -n (ponta da língua) ou -ng (fundo da boca).',
    nomeEn: 'Nasals',
    descricaoEn: 'Ending in -n (tongue tip) or -ng (back of the mouth).',
    finais: [
      { final: 'an', exemplo: { hanzi: '安', pinyin: 'ān', traducao: 'paz', traducaoEn: 'peace' }, dica: 'Não é o "ã" do português: a ponta da língua toca atrás dos dentes no fim ("an-n").', dicaEn: '"ahn" with a clear n — not the "an" of "can".' },
      { final: 'en', exemplo: { hanzi: '恩', pinyin: 'ēn', traducao: 'gratidão', traducaoEn: 'gratitude' }, dica: 'Como "ân" com o "n" bem pronunciado.', dicaEn: 'Like the "un" in "taken".' },
      { final: 'ang', exemplo: { hanzi: '忙', pinyin: 'máng', traducao: 'ocupado', traducaoEn: 'busy' }, dica: '"a" aberto + som nasal no fundo da boca, como o "ng" de "gongo" sem dizer o "g".', dicaEn: '"ahng", nasal at the back of the mouth.' },
      { final: 'eng', exemplo: { hanzi: '风', pinyin: 'fēng', traducao: 'vento', traducaoEn: 'wind' }, dica: 'Como "âng".', dicaEn: 'Like the "ung" in "lung".' },
      { final: 'ong', exemplo: { hanzi: '东', pinyin: 'dōng', traducao: 'leste', traducaoEn: 'east' }, dica: 'Soa como "ung", com bico.', dicaEn: 'Like "oong", with rounded lips.' },
    ],
  },
  {
    nome: 'Começando com i',
    descricao: 'Sem consoante antes, o i vira y: ia → ya, ie → ye...',
    nomeEn: 'Starting with i',
    descricaoEn: 'With no consonant before, i is written y: ia → ya, ie → ye...',
    finais: [
      { final: 'ia', sozinha: 'ya', exemplo: { hanzi: '家', pinyin: 'jiā', traducao: 'casa', traducaoEn: 'home; house' }, dica: '"iá".', dicaEn: '"yah".' },
      { final: 'ie', sozinha: 'ye', exemplo: { hanzi: '谢', pinyin: 'xiè', traducao: 'agradecer', traducaoEn: 'to thank' }, dica: '"iê" — aqui o "e" soa "ê", não como o "e" sozinho.', dicaEn: '"yeh" — here e sounds like the "e" in "yes".' },
      { final: 'iao', sozinha: 'yao', exemplo: { hanzi: '小', pinyin: 'xiǎo', traducao: 'pequeno', traducaoEn: 'small' }, dica: '"iáu".', dicaEn: '"yow".' },
      { final: 'iu', sozinha: 'you', exemplo: { hanzi: '六', pinyin: 'liù', traducao: 'seis', traducaoEn: 'six' }, dica: 'É uma abreviação de "iou": liù soa "liôu".', dicaEn: 'Short for "iou": liù sounds like "lyoh".' },
      { final: 'ian', sozinha: 'yan', exemplo: { hanzi: '天', pinyin: 'tiān', traducao: 'céu, dia', traducaoEn: 'sky; day' }, dica: 'Armadilha: soa "iên", não "ian"!', dicaEn: 'Pitfall: it sounds "yen", not "yan"!' },
      { final: 'in', sozinha: 'yin', exemplo: { hanzi: '新', pinyin: 'xīn', traducao: 'novo', traducaoEn: 'new' }, dica: '"in" com o "n" na ponta da língua.', dicaEn: '"een" with the n at the tongue tip.' },
      { final: 'iang', sozinha: 'yang', exemplo: { hanzi: '想', pinyin: 'xiǎng', traducao: 'pensar, querer', traducaoEn: 'to think; to want' }, dica: '"iáng".', dicaEn: '"yahng".' },
      { final: 'ing', sozinha: 'ying', exemplo: { hanzi: '听', pinyin: 'tīng', traducao: 'ouvir', traducaoEn: 'to listen' }, dica: '"ing" no fundo da boca (às vezes soa "iâng").', dicaEn: 'Like the "ing" in "sing".' },
      { final: 'iong', sozinha: 'yong', exemplo: { hanzi: '熊', pinyin: 'xióng', traducao: 'urso', traducaoEn: 'bear' }, dica: '"iung".', dicaEn: '"yoong".' },
    ],
  },
  {
    nome: 'Começando com u',
    descricao: 'Sem consoante antes, o u vira w: ua → wa, uo → wo...',
    nomeEn: 'Starting with u',
    descricaoEn: 'With no consonant before, u is written w: ua → wa, uo → wo...',
    finais: [
      { final: 'ua', sozinha: 'wa', exemplo: { hanzi: '花', pinyin: 'huā', traducao: 'flor', traducaoEn: 'flower' }, dica: '"uá".', dicaEn: '"wah".' },
      { final: 'uo', sozinha: 'wo', exemplo: { hanzi: '多', pinyin: 'duō', traducao: 'muito', traducaoEn: 'many; much' }, dica: '"uô".', dicaEn: '"waw".' },
      { final: 'uai', sozinha: 'wai', exemplo: { hanzi: '快', pinyin: 'kuài', traducao: 'rápido', traducaoEn: 'fast' }, dica: '"uái".', dicaEn: 'Like "why".' },
      { final: 'ui', sozinha: 'wei', exemplo: { hanzi: '对', pinyin: 'duì', traducao: 'certo', traducaoEn: 'right; correct' }, dica: 'Abreviação de "uei": duì soa "duêi".', dicaEn: 'Short for "uei": duì sounds like "dway".' },
      { final: 'uan', sozinha: 'wan', exemplo: { hanzi: '关', pinyin: 'guān', traducao: 'fechar', traducaoEn: 'to close' }, dica: '"uan" com "n" bem pronunciado.', dicaEn: '"wahn".' },
      { final: 'un', sozinha: 'wen', exemplo: { hanzi: '春', pinyin: 'chūn', traducao: 'primavera', traducaoEn: 'spring' }, dica: 'Abreviação de "uen": chūn soa "tchuên".', dicaEn: 'Short for "uen": chūn sounds like "chwun".' },
      { final: 'uang', sozinha: 'wang', exemplo: { hanzi: '黄', pinyin: 'huáng', traducao: 'amarelo', traducaoEn: 'yellow' }, dica: '"uáng".', dicaEn: '"wahng".' },
      { final: 'ueng', sozinha: 'weng', exemplo: { hanzi: '翁', pinyin: 'wēng', traducao: 'velho (senhor)', traducaoEn: 'old man' }, dica: 'Só existe sozinha: wēng.', dicaEn: 'Only on its own: wēng.' },
    ],
  },
  {
    nome: 'Começando com ü',
    descricao: 'Depois de j, q, x e y, o ü perde os dois pontinhos (mas o som continua ü).',
    nomeEn: 'Starting with ü',
    descricaoEn: 'After j, q, x and y, ü loses its dots (but it still sounds ü).',
    finais: [
      { final: 'üe', sozinha: 'yue', exemplo: { hanzi: '学', pinyin: 'xué', traducao: 'estudar', traducaoEn: 'to study' }, dica: '"üê".', dicaEn: '"yweh" (ü + eh).' },
      { final: 'üan', sozinha: 'yuan', exemplo: { hanzi: '远', pinyin: 'yuǎn', traducao: 'longe', traducaoEn: 'far' }, dica: '"üén" — como o "ian", o "a" soa "ê".', dicaEn: '"ywen" — like ian, the a sounds "e".' },
      { final: 'ün', sozinha: 'yun', exemplo: { hanzi: '云', pinyin: 'yún', traducao: 'nuvem', traducaoEn: 'cloud' }, dica: '"ün".', dicaEn: '"ün" (rounded "een").' },
    ],
  },
];

/** Iniciais na ordem da tabela de sílabas ('' = sem inicial). */
export const INICIAIS_TABELA = [
  '', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h',
  'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's',
];

export const FINAIS_TABELA = [
  'a', 'o', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong', 'er',
  'ia', 'ie', 'iao', 'iu', 'ian', 'in', 'iang', 'ing', 'iong',
  'ua', 'uo', 'uai', 'ui', 'uan', 'un', 'uang', 'ueng', 'üe', 'üan', 'ün',
];

const SEM_INICIAL: Record<string, string> = {
  i: 'yi', ia: 'ya', ie: 'ye', iao: 'yao', iu: 'you', ian: 'yan', in: 'yin', iang: 'yang', ing: 'ying', iong: 'yong',
  u: 'wu', ua: 'wa', uo: 'wo', uai: 'wai', ui: 'wei', uan: 'wan', un: 'wen', uang: 'wang', ueng: 'weng',
  ü: 'yu', üe: 'yue', üan: 'yuan', ün: 'yun',
};

/** Como se escreve a combinação inicial + final (ex.: j + ü → ju; '' + i → yi). */
export function escreverSilaba(inicial: string, final: string): string {
  if (!inicial) return SEM_INICIAL[final] ?? final;
  if ('jqx'.includes(inicial) && final.startsWith('ü')) return inicial + 'u' + final.slice(1);
  return inicial + final;
}

// ---------------------------------------------------------------------------
// Tons
// ---------------------------------------------------------------------------

export interface InfoTom {
  tom: Tom;
  nome: string;
  nomeEn?: string;
  marca: string;
  resumo: string;
  resumoEn?: string;
  comparacao: string;
  comparacaoEn?: string;
  exemplo: ExemploSom;
}

export const TONS: InfoTom[] = [
  {
    tom: 1,
    nome: '1º tom',
    marca: 'ā',
    resumo: 'Alto e reto, sem subir nem descer.',
    comparacao: 'Como cantar uma nota aguda e segurar: "mããã…". Lembra o "biiip" de um aparelho.',
    nomeEn: 'Tone 1',
    resumoEn: 'High and level, no rise or fall.',
    comparacaoEn: 'Like singing and holding a high note: "maaa…". Think of a doctor\'s "say aaah".',
    exemplo: { hanzi: '妈', pinyin: 'mā', traducao: 'mãe', traducaoEn: 'mom' },
  },
  {
    tom: 2,
    nome: '2º tom',
    marca: 'á',
    resumo: 'Sobe, do meio para o alto.',
    comparacao: 'Como a pergunta de espanto "Hã?" ou "Sério?!".',
    nomeEn: 'Tone 2',
    resumoEn: 'Rising, from mid to high.',
    comparacaoEn: 'Like a surprised "What?" or "Huh?!".',
    exemplo: { hanzi: '麻', pinyin: 'má', traducao: 'cânhamo; dormente', traducaoEn: 'hemp; numb' },
  },
  {
    tom: 3,
    nome: '3º tom',
    marca: 'ǎ',
    resumo: 'Desce até o grave e volta a subir.',
    comparacao: 'Como um "Hmmm…" desconfiado. Na fala corrida, quase sempre só desce (fica grave).',
    nomeEn: 'Tone 3',
    resumoEn: 'Dips low and rises again.',
    comparacaoEn: 'Like a doubtful "Hmmm…" or "Well…". In connected speech it usually just stays low.',
    exemplo: { hanzi: '马', pinyin: 'mǎ', traducao: 'cavalo', traducaoEn: 'horse' },
  },
  {
    tom: 4,
    nome: '4º tom',
    marca: 'à',
    resumo: 'Cai rápido, do alto até o grave.',
    comparacao: 'Como uma ordem firme: "Para!", "Não!".',
    nomeEn: 'Tone 4',
    resumoEn: 'Falls sharply, from high to low.',
    comparacaoEn: 'Like a firm command: "Stop!", "No!".',
    exemplo: { hanzi: '骂', pinyin: 'mà', traducao: 'xingar', traducaoEn: 'to scold' },
  },
  {
    tom: 5,
    nome: 'Tom neutro',
    marca: 'a',
    resumo: 'Curto e leve, sem marca no pinyin.',
    comparacao: 'Como a sílaba fraca no fim de "pássaro". A altura depende da sílaba anterior.',
    nomeEn: 'Neutral tone',
    resumoEn: 'Short and light, no mark in pinyin.',
    comparacaoEn: 'Like the weak "a" in "sofa". Its pitch depends on the syllable before.',
    exemplo: { hanzi: '吗', pinyin: 'ma', traducao: '(partícula de pergunta)', traducaoEn: '(question particle)' },
  },
];

// ---------------------------------------------------------------------------
// Armadilhas para brasileiros
// ---------------------------------------------------------------------------

export interface Armadilha {
  titulo: string;
  tituloEn?: string;
  explicacao: string;
  exemplos: ExemploSom[];
}

export const ARMADILHAS: Armadilha[] = [
  {
    titulo: '"x" não é o "x" de xícara',
    explicacao:
      'O x do pinyin é um chiado mais fino e "sorridente": a ponta da língua fica atrás dos dentes de baixo e os lábios ficam esticados. Fica entre o "s" e o "x" do português. O "x" de xícara está mais perto do sh.',
    exemplos: [
      { hanzi: '谢谢', pinyin: 'xièxie', traducao: 'obrigado(a)', traducaoEn: 'thank you' },
      { hanzi: '学', pinyin: 'xué', traducao: 'estudar', traducaoEn: 'to study' },
      { hanzi: '小', pinyin: 'xiǎo', traducao: 'pequeno', traducaoEn: 'small' },
    ],
  },
  {
    titulo: 'O "r" de rì não é nenhum "r" nosso',
    explicacao:
      'Não é o "r" de "caro" nem o de "rato". Enrole a ponta da língua para trás (como no sh) e vibre a voz: o som fica entre o "j" de "já" e o "r" do inglês.',
    exemplos: [
      { hanzi: '日', pinyin: 'rì', traducao: 'sol, dia', traducaoEn: 'sun; day' },
      { hanzi: '热', pinyin: 'rè', traducao: 'quente', traducaoEn: 'hot' },
      { hanzi: '人', pinyin: 'rén', traducao: 'pessoa', traducaoEn: 'person' },
    ],
  },
  {
    titulo: 'O "ü" (e o u escondido depois de j, q, x, y)',
    explicacao:
      'Diga "i" e, sem mexer a língua, faça bico de "u". Depois de j, q, x e y os pontinhos somem (qù, xué, yú), mas o som continua sendo ü. Só depois de n e l eles aparecem, para diferenciar: nǚ (mulher) ≠ nǔ.',
    exemplos: [
      { hanzi: '女', pinyin: 'nǚ', traducao: 'mulher', traducaoEn: 'woman' },
      { hanzi: '绿', pinyin: 'lǜ', traducao: 'verde', traducaoEn: 'green' },
      { hanzi: '去', pinyin: 'qù', traducao: 'ir', traducaoEn: 'to go' },
      { hanzi: '路', pinyin: 'lù', traducao: 'caminho (com u normal)', traducaoEn: 'road (plain u)' },
    ],
  },
  {
    titulo: '"h" é raspado, não é mudo',
    explicacao:
      'O h do mandarim é raspado na garganta, parecido com o "r" de "rato" ou "carro" do sotaque carioca. Nunca deixe de pronunciá-lo.',
    exemplos: [
      { hanzi: '好', pinyin: 'hǎo', traducao: 'bom', traducaoEn: 'good' },
      { hanzi: '喝', pinyin: 'hē', traducao: 'beber', traducaoEn: 'to drink' },
      { hanzi: '汉语', pinyin: 'Hànyǔ', traducao: 'língua chinesa', traducaoEn: 'Chinese language' },
    ],
  },
  {
    titulo: 'b/p, d/t, g/k: a diferença é o sopro',
    explicacao:
      'Em português, "b" e "p" se diferenciam pela vibração da garganta. Em mandarim, b, d, g, j, zh, z são sem sopro, e p, t, k, q, ch, c têm um sopro forte (aspiração). Teste com uma folha de papel na frente da boca: ela deve mexer só nas aspiradas.',
    exemplos: [
      { hanzi: '爸', pinyin: 'bà', traducao: 'pai', traducaoEn: 'dad' },
      { hanzi: '怕', pinyin: 'pà', traducao: 'ter medo', traducaoEn: 'to be afraid' },
      { hanzi: '大', pinyin: 'dà', traducao: 'grande', traducaoEn: 'big' },
      { hanzi: '他', pinyin: 'tā', traducao: 'ele', traducaoEn: 'he' },
    ],
  },
  {
    titulo: '"ti" e "di" não viram "tchi" e "dji"',
    explicacao:
      'Muitos brasileiros falam "tia" como "tchia". Em mandarim, ti e di são sempre "ti" e "di" secos. Quem faz o som de "tch" é o q, e o de "dj" é o j.',
    exemplos: [
      { hanzi: '弟弟', pinyin: 'dìdi', traducao: 'irmão mais novo', traducaoEn: 'younger brother' },
      { hanzi: '天', pinyin: 'tiān', traducao: 'céu, dia', traducaoEn: 'sky; day' },
      { hanzi: '七', pinyin: 'qī', traducao: 'sete (este sim, "tchi")', traducaoEn: 'seven (this one is "chee")' },
    ],
  },
  {
    titulo: '"c" soa "ts"',
    explicacao: 'O c do pinyin é sempre "ts" com sopro, nunca "k" ou "s".',
    exemplos: [
      { hanzi: '菜', pinyin: 'cài', traducao: 'prato, verdura', traducaoEn: 'dish; vegetable' },
      { hanzi: '次', pinyin: 'cì', traducao: 'vez', traducaoEn: 'time (occurrence)' },
      { hanzi: '厕所', pinyin: 'cèsuǒ', traducao: 'banheiro', traducaoEn: 'restroom' },
    ],
  },
  {
    titulo: 'zh/ch/sh (língua enrolada) × z/c/s (língua reta)',
    explicacao:
      'Com a língua enrolada para trás o som fica mais "grosso"; com a língua atrás dos dentes, mais "fino". Trocar muda a palavra: shì (ser) × sì (quatro).',
    exemplos: [
      { hanzi: '是', pinyin: 'shì', traducao: 'ser', traducaoEn: 'to be' },
      { hanzi: '四', pinyin: 'sì', traducao: 'quatro', traducaoEn: 'four' },
      { hanzi: '知', pinyin: 'zhī', traducao: 'saber', traducaoEn: 'to know' },
      { hanzi: '资', pinyin: 'zī', traducao: 'recursos', traducaoEn: 'resources' },
    ],
  },
  {
    titulo: 'O "e" sozinho não é "é"',
    explicacao: 'Em hē, chē, è o e é um som do fundo da garganta, parecido com "â" ou um "ô" sem bico. Só em ie, üe e ei ele soa como "ê".',
    exemplos: [
      { hanzi: '饿', pinyin: 'è', traducao: 'com fome', traducaoEn: 'hungry' },
      { hanzi: '车', pinyin: 'chē', traducao: 'carro', traducaoEn: 'car' },
      { hanzi: '也', pinyin: 'yě', traducao: 'também (aqui é "iê")', traducaoEn: 'also (here it sounds "yeh")' },
    ],
  },
  {
    titulo: '"ao" é "au", e o "-n" não vira "ã"',
    explicacao:
      'hǎo é "hau", nunca "hão". E as finais em -n terminam com a língua encostando nos dentes: ān é "an-n", não o "ã" nasal do português.',
    exemplos: [
      { hanzi: '好', pinyin: 'hǎo', traducao: 'bom', traducaoEn: 'good' },
      { hanzi: '安', pinyin: 'ān', traducao: 'paz', traducaoEn: 'peace' },
      { hanzi: '看', pinyin: 'kàn', traducao: 'olhar', traducaoEn: 'to look' },
    ],
  },
  {
    titulo: '"ian" soa "iên"',
    explicacao: 'Na final ian (e em yan, üan), o a fica fechado, quase um "ê".',
    exemplos: [
      { hanzi: '钱', pinyin: 'qián', traducao: 'dinheiro', traducaoEn: 'money' },
      { hanzi: '见', pinyin: 'jiàn', traducao: 'ver', traducaoEn: 'to see' },
      { hanzi: '电', pinyin: 'diàn', traducao: 'eletricidade', traducaoEn: 'electricity' },
    ],
  },
  {
    titulo: 'O "i" de zi, ci, si, zhi, chi, shi, ri não é "i"',
    explicacao:
      'Depois dessas consoantes, o i só indica que a consoante se prolonga, como um zumbido. sì é quase "sz", shì é quase "shr".',
    exemplos: [
      { hanzi: '字', pinyin: 'zì', traducao: 'caractere', traducaoEn: 'character' },
      { hanzi: '是', pinyin: 'shì', traducao: 'ser', traducaoEn: 'to be' },
      { hanzi: '吃', pinyin: 'chī', traducao: 'comer', traducaoEn: 'to eat' },
    ],
  },
];

/** Armadilhas para quem fala inglês (versão em inglês do site). */
export const ARMADILHAS_EN: Armadilha[] = [
  {
    titulo: 'Tones are not intonation',
    explicacao:
      'In English, a rising pitch turns a sentence into a question. In Mandarin, pitch belongs to each word: mā (mom) and mǎ (horse) are different words. Keep each tone even at the end of a question — 吗 already does the asking.',
    exemplos: [
      { hanzi: '妈', pinyin: 'mā', traducao: 'mom' },
      { hanzi: '马', pinyin: 'mǎ', traducao: 'horse' },
      { hanzi: '你好吗？', pinyin: 'Nǐ hǎo ma?', traducao: 'How are you?' },
    ],
  },
  {
    titulo: 'b/d/g vs. p/t/k: the difference is the puff of air',
    explicacao:
      'English b/d/g are voiced; Mandarin b, d, g, j, zh, z are NOT — they sound like the p/t/k in "spin, stop, skin". p, t, k, q, ch, c have a strong puff of air, like the p/t/k in "pin, top, kite". Hold a sheet of paper in front of your mouth: it should only move for the aspirated ones.',
    exemplos: [
      { hanzi: '爸', pinyin: 'bà', traducao: 'dad' },
      { hanzi: '怕', pinyin: 'pà', traducao: 'to be afraid' },
      { hanzi: '大', pinyin: 'dà', traducao: 'big' },
      { hanzi: '他', pinyin: 'tā', traducao: 'he' },
    ],
  },
  {
    titulo: 'x, q, j are not English x, q, j',
    explicacao:
      'Put your tongue tip down behind your lower teeth and spread your lips: x is between "s" and "sh", q is like "ch" in "cheap", j is like "j" in "jeep". Never pronounce x as "ks" or q as "kw"!',
    exemplos: [
      { hanzi: '谢谢', pinyin: 'xièxie', traducao: 'thank you' },
      { hanzi: '七', pinyin: 'qī', traducao: 'seven' },
      { hanzi: '机', pinyin: 'jī', traducao: 'machine' },
    ],
  },
  {
    titulo: 'zh/ch/sh (curled) vs. j/q/x (flat) vs. z/c/s',
    explicacao:
      'Three different places: zh, ch, sh with the tongue curled back; j, q, x with the tongue flat behind the lower teeth; z, c, s with the tongue tip behind the upper teeth. Mixing them changes the word: shì (to be) × sì (four) × xì (play).',
    exemplos: [
      { hanzi: '是', pinyin: 'shì', traducao: 'to be' },
      { hanzi: '四', pinyin: 'sì', traducao: 'four' },
      { hanzi: '知', pinyin: 'zhī', traducao: 'to know' },
      { hanzi: '西', pinyin: 'xī', traducao: 'west' },
    ],
  },
  {
    titulo: 'c sounds "ts", z sounds "dz"',
    explicacao: 'The pinyin c is always "ts" with a puff of air (as in "cats"), never "k" or "s". The pinyin z is "ds" as in "kids", not English "z".',
    exemplos: [
      { hanzi: '菜', pinyin: 'cài', traducao: 'dish; vegetable' },
      { hanzi: '次', pinyin: 'cì', traducao: 'time (occurrence)' },
      { hanzi: '字', pinyin: 'zì', traducao: 'character' },
    ],
  },
  {
    titulo: 'The Mandarin r is not the English r',
    explicacao:
      'Curl your tongue back as for "sh" and add voice. It is closer to the "s" in "pleasure" or "vision" than to English "r". Don\'t round your lips.',
    exemplos: [
      { hanzi: '日', pinyin: 'rì', traducao: 'sun; day' },
      { hanzi: '热', pinyin: 'rè', traducao: 'hot' },
      { hanzi: '人', pinyin: 'rén', traducao: 'person' },
    ],
  },
  {
    titulo: 'ü — and the u that is secretly ü',
    explicacao:
      'Say "ee" and, without moving your tongue, round your lips as for "oo". After j, q, x and y the dots disappear (qù, xué, yú), but it is still ü. Only after n and l are the dots written: nǚ (woman) ≠ nǔ.',
    exemplos: [
      { hanzi: '女', pinyin: 'nǚ', traducao: 'woman' },
      { hanzi: '绿', pinyin: 'lǜ', traducao: 'green' },
      { hanzi: '去', pinyin: 'qù', traducao: 'to go' },
      { hanzi: '路', pinyin: 'lù', traducao: 'road (plain u)' },
    ],
  },
  {
    titulo: 'The e on its own is not "eh"',
    explicacao: 'In hē, chē, è the e is a "uh" from the back of the throat. It only sounds like "eh" in ie, üe and ei.',
    exemplos: [
      { hanzi: '饿', pinyin: 'è', traducao: 'hungry' },
      { hanzi: '车', pinyin: 'chē', traducao: 'car' },
      { hanzi: '也', pinyin: 'yě', traducao: 'also (here it sounds "yeh")' },
    ],
  },
  {
    titulo: 'ian sounds "yen", ui sounds "way", iu sounds "yo"',
    explicacao:
      'Pinyin spelling hides some vowels: ian is pronounced "yen"; ui is short for uei ("way"); iu is short for iou ("yo"); un is short for uen ("wun").',
    exemplos: [
      { hanzi: '天', pinyin: 'tiān', traducao: 'sky; day' },
      { hanzi: '对', pinyin: 'duì', traducao: 'right; correct' },
      { hanzi: '六', pinyin: 'liù', traducao: 'six' },
    ],
  },
  {
    titulo: 'The i in zi, ci, si, zhi, chi, shi, ri is not "ee"',
    explicacao: 'After these consonants, i just means the consonant is held, like a buzz. sì sounds like "sz", shì like "shr".',
    exemplos: [
      { hanzi: '字', pinyin: 'zì', traducao: 'character' },
      { hanzi: '是', pinyin: 'shì', traducao: 'to be' },
      { hanzi: '吃', pinyin: 'chī', traducao: 'to eat' },
    ],
  },
  {
    titulo: 'ao is "ow", ou is "oh", -n and -ng are different',
    explicacao: 'hǎo rhymes with "how". The finals -n (tongue tip touches the teeth) and -ng (back of the mouth) change the word: fàn (food) × fàng (to put).',
    exemplos: [
      { hanzi: '好', pinyin: 'hǎo', traducao: 'good' },
      { hanzi: '饭', pinyin: 'fàn', traducao: 'food; rice' },
      { hanzi: '放', pinyin: 'fàng', traducao: 'to put' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Sandhi tonal
// ---------------------------------------------------------------------------

export interface ExemploSandhi extends ExemploSom {
  /** como realmente se fala */
  falado: string;
  faladoEn?: string;
}

export interface RegraSandhi {
  id: string;
  titulo: string;
  tituloEn?: string;
  regra: string;
  regraEn?: string;
  detalhes: string[];
  detalhesEn?: string[];
  exemplos: ExemploSandhi[];
}

export const REGRAS_SANDHI: RegraSandhi[] = [
  {
    id: '3-3',
    titulo: '3º tom + 3º tom',
    regra: 'Quando dois 3º tons ficam juntos, o primeiro vira 2º tom.',
    tituloEn: 'Tone 3 + tone 3',
    regraEn: 'When two 3rd tones come together, the first becomes a 2nd tone.',
    detalhesEn: ['Pinyin still writes the 3rd tone — the change is only in speech.', 'Before a 1st, 2nd, 4th or neutral tone, the 3rd tone usually stays low (dips without rising): the "half 3rd tone".'],
    detalhes: [
      'No pinyin continua escrito com 3º tom — a mudança é só na fala.',
      'Antes de 1º, 2º, 4º ou neutro, o 3º tom costuma ficar só grave (desce e não sobe): é o "meio 3º tom".',
    ],
    exemplos: [
      { hanzi: '你好', pinyin: 'nǐ hǎo', falado: 'ní hǎo', traducao: 'olá', traducaoEn: 'hello' },
      { hanzi: '很好', pinyin: 'hěn hǎo', falado: 'hén hǎo', traducao: 'muito bem', traducaoEn: 'very well' },
      { hanzi: '可以', pinyin: 'kěyǐ', falado: 'kéyǐ', traducao: 'poder', traducaoEn: 'can; may' },
      { hanzi: '水果', pinyin: 'shuǐguǒ', falado: 'shuíguǒ', traducao: 'fruta', traducaoEn: 'fruit' },
      { hanzi: '老师', pinyin: 'lǎoshī', falado: 'lǎoshī (meio 3º tom)', faladoEn: 'lǎoshī (half 3rd tone)', traducao: 'professor(a)', traducaoEn: 'teacher' },
    ],
  },
  {
    id: 'bu',
    titulo: '不 (bù)',
    regra: '不 é 4º tom (bù), mas vira 2º tom (bú) antes de outro 4º tom.',
    tituloEn: '不 (bù)',
    regraEn: '不 is a 4th tone (bù), but becomes a 2nd tone (bú) before another 4th tone.',
    detalhesEn: ['Study materials usually write the change: bú shì, bú kèqi.', 'Between repeated words ("is it or not" questions) it becomes neutral: shì bu shì.'],
    detalhes: [
      'Nos materiais de estudo a mudança costuma vir escrita: bú shì, bú kèqi.',
      'Entre duas palavras repetidas (perguntas tipo "é ou não é") fica neutro: shì bu shì.',
    ],
    exemplos: [
      { hanzi: '不是', pinyin: 'bú shì', falado: 'bú shì', traducao: 'não é', traducaoEn: 'isn\'t' },
      { hanzi: '不客气', pinyin: 'bú kèqi', falado: 'bú kèqi', traducao: 'de nada', traducaoEn: 'you\'re welcome' },
      { hanzi: '不好', pinyin: 'bù hǎo', falado: 'bù hǎo', traducao: 'não é bom', traducaoEn: 'isn\'t good' },
      { hanzi: '不吃', pinyin: 'bù chī', falado: 'bù chī', traducao: 'não comer', traducaoEn: 'not eat' },
      { hanzi: '是不是', pinyin: 'shì bu shì', falado: 'shì bu shì', traducao: 'é ou não é?', traducaoEn: 'is it or not?' },
    ],
  },
  {
    id: 'yi',
    titulo: '一 (yī)',
    regra: '一 tem 1º tom quando está sozinho, em números e em ordinais; vira 2º tom antes de 4º tom e 4º tom antes dos outros tons.',
    tituloEn: '一 (yī)',
    regraEn: '一 is 1st tone on its own, in numbers and ordinals; it becomes 2nd tone before a 4th tone and 4th tone before other tones.',
    detalhesEn: ['yī: 一, 十一 (shíyī, eleven), 第一 (dì-yī, first).', 'yí before a 4th tone: 一个 yí gè, 一下 yíxià.', 'yì before 1st, 2nd and 3rd tones: 一天 yì tiān, 一年 yì nián, 一起 yìqǐ.', 'Between repeated verbs it becomes neutral: 看一看 kàn yi kàn.'],
    detalhes: [
      'yī: 一, 十一 (shíyī, onze), 第一 (dì-yī, primeiro).',
      'yí antes de 4º tom: 一个 yí gè, 一下 yíxià.',
      'yì antes de 1º, 2º e 3º tons: 一天 yì tiān, 一年 yì nián, 一起 yìqǐ.',
      'Entre verbos repetidos fica neutro: 看一看 kàn yi kàn.',
    ],
    exemplos: [
      { hanzi: '第一', pinyin: 'dì-yī', falado: 'dì-yī', traducao: 'primeiro', traducaoEn: 'first' },
      { hanzi: '一个', pinyin: 'yí gè', falado: 'yí gè', traducao: 'um (classificador)', traducaoEn: 'one (measure word)' },
      { hanzi: '一下', pinyin: 'yíxià', falado: 'yíxià', traducao: 'um pouco, uma vez', traducaoEn: 'a bit; once' },
      { hanzi: '一天', pinyin: 'yì tiān', falado: 'yì tiān', traducao: 'um dia', traducaoEn: 'one day' },
      { hanzi: '一起', pinyin: 'yìqǐ', falado: 'yìqǐ', traducao: 'juntos', traducaoEn: 'together' },
    ],
  },
];

export interface PerguntaSandhi {
  pergunta: string;
  perguntaEn?: string;
  explicacaoEn?: string;
  hanzi: string;
  opcoes: string[];
  correta: string;
  explicacao: string;
}

export const QUIZ_SANDHI: PerguntaSandhi[] = [
  { pergunta: 'Como se fala 不 em 不去 (não ir)?', perguntaEn: 'How is 不 said in 不去 (not go)?', hanzi: '不去', opcoes: ['bù', 'bú'], correta: 'bú', explicacao: '去 qù é 4º tom, então 不 vira bú.', explicacaoEn: '去 qù is a 4th tone, so 不 becomes bú.' },
  { pergunta: 'Como se fala 不 em 不忙 (não estar ocupado)?', perguntaEn: 'How is 不 said in 不忙 (not busy)?', hanzi: '不忙', opcoes: ['bù', 'bú'], correta: 'bù', explicacao: '忙 máng é 2º tom; 不 continua bù.', explicacaoEn: '忙 máng is a 2nd tone; 不 stays bù.' },
  { pergunta: 'Como se fala 一 em 一样 (igual)?', perguntaEn: 'How is 一 said in 一样 (the same)?', hanzi: '一样', opcoes: ['yī', 'yí', 'yì'], correta: 'yí', explicacao: '样 yàng é 4º tom, então 一 vira yí.', explicacaoEn: '样 yàng is a 4th tone, so 一 becomes yí.' },
  { pergunta: 'Como se fala 一 em 一杯 (um copo)?', perguntaEn: 'How is 一 said in 一杯 (one cup)?', hanzi: '一杯', opcoes: ['yī', 'yí', 'yì'], correta: 'yì', explicacao: '杯 bēi é 1º tom, então 一 vira yì.', explicacaoEn: '杯 bēi is a 1st tone, so 一 becomes yì.' },
  { pergunta: 'Como se fala 一 em 十一 (onze)?', perguntaEn: 'How is 一 said in 十一 (eleven)?', hanzi: '十一', opcoes: ['yī', 'yí', 'yì'], correta: 'yī', explicacao: 'Em números, 一 mantém o 1º tom.', explicacaoEn: 'In numbers, 一 keeps the 1st tone.' },
  { pergunta: 'Como se fala 你 em 你好?', perguntaEn: 'How is 你 said in 你好?', hanzi: '你好', opcoes: ['nǐ', 'ní'], correta: 'ní', explicacao: '3º + 3º: o primeiro vira 2º tom na fala (ní hǎo).', explicacaoEn: '3rd + 3rd: the first becomes a 2nd tone in speech (ní hǎo).' },
  { pergunta: 'Como se fala 很 em 很冷 (muito frio)?', perguntaEn: 'How is 很 said in 很冷 (very cold)?', hanzi: '很冷', opcoes: ['hěn', 'hén'], correta: 'hén', explicacao: '冷 lěng também é 3º tom, então 很 vira hén.', explicacaoEn: '冷 lěng is also a 3rd tone, so 很 becomes hén.' },
  { pergunta: 'Como se fala 不 em 不对 (não está certo)?', perguntaEn: 'How is 不 said in 不对 (not right)?', hanzi: '不对', opcoes: ['bù', 'bú'], correta: 'bú', explicacao: '对 duì é 4º tom, então 不 vira bú.', explicacaoEn: '对 duì is a 4th tone, so 不 becomes bú.' },
];

// ---------------------------------------------------------------------------
// Pares mínimos
// ---------------------------------------------------------------------------

export interface GrupoPares {
  id: string;
  titulo: string;
  tituloEn?: string;
  itens: ExemploSom[];
}

/** Mesma sílaba, tons diferentes. */
export const PARES_TONS: GrupoPares[] = [
  { id: 'ma', titulo: 'mā · má · mǎ · mà', itens: [
    { hanzi: '妈', pinyin: 'mā', traducao: 'mãe', traducaoEn: 'mom' }, { hanzi: '麻', pinyin: 'má', traducao: 'cânhamo', traducaoEn: 'hemp' },
    { hanzi: '马', pinyin: 'mǎ', traducao: 'cavalo', traducaoEn: 'horse' }, { hanzi: '骂', pinyin: 'mà', traducao: 'xingar', traducaoEn: 'to scold' } ] },
  { id: 'ba', titulo: 'bā · bá · bǎ · bà', itens: [
    { hanzi: '八', pinyin: 'bā', traducao: 'oito', traducaoEn: 'eight' }, { hanzi: '拔', pinyin: 'bá', traducao: 'arrancar', traducaoEn: 'to pull out' },
    { hanzi: '把', pinyin: 'bǎ', traducao: 'segurar', traducaoEn: 'to hold' }, { hanzi: '爸', pinyin: 'bà', traducao: 'pai', traducaoEn: 'dad' } ] },
  { id: 'yi', titulo: 'yī · yí · yǐ · yì', itens: [
    { hanzi: '衣', pinyin: 'yī', traducao: 'roupa', traducaoEn: 'clothes' }, { hanzi: '姨', pinyin: 'yí', traducao: 'tia', traducaoEn: 'aunt' },
    { hanzi: '椅', pinyin: 'yǐ', traducao: 'cadeira', traducaoEn: 'chair' }, { hanzi: '意', pinyin: 'yì', traducao: 'significado', traducaoEn: 'meaning' } ] },
  { id: 'shi', titulo: 'shī · shí · shǐ · shì', itens: [
    { hanzi: '诗', pinyin: 'shī', traducao: 'poema', traducaoEn: 'poem' }, { hanzi: '十', pinyin: 'shí', traducao: 'dez', traducaoEn: 'ten' },
    { hanzi: '史', pinyin: 'shǐ', traducao: 'história', traducaoEn: 'history' }, { hanzi: '是', pinyin: 'shì', traducao: 'ser', traducaoEn: 'to be' } ] },
  { id: 'wu', titulo: 'wū · wú · wǔ · wù', itens: [
    { hanzi: '屋', pinyin: 'wū', traducao: 'casa', traducaoEn: 'home; house' }, { hanzi: '无', pinyin: 'wú', traducao: 'sem', traducaoEn: 'without' },
    { hanzi: '五', pinyin: 'wǔ', traducao: 'cinco', traducaoEn: 'five' }, { hanzi: '雾', pinyin: 'wù', traducao: 'névoa', traducaoEn: 'fog' } ] },
  { id: 'tang', titulo: 'tāng · táng · tǎng · tàng', itens: [
    { hanzi: '汤', pinyin: 'tāng', traducao: 'sopa', traducaoEn: 'soup' }, { hanzi: '糖', pinyin: 'táng', traducao: 'açúcar', traducaoEn: 'sugar' },
    { hanzi: '躺', pinyin: 'tǎng', traducao: 'deitar', traducaoEn: 'to lie down' }, { hanzi: '烫', pinyin: 'tàng', traducao: 'escaldante', traducaoEn: 'scalding hot' } ] },
  { id: 'qi', titulo: 'qī · qí · qǐ · qì', itens: [
    { hanzi: '七', pinyin: 'qī', traducao: 'sete', traducaoEn: 'seven' }, { hanzi: '骑', pinyin: 'qí', traducao: 'montar', traducaoEn: 'to ride' },
    { hanzi: '起', pinyin: 'qǐ', traducao: 'levantar', traducaoEn: 'to rise' }, { hanzi: '气', pinyin: 'qì', traducao: 'ar', traducaoEn: 'air' } ] },
  { id: 'tu', titulo: 'tū · tú · tǔ · tù', itens: [
    { hanzi: '突', pinyin: 'tū', traducao: 'de repente', traducaoEn: 'suddenly' }, { hanzi: '图', pinyin: 'tú', traducao: 'figura', traducaoEn: 'picture' },
    { hanzi: '土', pinyin: 'tǔ', traducao: 'terra', traducaoEn: 'earth; soil' }, { hanzi: '兔', pinyin: 'tù', traducao: 'coelho', traducaoEn: 'rabbit' } ] },
  { id: 'yan', titulo: 'yān · yán · yǎn · yàn', itens: [
    { hanzi: '烟', pinyin: 'yān', traducao: 'fumaça', traducaoEn: 'smoke' }, { hanzi: '盐', pinyin: 'yán', traducao: 'sal', traducaoEn: 'salt' },
    { hanzi: '眼', pinyin: 'yǎn', traducao: 'olho', traducaoEn: 'eye' }, { hanzi: '验', pinyin: 'yàn', traducao: 'examinar', traducaoEn: 'to examine' } ] },
  { id: 'mai', titulo: 'mǎi × mài (comprar × vender)', tituloEn: 'mǎi × mài (buy × sell)', itens: [
    { hanzi: '买', pinyin: 'mǎi', traducao: 'comprar', traducaoEn: 'to buy' }, { hanzi: '卖', pinyin: 'mài', traducao: 'vender', traducaoEn: 'to sell' } ] },
];

/** Mesmo tom, sons parecidos que confundem brasileiros. */
export const PARES_SONS: GrupoPares[] = [
  { id: 'shi-si', titulo: 'shì × sì', itens: [{ hanzi: '是', pinyin: 'shì', traducao: 'ser', traducaoEn: 'to be' }, { hanzi: '四', pinyin: 'sì', traducao: 'quatro', traducaoEn: 'four' }] },
  { id: 'zhi-zi', titulo: 'zhī × zī', itens: [{ hanzi: '知', pinyin: 'zhī', traducao: 'saber', traducaoEn: 'to know' }, { hanzi: '资', pinyin: 'zī', traducao: 'recursos', traducaoEn: 'resources' }] },
  { id: 'chu-cu', titulo: 'chū × cū', itens: [{ hanzi: '出', pinyin: 'chū', traducao: 'sair', traducaoEn: 'to go out' }, { hanzi: '粗', pinyin: 'cū', traducao: 'grosso', traducaoEn: 'thick' }] },
  { id: 'xi-shi', titulo: 'xī × shī', itens: [{ hanzi: '西', pinyin: 'xī', traducao: 'oeste', traducaoEn: 'west' }, { hanzi: '诗', pinyin: 'shī', traducao: 'poema', traducaoEn: 'poem' }] },
  { id: 'qi-chi', titulo: 'qī × chī', itens: [{ hanzi: '七', pinyin: 'qī', traducao: 'sete', traducaoEn: 'seven' }, { hanzi: '吃', pinyin: 'chī', traducao: 'comer', traducaoEn: 'to eat' }] },
  { id: 'ji-zhi', titulo: 'jī × zhī', itens: [{ hanzi: '机', pinyin: 'jī', traducao: 'máquina', traducaoEn: 'machine' }, { hanzi: '知', pinyin: 'zhī', traducao: 'saber', traducaoEn: 'to know' }] },
  { id: 'nu-nv', titulo: 'nǚ × nǔ', itens: [{ hanzi: '女', pinyin: 'nǚ', traducao: 'mulher', traducaoEn: 'woman' }, { hanzi: '努', pinyin: 'nǔ', traducao: 'esforçar-se', traducaoEn: 'to strive' }] },
  { id: 'lu-lv', titulo: 'lù × lǜ', itens: [{ hanzi: '路', pinyin: 'lù', traducao: 'caminho', traducaoEn: 'road' }, { hanzi: '绿', pinyin: 'lǜ', traducao: 'verde', traducaoEn: 'green' }] },
  { id: 'ba-pa', titulo: 'bà × pà', itens: [{ hanzi: '爸', pinyin: 'bà', traducao: 'pai', traducaoEn: 'dad' }, { hanzi: '怕', pinyin: 'pà', traducao: 'ter medo', traducaoEn: 'to be afraid' }] },
  { id: 'da-ta', titulo: 'dā × tā', itens: [{ hanzi: '搭', pinyin: 'dā', traducao: 'montar, pegar (carona)', traducaoEn: 'to put up; to catch (a ride)' }, { hanzi: '他', pinyin: 'tā', traducao: 'ele', traducaoEn: 'he' }] },
  { id: 'rang-lang', titulo: 'ràng × làng', itens: [{ hanzi: '让', pinyin: 'ràng', traducao: 'deixar, permitir', traducaoEn: 'to let; to allow' }, { hanzi: '浪', pinyin: 'làng', traducao: 'onda', traducaoEn: 'wave' }] },
  { id: 'an-ang', titulo: 'fàn × fàng', itens: [{ hanzi: '饭', pinyin: 'fàn', traducao: 'comida', traducaoEn: 'food; rice' }, { hanzi: '放', pinyin: 'fàng', traducao: 'colocar', traducaoEn: 'to put' }] },
  { id: 'in-ing', titulo: 'xīn × xīng', itens: [{ hanzi: '新', pinyin: 'xīn', traducao: 'novo', traducaoEn: 'new' }, { hanzi: '星', pinyin: 'xīng', traducao: 'estrela', traducaoEn: 'star' }] },
];
