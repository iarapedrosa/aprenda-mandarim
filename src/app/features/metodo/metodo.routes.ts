import { Routes } from '@angular/router';

export const METODO_ROTAS: Routes = [
  {
    path: '',
    title: 'O método e a ciência',
    loadComponent: () => import('./metodo').then((m) => m.MetodoPagina),
  },
];
