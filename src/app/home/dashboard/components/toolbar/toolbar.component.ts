import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../authentication/services/auth.service';
import { TokenService } from '../../../../authentication/services/token.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    MatIconModule,
    MatToolbarModule,
    MatButtonModule
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent {
  @Output() readonly menuClick = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly tokens = inject(TokenService);
  readonly isLoggingOut = signal(false);

  logout(): void {
    if (this.isLoggingOut()) return;
    this.isLoggingOut.set(true);
    const logoutVersion = this.tokens.sessionVersion + 1;
    this.authService.logout().pipe(
      finalize(() => {
        this.isLoggingOut.set(false);
        if (this.tokens.sessionVersion === logoutVersion && !this.tokens.getAccessToken()) {
          this.router.navigate(['/login']);
        }
      })
    ).subscribe({ error: () => undefined });
  }
}
