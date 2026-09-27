import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = route => {
  const roles: string[] = route.data['roles'] ?? [];
  if (!roles.length || inject(AuthService).hasAnyRole(roles)) return true;
  return inject(Router).createUrlTree(['/dashboard']);
};
