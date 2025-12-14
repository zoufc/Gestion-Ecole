import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import {
  clearLocalStorage,
  getLocalData,
} from '../../../utils/local-storage-service';
import { OrganisationCategory, UserRoles } from '../../../utils/enums';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { ThemeService } from '../../../services/theme.service';
import { StatisticService } from '../../../services/statistic.service';
import { LOGO_CONFIG } from '../../../config/logo.config';

@Component({
  selector: 'app-side-nav-bar',
  imports: [CommonModule, RouterModule],
  templateUrl: './side-nav-bar.component.html',
  styleUrl: './side-nav-bar.component.css',
})
export class SideNavBarComponent {
  current_router: string = '/';
  dropdowns: any = {
    management: false,
    clients: false,
    parametres: false,
  };

  user!: any;

  statusAbonnement!: any;

  isProfileMenuOpen!: boolean;
  @ViewChild('profileMenu') profileMenuRef!: ElementRef;

  toggleDropdown(menu: string) {
    this.dropdowns[menu] = !this.dropdowns[menu];
  }

  isSidebarOpen = false;
  screenWidth: number = window.innerWidth;

  currentThemeImage = computed(() => {
    const theme = this.themeService.theme();
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    return isDark ? LOGO_CONFIG.mainDark : LOGO_CONFIG.main;
  });

  logoConfig = LOGO_CONFIG;

  constructor(
    private router: Router,
    private authService: AuthService,
    public themeService: ThemeService,
    private userService: UserService,
    private statistic: StatisticService
  ) {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        if (this.router.url === '/' || this.router.url === '/overview') {
          this.current_router = this.router.url;
          console.log(this.current_router);
        }
      }
    });
    effect(() => {
      console.log('USER_UPDATE', this.userService.updateUserInfo());
      this.user = getLocalData('userInfos');
      this.user = JSON.parse(this.user);
    });

    // effect(() => {
    //   console.log('Statut abonnement', this.statistic.statusAbonnement());
    //   this.statusAbonnement = this.statistic.statusAbonnement();
    // });
    this.statusAbonnement = getLocalData('statusAbonnement');
    this.statusAbonnement = Boolean(this.statusAbonnement);
    console.log('STATUS_ABN', this.statusAbonnement);

    this.user = getLocalData('userInfos');
    this.user = JSON.parse(this.user);
  }
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = event.target.innerWidth;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleTheme() {
    this.themeService.cycleTheme();
  }

  isMdAndAbove(): boolean {
    return this.screenWidth >= 768; // Tailwind's `md` breakpoint is 768px
  }

  isOrganisationProvider(): boolean {
    const category = getLocalData('organisationCategory');
    return category == OrganisationCategory.provider;
  }

  isOwner() {
    const role = this.authService.getUserRole();
    return role == UserRoles.owner;
  }

  toggleProfileMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  getFormateduserRole(role: string) {
    switch (role) {
      case UserRoles.teacher:
        return 'Enseignant';
      case UserRoles.administrator:
        return 'Administrateur';
      case UserRoles.director:
        return 'Directeur';
      case UserRoles.secretary:
        return 'Secrétaire';
      // Compatibilité avec les anciens rôles
      case UserRoles.consultant:
        return 'Consultant';
      case UserRoles.owner:
        return 'Propriétaire';
      default:
        return '';
    }
  }

  logout() {
    Swal.fire({
      title: 'Se déconnecter?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FC2828',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/login']); // Rediriger si l'utilisateur ne remplit pas la condition
        clearLocalStorage();
      }
    });
  }

  // Fermer si clic extérieur
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (
      this.isProfileMenuOpen &&
      this.profileMenuRef &&
      !this.profileMenuRef.nativeElement.contains(event.target)
    ) {
      this.isProfileMenuOpen = false;
    }
  }
}
