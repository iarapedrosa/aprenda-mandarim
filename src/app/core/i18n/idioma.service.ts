import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';
import { ArmazenamentoService } from '../armazenamento/armazenamento.service';

/** Idioma da interface: português ↔ mandarim ou inglês ↔ mandarim. */
export type Idioma = 'pt' | 'en';

function idiomaDoNavegador(): Idioma {
  if (typeof navigator === 'undefined') return 'pt';
  const preferidos = navigator.languages?.length ? navigator.languages : [navigator.language];
  return preferidos.some((l) => l?.toLowerCase().startsWith('pt')) ? 'pt' : 'en';
}

/**
 * Traduções ficam ao lado do texto original: `i.t('Olá', 'Hello')`.
 * Nos dados (JSON), o inglês fica em campos com sufixo "En" (traducao → traducaoEn).
 */
@Injectable({ providedIn: 'root' })
export class IdiomaService {
  private readonly armazenamento = inject(ArmazenamentoService);
  private readonly documento = inject(DOCUMENT);

  readonly idioma = signal<Idioma>(this.armazenamento.ler<Idioma | null>('idioma', null) ?? idiomaDoNavegador());
  readonly ingles = computed(() => this.idioma() === 'en');
  /** locale para datas e números */
  readonly locale = computed(() => (this.ingles() ? 'en-US' : 'pt-BR'));

  constructor() {
    effect(() => {
      const idioma = this.idioma();
      this.armazenamento.salvar('idioma', idioma);
      this.documento.documentElement.lang = idioma === 'en' ? 'en' : 'pt-BR';
    });
  }

  /** Escolhe o texto do idioma atual. */
  t(pt: string, en: string): string {
    return this.idioma() === 'en' ? en : pt;
  }

  /**
   * Campo traduzido de um objeto de dados: em inglês usa `campoEn` se existir.
   * Ex.: tr(palavra, 'traducao') → palavra.traducaoEn ?? palavra.traducao
   */
  tr<T extends object>(obj: T | null | undefined, campo: keyof T & string): string {
    if (!obj) return '';
    const registro = obj as Record<string, unknown>;
    if (this.idioma() === 'en') {
      const en = registro[`${campo}En`];
      if (typeof en === 'string' && en) return en;
    }
    const valor = registro[campo];
    return typeof valor === 'string' ? valor : '';
  }

  /** Igual a `tr`, para listas de textos (ex.: parágrafos de explicação). */
  trLista<T extends object>(obj: T | null | undefined, campo: keyof T & string): string[] {
    if (!obj) return [];
    const registro = obj as Record<string, unknown>;
    if (this.idioma() === 'en' && Array.isArray(registro[`${campo}En`])) return registro[`${campo}En`] as string[];
    return Array.isArray(registro[campo]) ? (registro[campo] as string[]) : [];
  }

  alternar(): void {
    this.idioma.update((i) => (i === 'pt' ? 'en' : 'pt'));
  }
}
