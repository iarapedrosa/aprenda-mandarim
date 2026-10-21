import { Routes } from '@angular/router';

export const CONTATO_ROTAS: Routes = [
  {
    path: '',
    title: 'Contato',
    loadComponent: () => import('./contato').then((m) => m.ContatoPagina),
  },
];
