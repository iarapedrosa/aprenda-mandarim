import { Routes } from '@angular/router';

export const RECURSOS_ROTAS: Routes = [
  {
    path: '',
    title: 'Recursos para estudar',
    loadComponent: () => import('./recursos').then((m) => m.RecursosPagina),
  },
];
