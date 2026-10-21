import { novoCartao } from '../../core/srs/sm2';
import { Baralho, contar, exportarParaAnki } from './baralhos';

const baralho: Baralho = {
  id: 'hsk1',
  nome: 'HSK 1',
  descricao: '',
  itens: [
    { tipo: 'palavra', ref: '你好', hanzi: '你好', pinyin: 'nǐ hǎo', traducao: 'olá', exemplo: { hanzi: '你好！', pinyin: 'Nǐ hǎo!', traducao: 'Olá!' } },
    { tipo: 'palavra', ref: '谢谢', hanzi: '谢谢', pinyin: 'xièxie', traducao: 'obrigado(a)' },
    { tipo: 'palavra', ref: '再见', hanzi: '再见', pinyin: 'zàijiàn', traducao: 'tchau <até>' },
  ],
};

describe('cartões: baralhos', () => {
  it('conta novos, vencidos e estudados', () => {
    const hoje = '2026-10-20';
    const cartoes = {
      'palavra:你好': { ...novoCartao('palavra', '你好', '2026-10-01'), revisoes: 2, vencimento: '2026-10-19' },
      'palavra:谢谢': { ...novoCartao('palavra', '谢谢', '2026-10-01'), revisoes: 1, vencimento: '2026-10-25' },
    };
    expect(contar(baralho, cartoes, hoje)).toEqual({ novos: 1, vencidos: 1, aprendidos: 2 });
  });

  it('exporta no formato de importação do Anki', () => {
    const texto = exportarParaAnki(baralho);
    const linhas = texto.trim().split('\n');
    expect(linhas.slice(0, 4)).toEqual(['#separator:tab', '#html:true', '#deck:Aprenda Mandarim::HSK 1', '#tags column:3']);
    expect(linhas).toHaveLength(7);
    const [frente, verso, tags] = linhas[4].split('\t');
    expect(frente).toBe('你好');
    expect(verso).toContain('<b>nǐ hǎo</b>');
    expect(verso).toContain('你好！');
    expect(tags).toBe('aprenda-mandarim hsk1');
    expect(linhas[6]).toContain('tchau &lt;até&gt;');
  });
});
