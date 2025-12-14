import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { clearLocalStorage } from '../utils/local-storage-service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  let isUserConnected = authService.isUserConnected();
  if (isUserConnected) {
    return true;
  }
  const router = inject(Router);
  clearLocalStorage();
  return router.createUrlTree(['/login']);
};
