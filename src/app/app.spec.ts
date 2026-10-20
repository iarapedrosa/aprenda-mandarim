import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { App } from './app';

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
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    const rotulos = Array.from(html.querySelectorAll('.nav-celular .nav-rotulo')).map((e) =>
      e.textContent?.trim(),
    );
    expect(rotulos).toEqual(['Hoje', 'Pinyin', 'Caracteres', 'Praticar', 'Progresso']);
  });
});
