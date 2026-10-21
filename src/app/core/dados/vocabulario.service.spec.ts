import { caracteresDe, pinyinDoCaractere } from './vocabulario.service';

describe('vocabulário: caracteres', () => {
  it('extrai só os caracteres chineses', () => {
    expect(caracteresDe('因为…所以…')).toEqual(['因', '为', '所', '以']);
  });

  it('encontra o pinyin de um caractere dentro da palavra', () => {
    expect(pinyinDoCaractere('北京', 'Běijīng', '京')).toBe('jīng');
    expect(pinyinDoCaractere('女儿', "nǚ'ér", '儿')).toBe('ér');
    expect(pinyinDoCaractere('一点儿', 'yìdiǎnr', '点')).toBe('diǎn');
    expect(pinyinDoCaractere('哪儿', 'nǎr', '哪')).toBe('nǎ');
  });
});
