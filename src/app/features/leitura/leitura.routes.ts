import { Routes } from '@angular/router';

export const LEITURA_ROTAS: Routes = [
  {
    path: '',
    title: 'Leitura',
    loadComponent: () => import('./leitura').then((m) => m.LeituraPagina),
  },
];
