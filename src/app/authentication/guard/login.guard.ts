import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const canActivateGuardLogin: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.ensurePanelSession().pipe(
        map(isAdmin => isAdmin ? router.createUrlTree(['/dispatch']) : true)
    );
}
