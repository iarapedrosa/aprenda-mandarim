import { Routes } from '@angular/router';

export const INICIO_ROTAS: Routes = [
  {
    path: '',
    title: 'Início',
    loadComponent: () => import('./inicio').then((m) => m.InicioPagina),
  },
];
