import { Routes } from '@angular/router';
import { OverviewComponent } from './views/pages/overview/overview.component';
import { ServicesComponent } from './views/pages/services/services.component';
import { StaffListComponent } from './views/pages/staff-list/staff-list.component';
import { SettingsComponent } from './views/pages/settings/settings.component';
import { CalendarComponent } from './views/pages/calendar/calendar.component';
import { CourseDetailsComponent } from './views/components/course-details/course-details.component';
import { CoursesListComponent } from './views/components/courses-list/courses-list.component';
import { LoginComponent } from './views/pages/login/login.component';
import { SideNavBarComponent } from './views/components/side-nav-bar/side-nav-bar.component';
import { authGuard } from './guards/auth.guard';
import { CustomersComponent } from './views/pages/customers/customers.component';
import { DetailUserComponent } from './views/components/detail-user/detail-user.component';
import { roleGuard } from './guards/role.guard';
import { ForgotPasswordComponent } from './views/pages/forgot-password/forgot-password.component';
import { OtpVerificationComponent } from './views/pages/otp-verification/otp-verification.component';
import { ResetPasswordComponent } from './views/pages/reset-password/reset-password.component';
import { PaymentsComponent } from './views/pages/payments/payments.component';
import { GradesComponent } from './views/pages/grades/grades.component';
import { ClassDetailsComponent } from './views/components/class-details/class-details.component';

export const routes: Routes = [
  { path: '', component: LoginComponent }, // Rediriger vers login par défaut
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
  },
  {
    path: 'otp-verification/:email',
    component: OtpVerificationComponent,
  },
  {
    path: 'reset-password/:resetToken',
    component: ResetPasswordComponent,
  },
  {
    path: '',
    component: SideNavBarComponent, // Composant contenant le sidebar
    canActivate: [authGuard],
    children: [
      {
        path: 'overview',
        component: OverviewComponent,
        canActivate: [roleGuard],
      },
      {
        path: 'courses',
        children: [
          {
            path: '',
            component: CoursesListComponent,
          },
          {
            path: ':id',
            component: CourseDetailsComponent,
          },
        ],
      },
      // Alias pour compatibilité
      {
        path: 'appointments',
        redirectTo: 'courses',
        pathMatch: 'full',
      },
      {
        path: 'classes',
        children: [
          {
            path: '',
            component: ServicesComponent,
            canActivate: [roleGuard],
            data: { role: 'admin' },
          },
          {
            path: ':id',
            component: ClassDetailsComponent,
            canActivate: [roleGuard],
            data: { role: 'admin' },
          },
        ],
      },
      {
        path: 'subjects',
        component: ServicesComponent, // Réutilisé pour les matières
        canActivate: [roleGuard],
        data: { role: 'admin' },
      },
      // Alias pour compatibilité
      {
        path: 'services',
        redirectTo: 'classes',
        pathMatch: 'full',
      },
      {
        path: 'students',
        component: CustomersComponent, // Réutilisé pour les élèves
        canActivate: [roleGuard],
        data: { role: 'admin' },
      },
      {
        path: 'payments',
        component: PaymentsComponent,
        canActivate: [roleGuard],
        data: { role: 'admin' },
      },
      {
        path: 'grades',
        component: GradesComponent,
        canActivate: [roleGuard],
        data: { role: 'admin' },
      },
      {
        path: 'teachers',
        component: StaffListComponent, // Réutilisé pour les enseignants
        canActivate: [roleGuard],
        data: { role: 'admin' },
      },
      // Alias pour compatibilité
      {
        path: 'customers',
        redirectTo: 'students',
        pathMatch: 'full',
      },
      {
        path: 'staff-list',
        redirectTo: 'teachers',
        pathMatch: 'full',
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: 'calendar',
        component: CalendarComponent,
      },

      {
        path: 'detailUser/:id',
        component: DetailUserComponent,
        canActivate: [roleGuard],
        data: { role: 'admin' },
      },
      { path: '**', redirectTo: 'overview' },
    ],
  },

  { path: '**', redirectTo: 'login' }, // Rediriger vers login par défaut
];
