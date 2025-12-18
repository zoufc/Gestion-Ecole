import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRoles } from '../utils/enums';
import { clearLocalStorage } from '../utils/local-storage-service';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  try {
    const userRole = authService.getUserRole(); // Rôle actuel de l'utilisateur
    console.log('GET USER ROLE', userRole);

    // Récupérer le rôle requis depuis les données de la route
    const requiredRole = route.data?.['role'];

    // Si aucun rôle spécifique n'est requis, autoriser tous les utilisateurs connectés
    if (!requiredRole) {
      return true;
    }

    // Définir les rôles autorisés pour l'accès admin
    const adminRoles = [
      UserRoles.owner,
      UserRoles.director,
      UserRoles.administrator,
      'company_owner',
      'company_director',
      'company_administrator',
      'director',
      'administrator',
    ];

    // Si le rôle requis est 'admin', vérifier si l'utilisateur a un rôle d'administration
    if (requiredRole === 'admin') {
      const hasAdminRole =
        adminRoles.includes(userRole) ||
        userRole === UserRoles.owner ||
        userRole === UserRoles.director ||
        userRole === UserRoles.administrator;

      if (!hasAdminRole) {
        console.warn(
          'Access denied: User role',
          userRole,
          'does not have admin privileges'
        );
        router.navigate(['/overview']); // Rediriger vers overview au lieu de login
        return false;
      }
    }

    // Vérifier les routes spécifiques qui nécessitent provider
    if (
      route.routeConfig?.path === 'transactions' ||
      route.routeConfig?.path === 'services'
    ) {
      const isOrganisationProvider = authService.isOrganisationProvider();
      if (!isOrganisationProvider) {
        router.navigate(['/overview']); // Rediriger vers overview au lieu de login
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in roleGuard:', error);
    // En cas d'erreur, rediriger vers login seulement si vraiment nécessaire
    router.navigate(['/login']);
    return false;
  }
};
