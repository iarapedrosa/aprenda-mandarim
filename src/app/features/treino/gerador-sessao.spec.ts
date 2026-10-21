import { Palavra } from '../../core/dados/modelos';
import { EstadoProgresso } from '../../core/progresso/progresso.model';
import { normalizarEstado } from '../../core/progresso/progresso.service';
import { CartaoSrs, novoCartao } from '../../core/srs/sm2';
import { LICOES_PINYIN } from './curriculo';
import { ContextoSessao, acumuloDeRevisoes, etapaAtual, gerarSessao, palavrasLiberadas } from './gerador-sessao';

const HOJE = '2026-10-20';
const ONTEM = '2026-10-19';

const palavras: Palavra[] = Array.from({ length: 40 }, (_, i) => ({
  id: `p${i}`,
  hanzi: '一二三四五六七八九十'[i % 10] + '人大小中'[i % 4] + (i >= 10 ? '好' : ''),
  pinyin: 'yī rén',
  traducao: `tradução ${i}`,
  classe: 'substantivo',
  nivel: 1,
}));

function contexto(estado: Partial<EstadoProgresso>): ContextoSessao {
  return {
    hoje: HOJE,
    estado: normalizarEstado(estado),
    palavras,
    frases: [],
    infoCaractere: (c) => ({ hanzi: c, pinyin: '', traducao: '' }),
    silabasAquecimento: [
      { hanzi: '妈', pinyin: 'mā', letras: 'ma' },
      { hanzi: '马', pinyin: 'mǎ', letras: 'ma' },
      { hanzi: '八', pinyin: 'bā', letras: 'ba' },
    ],
  };
}

function cartaoRevisado(ref: string, extra: Partial<CartaoSrs> = {}): CartaoSrs {
  return { ...novoCartao('palavra', ref, '2026-10-01'), revisoes: 2, repeticoes: 2, intervalo: 6, vencimento: HOJE, ...extra };
}

describe('treino diário: progressão', () => {
  it('no primeiro dia só tem pinyin (aquecimento + 2 lições)', () => {
    const plano = gerarSessao(contexto({}));
    expect(plano.etapa).toBe('pinyin');
    expect(plano.resumo.licoes).toBe(2);
    expect(plano.resumo.novas).toBe(0);
    expect(plano.itens.filter((i) => i.tipo === 'licao').map((i) => i.licao)).toEqual(['tons', 'iniciais-1']);
  });

  it('libera palavras no dia seguinte às 2 primeiras lições', () => {
    const feitasHoje = { licoesPinyin: { tons: HOJE, 'iniciais-1': HOJE } };
    expect(palavrasLiberadas(normalizarEstado(feitasHoje), HOJE)).toBe(false);
    const feitasOntem = { licoesPinyin: { tons: ONTEM, 'iniciais-1': ONTEM } };
    expect(palavrasLiberadas(normalizarEstado(feitasOntem), HOJE)).toBe(true);
  });

  it('libera na hora quando todas as lições foram feitas (ex.: "já sei pinyin")', () => {
    const todas = Object.fromEntries(LICOES_PINYIN.map((l) => [l.id, HOJE]));
    expect(palavrasLiberadas(normalizarEstado({ licoesPinyin: todas }), HOJE)).toBe(true);
  });

  it('libera frases depois de 30 palavras estudadas', () => {
    const licoesPinyin = Object.fromEntries(LICOES_PINYIN.map((l) => [l.id, ONTEM]));
    const cartoes = Object.fromEntries(
      palavras.slice(0, 30).map((p) => [`palavra:${p.id}`, cartaoRevisado(p.id, { vencimento: '2026-11-01' })]),
    );
    expect(etapaAtual(normalizarEstado({ licoesPinyin }), HOJE)).toBe('palavras');
    expect(etapaAtual(normalizarEstado({ licoesPinyin, cartoes }), HOJE)).toBe('frases');
  });
});

describe('treino diário: metas', () => {
  const licoesPinyin = Object.fromEntries(LICOES_PINYIN.map((l) => [l.id, ONTEM]));

  it('respeita a meta de palavras novas e apresenta antes de perguntar', () => {
    const plano = gerarSessao(contexto({ licoesPinyin, metas: { novasPorDia: 5, revisoesPorDia: 20 } }));
    expect(plano.resumo.novas).toBe(5);
    const apresentacoes = plano.itens.filter((i) => i.tipo === 'apresentar');
    expect(apresentacoes.length).toBe(5);
    const primeiraApresentacao = plano.itens.findIndex((i) => i.tipo === 'apresentar');
    const primeiraPergunta = plano.itens.findIndex((i) => i.tipo === 'escolha' && i.cartao?.tipo === 'palavra');
    expect(primeiraApresentacao).toBeLessThan(primeiraPergunta);
  });

  it('desconta as palavras novas já aprendidas hoje', () => {
    const atividade = { [HOJE]: { exercicios: 10, acertos: 8, novas: 4, revisoes: 0, treinoConcluido: false, segundos: 0 } };
    const plano = gerarSessao(contexto({ licoesPinyin, atividade, metas: { novasPorDia: 5, revisoesPorDia: 20 } }));
    expect(plano.resumo.novas).toBe(1);
  });

  it('limita as revisões à meta (até o dobro quando há atraso)', () => {
    const poucas = Object.fromEntries(palavras.slice(0, 8).map((p) => [`palavra:${p.id}`, cartaoRevisado(p.id)]));
    expect(gerarSessao(contexto({ licoesPinyin, cartoes: poucas, metas: { novasPorDia: 0, revisoesPorDia: 10 } })).resumo.revisoes).toBe(8);
    const cartoes = Object.fromEntries(palavras.slice(0, 25).map((p) => [`palavra:${p.id}`, cartaoRevisado(p.id)]));
    const plano = gerarSessao(contexto({ licoesPinyin, cartoes, metas: { novasPorDia: 0, revisoesPorDia: 10 } }));
    expect(plano.resumo.revisoes).toBe(20);
    expect(plano.resumo.novas).toBe(0);
  });

  it('introduz a escrita de caracteres de palavras aprendidas antes', () => {
    const cartoes = { 'palavra:p0': cartaoRevisado('p0', { vencimento: '2026-11-01' }) };
    const plano = gerarSessao(contexto({ licoesPinyin, cartoes, metas: { novasPorDia: 0, revisoesPorDia: 10 } }));
    const escrita = plano.itens.filter((i) => i.tipo === 'escrever');
    expect(escrita.map((i) => (i.tipo === 'escrever' ? i.caractere.hanzi : ''))).toEqual(['一', '人']);
  });
});

describe('treino diário: acúmulo de revisões', () => {
  it('sem atraso, segue a meta', () => {
    expect(acumuloDeRevisoes(15, 20)).toEqual({ limiteRevisoes: 20, fatorNovas: 1 });
  });

  it('com atraso, aumenta o limite até o dobro', () => {
    expect(acumuloDeRevisoes(25, 20).limiteRevisoes).toBe(25);
    expect(acumuloDeRevisoes(100, 20).limiteRevisoes).toBe(40);
  });

  it('reduz palavras novas conforme o acúmulo', () => {
    expect(acumuloDeRevisoes(35, 20).fatorNovas).toBe(0.5);
    expect(acumuloDeRevisoes(61, 20).fatorNovas).toBe(0);
    expect(acumuloDeRevisoes(61, 20).aviso).toContain('61 revisões');
  });

  it('aplica isso na sessão', () => {
    const licoesPinyin = Object.fromEntries(LICOES_PINYIN.map((l) => [l.id, ONTEM]));
    const cartoes = Object.fromEntries(palavras.slice(0, 35).map((p) => [`palavra:${p.id}`, cartaoRevisado(p.id)]));
    const plano = gerarSessao(contexto({ licoesPinyin, cartoes, metas: { novasPorDia: 6, revisoesPorDia: 10 } }));
    expect(plano.resumo.revisoes).toBe(20);
    expect(plano.resumo.novas).toBe(0);
    expect(plano.aviso).toBeTruthy();
  });
});

describe('treino diário: gramática', () => {
  const licoesPinyin = Object.fromEntries(LICOES_PINYIN.map((l) => [l.id, ONTEM]));
  const licao = (id: string, minPalavras: number) => ({
    id,
    titulo: id,
    minPalavras,
    estrutura: '',
    explicacao: [],
    exemplos: [],
    exercicios: [{ pergunta: '?', opcoes: ['a', 'b'], correta: 0, explicacao: '' }],
  });

  it('inclui a próxima lição liberada pelo vocabulário, uma por dia', () => {
    const cartoes = Object.fromEntries(palavras.slice(0, 5).map((p) => [`palavra:${p.id}`, cartaoRevisado(p.id, { vencimento: '2026-11-01' })]));
    const ctx = { ...contexto({ licoesPinyin, cartoes }), gramatica: [licao('g01', 3), licao('g02', 8)] };
    const plano = gerarSessao(ctx);
    expect(plano.itens.filter((i) => i.tipo === 'gramatica').map((i) => i.licao)).toEqual(['gramatica:g01']);
    expect(plano.resumo.gramatica).toBe(1);

    const feitaHoje = { ...contexto({ licoesPinyin, cartoes, licoesGramatica: { g01: HOJE } }), gramatica: ctx.gramatica };
    expect(gerarSessao(feitaHoje).resumo.gramatica).toBe(0);
  });
});
