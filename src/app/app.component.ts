import { Component, LOCALE_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SideNavBarComponent } from './views/components/side-nav-bar/side-nav-bar.component';
import { LoginComponent } from './views/pages/login/login.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'gestion_equipement_front';
}
