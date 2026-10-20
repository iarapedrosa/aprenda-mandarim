import { Routes } from '@angular/router';

export const TREINO_ROTAS: Routes = [
  {
    path: '',
    title: 'Treino de hoje',
    loadComponent: () => import('./treino').then((m) => m.TreinoPagina),
  },
];
