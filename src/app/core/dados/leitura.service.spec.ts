import { LinhaTexto, hanziDaLinha, pinyinDaLinha } from './leitura.service';

const linha: LinhaTexto = {
  traducao: 'Lili ficou aflita: "Como eu vou voltar para casa?"',
  tokens: [
    { hanzi: '丽丽', pinyin: 'Lìli' },
    { hanzi: '很', pinyin: 'hěn' },
    { hanzi: '着急', pinyin: 'zháojí' },
    { hanzi: '：' },
    { hanzi: '“' },
    { hanzi: '我', pinyin: 'wǒ' },
    { hanzi: '怎么', pinyin: 'zěnme' },
    { hanzi: '回', pinyin: 'huí' },
    { hanzi: '家', pinyin: 'jiā' },
    { hanzi: '呢', pinyin: 'ne' },
    { hanzi: '？' },
    { hanzi: '”' },
  ],
};

describe('leitura: linhas', () => {
  it('junta os caracteres da linha', () => {
    expect(hanziDaLinha(linha)).toBe('丽丽很着急：“我怎么回家呢？”');
  });

  it('monta o pinyin com pontuação ocidental e maiúsculas', () => {
    expect(pinyinDaLinha(linha)).toBe('Lìli hěn zháojí: "Wǒ zěnme huí jiā ne?"');
  });
});
