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

  // Ne pas modifier la requête si c'est une connexion (login)
  if (req.url.includes('/login')) {
    return next(req);
  }

  // Récupérer le token depuis localStorage
  const accessToken = getLocalData('accessToken');

  // Cloner la requête et ajouter le token si disponible
  const authReq = accessToken
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
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
