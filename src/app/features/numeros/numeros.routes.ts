import { Routes } from '@angular/router';

export const NUMEROS_ROTAS: Routes = [
  {
    path: '',
    loadComponent: () => import('./numeros').then((m) => m.NumerosPagina),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'aprender' },
      {
        path: 'aprender',
        title: 'Números',
        loadComponent: () => import('./aprender/aprender').then((m) => m.AprenderNumerosPagina),
      },
      {
        path: 'conversor',
        title: 'Conversor de números',
        loadComponent: () => import('./conversor/conversor').then((m) => m.ConversorPagina),
      },
      {
        path: 'praticar',
        title: 'Praticar números',
        loadComponent: () => import('./praticar/praticar-numeros').then((m) => m.PraticarNumerosPagina),
      },
    ],
  },
];
