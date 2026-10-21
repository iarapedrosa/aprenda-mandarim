import { compararFala, limparParaComparar, numeroParaHanzi } from './comparar-fala';

describe('fala: números', () => {
  it('converte números arábicos para a leitura chinesa', () => {
    expect(numeroParaHanzi(8)).toBe('八');
    expect(numeroParaHanzi(10)).toBe('十');
    expect(numeroParaHanzi(14)).toBe('十四');
    expect(numeroParaHanzi(40)).toBe('四十');
    expect(numeroParaHanzi(25)).toBe('二十五');
    expect(numeroParaHanzi(100)).toBe('一百');
    expect(numeroParaHanzi(105)).toBe('一百零五');
    expect(numeroParaHanzi(120)).toBe('一百二十');
    expect(numeroParaHanzi(2026)).toBe('二千零二十六');
  });

  it('limpa pontuação e converte números do reconhecimento', () => {
    expect(limparParaComparar('现在8点10分。')).toBe('现在八点十分');
    expect(limparParaComparar('你好，世界！')).toBe('你好世界');
  });
});

describe('fala: comparação', () => {
  it('dá 100 quando é igual', () => {
    const r = compararFala('你好！', '你好');
    expect(r.pontuacao).toBe(100);
    expect(r.pedacos.every((p) => p.estado === 'certo')).toBe(true);
  });

  it('aceita homófonos (o reconhecimento não sabe se é 他 ou 她)', () => {
    const r = compararFala('她是老师。', '他是老师');
    expect(r.pontuacao).toBe(100);
    expect(r.pedacos[0]).toEqual({ caractere: '她', estado: 'homofono', ouvido: '他' });
  });

  it('marca o que faltou', () => {
    const r = compararFala('我很高兴', '我高兴');
    expect(r.pedacos.map((p) => p.estado)).toEqual(['certo', 'faltou', 'certo', 'certo']);
    expect(r.pontuacao).toBe(75);
  });

  it('marca o que sobrou e penaliza pela metade', () => {
    const r = compararFala('你好', '你好吗');
    expect(r.pedacos.map((p) => p.estado)).toEqual(['certo', 'certo', 'sobrou']);
    expect(r.pontuacao).toBe(75);
  });

  it('dá 0 quando nada bate', () => {
    expect(compararFala('谢谢', '').pontuacao).toBe(0);
  });

  it('compara números falados', () => {
    expect(compararFala('现在八点十分。', '现在8点10分').pontuacao).toBe(100);
  });
});
