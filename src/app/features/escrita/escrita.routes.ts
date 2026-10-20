import { Routes } from '@angular/router';

export const ESCRITA_ROTAS: Routes = [
  {
    path: '',
    title: 'Escrita',
    loadComponent: () => import('./escrita').then((m) => m.EscritaPagina),
  },
];
