import { grupoDaUrl } from './navegacao';

describe('navegação: grupo ativo', () => {
  it.each([
    ['/', 'inicio'],
    ['/hoje', 'hoje'],
    ['/treino', 'hoje'],
    ['/pinyin/tons', 'aprender'],
    ['/caracteres/palavra/你好', 'aprender'],
    ['/gramatica/g01', 'aprender'],
    ['/numeros/conversor', 'aprender'],
    ['/pinyin/treino', 'praticar'],
    ['/leitura/d01', 'praticar'],
    ['/escrita?texto=你', 'praticar'],
    ['/cartoes', 'cartoes'],
    ['/progresso', 'progresso'],
    ['/metodo', 'sobre'],
  ])('%s → %s', (url, grupo) => {
    expect(grupoDaUrl(url)).toBe(grupo);
  });
});
