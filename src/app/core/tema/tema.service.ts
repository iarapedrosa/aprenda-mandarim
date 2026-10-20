import { DOCUMENT, Injectable, effect, inject, signal, computed } from '@angular/core';
import { ArmazenamentoService } from '../armazenamento/armazenamento.service';

export type PreferenciaTema = 'sistema' | 'claro' | 'escuro';

@Injectable({ providedIn: 'root' })
export class TemaService {
  private readonly documento = inject(DOCUMENT);
  private readonly armazenamento = inject(ArmazenamentoService);
  private readonly consulta =
    typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
  private readonly sistemaEscuro = signal(this.consulta?.matches ?? false);

  readonly preferencia = signal<PreferenciaTema>(
    this.armazenamento.ler<PreferenciaTema>('tema', 'sistema'),
  );

  readonly temaAtivo = computed<'claro' | 'escuro'>(() => {
    const p = this.preferencia();
    if (p === 'sistema') return this.sistemaEscuro() ? 'escuro' : 'claro';
    return p;
  });

  constructor() {
    this.consulta?.addEventListener('change', (e) => this.sistemaEscuro.set(e.matches));
    effect(() => {
      const tema = this.temaAtivo();
      const html = this.documento.documentElement;
      html.dataset['tema'] = tema;
      const meta = this.documento.querySelector('meta[name="theme-color"]');
      meta?.setAttribute('content', tema === 'escuro' ? '#15130f' : '#b3261e');
    });
    effect(() => this.armazenamento.salvar('tema', this.preferencia()));
  }

  alternar(): void {
    this.preferencia.set(this.temaAtivo() === 'escuro' ? 'claro' : 'escuro');
  }
}
