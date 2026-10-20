import { Routes } from '@angular/router';

export const PRATICAR_ROTAS: Routes = [
  {
    path: '',
    title: 'Praticar',
    loadComponent: () => import('./praticar').then((m) => m.PraticarPagina),
  },
];
