import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { App } from './app';
import { IdiomaService } from './core/i18n/idioma.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideServiceWorker('ngsw-worker.js', { enabled: false })],
    }).compileComponents();
  });

  it('cria o app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('mostra a navegação principal em português', async () => {
    TestBed.inject(IdiomaService).idioma.set('pt');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    const rotulos = Array.from(html.querySelectorAll('.nav-celular .nav-rotulo')).map((e) =>
      e.textContent?.trim(),
    );
    expect(rotulos).toEqual(['Hoje', 'Aprender', 'Praticar', 'Cartões', 'Progresso']);
  });

  it('mostra a navegação principal em inglês', async () => {
    TestBed.inject(IdiomaService).idioma.set('en');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    const rotulos = Array.from(html.querySelectorAll('.nav-celular .nav-rotulo')).map((e) => e.textContent?.trim());
    expect(rotulos).toEqual(['Today', 'Learn', 'Practice', 'Cards', 'Progress']);
  });
});
