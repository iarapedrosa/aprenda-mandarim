import { Injectable, effect, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { IdiomaService } from './i18n/idioma.service';

/** Títulos das rotas em inglês (as rotas declaram o título em português). */
const TITULOS_EN: Record<string, string> = {
  'Treino de hoje': "Today's training",
  Treino: 'Training',
  'Os tons': 'The tones',
  'Iniciais e finais': 'Initials and finals',
  'Armadilhas para brasileiros': 'Common pitfalls',
  'Sandhi tonal': 'Tone sandhi',
  'Treino de tons': 'Tone training',
  Caracteres: 'Characters',
  Radicais: 'Radicals',
  Palavra: 'Word',
  Escrita: 'Writing',
  Leitura: 'Reading',
  Texto: 'Text',
  Escuta: 'Listening',
  Fala: 'Speaking',
  Aprender: 'Learn',
  Praticar: 'Practice',
  Progresso: 'Progress',
  Cartões: 'Flashcards',
  Números: 'Numbers',
  'Conversor de números': 'Number converter',
  'Praticar números': 'Number practice',
  Gramática: 'Grammar',
  'Lição de gramática': 'Grammar lesson',
  'Recursos para estudar': 'Study resources',
  'O método e a ciência': 'The method and the science',
  Contato: 'Contact',
};

/** "Título da página · Aprenda Mandarim" (ou "· Learn Mandarin" em inglês). */
@Injectable({ providedIn: 'root' })
export class TituloStrategy extends TitleStrategy {
  private readonly titulo = inject(Title);
  private readonly i = inject(IdiomaService);
  private ultimo: string | undefined;

  constructor() {
    super();
    effect(() => {
      this.i.idioma();
      this.aplicar();
    });
  }

  override updateTitle(estado: RouterStateSnapshot): void {
    this.ultimo = this.buildTitle(estado);
    this.aplicar();
  }

  private aplicar(): void {
    const site = this.i.t('Aprenda Mandarim', 'Learn Mandarin');
    const pagina = this.ultimo ? this.i.t(this.ultimo, TITULOS_EN[this.ultimo] ?? this.ultimo) : '';
    this.titulo.setTitle(pagina ? `${pagina} · ${site}` : site);
  }
}
