import { Routes } from '@angular/router';

export const CARACTERES_ROTAS: Routes = [
  {
    path: '',
    title: 'Caracteres',
    loadComponent: () => import('./caracteres').then((m) => m.CaracteresPagina),
  },
];
