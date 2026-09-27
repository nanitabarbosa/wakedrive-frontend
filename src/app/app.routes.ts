import { Routes } from '@angular/router';

import { guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('./modules/administration.routes').then(m => m.ADMINISTRATION_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
