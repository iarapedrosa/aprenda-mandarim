import { Routes } from '@angular/router';

export const CARTOES_ROTAS: Routes = [
  {
    path: '',
    title: 'Cartões',
    loadComponent: () => import('./cartoes').then((m) => m.CartoesPagina),
  },
];
