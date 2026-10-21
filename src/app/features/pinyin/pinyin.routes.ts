import { Routes } from '@angular/router';

export const PINYIN_ROTAS: Routes = [
  {
    path: '',
    loadComponent: () => import('./pinyin').then((m) => m.PinyinPagina),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tons' },
      {
        path: 'tons',
        title: 'Os tons',
        loadComponent: () => import('./tons/tons').then((m) => m.TonsPagina),
      },
      {
        path: 'sons',
        title: 'Iniciais e finais',
        loadComponent: () => import('./sons/sons').then((m) => m.SonsPagina),
      },
      {
        path: 'armadilhas',
        title: 'Armadilhas para brasileiros',
        loadComponent: () => import('./armadilhas/armadilhas').then((m) => m.ArmadilhasPagina),
      },
      {
        path: 'sandhi',
        title: 'Sandhi tonal',
        loadComponent: () => import('./sandhi/sandhi').then((m) => m.SandhiPagina),
      },
      {
        path: 'treino',
        title: 'Treino de tons',
        loadComponent: () => import('./treino-tons/treino-tons').then((m) => m.TreinoTonsPagina),
      },
    ],
  },
];
