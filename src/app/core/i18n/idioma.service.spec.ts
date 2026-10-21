import { TestBed } from '@angular/core/testing';
import { IdiomaService } from './idioma.service';

describe('IdiomaService', () => {
  let i: IdiomaService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    i = TestBed.inject(IdiomaService);
    i.idioma.set('pt');
  });

  it('escolhe o texto do idioma atual', () => {
    expect(i.t('Olá', 'Hello')).toBe('Olá');
    i.idioma.set('en');
    expect(i.t('Olá', 'Hello')).toBe('Hello');
  });

  it('lê campos traduzidos dos dados, com o português como reserva', () => {
    const palavra = { traducao: 'você', traducaoEn: 'you', classe: 'pronome' };
    expect(i.tr(palavra, 'traducao')).toBe('você');
    i.idioma.set('en');
    expect(i.tr(palavra, 'traducao')).toBe('you');
    expect(i.tr(palavra, 'classe')).toBe('pronome');
  });

  it('traduz listas', () => {
    const licao = { explicacao: ['a', 'b'], explicacaoEn: ['A', 'B'] };
    i.idioma.set('en');
    expect(i.trLista(licao, 'explicacao')).toEqual(['A', 'B']);
  });

  it('alterna e atualiza o lang do documento', () => {
    i.alternar();
    TestBed.tick();
    expect(i.idioma()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
