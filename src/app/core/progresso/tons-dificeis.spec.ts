import { confusoesFrequentes, pesosDosTons, sortearPonderado } from './tons-dificeis';

describe('tons difíceis', () => {
  const confusao = { '2>3': 5, '3>2': 3, '1>4': 1 };

  it('soma as confusões nos dois sentidos e ordena', () => {
    expect(confusoesFrequentes(confusao)).toEqual([
      { a: 2, b: 3, vezes: 8 },
      { a: 1, b: 4, vezes: 1 },
    ]);
  });

  it('dá mais peso aos tons mais confundidos', () => {
    const p = pesosDosTons(confusao);
    expect(p[2]).toBe(3);
    expect(p[3]).toBe(3);
    expect(p[1]).toBeCloseTo(1.25);
    expect(p[5]).toBe(1);
  });

  it('sem histórico, todos têm o mesmo peso', () => {
    expect(Object.values(pesosDosTons({}))).toEqual([1, 1, 1, 1, 1]);
  });

  it('sorteia respeitando os pesos', () => {
    expect(sortearPonderado(['a', 'b'], (x) => (x === 'a' ? 1 : 0), () => 0.5)).toBe('a');
    expect(sortearPonderado(['a', 'b'], (x) => (x === 'a' ? 1 : 3), () => 0.9)).toBe('b');
  });
});
