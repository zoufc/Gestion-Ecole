import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastService } from '../../../services/toastr.service';
import { setLocalData } from '../../../utils/local-storage-service';
import { LOGO_CONFIG } from '../../../config/logo.config';
import { CommonModule } from '@angular/common';
import { LoginDto } from '../../../models/dto';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm!: FormGroup;
  logoConfig = LOGO_CONFIG;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmitLogin() {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      const loginData: LoginDto = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      };

      this.authService.login(loginData).subscribe({
        next: (response: any) => {
          this.isLoading = false;

          console.log('Login response:', response);

          // Gérer différents formats de réponse API
          const responseData = response.data || response;
          const userData = responseData.user || response.user || responseData;
          const organisationData =
            responseData.organisation || response.organisation;
          const accessToken =
            responseData.accessToken ||
            response.accessToken ||
            responseData.token ||
            response.token;

          // Sauvegarder les données de l'utilisateur
          if (userData) {
            setLocalData('userInfos', JSON.stringify(userData));
            console.log('User data saved:', userData);
          }

          // Sauvegarder les données de l'organisation
          if (organisationData) {
            setLocalData('organisation', JSON.stringify(organisationData));
            if (organisationData.id) {
              setLocalData('organisationId', organisationData.id.toString());
            }
            if (organisationData.category) {
              setLocalData('organisationCategory', organisationData.category);
            }
          }

          // Sauvegarder le token d'accès (CRITIQUE pour le guard)
          if (accessToken) {
            setLocalData('accessToken', accessToken);
            console.log('Access token saved');
          } else {
            console.warn('No access token found in response');
          }

          // Récupérer le rôle de l'utilisateur
          const userRole =
            userData?.role || responseData?.role || response?.role;
          console.log('User role:', userRole);

          // Vérifier que le token est bien sauvegardé avant de naviguer
          const savedToken = localStorage.getItem('accessToken');
          if (!savedToken) {
            console.error('Token not saved, cannot proceed with navigation');
            this.toast.showError('Erreur lors de la sauvegarde de la session');
            return;
          }

          // Naviguer vers la page appropriée selon le rôle
          const redirectUrl = this.authService.getRedirectRouteByRole(userRole);
          console.log('Redirecting to:', redirectUrl);

          // Naviguer immédiatement (pas besoin de setTimeout)
          this.router
            .navigate([redirectUrl], {
              replaceUrl: true,
            })
            .then(
              (success) => {
                if (success) {
                  console.log('Navigation successful');
                  this.toast.showSuccess('Connexion réussie !');
                } else {
                  console.error('Navigation failed');
                  this.toast.showError('Erreur lors de la redirection');
                }
              },
              (error) => {
                console.error('Navigation error:', error);
                this.toast.showError(
                  'Erreur lors de la redirection. Veuillez réessayer.'
                );
              }
            );
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          let errorMessage = 'Une erreur est survenue lors de la connexion';

          if (error.status === 401) {
            errorMessage = 'Email ou mot de passe incorrect';
          } else if (error.status === 0) {
            errorMessage =
              'Impossible de se connecter au serveur. Vérifiez votre connexion.';
          } else if (error.status >= 500) {
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          }

          this.toast.showError(errorMessage);
        },
      });
    } else if (this.loginForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
      this.toast.showError('Veuillez remplir tous les champs correctement');
    }
  }

  goToForgotPassword() {
    this.router.navigate(['forgot-password']);
  }
}
