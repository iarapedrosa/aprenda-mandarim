import { candidatosTeclado, chaveTeclado } from './teclado';

const fonte = [
  { hanzi: '他', pinyin: 'tā' },
  { hanzi: '她', pinyin: 'tā' },
  { hanzi: '太', pinyin: 'tài' },
  { hanzi: '天气', pinyin: 'tiānqì' },
  { hanzi: '女儿', pinyin: "nǚ'ér" },
  { hanzi: '你好', pinyin: 'nǐ hǎo' },
];

describe('teclado chinês', () => {
  it('normaliza como um teclado (sem tons, v = ü)', () => {
    expect(chaveTeclado("nǚ'ér")).toBe('nver');
    expect(chaveTeclado('nǐ hǎo')).toBe('nihao');
  });

  it('mostra homófonos exatos primeiro e depois os que começam igual', () => {
    expect(candidatosTeclado('ta', fonte).map((c) => c.hanzi)).toEqual(['他', '她', '太']);
    expect(candidatosTeclado('t', fonte).map((c) => c.hanzi)).toEqual(['他', '她', '太', '天气']);
  });

  it('aceita espaços, maiúsculas e v', () => {
    expect(candidatosTeclado('Ni Hao', fonte).map((c) => c.hanzi)).toEqual(['你好']);
    expect(candidatosTeclado('nver', fonte).map((c) => c.hanzi)).toEqual(['女儿']);
  });

  it('não sugere nada sem letras', () => {
    expect(candidatosTeclado('  ', fonte)).toEqual([]);
  });
});
