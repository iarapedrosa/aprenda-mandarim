import { compararPinyin } from '../pinyin/pinyin';
import { ano, digitoADigito, hora, lerNumeroDigitado, numero, numeroParaChines, pinyinDeNumero, preco } from './numeros';

describe('números: caracteres', () => {
  it.each([
    [0, '零'],
    [7, '七'],
    [10, '十'],
    [15, '十五'],
    [20, '二十'],
    [99, '九十九'],
    [100, '一百'],
    [101, '一百零一'],
    [110, '一百一十'],
    [115, '一百一十五'],
    [200, '两百'],
    [250, '两百五十'],
    [1000, '一千'],
    [1005, '一千零五'],
    [1020, '一千零二十'],
    [2026, '两千零二十六'],
    [10000, '一万'],
    [10010, '一万零一十'],
    [12345, '一万二千三百四十五'],
    [20000, '两万'],
    [100000, '十万'],
    [1000000, '一百万'],
    [10000000, '一千万'],
    [99999999, '九千九百九十九万九千九百九十九'],
  ])('%i → %s', (n, esperado) => {
    expect(numeroParaChines(n)).toBe(esperado);
  });

  it('recusa números fora do intervalo', () => {
    expect(() => numeroParaChines(-1)).toThrow();
    expect(() => numeroParaChines(1.5)).toThrow();
    expect(() => numeroParaChines(100_000_000)).toThrow();
  });
});

describe('números: pinyin', () => {
  it('monta o pinyin com quebras e apóstrofo', () => {
    expect(numero(12).pinyin).toBe("shí'èr");
    expect(numero(35).pinyin).toBe('sānshíwǔ');
    expect(numero(356).pinyin).toBe('sānbǎi wǔshíliù');
    expect(numero(105).pinyin).toBe('yìbǎi líng wǔ');
    expect(numero(2026).pinyin).toBe('liǎngqiān líng èrshíliù');
  });

  it('aplica o sandhi de 一 antes de 百, 千 e 万', () => {
    expect(numero(100).pinyin).toBe('yìbǎi');
    expect(numero(1000).pinyin).toBe('yìqiān');
    expect(numero(10000).pinyin).toBe('yíwàn');
    expect(numero(11).pinyin).toBe('shíyī');
  });

  it('gera pinyin que o corretor aceita', () => {
    for (const n of [7, 12, 45, 105, 999, 2026, 12345]) {
      const { hanzi, pinyin } = numero(n);
      expect(compararPinyin(pinyin, pinyin, { hanzi }).correto).toBe(true);
    }
    expect(pinyinDeNumero('二十')).toBe('èrshí');
  });
});

describe('números: usos do dia a dia', () => {
  it('lê telefone dígito a dígito, com 1 = 幺', () => {
    expect(digitoADigito('110', true)).toEqual({ hanzi: '幺幺零', pinyin: 'yāo yāo líng' });
  });

  it('lê anos dígito a dígito', () => {
    expect(ano(2026)).toEqual({ hanzi: '二零二六年', pinyin: 'èr líng èr liù nián' });
  });

  it('lê preços em 块 e 毛', () => {
    expect(preco(12.5).hanzi).toBe('十二块五');
    expect(preco(2).hanzi).toBe('两块');
    expect(preco(0.5).hanzi).toBe('五毛');
    expect(preco(3.05).hanzi).toBe('三块零五分');
  });

  it('lê horas', () => {
    expect(hora(8, 0).hanzi).toBe('八点');
    expect(hora(8, 30).hanzi).toBe('八点半');
    expect(hora(8, 5).hanzi).toBe('八点零五分');
    expect(hora(2, 15)).toEqual({ hanzi: '两点十五分', pinyin: 'liǎng diǎn shíwǔ fēn' });
  });

  it('entende números digitados de vários jeitos', () => {
    expect(lerNumeroDigitado('1.250')).toBe(1250);
    expect(lerNumeroDigitado('1 250')).toBe(1250);
    expect(lerNumeroDigitado('12,5')).toBe(12.5);
    expect(lerNumeroDigitado('abc')).toBeNull();
  });
});
