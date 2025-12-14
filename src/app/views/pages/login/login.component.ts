import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastService } from '../../../services/toastr.service';
import { setLocalData } from '../../../utils/local-storage-service';
import { LOGO_CONFIG } from '../../../config/logo.config';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm!: FormGroup;
  logoConfig = LOGO_CONFIG;
  
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
    if (this.loginForm.valid) {
      // Navigation directe sans appel API
      // Données mock pour permettre la navigation
      const mockUserInfos = {
        id: '1',
        first_name: 'Admin',
        last_name: 'User',
        email: this.loginForm.value.email,
        phone: '+221701234567',
        role: 'company_owner', // Utiliser un rôle valide
      };
      const mockOrganisation = {
        id: '1',
        name: 'École Primaire',
        category: 'primary',
        email: 'contact@ecole.com',
        address: '123 Rue de l\'École',
      };
      const mockAccessToken = 'mock_access_token_' + Date.now();
      const mockOrganisationId = '1';
      const mockOrganisationCategory = 'primary';

      // Sauvegarder les données mock dans le localStorage
      setLocalData('userInfos', JSON.stringify(mockUserInfos));
      setLocalData('organisation', JSON.stringify(mockOrganisation));
      setLocalData('accessToken', mockAccessToken);
      setLocalData('organisationId', mockOrganisationId);
      setLocalData('organisationCategory', mockOrganisationCategory);

      // Naviguer directement vers la page d'accueil
      const redirectUrl = this.authService.getRedirectRouteByRole(mockUserInfos.role);
      this.router.navigate([redirectUrl], {
        replaceUrl: true,
      });
      this.toast.showSuccess('Connexion réussie !');
    }
  }

  goToForgotPassword() {
    this.router.navigate(['forgot-password']);
  }
}
