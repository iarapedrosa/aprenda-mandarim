import { LinhaTexto, Texto, coberturaDoTexto, hanziDaLinha, pinyinDaLinha, rotuloCobertura } from './leitura.service';

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

describe('leitura: cobertura de vocabulário', () => {
  const texto: Texto = {
    id: 't',
    tipo: 'dialogo',
    nivel: 1,
    titulo: '',
    tituloHanzi: '',
    resumo: '',
    perguntas: [],
    linhas: [
      {
        traducao: '',
        tokens: [
          { hanzi: '我', pinyin: 'wǒ', palavra: '我' },
          { hanzi: '叫', pinyin: 'jiào', palavra: '叫' },
          { hanzi: '安娜', pinyin: 'Ānnà', traducao: 'Ana (nome)' },
          { hanzi: '绿茶', pinyin: 'lǜchá', traducao: 'chá verde' },
          { hanzi: '。' },
        ],
      },
    ],
  };

  it('conta palavras estudadas e nomes próprios', () => {
    expect(coberturaDoTexto(texto, new Set(['我', '叫']))).toBe(75);
    expect(coberturaDoTexto(texto, new Set())).toBe(25);
  });

  it('classifica o nível de dificuldade', () => {
    expect(rotuloCobertura(98).classe).toBe('ideal');
    expect(rotuloCobertura(90).classe).toBe('desafio');
    expect(rotuloCobertura(60).classe).toBe('dificil');
  });
});
