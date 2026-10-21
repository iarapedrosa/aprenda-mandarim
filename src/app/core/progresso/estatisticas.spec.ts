import { melhorSequencia, sequenciaAtual, taxa } from './estatisticas';
import { AtividadeDia } from './progresso.model';

const ativo: AtividadeDia = { exercicios: 5, acertos: 4, novas: 0, revisoes: 0, treinoConcluido: true, segundos: 60 };
const vazio: AtividadeDia = { ...ativo, exercicios: 0 };

describe('estatísticas: sequência de dias (streak)', () => {
  it('conta dias seguidos até hoje', () => {
    const a = { '2026-10-18': ativo, '2026-10-19': ativo, '2026-10-20': ativo };
    expect(sequenciaAtual(a, '2026-10-20')).toBe(3);
  });

  it('mantém a sequência de ontem se hoje ainda não praticou', () => {
    const a = { '2026-10-18': ativo, '2026-10-19': ativo };
    expect(sequenciaAtual(a, '2026-10-20')).toBe(2);
  });

  it('zera quando pulou um dia', () => {
    const a = { '2026-10-17': ativo, '2026-10-18': ativo };
    expect(sequenciaAtual(a, '2026-10-20')).toBe(0);
  });

  it('ignora dias sem exercícios', () => {
    const a = { '2026-10-19': vazio, '2026-10-20': ativo };
    expect(sequenciaAtual(a, '2026-10-20')).toBe(1);
  });

  it('atravessa a virada do mês', () => {
    const a = { '2026-09-30': ativo, '2026-10-01': ativo };
    expect(sequenciaAtual(a, '2026-10-01')).toBe(2);
  });

  it('calcula a melhor sequência', () => {
    const a = {
      '2026-10-01': ativo,
      '2026-10-02': ativo,
      '2026-10-03': ativo,
      '2026-10-05': ativo,
      '2026-10-06': ativo,
    };
    expect(melhorSequencia(a)).toBe(3);
    expect(melhorSequencia({})).toBe(0);
  });
});

describe('estatísticas: taxa de acerto', () => {
  it('arredonda a porcentagem e trata zero', () => {
    expect(taxa(2, 3)).toBe(67);
    expect(taxa(0, 0)).toBeNull();
  });
});
