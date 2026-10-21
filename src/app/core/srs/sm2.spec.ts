import {
  CartaoSrs,
  FACILIDADE_MINIMA,
  cartoesVencidos,
  estagio,
  idCartao,
  novaFacilidade,
  notaDaEscrita,
  notaDoExercicio,
  novoCartao,
  revisarCartao,
  revisarSm2,
} from './sm2';

const HOJE = '2026-10-20';

describe('SM-2: fator de facilidade', () => {
  it('nota 5 aumenta a facilidade em 0,1', () => {
    expect(novaFacilidade(2.5, 5)).toBe(2.6);
  });

  it('nota 4 mantém a facilidade', () => {
    expect(novaFacilidade(2.5, 4)).toBe(2.5);
  });

  it('nota 3 diminui 0,14', () => {
    expect(novaFacilidade(2.5, 3)).toBe(2.36);
  });

  it('nota 0 diminui 0,8, respeitando o mínimo de 1,3', () => {
    expect(novaFacilidade(2.5, 0)).toBe(1.7);
    expect(novaFacilidade(1.4, 0)).toBe(FACILIDADE_MINIMA);
  });
});

describe('SM-2: intervalos', () => {
  it('segue 1 dia, 6 dias e depois intervalo × facilidade', () => {
    let c = novoCartao('palavra', '你好', HOJE);
    c = revisarCartao(c, 4, HOJE);
    expect(c.intervalo).toBe(1);
    expect(c.vencimento).toBe('2026-10-21');

    c = revisarCartao(c, 4, '2026-10-21');
    expect(c.intervalo).toBe(6);
    expect(c.vencimento).toBe('2026-10-27');

    c = revisarCartao(c, 4, '2026-10-27');
    expect(c.intervalo).toBe(15); // 6 × 2,5
    expect(c.vencimento).toBe('2026-11-11');
    expect(c.repeticoes).toBe(3);
  });

  it('usa a facilidade ANTERIOR para calcular o intervalo', () => {
    const estado = { repeticoes: 2, facilidade: 2.0, intervalo: 10, vencimento: HOJE };
    const r = revisarSm2(estado, 5, HOJE);
    expect(r.intervalo).toBe(20);
    expect(r.facilidade).toBe(2.1);
  });

  it('erro zera as repetições e traz o cartão de volta amanhã', () => {
    let c: CartaoSrs = { ...novoCartao('palavra', '谢谢', HOJE), repeticoes: 4, intervalo: 30, revisoes: 4 };
    c = revisarCartao(c, 1, HOJE);
    expect(c.repeticoes).toBe(0);
    expect(c.intervalo).toBe(1);
    expect(c.vencimento).toBe('2026-10-21');
    expect(c.lapsos).toBe(1);
  });

  it('erro em cartão novo não conta como lapso', () => {
    const c = revisarCartao(novoCartao('palavra', '我', HOJE), 1, HOJE);
    expect(c.lapsos).toBe(0);
    expect(c.revisoes).toBe(1);
  });

  it('limita o intervalo a 365 dias', () => {
    const estado = { repeticoes: 10, facilidade: 3, intervalo: 300, vencimento: HOJE };
    expect(revisarSm2(estado, 5, HOJE).intervalo).toBe(365);
  });

  it('atravessa a virada do ano corretamente', () => {
    const estado = { repeticoes: 1, facilidade: 2.5, intervalo: 1, vencimento: '2026-12-28' };
    expect(revisarSm2(estado, 4, '2026-12-28').vencimento).toBe('2027-01-03');
  });
});

describe('SM-2: seleção de cartões', () => {
  it('lista vencidos (mais atrasados primeiro) e ignora cartões nunca revisados', () => {
    const base = novoCartao('palavra', 'x', HOJE);
    const cartoes: CartaoSrs[] = [
      { ...base, id: 'a', revisoes: 2, vencimento: '2026-10-19', facilidade: 2.5 },
      { ...base, id: 'b', revisoes: 2, vencimento: '2026-10-21', facilidade: 2.5 },
      { ...base, id: 'c', revisoes: 2, vencimento: '2026-10-15', facilidade: 2.5 },
      { ...base, id: 'd', revisoes: 0, vencimento: '2026-10-10', facilidade: 2.5 },
      { ...base, id: 'e', revisoes: 3, vencimento: '2026-10-19', facilidade: 1.5 },
    ];
    expect(cartoesVencidos(cartoes, HOJE).map((c) => c.id)).toEqual(['c', 'e', 'a']);
  });

  it('monta ids padronizados', () => {
    expect(idCartao('escrita', '你')).toBe('escrita:你');
  });

  it('classifica o estágio', () => {
    const c = novoCartao('palavra', 'x', HOJE);
    expect(estagio(c)).toBe('novo');
    expect(estagio({ ...c, revisoes: 1, repeticoes: 1, intervalo: 1 })).toBe('aprendendo');
    expect(estagio({ ...c, revisoes: 3, repeticoes: 3, intervalo: 15 })).toBe('jovem');
    expect(estagio({ ...c, revisoes: 5, repeticoes: 5, intervalo: 40 })).toBe('maduro');
  });
});

describe('SM-2: notas automáticas', () => {
  it('converte acerto/erro de exercício', () => {
    expect(notaDoExercicio(true)).toBe(4);
    expect(notaDoExercicio(true, { hesitou: true })).toBe(3);
    expect(notaDoExercicio(false)).toBe(1);
  });

  it('converte erros de traço da escrita', () => {
    expect(notaDaEscrita(0, false)).toBe(5);
    expect(notaDaEscrita(2, false)).toBe(4);
    expect(notaDaEscrita(4, false)).toBe(3);
    expect(notaDaEscrita(7, false)).toBe(1);
    expect(notaDaEscrita(1, true)).toBe(3);
    expect(notaDaEscrita(5, true)).toBe(2);
  });
});
