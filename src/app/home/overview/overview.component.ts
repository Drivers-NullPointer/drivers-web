import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AdminDashboard } from './model/admin-dashboard';
import { OverviewService } from './overview.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent {
  private readonly service = inject(OverviewService);
  readonly dashboard = signal<AdminDashboard | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);

  constructor() { this.load(); }

  load(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.service.getDashboard().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: value => this.dashboard.set(value),
      error: () => this.hasError.set(true)
    });
  }
}
