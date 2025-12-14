import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toastr.service';
import { LOGO_CONFIG } from '../../../config/logo.config';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;
  logoConfig = LOGO_CONFIG;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get email() {
    return this.forgotForm.get('email')!;
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      // Navigation directe sans appel API
      const emailValue = this.forgotForm.value.email;
      console.log('Lien envoyé à :', emailValue);
      this.toast.showSuccess('Code de réinitialisation envoyé !');
      this.goToOtpVerification(emailValue);
    }
  }

  goToOtpVerification(email: string) {
    this.router.navigate(['otp-verification', email], { replaceUrl: true });
  }
}
