import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { LoginDto } from '../models/dto';
import { Router } from '@angular/router';
import {
  clearLocalStorage,
  getLocalData,
} from '../utils/local-storage-service';
import { OrganisationCategory, UserRoles } from '../utils/enums';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isUserConnected() {
    return !!localStorage.getItem('accessToken');
  }

  constructor(private apiService: ApiService, private router: Router) {}

  getUserRole() {
    let userInfos: any = getLocalData('userInfos');
    userInfos = JSON.parse(userInfos);
    return userInfos.role;
  }

  isOrganisationProvider(): boolean {
    const category = getLocalData('organisationCategory');
    return category == OrganisationCategory.provider;
  }

  login(body: LoginDto) {
    return this.apiService.post('auth/login', body);
  }

  getRedirectRouteByRole(role: string): string {
    switch (role) {
      case UserRoles.owner:
      case UserRoles.director:
      case UserRoles.administrator:
        return '/overview';
      case UserRoles.consultant:
      case UserRoles.teacher:
        return '/courses';
      case UserRoles.secretary:
        return '/students';
      default:
        return '/overview';
    }
  }

  updatePassword(body: any) {
    return this.apiService.put('auth/update-password', body);
  }

  logout() {
    clearLocalStorage();
    this.router.navigate(['/login']);
  }

  forgotPassword(email: string) {
    return this.apiService.post('auth/forgot-password', { email });
  }

  verifyOtp(body: any) {
    return this.apiService.post('auth/verify-reset-code', body);
  }

  resetPassword(body: any) {
    return this.apiService.post('auth/reset-password', body);
  }

  getToken() {
    const token = localStorage.getItem('accessToken');
    return token;
  }
}
