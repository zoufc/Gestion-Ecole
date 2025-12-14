import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toastr.service';
import { LOGO_CONFIG } from '../../../config/logo.config';

@Component({
  selector: 'app-otp-verification',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './otp-verification.component.html',
})
export class OtpVerificationComponent implements OnInit {
  otpForm!: FormGroup;
  email: string = '';
  logoConfig = LOGO_CONFIG;

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      this.email = paramMap.get('email')!;
    });
  }

  ngOnInit() {
    this.otpForm = this.fb.group({
      code: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.otpForm.valid) {
      // Navigation directe sans appel API
      const mockResetCode = 'mock_reset_code_' + Date.now();
      this.toast.showSuccess('Code vérifié avec succès !');
      this.router.navigate(['reset-password', mockResetCode]);
    }
  }

  resendOtp() {
    console.log('Renvoyer OTP');
    // appel API ici
  }
}
