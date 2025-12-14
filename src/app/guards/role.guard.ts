import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRoles } from '../utils/enums';
import { clearLocalStorage } from '../utils/local-storage-service';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const userRole = authService.getUserRole(); // Rôle actuel de l'utilisateur
  console.log('GET USER ROLE', userRole);

  if (userRole !== UserRoles.owner) {
    router.navigate(['/login']); // Redirige si l'utilisateur n'a pas le bon rôle
    clearLocalStorage();
    return false;
  }

  if (
    route.routeConfig?.path === 'transactions' ||
    route.routeConfig?.path === 'services'
  ) {
    const isOrganisationProvider = authService.isOrganisationProvider(); // Vérifie une autre condition
    if (!isOrganisationProvider) {
      router.navigate(['/login']); // Rediriger si l'utilisateur ne remplit pas la condition
      clearLocalStorage();
      return false;
    }
  }

  return true;
};
