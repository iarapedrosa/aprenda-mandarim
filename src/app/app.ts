import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { filter } from 'rxjs';
import { TemaService } from './core/tema/tema.service';

interface ItemNavegacao {
  rota: string;
  rotulo: string;
  icone: string;
  exato?: boolean;
  /** aparece só no menu superior (desktop) */
  soDesktop?: boolean;
  /** aparece só na barra inferior (celular) */
  soCelular?: boolean;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly tema = inject(TemaService);
  private readonly sw = inject(SwUpdate);
  private readonly router = inject(Router);
  protected readonly atualizacaoDisponivel = signal(false);
  /** durante o treino a barra inferior some, para dar foco */
  protected readonly emTreino = signal(false);

  protected readonly navegacao: ItemNavegacao[] = [
    { rota: '/', rotulo: 'Hoje', icone: '今', exato: true },
    { rota: '/pinyin', rotulo: 'Pinyin', icone: '音' },
    { rota: '/caracteres', rotulo: 'Caracteres', icone: '字' },
    { rota: '/praticar', rotulo: 'Praticar', icone: '练', soCelular: true },
    { rota: '/escrita', rotulo: 'Escrita', icone: '写', soDesktop: true },
    { rota: '/leitura', rotulo: 'Leitura', icone: '读', soDesktop: true },
    { rota: '/escuta', rotulo: 'Escuta', icone: '听', soDesktop: true },
    { rota: '/fala', rotulo: 'Fala', icone: '说', soDesktop: true },
    { rota: '/numeros', rotulo: 'Números', icone: '数', soDesktop: true },
    { rota: '/cartoes', rotulo: 'Cartões', icone: '卡', soDesktop: true },
    { rota: '/progresso', rotulo: 'Progresso', icone: '进' },
  ];

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => this.emTreino.set((e as NavigationEnd).urlAfterRedirects.startsWith('/treino')));
    if (this.sw.isEnabled) {
      this.sw.versionUpdates
        .pipe(filter((e) => e.type === 'VERSION_READY'))
        .subscribe(() => this.atualizacaoDisponivel.set(true));
    }
  }

  protected atualizar(): void {
    document.location.reload();
  }
}
