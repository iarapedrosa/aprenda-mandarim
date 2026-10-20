import { Routes } from '@angular/router';

export const ESCUTA_ROTAS: Routes = [
  {
    path: '',
    title: 'Escuta',
    loadComponent: () => import('./escuta').then((m) => m.EscutaPagina),
  },
];
