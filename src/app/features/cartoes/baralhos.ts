import { FraseDoDia } from '../../core/dados/frases.service';
import { Palavra } from '../../core/dados/modelos';
import { CartaoSrs, TipoCartao, idCartao } from '../../core/srs/sm2';
import { DataISO } from '../../core/util/datas';

/** Conteúdo de um cartão, independente de ser palavra ou frase. */
export interface ConteudoCartao {
  tipo: TipoCartao;
  ref: string;
  hanzi: string;
  pinyin: string;
  traducao: string;
  extra?: string;
  exemplo?: { hanzi: string; pinyin: string; traducao: string };
  /** link para a página da palavra */
  palavraId?: string;
}

export interface Baralho {
  id: string;
  nome: string;
  descricao: string;
  itens: ConteudoCartao[];
}

export interface ContagemBaralho {
  novos: number;
  vencidos: number;
  aprendidos: number;
}

export function deVocabulario(p: Palavra): ConteudoCartao {
  return {
    tipo: 'palavra',
    ref: p.id,
    hanzi: p.hanzi,
    pinyin: p.pinyin,
    traducao: p.traducao,
    extra: `HSK ${p.nivel} · ${p.classe}`,
    exemplo: p.exemplo,
    palavraId: p.id,
  };
}

export function deFrase(f: FraseDoDia): ConteudoCartao {
  return { tipo: 'frase', ref: f.id, hanzi: f.hanzi, pinyin: f.pinyin, traducao: f.traducao, extra: f.nota };
}

export function contar(b: Baralho, cartoes: Record<string, CartaoSrs>, hoje: DataISO): ContagemBaralho {
  let novos = 0;
  let vencidos = 0;
  let aprendidos = 0;
  for (const item of b.itens) {
    const c = cartoes[idCartao(item.tipo, item.ref)];
    if (!c || c.revisoes === 0) novos++;
    else {
      aprendidos++;
      if (c.vencimento <= hoje && c.ultimaRevisao !== hoje) vencidos++;
    }
  }
  return { novos, vencidos, aprendidos };
}

function escaparHtml(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Arquivo de texto que o Anki importa direto (Arquivo › Importar), com tipo de nota "Básico":
 * frente = caracteres; verso = pinyin, tradução e exemplo.
 */
export function exportarParaAnki(b: Baralho): string {
  const sanitizar = (t: string) => escaparHtml(t).replace(/[\t\n]/g, ' ');
  const linhas = b.itens.map((i) => {
    const verso = [
      `<b>${sanitizar(i.pinyin)}</b>`,
      sanitizar(i.traducao),
      i.exemplo ? `<br>${sanitizar(i.exemplo.hanzi)}<br>${sanitizar(i.exemplo.pinyin)}<br><i>${sanitizar(i.exemplo.traducao)}</i>` : '',
    ]
      .filter(Boolean)
      .join('<br>');
    return [sanitizar(i.hanzi), verso, `aprenda-mandarim ${b.id}`].join('\t');
  });
  return [
    '#separator:tab',
    '#html:true',
    `#deck:Aprenda Mandarim::${b.nome}`,
    '#tags column:3',
    ...linhas,
  ].join('\n') + '\n';
}
