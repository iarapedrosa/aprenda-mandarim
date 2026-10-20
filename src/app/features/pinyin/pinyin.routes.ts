import { Routes } from '@angular/router';

export const PINYIN_ROTAS: Routes = [
  {
    path: '',
    title: 'Pinyin e tons',
    loadComponent: () => import('./pinyin').then((m) => m.PinyinPagina),
  },
];
