import { Palavra } from '../dados/modelos';
import { PARES, alternativasDePar, nomePar, observacaoPar, palavrasPorPar, pinyinComTons } from './pares-tons';

const palavra = (hanzi: string, pinyin: string): Palavra => ({ id: hanzi, hanzi, pinyin, traducao: '', classe: '', nivel: 1 });

describe('pares de tons', () => {
  it('tem as 20 combinações', () => {
    expect(PARES).toHaveLength(20);
    expect(nomePar([3, 5])).toBe('3º + neutro');
  });

  it('agrupa palavras de duas sílabas pelo par de tons', () => {
    const mapa = palavrasPorPar([
      palavra('老师', 'lǎoshī'),
      palavra('北京', 'Běijīng'),
      palavra('谢谢', 'xièxie'),
      palavra('你', 'nǐ'),
      palavra('出租车', 'chūzūchē'),
      palavra('哪儿', 'nǎr'),
    ]);
    expect(mapa.get('3-1')?.map((p) => p.hanzi)).toEqual(['老师', '北京']);
    expect(mapa.get('4-5')?.map((p) => p.hanzi)).toEqual(['谢谢']);
    expect([...mapa.values()].flat()).toHaveLength(3);
  });

  it('gera quatro alternativas diferentes, incluindo a correta', () => {
    const p = palavrasPorPar([palavra('老师', 'lǎoshī')]).get('3-1')![0];
    const alt = alternativasDePar(p);
    expect(alt).toHaveLength(4);
    expect(new Set(alt.map((a) => a.valor)).size).toBe(4);
    expect(alt.some((a) => a.valor === '3-1' && a.rotulo === 'lǎoshī')).toBe(true);
    expect(pinyinComTons(p, [2, 4])).toBe('láoshì');
  });

  it('avisa sobre o sandhi do 3º tom', () => {
    const [p] = palavrasPorPar([palavra('水果', 'shuǐguǒ')]).get('3-3')!;
    expect(observacaoPar(p)).toContain('3+3');
  });
});
