import { Routes } from '@angular/router';

export const PROGRESSO_ROTAS: Routes = [
  {
    path: '',
    title: 'Progresso',
    loadComponent: () => import('./progresso').then((m) => m.ProgressoPagina),
  },
];
