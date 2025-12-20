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

  user: any = null;

  statusAbonnement!: any;

  isProfileMenuOpen: boolean = false;
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
    // Charger les informations de l'utilisateur
    this.loadUserInfo();

    effect(() => {
      console.log('USER_UPDATE', this.userService.updateUserInfo());
      this.loadUserInfo();
    });

    // effect(() => {
    //   console.log('Statut abonnement', this.statistic.statusAbonnement());
    //   this.statusAbonnement = this.statistic.statusAbonnement();
    // });
    this.statusAbonnement = getLocalData('statusAbonnement');
    this.statusAbonnement = Boolean(this.statusAbonnement);
    console.log('STATUS_ABN', this.statusAbonnement);
  }
  ngOnInit(): void {
    // Charger les informations de l'utilisateur au démarrage
    this.loadUserInfo();
  }

  loadUserInfo() {
    try {
      const userData = getLocalData('userInfos');
      if (userData) {
        this.user = JSON.parse(userData);
      }
    } catch (error) {
      console.error(
        'Erreur lors du chargement des informations utilisateur:',
        error
      );
      this.user = null;
    }
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

  getFormateduserRole(role: string): string {
    if (!role) return 'Utilisateur';

    switch (role.toLowerCase()) {
      case UserRoles.teacher:
      case 'teacher':
      case 'enseignant':
        return 'Enseignant';
      case UserRoles.administrator:
      case 'administrator':
      case 'administrateur':
        return 'Administrateur';
      case UserRoles.director:
      case 'director':
      case 'directeur':
        return 'Directeur';
      case UserRoles.secretary:
      case 'secretary':
      case 'secretaire':
      case 'secrétaire':
        return 'Secrétaire';
      case UserRoles.owner:
      case 'company_owner':
      case 'owner':
      case 'proprietaire':
      case 'propriétaire':
        return 'Propriétaire';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, ' ');
    }
  }

  getUserDisplayName(): string {
    if (!this.user) {
      // Recharger les informations utilisateur si elles ne sont pas disponibles
      this.loadUserInfo();
      if (!this.user) {
        return 'Utilisateur';
      }
    }

    // Gérer différents formats de nom
    const firstName =
      this.user.first_name || this.user.firstName || this.user.prenom || '';
    const lastName =
      this.user.last_name || this.user.lastName || this.user.nom || '';
    const fullName = `${firstName} ${lastName}`.trim();

    // Si aucun nom n'est trouvé, utiliser l'email comme alternative
    if (!fullName && this.user.email) {
      return this.user.email;
    }

    return fullName || 'Utilisateur';
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
