import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/** "Título da página · Aprenda Mandarim" */
@Injectable({ providedIn: 'root' })
export class TituloStrategy extends TitleStrategy {
  private readonly titulo = inject(Title);

  override updateTitle(estado: RouterStateSnapshot): void {
    const pagina = this.buildTitle(estado);
    this.titulo.setTitle(pagina ? `${pagina} · Aprenda Mandarim` : 'Aprenda Mandarim');
  }
}
