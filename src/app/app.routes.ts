import { Routes } from '@angular/router';

/** Cada módulo do site é carregado sob demanda (lazy loading). */
export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/treino/treino.routes').then((m) => m.TREINO_ROTAS),
  },
  {
    path: 'pinyin',
    loadChildren: () => import('./features/pinyin/pinyin.routes').then((m) => m.PINYIN_ROTAS),
  },
  {
    path: 'caracteres',
    loadChildren: () =>
      import('./features/caracteres/caracteres.routes').then((m) => m.CARACTERES_ROTAS),
  },
  {
    path: 'escrita',
    loadChildren: () => import('./features/escrita/escrita.routes').then((m) => m.ESCRITA_ROTAS),
  },
  {
    path: 'leitura',
    loadChildren: () => import('./features/leitura/leitura.routes').then((m) => m.LEITURA_ROTAS),
  },
  {
    path: 'escuta',
    loadChildren: () => import('./features/escuta/escuta.routes').then((m) => m.ESCUTA_ROTAS),
  },
  {
    path: 'fala',
    loadChildren: () => import('./features/fala/fala.routes').then((m) => m.FALA_ROTAS),
  },
  {
    path: 'gramatica',
    loadChildren: () => import('./features/gramatica/gramatica.routes').then((m) => m.GRAMATICA_ROTAS),
  },
  {
    path: 'cartoes',
    loadChildren: () => import('./features/cartoes/cartoes.routes').then((m) => m.CARTOES_ROTAS),
  },
  {
    path: 'numeros',
    loadChildren: () => import('./features/numeros/numeros.routes').then((m) => m.NUMEROS_ROTAS),
  },
  {
    path: 'praticar',
    loadChildren: () =>
      import('./features/praticar/praticar.routes').then((m) => m.PRATICAR_ROTAS),
  },
  {
    path: 'progresso',
    loadChildren: () =>
      import('./features/progresso/progresso.routes').then((m) => m.PROGRESSO_ROTAS),
  },
  { path: '**', redirectTo: '' },
];
