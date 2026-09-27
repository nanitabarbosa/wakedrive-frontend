import { Routes } from '@angular/router';

import { authGuard } from '../core/guards/auth.guard';
import { roleGuard } from '../core/guards/role.guard';
import { MainLayoutComponent } from '../shared/layouts/main-layout/main-layout.component';

export const ADMINISTRATION_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./users/pages/user-list/user-list.component').then(m => m.UserListComponent),
      },
      {
        path: 'alerts',
        loadComponent: () => import('./alerts/pages/alert-list/alert-list.component').then(m => m.AlertListComponent),
      },
      {
        path: 'devices',
        loadComponent: () => import('./devices/pages/device-list/device-list.component').then(m => m.DeviceListComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/pages/settings/settings.component').then(m => m.SettingsComponent),
      },
      {
        path: 'onboarding',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] },
        loadComponent: () => import('./onboarding/pages/onboarding/onboarding.component').then(m => m.OnboardingComponent),
      },
      {
        path: 'companies',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] },
        loadComponent: () => import('./companies/pages/company-list/company-list.component').then(m => m.CompanyListComponent),
      },
    ],
  },
];
