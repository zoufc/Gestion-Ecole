import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SettingInfoSectionComponent } from '../../components/setting-info-section/setting-info-section.component';
import { SettingCourseSectionComponent } from '../../components/setting-course-section/setting-course-section.component';
import { AuthService } from '../../../services/auth.service';
import { UserRoles } from '../../../utils/enums';

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    SettingInfoSectionComponent,
    SettingCourseSectionComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  settingsItems: any = [];
  selectedItem: any;
  constructor(
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.settingsItems = [
      {
        name: 'Informations',
        icon: this.sanitizer
          .bypassSecurityTrustHtml(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.01 2C17.5315 2.00552 22.0037 6.48512 22 12.0067C21.9963 17.5282 17.5182 22.0018 11.9967 22C6.47512 21.9982 2 17.5215 2 12C2.00331 6.47462 6.48462 1.99779 12.01 2ZM20 11.828C19.9527 7.42676 16.3589 3.89046 11.9575 3.914C7.55603 3.93778 4.00046 7.51251 4.00046 11.914C4.00046 16.3155 7.55603 19.8902 11.9575 19.914C16.3589 19.9375 19.9527 16.4012 20 12L20 11.828ZM11 7L13 7L13 9L11 9L11 7ZM11 11L13 11L13 17L11 17L11 11Z" fill="currentColor"/>
              </svg>
              `),
      },
      {
        name: 'Configuration',
        icon: this.sanitizer
          .bypassSecurityTrustHtml(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4H7V2H9V4H15V2H17V4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22ZM5 10V20H19V10H5ZM5 6V8H19V6H5ZM17 18H15V16H17V18ZM13 18H11V16H13V18ZM9 18H7V16H9V18ZM17 14H15V12H17V14ZM13 14H11V12H13V14ZM9 14H7V12H9V14Z" fill="currentColor"/>
              </svg>

              `),
      },
    ];
    this.selectedItem = this.settingsItems[0];
  }

  isOwner() {
    const role = this.authService.getUserRole();
    return role == UserRoles.owner;
  }

  selectItem(item: any) {
    this.selectedItem = item;
  }
}
