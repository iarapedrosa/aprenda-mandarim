import { Tom } from '../../core/pinyin/pinyin';

/** Um som de exemplo: o caractere é o que a voz vai ler. */
export interface ExemploSom {
  hanzi: string;
  pinyin: string;
  traducao?: string;
}

export interface Inicial {
  letra: string;
  exemplo: ExemploSom;
  dica: string;
  /** par aspirado/não aspirado, se houver */
  aspirada?: boolean;
}

export interface GrupoIniciais {
  nome: string;
  descricao: string;
  iniciais: Inicial[];
}

export const GRUPOS_INICIAIS: GrupoIniciais[] = [
  {
    nome: 'Lábios',
    descricao: 'b, p, m, f — feitos com os lábios.',
    iniciais: [
      { letra: 'b', exemplo: { hanzi: '波', pinyin: 'bō', traducao: 'onda' }, dica: 'Parece um "p" sem sopro. Não vibra a garganta como o "b" de "bola".' },
      { letra: 'p', exemplo: { hanzi: '坡', pinyin: 'pō', traducao: 'ladeira' }, dica: '"p" com um sopro forte de ar. Com a mão na frente da boca, você sente o ar.', aspirada: true },
      { letra: 'm', exemplo: { hanzi: '摸', pinyin: 'mō', traducao: 'tocar' }, dica: 'Igual ao "m" do português.' },
      { letra: 'f', exemplo: { hanzi: '佛', pinyin: 'fó', traducao: 'Buda' }, dica: 'Igual ao "f" do português.' },
    ],
  },
  {
    nome: 'Ponta da língua',
    descricao: 'd, t, n, l — ponta da língua atrás dos dentes de cima.',
    iniciais: [
      { letra: 'd', exemplo: { hanzi: '德', pinyin: 'dé', traducao: 'virtude' }, dica: 'Um "t" sem sopro, bem seco. Antes de "i" NÃO vira "dj": 弟 dì é "di", não "dji".' },
      { letra: 't', exemplo: { hanzi: '特', pinyin: 'tè', traducao: 'especial' }, dica: '"t" com sopro forte. Antes de "i" NÃO vira "tch": 天 tiān é "tiên", não "tchiên".', aspirada: true },
      { letra: 'n', exemplo: { hanzi: '呢', pinyin: 'ne', traducao: '(partícula)' }, dica: 'Igual ao "n" do português.' },
      { letra: 'l', exemplo: { hanzi: '拉', pinyin: 'lā', traducao: 'puxar' }, dica: 'Igual ao "l" de "lua".' },
    ],
  },
  {
    nome: 'Fundo da boca',
    descricao: 'g, k, h — feitos com a parte de trás da língua.',
    iniciais: [
      { letra: 'g', exemplo: { hanzi: '哥', pinyin: 'gē', traducao: 'irmão mais velho' }, dica: 'Um "k" sem sopro; soa como um "g" seco de "gato". Nunca vira "j" (gē não é "jê").' },
      { letra: 'k', exemplo: { hanzi: '科', pinyin: 'kē', traducao: 'disciplina' }, dica: '"k" com sopro forte.', aspirada: true },
      { letra: 'h', exemplo: { hanzi: '喝', pinyin: 'hē', traducao: 'beber' }, dica: 'Som raspado na garganta, parecido com o "r" de "rato" ou "carro" no sotaque carioca. Não é mudo!' },
    ],
  },
  {
    nome: 'Língua achatada',
    descricao: 'j, q, x — ponta da língua atrás dos dentes de BAIXO, lábios esticados.',
    iniciais: [
      { letra: 'j', exemplo: { hanzi: '机', pinyin: 'jī', traducao: 'máquina' }, dica: 'Parecido com o "dj" de "dia" (como se fala no Rio/SP), sem sopro. Não é o "j" de "já"!' },
      { letra: 'q', exemplo: { hanzi: '七', pinyin: 'qī', traducao: 'sete' }, dica: 'Parecido com o "tch" de "tia" (tchia), com sopro forte. Nada a ver com o "q" de "queijo".', aspirada: true },
      { letra: 'x', exemplo: { hanzi: '西', pinyin: 'xī', traducao: 'oeste' }, dica: 'Um chiado fino, entre "s" e "x" de "xícara", com a língua achatada e sorrindo.' },
    ],
  },
  {
    nome: 'Língua enrolada (retroflexas)',
    descricao: 'zh, ch, sh, r — ponta da língua curvada para trás, no céu da boca.',
    iniciais: [
      { letra: 'zh', exemplo: { hanzi: '知', pinyin: 'zhī', traducao: 'saber' }, dica: 'Como "dj", mas com a língua enrolada para trás. Sem sopro.' },
      { letra: 'ch', exemplo: { hanzi: '吃', pinyin: 'chī', traducao: 'comer' }, dica: 'Como "tch", com a língua enrolada para trás e sopro forte.', aspirada: true },
      { letra: 'sh', exemplo: { hanzi: '诗', pinyin: 'shī', traducao: 'poema' }, dica: 'Como o "x" de "xícara", mas com a língua enrolada para trás. Mais "grosso" que o x do pinyin.' },
      { letra: 'r', exemplo: { hanzi: '日', pinyin: 'rì', traducao: 'sol, dia' }, dica: 'Não é nenhum "r" do português! Fica entre o "j" de "já" e o "r" do inglês: língua enrolada, vibrando a voz.' },
    ],
  },
  {
    nome: 'Atrás dos dentes (sibilantes)',
    descricao: 'z, c, s — ponta da língua atrás dos dentes de cima.',
    iniciais: [
      { letra: 'z', exemplo: { hanzi: '资', pinyin: 'zī', traducao: 'recursos' }, dica: 'Como o "ds" de "cidades" falado rápido, sem sopro. Não é o "z" de "zebra".' },
      { letra: 'c', exemplo: { hanzi: '词', pinyin: 'cí', traducao: 'palavra' }, dica: 'Como o "ts" de "tsunami", com sopro forte. Nunca "k" nem "s"!', aspirada: true },
      { letra: 's', exemplo: { hanzi: '思', pinyin: 'sī', traducao: 'pensar' }, dica: 'Igual ao "s" de "sapo".' },
    ],
  },
];

export interface Final {
  final: string;
  /** como se escreve quando não há inicial (ex.: i → yi) */
  sozinha?: string;
  exemplo: ExemploSom;
  dica: string;
}

export interface GrupoFinais {
  nome: string;
  descricao: string;
  finais: Final[];
}

export const GRUPOS_FINAIS: GrupoFinais[] = [
  {
    nome: 'Vogais simples',
    descricao: 'As seis vogais básicas.',
    finais: [
      { final: 'a', exemplo: { hanzi: '八', pinyin: 'bā', traducao: 'oito' }, dica: '"a" aberto, como em "pá".' },
      { final: 'o', exemplo: { hanzi: '我', pinyin: 'wǒ', traducao: 'eu' }, dica: 'Soa quase como "uô". Depois de b, p, m, f aparece um "u" leve: bō ≈ "buô".' },
      { final: 'e', exemplo: { hanzi: '饿', pinyin: 'è', traducao: 'com fome' }, dica: 'NÃO é "é" nem "ê": diga "ô" sem arredondar os lábios. Som do fundo da garganta, parecido com "â".' },
      { final: 'i', sozinha: 'yi', exemplo: { hanzi: '一', pinyin: 'yī', traducao: 'um' }, dica: '"i" de "vida". Atenção: em zhi, chi, shi, ri, zi, ci, si o "i" é só um zumbido da consoante.' },
      { final: 'u', sozinha: 'wu', exemplo: { hanzi: '五', pinyin: 'wǔ', traducao: 'cinco' }, dica: '"u" de "lua", com bico.' },
      { final: 'ü', sozinha: 'yu', exemplo: { hanzi: '鱼', pinyin: 'yú', traducao: 'peixe' }, dica: 'Diga "i" e, sem mexer a língua, faça bico de "u". Depois de j, q, x, y escreve-se só "u" (qù, xué, yú).' },
    ],
  },
  {
    nome: 'Vogais compostas',
    descricao: 'Duas vogais que deslizam uma na outra.',
    finais: [
      { final: 'ai', exemplo: { hanzi: '爱', pinyin: 'ài', traducao: 'amar' }, dica: 'Como "ai" de "pai".' },
      { final: 'ei', exemplo: { hanzi: '杯', pinyin: 'bēi', traducao: 'copo' }, dica: 'Como "ei" de "lei".' },
      { final: 'ao', exemplo: { hanzi: '好', pinyin: 'hǎo', traducao: 'bom' }, dica: 'Como "au" de "mau". Nunca "ão"!' },
      { final: 'ou', exemplo: { hanzi: '欧', pinyin: 'ōu', traducao: 'Europa' }, dica: 'Como "ôu", com o "u" bem audível.' },
      { final: 'er', exemplo: { hanzi: '二', pinyin: 'èr', traducao: 'dois' }, dica: 'Um "âr" com a língua enrolada, parecido com o "r" caipira de "porta".' },
    ],
  },
  {
    nome: 'Nasais',
    descricao: 'Terminam em -n (ponta da língua) ou -ng (fundo da boca).',
    finais: [
      { final: 'an', exemplo: { hanzi: '安', pinyin: 'ān', traducao: 'paz' }, dica: 'Não é o "ã" do português: a ponta da língua toca atrás dos dentes no fim ("an-n").' },
      { final: 'en', exemplo: { hanzi: '恩', pinyin: 'ēn', traducao: 'gratidão' }, dica: 'Como "ân" com o "n" bem pronunciado.' },
      { final: 'ang', exemplo: { hanzi: '忙', pinyin: 'máng', traducao: 'ocupado' }, dica: '"a" aberto + som nasal no fundo da boca, como o "ng" de "gongo" sem dizer o "g".' },
      { final: 'eng', exemplo: { hanzi: '风', pinyin: 'fēng', traducao: 'vento' }, dica: 'Como "âng".' },
      { final: 'ong', exemplo: { hanzi: '东', pinyin: 'dōng', traducao: 'leste' }, dica: 'Soa como "ung", com bico.' },
    ],
  },
  {
    nome: 'Começando com i',
    descricao: 'Sem consoante antes, o i vira y: ia → ya, ie → ye...',
    finais: [
      { final: 'ia', sozinha: 'ya', exemplo: { hanzi: '家', pinyin: 'jiā', traducao: 'casa' }, dica: '"iá".' },
      { final: 'ie', sozinha: 'ye', exemplo: { hanzi: '谢', pinyin: 'xiè', traducao: 'agradecer' }, dica: '"iê" — aqui o "e" soa "ê", não como o "e" sozinho.' },
      { final: 'iao', sozinha: 'yao', exemplo: { hanzi: '小', pinyin: 'xiǎo', traducao: 'pequeno' }, dica: '"iáu".' },
      { final: 'iu', sozinha: 'you', exemplo: { hanzi: '六', pinyin: 'liù', traducao: 'seis' }, dica: 'É uma abreviação de "iou": liù soa "liôu".' },
      { final: 'ian', sozinha: 'yan', exemplo: { hanzi: '天', pinyin: 'tiān', traducao: 'céu, dia' }, dica: 'Armadilha: soa "iên", não "ian"!' },
      { final: 'in', sozinha: 'yin', exemplo: { hanzi: '新', pinyin: 'xīn', traducao: 'novo' }, dica: '"in" com o "n" na ponta da língua.' },
      { final: 'iang', sozinha: 'yang', exemplo: { hanzi: '想', pinyin: 'xiǎng', traducao: 'pensar, querer' }, dica: '"iáng".' },
      { final: 'ing', sozinha: 'ying', exemplo: { hanzi: '听', pinyin: 'tīng', traducao: 'ouvir' }, dica: '"ing" no fundo da boca (às vezes soa "iâng").' },
      { final: 'iong', sozinha: 'yong', exemplo: { hanzi: '熊', pinyin: 'xióng', traducao: 'urso' }, dica: '"iung".' },
    ],
  },
  {
    nome: 'Começando com u',
    descricao: 'Sem consoante antes, o u vira w: ua → wa, uo → wo...',
    finais: [
      { final: 'ua', sozinha: 'wa', exemplo: { hanzi: '花', pinyin: 'huā', traducao: 'flor' }, dica: '"uá".' },
      { final: 'uo', sozinha: 'wo', exemplo: { hanzi: '多', pinyin: 'duō', traducao: 'muito' }, dica: '"uô".' },
      { final: 'uai', sozinha: 'wai', exemplo: { hanzi: '快', pinyin: 'kuài', traducao: 'rápido' }, dica: '"uái".' },
      { final: 'ui', sozinha: 'wei', exemplo: { hanzi: '对', pinyin: 'duì', traducao: 'certo' }, dica: 'Abreviação de "uei": duì soa "duêi".' },
      { final: 'uan', sozinha: 'wan', exemplo: { hanzi: '关', pinyin: 'guān', traducao: 'fechar' }, dica: '"uan" com "n" bem pronunciado.' },
      { final: 'un', sozinha: 'wen', exemplo: { hanzi: '春', pinyin: 'chūn', traducao: 'primavera' }, dica: 'Abreviação de "uen": chūn soa "tchuên".' },
      { final: 'uang', sozinha: 'wang', exemplo: { hanzi: '黄', pinyin: 'huáng', traducao: 'amarelo' }, dica: '"uáng".' },
      { final: 'ueng', sozinha: 'weng', exemplo: { hanzi: '翁', pinyin: 'wēng', traducao: 'velho (senhor)' }, dica: 'Só existe sozinha: wēng.' },
    ],
  },
  {
    nome: 'Começando com ü',
    descricao: 'Depois de j, q, x e y, o ü perde os dois pontinhos (mas o som continua ü).',
    finais: [
      { final: 'üe', sozinha: 'yue', exemplo: { hanzi: '学', pinyin: 'xué', traducao: 'estudar' }, dica: '"üê".' },
      { final: 'üan', sozinha: 'yuan', exemplo: { hanzi: '远', pinyin: 'yuǎn', traducao: 'longe' }, dica: '"üén" — como o "ian", o "a" soa "ê".' },
      { final: 'ün', sozinha: 'yun', exemplo: { hanzi: '云', pinyin: 'yún', traducao: 'nuvem' }, dica: '"ün".' },
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
  marca: string;
  resumo: string;
  comparacao: string;
  exemplo: ExemploSom;
}

export const TONS: InfoTom[] = [
  {
    tom: 1,
    nome: '1º tom',
    marca: 'ā',
    resumo: 'Alto e reto, sem subir nem descer.',
    comparacao: 'Como cantar uma nota aguda e segurar: "mããã…". Lembra o "biiip" de um aparelho.',
    exemplo: { hanzi: '妈', pinyin: 'mā', traducao: 'mãe' },
  },
  {
    tom: 2,
    nome: '2º tom',
    marca: 'á',
    resumo: 'Sobe, do meio para o alto.',
    comparacao: 'Como a pergunta de espanto "Hã?" ou "Sério?!".',
    exemplo: { hanzi: '麻', pinyin: 'má', traducao: 'cânhamo; dormente' },
  },
  {
    tom: 3,
    nome: '3º tom',
    marca: 'ǎ',
    resumo: 'Desce até o grave e volta a subir.',
    comparacao: 'Como um "Hmmm…" desconfiado. Na fala corrida, quase sempre só desce (fica grave).',
    exemplo: { hanzi: '马', pinyin: 'mǎ', traducao: 'cavalo' },
  },
  {
    tom: 4,
    nome: '4º tom',
    marca: 'à',
    resumo: 'Cai rápido, do alto até o grave.',
    comparacao: 'Como uma ordem firme: "Para!", "Não!".',
    exemplo: { hanzi: '骂', pinyin: 'mà', traducao: 'xingar' },
  },
  {
    tom: 5,
    nome: 'Tom neutro',
    marca: 'a',
    resumo: 'Curto e leve, sem marca no pinyin.',
    comparacao: 'Como a sílaba fraca no fim de "pássaro". A altura depende da sílaba anterior.',
    exemplo: { hanzi: '吗', pinyin: 'ma', traducao: '(partícula de pergunta)' },
  },
];

// ---------------------------------------------------------------------------
// Armadilhas para brasileiros
// ---------------------------------------------------------------------------

export interface Armadilha {
  titulo: string;
  explicacao: string;
  exemplos: ExemploSom[];
}

export const ARMADILHAS: Armadilha[] = [
  {
    titulo: '"x" não é o "x" de xícara',
    explicacao:
      'O x do pinyin é um chiado mais fino e "sorridente": a ponta da língua fica atrás dos dentes de baixo e os lábios ficam esticados. Fica entre o "s" e o "x" do português. O "x" de xícara está mais perto do sh.',
    exemplos: [
      { hanzi: '谢谢', pinyin: 'xièxie', traducao: 'obrigado(a)' },
      { hanzi: '学', pinyin: 'xué', traducao: 'estudar' },
      { hanzi: '小', pinyin: 'xiǎo', traducao: 'pequeno' },
    ],
  },
  {
    titulo: 'O "r" de rì não é nenhum "r" nosso',
    explicacao:
      'Não é o "r" de "caro" nem o de "rato". Enrole a ponta da língua para trás (como no sh) e vibre a voz: o som fica entre o "j" de "já" e o "r" do inglês.',
    exemplos: [
      { hanzi: '日', pinyin: 'rì', traducao: 'sol, dia' },
      { hanzi: '热', pinyin: 'rè', traducao: 'quente' },
      { hanzi: '人', pinyin: 'rén', traducao: 'pessoa' },
    ],
  },
  {
    titulo: 'O "ü" (e o u escondido depois de j, q, x, y)',
    explicacao:
      'Diga "i" e, sem mexer a língua, faça bico de "u". Depois de j, q, x e y os pontinhos somem (qù, xué, yú), mas o som continua sendo ü. Só depois de n e l eles aparecem, para diferenciar: nǚ (mulher) ≠ nǔ.',
    exemplos: [
      { hanzi: '女', pinyin: 'nǚ', traducao: 'mulher' },
      { hanzi: '绿', pinyin: 'lǜ', traducao: 'verde' },
      { hanzi: '去', pinyin: 'qù', traducao: 'ir' },
      { hanzi: '路', pinyin: 'lù', traducao: 'caminho (com u normal)' },
    ],
  },
  {
    titulo: '"h" é raspado, não é mudo',
    explicacao:
      'O h do mandarim é raspado na garganta, parecido com o "r" de "rato" ou "carro" do sotaque carioca. Nunca deixe de pronunciá-lo.',
    exemplos: [
      { hanzi: '好', pinyin: 'hǎo', traducao: 'bom' },
      { hanzi: '喝', pinyin: 'hē', traducao: 'beber' },
      { hanzi: '汉语', pinyin: 'Hànyǔ', traducao: 'língua chinesa' },
    ],
  },
  {
    titulo: 'b/p, d/t, g/k: a diferença é o sopro',
    explicacao:
      'Em português, "b" e "p" se diferenciam pela vibração da garganta. Em mandarim, b, d, g, j, zh, z são sem sopro, e p, t, k, q, ch, c têm um sopro forte (aspiração). Teste com uma folha de papel na frente da boca: ela deve mexer só nas aspiradas.',
    exemplos: [
      { hanzi: '爸', pinyin: 'bà', traducao: 'pai' },
      { hanzi: '怕', pinyin: 'pà', traducao: 'ter medo' },
      { hanzi: '大', pinyin: 'dà', traducao: 'grande' },
      { hanzi: '他', pinyin: 'tā', traducao: 'ele' },
    ],
  },
  {
    titulo: '"ti" e "di" não viram "tchi" e "dji"',
    explicacao:
      'Muitos brasileiros falam "tia" como "tchia". Em mandarim, ti e di são sempre "ti" e "di" secos. Quem faz o som de "tch" é o q, e o de "dj" é o j.',
    exemplos: [
      { hanzi: '弟弟', pinyin: 'dìdi', traducao: 'irmão mais novo' },
      { hanzi: '天', pinyin: 'tiān', traducao: 'céu, dia' },
      { hanzi: '七', pinyin: 'qī', traducao: 'sete (este sim, "tchi")' },
    ],
  },
  {
    titulo: '"c" soa "ts"',
    explicacao: 'O c do pinyin é sempre "ts" com sopro, nunca "k" ou "s".',
    exemplos: [
      { hanzi: '菜', pinyin: 'cài', traducao: 'prato, verdura' },
      { hanzi: '次', pinyin: 'cì', traducao: 'vez' },
      { hanzi: '厕所', pinyin: 'cèsuǒ', traducao: 'banheiro' },
    ],
  },
  {
    titulo: 'zh/ch/sh (língua enrolada) × z/c/s (língua reta)',
    explicacao:
      'Com a língua enrolada para trás o som fica mais "grosso"; com a língua atrás dos dentes, mais "fino". Trocar muda a palavra: shì (ser) × sì (quatro).',
    exemplos: [
      { hanzi: '是', pinyin: 'shì', traducao: 'ser' },
      { hanzi: '四', pinyin: 'sì', traducao: 'quatro' },
      { hanzi: '知', pinyin: 'zhī', traducao: 'saber' },
      { hanzi: '资', pinyin: 'zī', traducao: 'recursos' },
    ],
  },
  {
    titulo: 'O "e" sozinho não é "é"',
    explicacao: 'Em hē, chē, è o e é um som do fundo da garganta, parecido com "â" ou um "ô" sem bico. Só em ie, üe e ei ele soa como "ê".',
    exemplos: [
      { hanzi: '饿', pinyin: 'è', traducao: 'com fome' },
      { hanzi: '车', pinyin: 'chē', traducao: 'carro' },
      { hanzi: '也', pinyin: 'yě', traducao: 'também (aqui é "iê")' },
    ],
  },
  {
    titulo: '"ao" é "au", e o "-n" não vira "ã"',
    explicacao:
      'hǎo é "hau", nunca "hão". E as finais em -n terminam com a língua encostando nos dentes: ān é "an-n", não o "ã" nasal do português.',
    exemplos: [
      { hanzi: '好', pinyin: 'hǎo', traducao: 'bom' },
      { hanzi: '安', pinyin: 'ān', traducao: 'paz' },
      { hanzi: '看', pinyin: 'kàn', traducao: 'olhar' },
    ],
  },
  {
    titulo: '"ian" soa "iên"',
    explicacao: 'Na final ian (e em yan, üan), o a fica fechado, quase um "ê".',
    exemplos: [
      { hanzi: '钱', pinyin: 'qián', traducao: 'dinheiro' },
      { hanzi: '见', pinyin: 'jiàn', traducao: 'ver' },
      { hanzi: '电', pinyin: 'diàn', traducao: 'eletricidade' },
    ],
  },
  {
    titulo: 'O "i" de zi, ci, si, zhi, chi, shi, ri não é "i"',
    explicacao:
      'Depois dessas consoantes, o i só indica que a consoante se prolonga, como um zumbido. sì é quase "sz", shì é quase "shr".',
    exemplos: [
      { hanzi: '字', pinyin: 'zì', traducao: 'caractere' },
      { hanzi: '是', pinyin: 'shì', traducao: 'ser' },
      { hanzi: '吃', pinyin: 'chī', traducao: 'comer' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Sandhi tonal
// ---------------------------------------------------------------------------

export interface ExemploSandhi extends ExemploSom {
  /** como realmente se fala */
  falado: string;
}

export interface RegraSandhi {
  id: string;
  titulo: string;
  regra: string;
  detalhes: string[];
  exemplos: ExemploSandhi[];
}

export const REGRAS_SANDHI: RegraSandhi[] = [
  {
    id: '3-3',
    titulo: '3º tom + 3º tom',
    regra: 'Quando dois 3º tons ficam juntos, o primeiro vira 2º tom.',
    detalhes: [
      'No pinyin continua escrito com 3º tom — a mudança é só na fala.',
      'Antes de 1º, 2º, 4º ou neutro, o 3º tom costuma ficar só grave (desce e não sobe): é o "meio 3º tom".',
    ],
    exemplos: [
      { hanzi: '你好', pinyin: 'nǐ hǎo', falado: 'ní hǎo', traducao: 'olá' },
      { hanzi: '很好', pinyin: 'hěn hǎo', falado: 'hén hǎo', traducao: 'muito bem' },
      { hanzi: '可以', pinyin: 'kěyǐ', falado: 'kéyǐ', traducao: 'poder' },
      { hanzi: '水果', pinyin: 'shuǐguǒ', falado: 'shuíguǒ', traducao: 'fruta' },
      { hanzi: '老师', pinyin: 'lǎoshī', falado: 'lǎoshī (meio 3º tom)', traducao: 'professor(a)' },
    ],
  },
  {
    id: 'bu',
    titulo: '不 (bù)',
    regra: '不 é 4º tom (bù), mas vira 2º tom (bú) antes de outro 4º tom.',
    detalhes: [
      'Nos materiais de estudo a mudança costuma vir escrita: bú shì, bú kèqi.',
      'Entre duas palavras repetidas (perguntas tipo "é ou não é") fica neutro: shì bu shì.',
    ],
    exemplos: [
      { hanzi: '不是', pinyin: 'bú shì', falado: 'bú shì', traducao: 'não é' },
      { hanzi: '不客气', pinyin: 'bú kèqi', falado: 'bú kèqi', traducao: 'de nada' },
      { hanzi: '不好', pinyin: 'bù hǎo', falado: 'bù hǎo', traducao: 'não é bom' },
      { hanzi: '不吃', pinyin: 'bù chī', falado: 'bù chī', traducao: 'não comer' },
      { hanzi: '是不是', pinyin: 'shì bu shì', falado: 'shì bu shì', traducao: 'é ou não é?' },
    ],
  },
  {
    id: 'yi',
    titulo: '一 (yī)',
    regra: '一 tem 1º tom quando está sozinho, em números e em ordinais; vira 2º tom antes de 4º tom e 4º tom antes dos outros tons.',
    detalhes: [
      'yī: 一, 十一 (shíyī, onze), 第一 (dì-yī, primeiro).',
      'yí antes de 4º tom: 一个 yí gè, 一下 yíxià.',
      'yì antes de 1º, 2º e 3º tons: 一天 yì tiān, 一年 yì nián, 一起 yìqǐ.',
      'Entre verbos repetidos fica neutro: 看一看 kàn yi kàn.',
    ],
    exemplos: [
      { hanzi: '第一', pinyin: 'dì-yī', falado: 'dì-yī', traducao: 'primeiro' },
      { hanzi: '一个', pinyin: 'yí gè', falado: 'yí gè', traducao: 'um (classificador)' },
      { hanzi: '一下', pinyin: 'yíxià', falado: 'yíxià', traducao: 'um pouco, uma vez' },
      { hanzi: '一天', pinyin: 'yì tiān', falado: 'yì tiān', traducao: 'um dia' },
      { hanzi: '一起', pinyin: 'yìqǐ', falado: 'yìqǐ', traducao: 'juntos' },
    ],
  },
];

export interface PerguntaSandhi {
  pergunta: string;
  hanzi: string;
  opcoes: string[];
  correta: string;
  explicacao: string;
}

export const QUIZ_SANDHI: PerguntaSandhi[] = [
  { pergunta: 'Como se fala 不 em 不去 (não ir)?', hanzi: '不去', opcoes: ['bù', 'bú'], correta: 'bú', explicacao: '去 qù é 4º tom, então 不 vira bú.' },
  { pergunta: 'Como se fala 不 em 不忙 (não estar ocupado)?', hanzi: '不忙', opcoes: ['bù', 'bú'], correta: 'bù', explicacao: '忙 máng é 2º tom; 不 continua bù.' },
  { pergunta: 'Como se fala 一 em 一样 (igual)?', hanzi: '一样', opcoes: ['yī', 'yí', 'yì'], correta: 'yí', explicacao: '样 yàng é 4º tom, então 一 vira yí.' },
  { pergunta: 'Como se fala 一 em 一杯 (um copo)?', hanzi: '一杯', opcoes: ['yī', 'yí', 'yì'], correta: 'yì', explicacao: '杯 bēi é 1º tom, então 一 vira yì.' },
  { pergunta: 'Como se fala 一 em 十一 (onze)?', hanzi: '十一', opcoes: ['yī', 'yí', 'yì'], correta: 'yī', explicacao: 'Em números, 一 mantém o 1º tom.' },
  { pergunta: 'Como se fala 你 em 你好?', hanzi: '你好', opcoes: ['nǐ', 'ní'], correta: 'ní', explicacao: '3º + 3º: o primeiro vira 2º tom na fala (ní hǎo).' },
  { pergunta: 'Como se fala 很 em 很冷 (muito frio)?', hanzi: '很冷', opcoes: ['hěn', 'hén'], correta: 'hén', explicacao: '冷 lěng também é 3º tom, então 很 vira hén.' },
  { pergunta: 'Como se fala 不 em 不对 (não está certo)?', hanzi: '不对', opcoes: ['bù', 'bú'], correta: 'bú', explicacao: '对 duì é 4º tom, então 不 vira bú.' },
];

// ---------------------------------------------------------------------------
// Pares mínimos
// ---------------------------------------------------------------------------

export interface GrupoPares {
  id: string;
  titulo: string;
  itens: ExemploSom[];
}

/** Mesma sílaba, tons diferentes. */
export const PARES_TONS: GrupoPares[] = [
  { id: 'ma', titulo: 'mā · má · mǎ · mà', itens: [
    { hanzi: '妈', pinyin: 'mā', traducao: 'mãe' }, { hanzi: '麻', pinyin: 'má', traducao: 'cânhamo' },
    { hanzi: '马', pinyin: 'mǎ', traducao: 'cavalo' }, { hanzi: '骂', pinyin: 'mà', traducao: 'xingar' } ] },
  { id: 'ba', titulo: 'bā · bá · bǎ · bà', itens: [
    { hanzi: '八', pinyin: 'bā', traducao: 'oito' }, { hanzi: '拔', pinyin: 'bá', traducao: 'arrancar' },
    { hanzi: '把', pinyin: 'bǎ', traducao: 'segurar' }, { hanzi: '爸', pinyin: 'bà', traducao: 'pai' } ] },
  { id: 'yi', titulo: 'yī · yí · yǐ · yì', itens: [
    { hanzi: '衣', pinyin: 'yī', traducao: 'roupa' }, { hanzi: '姨', pinyin: 'yí', traducao: 'tia' },
    { hanzi: '椅', pinyin: 'yǐ', traducao: 'cadeira' }, { hanzi: '意', pinyin: 'yì', traducao: 'significado' } ] },
  { id: 'shi', titulo: 'shī · shí · shǐ · shì', itens: [
    { hanzi: '诗', pinyin: 'shī', traducao: 'poema' }, { hanzi: '十', pinyin: 'shí', traducao: 'dez' },
    { hanzi: '史', pinyin: 'shǐ', traducao: 'história' }, { hanzi: '是', pinyin: 'shì', traducao: 'ser' } ] },
  { id: 'wu', titulo: 'wū · wú · wǔ · wù', itens: [
    { hanzi: '屋', pinyin: 'wū', traducao: 'casa' }, { hanzi: '无', pinyin: 'wú', traducao: 'sem' },
    { hanzi: '五', pinyin: 'wǔ', traducao: 'cinco' }, { hanzi: '雾', pinyin: 'wù', traducao: 'névoa' } ] },
  { id: 'tang', titulo: 'tāng · táng · tǎng · tàng', itens: [
    { hanzi: '汤', pinyin: 'tāng', traducao: 'sopa' }, { hanzi: '糖', pinyin: 'táng', traducao: 'açúcar' },
    { hanzi: '躺', pinyin: 'tǎng', traducao: 'deitar' }, { hanzi: '烫', pinyin: 'tàng', traducao: 'escaldante' } ] },
  { id: 'qi', titulo: 'qī · qí · qǐ · qì', itens: [
    { hanzi: '七', pinyin: 'qī', traducao: 'sete' }, { hanzi: '骑', pinyin: 'qí', traducao: 'montar' },
    { hanzi: '起', pinyin: 'qǐ', traducao: 'levantar' }, { hanzi: '气', pinyin: 'qì', traducao: 'ar' } ] },
  { id: 'tu', titulo: 'tū · tú · tǔ · tù', itens: [
    { hanzi: '突', pinyin: 'tū', traducao: 'de repente' }, { hanzi: '图', pinyin: 'tú', traducao: 'figura' },
    { hanzi: '土', pinyin: 'tǔ', traducao: 'terra' }, { hanzi: '兔', pinyin: 'tù', traducao: 'coelho' } ] },
  { id: 'yan', titulo: 'yān · yán · yǎn · yàn', itens: [
    { hanzi: '烟', pinyin: 'yān', traducao: 'fumaça' }, { hanzi: '盐', pinyin: 'yán', traducao: 'sal' },
    { hanzi: '眼', pinyin: 'yǎn', traducao: 'olho' }, { hanzi: '验', pinyin: 'yàn', traducao: 'examinar' } ] },
  { id: 'mai', titulo: 'mǎi × mài (comprar × vender)', itens: [
    { hanzi: '买', pinyin: 'mǎi', traducao: 'comprar' }, { hanzi: '卖', pinyin: 'mài', traducao: 'vender' } ] },
];

/** Mesmo tom, sons parecidos que confundem brasileiros. */
export const PARES_SONS: GrupoPares[] = [
  { id: 'shi-si', titulo: 'shì × sì', itens: [{ hanzi: '是', pinyin: 'shì', traducao: 'ser' }, { hanzi: '四', pinyin: 'sì', traducao: 'quatro' }] },
  { id: 'zhi-zi', titulo: 'zhī × zī', itens: [{ hanzi: '知', pinyin: 'zhī', traducao: 'saber' }, { hanzi: '资', pinyin: 'zī', traducao: 'recursos' }] },
  { id: 'chu-cu', titulo: 'chū × cū', itens: [{ hanzi: '出', pinyin: 'chū', traducao: 'sair' }, { hanzi: '粗', pinyin: 'cū', traducao: 'grosso' }] },
  { id: 'xi-shi', titulo: 'xī × shī', itens: [{ hanzi: '西', pinyin: 'xī', traducao: 'oeste' }, { hanzi: '诗', pinyin: 'shī', traducao: 'poema' }] },
  { id: 'qi-chi', titulo: 'qī × chī', itens: [{ hanzi: '七', pinyin: 'qī', traducao: 'sete' }, { hanzi: '吃', pinyin: 'chī', traducao: 'comer' }] },
  { id: 'ji-zhi', titulo: 'jī × zhī', itens: [{ hanzi: '机', pinyin: 'jī', traducao: 'máquina' }, { hanzi: '知', pinyin: 'zhī', traducao: 'saber' }] },
  { id: 'nu-nv', titulo: 'nǚ × nǔ', itens: [{ hanzi: '女', pinyin: 'nǚ', traducao: 'mulher' }, { hanzi: '努', pinyin: 'nǔ', traducao: 'esforçar-se' }] },
  { id: 'lu-lv', titulo: 'lù × lǜ', itens: [{ hanzi: '路', pinyin: 'lù', traducao: 'caminho' }, { hanzi: '绿', pinyin: 'lǜ', traducao: 'verde' }] },
  { id: 'ba-pa', titulo: 'bà × pà', itens: [{ hanzi: '爸', pinyin: 'bà', traducao: 'pai' }, { hanzi: '怕', pinyin: 'pà', traducao: 'ter medo' }] },
  { id: 'da-ta', titulo: 'dā × tā', itens: [{ hanzi: '搭', pinyin: 'dā', traducao: 'montar, pegar (carona)' }, { hanzi: '他', pinyin: 'tā', traducao: 'ele' }] },
  { id: 'rang-lang', titulo: 'ràng × làng', itens: [{ hanzi: '让', pinyin: 'ràng', traducao: 'deixar, permitir' }, { hanzi: '浪', pinyin: 'làng', traducao: 'onda' }] },
  { id: 'an-ang', titulo: 'fàn × fàng', itens: [{ hanzi: '饭', pinyin: 'fàn', traducao: 'comida' }, { hanzi: '放', pinyin: 'fàng', traducao: 'colocar' }] },
  { id: 'in-ing', titulo: 'xīn × xīng', itens: [{ hanzi: '新', pinyin: 'xīn', traducao: 'novo' }, { hanzi: '星', pinyin: 'xīng', traducao: 'estrela' }] },
];
