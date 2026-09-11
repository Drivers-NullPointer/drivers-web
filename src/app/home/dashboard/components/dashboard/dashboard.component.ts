import { Component, inject, ViewChild } from '@angular/core';
import { AuthService } from '../../../../authentication/services/auth.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { NavDestination, navDestinations } from '../../model/NavDestinations';
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { ItemNavComponent } from "../item-nav/item-nav.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatSidenavModule,
    ToolbarComponent,
    MatIconModule,
    ItemNavComponent,
    RouterOutlet,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  @ViewChild('drawer') drawer?: import('@angular/material/sidenav').MatDrawer;

  private readonly auth = inject(AuthService);
  get listDestinations(): NavDestination[] {
    return this.auth.isAdmin() ? navDestinations : this.auth.roleId() === 6
      ? navDestinations.filter(item => item.route === 'dispatch') : [];
  }

  constructor() { }

  toggleMenu(): void {
    this.drawer?.toggle();
  }
}
