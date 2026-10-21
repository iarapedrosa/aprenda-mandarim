import { segmentarFrase, soCaracteres } from './segmentar';

const dicionario = new Set(['喜欢', '老师', '中国', '中国人', '米饭', '我们']);

describe('segmentar frases', () => {
  it('usa as palavras do vocabulário, maiores primeiro', () => {
    expect(segmentarFrase('我喜欢喝茶。', dicionario)).toEqual(['我', '喜欢', '喝', '茶']);
    expect(segmentarFrase('他是中国人。', dicionario)).toEqual(['他', '是', '中国人']);
  });

  it('ignora a pontuação', () => {
    expect(segmentarFrase('我们，吃米饭！', dicionario)).toEqual(['我们', '吃', '米饭']);
  });

  it('extrai só os caracteres', () => {
    expect(soCaracteres('你好，老师！')).toBe('你好老师');
  });
});
