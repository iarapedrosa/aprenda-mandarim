import {
  acentosParaNumeros,
  analisarPinyin,
  compararPinyin,
  normalizar,
  numerosParaAcentos,
  segmentar,
  semTom,
  silabaComAcento,
  tomDaSilaba,
} from './pinyin';

describe('pinyin: conversões', () => {
  it('normaliza v e u: para ü e deixa minúsculo', () => {
    expect(normalizar('Lv4')).toBe('lü4');
    expect(normalizar('nu:3')).toBe('nü3');
  });

  it('remove os tons mantendo o ü', () => {
    expect(semTom("nǚ'ér")).toBe("nü'er");
    expect(semTom('Běijīng')).toBe('beijing');
  });

  it('identifica o tom de uma sílaba', () => {
    expect(tomDaSilaba('mā')).toBe(1);
    expect(tomDaSilaba('má')).toBe(2);
    expect(tomDaSilaba('mǎ')).toBe(3);
    expect(tomDaSilaba('mà')).toBe(4);
    expect(tomDaSilaba('ma')).toBe(5);
    expect(tomDaSilaba('lǜ')).toBe(4);
  });

  it('coloca o acento na vogal certa', () => {
    expect(silabaComAcento('hao', 3)).toBe('hǎo');
    expect(silabaComAcento('xie', 4)).toBe('xiè');
    expect(silabaComAcento('gou', 3)).toBe('gǒu');
    expect(silabaComAcento('liu', 4)).toBe('liù');
    expect(silabaComAcento('gui', 4)).toBe('guì');
    expect(silabaComAcento('lü', 4)).toBe('lǜ');
    expect(silabaComAcento('ma', 5)).toBe('ma');
  });

  it('converte números em acentos e vice-versa', () => {
    expect(numerosParaAcentos('ni3 hao3')).toBe('nǐ hǎo');
    expect(numerosParaAcentos('lv4 se4')).toBe('lǜ sè');
    expect(numerosParaAcentos('xie4xie5')).toBe('xièxie');
    expect(acentosParaNumeros('nǐ hǎo')).toBe('ni3 hao3');
    expect(acentosParaNumeros('xièxie')).toBe('xie4 xie');
  });
});

describe('pinyin: segmentação', () => {
  it('separa pinyin escrito junto', () => {
    expect(analisarPinyin('Běijīng')).toEqual([
      { letras: 'bei', tom: 3 },
      { letras: 'jing', tom: 1 },
    ]);
    expect(analisarPinyin('chūzūchē').map((s) => s.letras)).toEqual(['chu', 'zu', 'che']);
    expect(analisarPinyin('gōnggòng qìchē').map((s) => s.letras)).toEqual(['gong', 'gong', 'qi', 'che']);
  });

  it('respeita o apóstrofo', () => {
    expect(analisarPinyin("Xī'ān").map((s) => s.letras)).toEqual(['xi', 'an']);
    expect(analisarPinyin("nǚ'ér")).toEqual([
      { letras: 'nü', tom: 3 },
      { letras: 'er', tom: 2 },
    ]);
  });

  it('reconhece erhua (r no fim da sílaba)', () => {
    expect(analisarPinyin('nǎr')).toEqual([{ letras: 'nar', tom: 3 }]);
    expect(analisarPinyin('yìdiǎnr').map((s) => s.letras)).toEqual(['yi', 'dianr']);
    expect(analisarPinyin('yi4dian3r')).toEqual([
      { letras: 'yi', tom: 4 },
      { letras: 'dianr', tom: 3 },
    ]);
  });

  it('volta atrás quando a sílaba mais longa não serve', () => {
    // "zhuang" + "u" não serve ("u" sozinho não é sílaba), então: zhuan + gu
    expect(segmentar('zhuangu')).toEqual([5, 7]);
  });

  it('não começa sílaba com a/o/e no meio da palavra sem apóstrofo', () => {
    expect(analisarPinyin('kěnéng').map((s) => s.letras)).toEqual(['ke', 'neng']);
    expect(analisarPinyin('yángròu').map((s) => s.letras)).toEqual(['yang', 'rou']);
    expect(analisarPinyin('suīrán').map((s) => s.letras)).toEqual(['sui', 'ran']);
  });

  it('retorna null para letras que não formam sílabas', () => {
    expect(segmentar('xyz')).toBeNull();
  });
});

describe('pinyin: correção de respostas', () => {
  it('aceita números de tom', () => {
    const r = compararPinyin('ni3 hao3', 'nǐ hǎo');
    expect(r.correto).toBe(true);
  });

  it('aceita acentos, sem espaço e com maiúsculas', () => {
    expect(compararPinyin('NǏHǍO', 'nǐ hǎo').correto).toBe(true);
    expect(compararPinyin('ni3hao3', 'nǐ hǎo').correto).toBe(true);
  });

  it('aceita v no lugar de ü', () => {
    expect(compararPinyin('nv3er2', "nǚ'ér").correto).toBe(true);
    expect(compararPinyin('lv4', 'lǜ').correto).toBe(true);
  });

  it('aponta o tom errado na sílaba certa', () => {
    const r = compararPinyin('ni2 hao3', 'nǐ hǎo');
    // 3+3: o 2º tom na primeira sílaba é aceito com observação
    expect(r.correto).toBe(true);
    expect(r.silabas[0].nota).toContain('3+3');

    const r2 = compararPinyin('ma1', 'mà');
    expect(r2.correto).toBe(false);
    expect(r2.letrasCorretas).toBe(true);
    expect(r2.silabas[0].estado).toBe('tom-errado');
  });

  it('cobra os tons quando faltam', () => {
    const r = compararPinyin('nihao', 'nǐ hǎo');
    expect(r.correto).toBe(false);
    expect(r.letrasCorretas).toBe(true);
    expect(r.tonsInformados).toBe(false);
    expect(r.mensagem).toContain('faltaram os tons');
  });

  it('pode ignorar os tons se configurado', () => {
    expect(compararPinyin('nihao', 'nǐ hǎo', { exigirTons: false }).correto).toBe(true);
  });

  it('não exige tom na sílaba de tom neutro', () => {
    expect(compararPinyin('xie4xie', 'xièxie').correto).toBe(true);
    expect(compararPinyin('xie4 xie5', 'xièxie').correto).toBe(true);
    expect(compararPinyin('xie4 xie4', 'xièxie').correto).toBe(true);
    expect(compararPinyin('ba4ba0', 'bàba').correto).toBe(true);
  });

  it('aceita o tom original de 不 e 一 (sandhi)', () => {
    expect(compararPinyin('bu4 ke4qi', 'bú kèqi', { hanzi: '不客气' }).correto).toBe(true);
    expect(compararPinyin('bu2 ke4qi', 'bú kèqi', { hanzi: '不客气' }).correto).toBe(true);
    expect(compararPinyin('yi1qi3', 'yìqǐ', { hanzi: '一起' }).correto).toBe(true);
  });

  it('não aplica tolerância de 一 a outros caracteres com som yi', () => {
    // 意思 yìsi: 1º tom está errado
    expect(compararPinyin('yi1si', 'yìsi', { hanzi: '意思' }).correto).toBe(false);
  });

  it('alinha erhua com 儿 ao verificar sandhi', () => {
    expect(compararPinyin('yi1dian3r', 'yìdiǎnr', { hanzi: '一点儿' }).correto).toBe(true);
  });

  it('indica letras erradas', () => {
    const r = compararPinyin('ni3 hao4 ma', 'nǐ hǎo');
    expect(r.correto).toBe(false);
    expect(r.letrasCorretas).toBe(false);

    const r2 = compararPinyin('xi1', 'shī');
    expect(r2.silabas[0].estado).toBe('letras-erradas');
  });

  it('trata resposta vazia', () => {
    const r = compararPinyin('   ', 'nǐ');
    expect(r.correto).toBe(false);
    expect(r.mensagem).toContain('Digite');
  });

  it('distingue zh/z, ch/c, sh/s', () => {
    expect(compararPinyin('zi4', 'zhì').correto).toBe(false);
    expect(compararPinyin('si4', 'shì').correto).toBe(false);
  });
});
