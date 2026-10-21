import { Routes } from '@angular/router';

export const CARACTERES_ROTAS: Routes = [
  {
    path: '',
    title: 'Caracteres',
    loadComponent: () => import('./caracteres').then((m) => m.CaracteresPagina),
  },
  {
    path: 'radicais',
    title: 'Radicais',
    loadComponent: () => import('./radicais/radicais').then((m) => m.RadicaisPagina),
  },
  {
    path: 'palavra/:id',
    title: 'Palavra',
    loadComponent: () => import('./palavra/palavra').then((m) => m.PalavraPagina),
  },
];
