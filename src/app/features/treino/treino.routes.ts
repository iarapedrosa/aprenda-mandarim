import { Routes } from '@angular/router';

export const TREINO_ROTAS: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Treino de hoje',
    loadComponent: () => import('./treino').then((m) => m.TreinoPagina),
  },
  {
    path: 'treino',
    title: 'Treino',
    loadComponent: () => import('./sessao/sessao').then((m) => m.SessaoPagina),
  },
];
