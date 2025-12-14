import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toastr.service';
import { clearLocalStorage } from '../../../utils/local-storage-service';
import { LOGO_CONFIG } from '../../../config/logo.config';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  resetToken!: string;
  logoConfig = LOGO_CONFIG;

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router
  ) {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      this.resetToken = paramMap.get('resetToken')!;
    });
  }

  ngOnInit(): void {
    this.resetForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsMatch }
    );
    console.log('RESET_TOKEN', this.resetToken);
  }

  passwordsMatch(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { notMatching: true };
  }

  onSubmit() {
    if (this.resetForm.valid) {
      // Navigation directe sans appel API
      console.log('🔐 Nouveau mot de passe:', this.resetForm.value.password);
      this.toast.showSuccess('Mot de passe réinitialisé avec succès !');
      clearLocalStorage();
      this.router.navigate(['login'], {
        replaceUrl: true,
      });
    }
  }
}
