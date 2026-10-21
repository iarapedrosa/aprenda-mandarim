import { Routes } from '@angular/router';

export const GRAMATICA_ROTAS: Routes = [
  {
    path: '',
    title: 'Gramática',
    loadComponent: () => import('./gramatica').then((m) => m.GramaticaPagina),
  },
  {
    path: ':id',
    title: 'Lição de gramática',
    loadComponent: () => import('./licao-gramatica').then((m) => m.LicaoGramaticaPagina),
  },
];
