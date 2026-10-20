import { Routes } from '@angular/router';

export const FALA_ROTAS: Routes = [
  {
    path: '',
    title: 'Fala',
    loadComponent: () => import('./fala').then((m) => m.FalaPagina),
  },
];
