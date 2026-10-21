import { Routes } from '@angular/router';

export const APRENDER_ROTAS: Routes = [
  {
    path: '',
    title: 'Aprender',
    loadComponent: () => import('./aprender').then((m) => m.AprenderPagina),
  },
];
