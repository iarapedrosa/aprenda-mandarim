import { Component, DOCUMENT, ElementRef, HostListener, computed, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { filter } from 'rxjs';
import { APRENDER, Grupo, PRATICAR, SOBRE, grupoDaUrl } from './core/navegacao';
import { TemaService } from './core/tema/tema.service';
import { IdiomaService } from './core/i18n/idioma.service';
import { VozService } from './core/voz/voz.service';

interface AbaPrincipal {
  grupo: Grupo;
  rota: string;
  rotulo: string;
  rotuloEn: string;
  icone: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly i = inject(IdiomaService);
  protected readonly tema = inject(TemaService);
  protected readonly voz = inject(VozService);
  private readonly sw = inject(SwUpdate);
  private readonly router = inject(Router);
  private readonly documento = inject(DOCUMENT);

  protected readonly aprender = APRENDER;
  protected readonly praticar = PRATICAR;
  protected readonly sobre = SOBRE;

  /** Abas da barra inferior (celular). */
  protected readonly abas: AbaPrincipal[] = [
    { grupo: 'hoje', rota: '/', rotulo: 'Hoje', rotuloEn: 'Today', icone: '今' },
    { grupo: 'aprender', rota: '/aprender', rotulo: 'Aprender', rotuloEn: 'Learn', icone: '学' },
    { grupo: 'praticar', rota: '/praticar', rotulo: 'Praticar', rotuloEn: 'Practice', icone: '练' },
    { grupo: 'cartoes', rota: '/cartoes', rotulo: 'Cartões', rotuloEn: 'Cards', icone: '卡' },
    { grupo: 'progresso', rota: '/progresso', rotulo: 'Progresso', rotuloEn: 'Progress', icone: '进' },
  ];

  protected readonly url = signal('/');
  protected readonly grupo = computed(() => grupoDaUrl(this.url()));
  /** durante o treino a barra inferior e o rodapé somem, para dar foco */
  protected readonly emTreino = computed(() => this.url().startsWith('/treino'));
  protected readonly atualizacaoDisponivel = signal(false);

  /** submenu aberto no topo (computador) */
  protected readonly submenu = signal<'aprender' | 'praticar' | null>(null);
  /** menu completo (☰) */
  protected readonly menuAberto = signal(false);
  private readonly botaoMenu = viewChild<ElementRef<HTMLButtonElement>>('botaoMenu');
  private readonly painel = viewChild<ElementRef<HTMLElement>>('painel');

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      this.url.set((e as NavigationEnd).urlAfterRedirects);
      this.submenu.set(null);
      this.fecharMenu(false);
      // abas de seção roláveis (celular): traz a aba ativa para a área visível
      setTimeout(() => {
        for (const aba of this.documento.querySelectorAll<HTMLElement>('.abas .ativa')) {
          const faixa = aba.parentElement!;
          faixa.scrollLeft = aba.offsetLeft - (faixa.clientWidth - aba.offsetWidth) / 2;
        }
      }, 50);
    });
    if (this.sw.isEnabled) {
      this.sw.versionUpdates
        .pipe(filter((e) => e.type === 'VERSION_READY'))
        .subscribe(() => this.atualizacaoDisponivel.set(true));
    }
  }

  protected alternarSubmenu(qual: 'aprender' | 'praticar', evento: Event): void {
    evento.stopPropagation();
    this.submenu.update((atual) => (atual === qual ? null : qual));
  }

  protected abrirMenu(): void {
    this.menuAberto.set(true);
    this.documento.body.style.overflow = 'hidden';
    setTimeout(() => this.painel()?.nativeElement.querySelector<HTMLElement>('a, button')?.focus());
  }

  protected fecharMenu(devolverFoco = true): void {
    if (!this.menuAberto()) return;
    this.menuAberto.set(false);
    this.documento.body.style.overflow = '';
    if (devolverFoco) this.botaoMenu()?.nativeElement.focus();
  }

  @HostListener('document:click')
  protected cliqueFora(): void {
    this.submenu.set(null);
  }

  @HostListener('document:keydown.escape')
  protected esc(): void {
    this.submenu.set(null);
    this.fecharMenu();
  }

  /** Mantém o foco dentro do painel enquanto ele está aberto. */
  protected prenderFoco(evento: KeyboardEvent): void {
    if (evento.key !== 'Tab') return;
    const focaveis = this.painel()?.nativeElement.querySelectorAll<HTMLElement>('a, button');
    if (!focaveis?.length) return;
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    if (evento.shiftKey && this.documento.activeElement === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && this.documento.activeElement === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  }

  protected atualizar(): void {
    document.location.reload();
  }
}
