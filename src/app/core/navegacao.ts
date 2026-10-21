/**
 * Mapa do site: fonte única para o menu do topo, a barra inferior, o menu completo (☰)
 * e as páginas "Aprender" e "Praticar".
 */
export type Grupo = 'hoje' | 'aprender' | 'praticar' | 'cartoes' | 'progresso' | 'sobre';

export interface Destino {
  rota: string;
  icone: string;
  nome: string;
  nomeEn: string;
  descricao: string;
  descricaoEn: string;
}

export const APRENDER: Destino[] = [
  { rota: '/pinyin', icone: '音', nome: 'Pinyin e tons', descricao: 'Os sons do mandarim, os 4 tons e as armadilhas para brasileiros.', nomeEn: 'Pinyin and tones', descricaoEn: 'The sounds of Mandarin, the 4 tones and common pitfalls.' },
  { rota: '/caracteres', icone: '字', nome: 'Caracteres', descricao: 'Vocabulário do HSK 1 e 2 com áudio, exemplos e ordem dos traços.', nomeEn: 'Characters', descricaoEn: 'HSK 1 and 2 vocabulary with audio, examples and stroke order.' },
  { rota: '/caracteres/radicais', icone: '部', nome: 'Radicais', descricao: 'As peças que formam os caracteres e dão pistas do significado.', nomeEn: 'Radicals', descricaoEn: 'The building blocks of characters, with hints to their meaning.' },
  { rota: '/gramatica', icone: '语', nome: 'Gramática', descricao: 'Mini-lições: ordem da frase, 的, 了, classificadores… e Monte a frase.', nomeEn: 'Grammar', descricaoEn: 'Mini-lessons: word order, 的, 了, measure words… and Build the sentence.' },
  { rota: '/numeros', icone: '数', nome: 'Números', descricao: 'Contar, preços, horas, datas e telefones, com conversor e áudio.', nomeEn: 'Numbers', descricaoEn: 'Counting, prices, times, dates and phone numbers, with a converter and audio.' },
];

export const PRATICAR: Destino[] = [
  { rota: '/cartoes', icone: '卡', nome: 'Cartões', descricao: 'Flashcards estilo Anki com revisão espaçada.', nomeEn: 'Flashcards', descricaoEn: 'Anki-style flashcards with spaced repetition.' },
  { rota: '/escrita', icone: '写', nome: 'Escrita', descricao: 'Desenhe os caracteres ou digite como no teclado chinês.', nomeEn: 'Writing', descricaoEn: 'Draw the characters or type like on a Chinese keyboard.' },
  { rota: '/leitura', icone: '读', nome: 'Leitura', descricao: 'Diálogos e historinhas com pinyin e tradução.', nomeEn: 'Reading', descricaoEn: 'Dialogues and short stories with pinyin and translation.' },
  { rota: '/escuta', icone: '听', nome: 'Escuta', descricao: 'Ditado: ouça e escreva em pinyin ou escolha os caracteres.', nomeEn: 'Listening', descricaoEn: 'Dictation: listen and type pinyin or pick the characters.' },
  { rota: '/fala', icone: '说', nome: 'Fala', descricao: 'Shadowing e trava-línguas com reconhecimento de voz.', nomeEn: 'Speaking', descricaoEn: 'Shadowing and tongue twisters with speech recognition.' },
  { rota: '/pinyin/treino', icone: '声', nome: 'Treino de tons', descricao: 'Tons, pares de tons e pares mínimos.', nomeEn: 'Tone training', descricaoEn: 'Tones, tone pairs and minimal pairs.' },
];

export const SOBRE: Destino[] = [
  { rota: '/recursos', icone: '书', nome: 'Recursos para estudar', descricao: 'Livros, apps, vídeos e conversa — fora do site.', nomeEn: 'Study resources', descricaoEn: 'Books, apps, videos and conversation — beyond this site.' },
  { rota: '/metodo', icone: '研', nome: 'O método e a ciência', descricao: 'Por que o site funciona assim, com as referências.', nomeEn: 'The method and the science', descricaoEn: 'Why the site works this way, with references.' },
  { rota: '/contato', icone: '信', nome: 'Fale comigo', descricao: 'Dúvidas, sugestões ou erros? Mande uma mensagem.', nomeEn: 'Get in touch', descricaoEn: 'Questions, suggestions or mistakes? Send a message.' },
];

/** Grupo (aba ativa do menu) de uma URL. */
export function grupoDaUrl(url: string): Grupo {
  const caminho = url.split(/[?#]/)[0];
  if (caminho === '/' || caminho === '' || caminho.startsWith('/treino')) return 'hoje';
  if (caminho.startsWith('/pinyin/treino')) return 'praticar';
  if (caminho.startsWith('/cartoes')) return 'cartoes';
  if (caminho.startsWith('/progresso')) return 'progresso';
  if (/^\/(aprender|pinyin|caracteres|gramatica|numeros)/.test(caminho)) return 'aprender';
  if (/^\/(praticar|escrita|leitura|escuta|fala)/.test(caminho)) return 'praticar';
  return 'sobre';
}
