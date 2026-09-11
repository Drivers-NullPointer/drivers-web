import { Component, ViewChild } from '@angular/core';
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

  listDestinations: NavDestination[] = navDestinations

  constructor() { }

  toggleMenu(): void {
    this.drawer?.toggle();
  }
}
