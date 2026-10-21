import { TestBed } from '@angular/core/testing';
import { hoje } from '../util/datas';
import { ProgressoService, normalizarEstado } from './progresso.service';

describe('ProgressoService', () => {
  let servico: ProgressoService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    servico = TestBed.inject(ProgressoService);
  });

  it('registra respostas por módulo, por tom e no dia', () => {
    servico.registrarResposta('tons', true, 3);
    servico.registrarResposta('tons', false, 3);
    const e = servico.estado();
    expect(e.porModulo.tons).toEqual({ acertos: 1, total: 2 });
    expect(e.porTom['3']).toEqual({ acertos: 1, total: 2 });
    expect(servico.atividadeHoje().exercicios).toBe(2);
    expect(servico.sequencia()).toBe(1);
  });

  it('revisa cartões só uma vez por dia e conta palavras novas', () => {
    servico.adicionarCartao('palavra', '你好');
    const c1 = servico.revisar('palavra', '你好', 4);
    expect(c1.intervalo).toBe(1);
    const c2 = servico.revisar('palavra', '你好', 1);
    expect(c2).toEqual(c1);
    expect(servico.atividadeHoje().novas).toBe(1);
  });

  it('limita as metas a valores válidos', () => {
    servico.definirMetas({ novasPorDia: 999, revisoesPorDia: -3 });
    expect(servico.metas()).toEqual({ novasPorDia: 30, revisoesPorDia: 5 });
  });

  it('exporta e importa um backup', () => {
    servico.registrarResposta('escuta', true);
    servico.adicionarCartao('palavra', '谢谢');
    const backup = JSON.parse(JSON.stringify(servico.exportar()));
    servico.apagarTudo();
    expect(servico.cartoes().length).toBe(0);
    servico.importar(backup);
    expect(servico.cartoes().length).toBe(1);
    expect(servico.estado().porModulo.escuta?.total).toBe(1);
  });

  it('recusa arquivos que não são backup', () => {
    expect(() => servico.importar({ foo: 1 })).toThrowError(/não é um backup/);
    expect(() => servico.importar(null)).toThrowError();
  });

  it('migra lições salvas como lista para o formato com datas', () => {
    const e = normalizarEstado({ licoesPinyin: ['tons'] as unknown as Record<string, string> });
    expect(Object.keys(e.licoesPinyin)).toEqual(['tons']);
    expect(e.licoesPinyin['tons']).toBe(hoje());
  });
});
