import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toastr.service';
import { clearLocalStorage, getLocalData } from './local-storage-service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  // Vérifier si l'utilisateur est en ligne
  if (!navigator.onLine) {
    toast.showError(
      'Aucune connexion Internet. Veuillez vérifier votre connexion.'
    );
    return throwError(() => new Error('Aucune connexion Internet'));
  }

  // Endpoints publics qui ne nécessitent pas d'authentification
  const publicEndpoints = ['/login', '/forgot-password', '/reset-password', '/otp-verification'];
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));

  // Récupérer le token depuis localStorage
  const accessToken = getLocalData('accessToken');

  // Cloner la requête et ajouter les headers nécessaires
  let headersToAdd: { [key: string]: string } = {};

  // Ajouter le token si disponible et si ce n'est pas un endpoint public
  if (accessToken && !isPublicEndpoint) {
    headersToAdd['x-access-token'] = accessToken;
  }

  // Cloner la requête et ajouter les headers (seulement si des headers sont à ajouter)
  const authReq = Object.keys(headersToAdd).length > 0
    ? req.clone({
        setHeaders: headersToAdd,
      })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Déconnexion forcée en cas de token expiré
        clearLocalStorage();
        toast.showError('Session expirée!');
        router.navigate(['/login'], {
          queryParams: { returnUrl: router.url },
          replaceUrl: true,
        });
      }
      return throwError(() => error);
    })
  );
};
