import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/json-to-form',
  },
  {
    path: 'json-to-form',
    loadChildren: () => import('./modules/json-to-form/routes').then((r) => r.routes),
  },
];
