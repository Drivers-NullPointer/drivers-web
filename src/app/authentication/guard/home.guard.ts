import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, of } from 'rxjs';


export const canActivateGuardHome: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.ensurePanelSession().pipe(
    map(isAdmin => isAdmin
      ? true
      : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }))
  );
};

export const canActivatePanelChild: CanActivateChildFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return (auth.roleId() === null ? auth.ensurePanelSession() : of([1, 2, 6].includes(auth.roleId()!))).pipe(map(allowed => {
    if (!allowed) return router.createUrlTree(['/login']);
    return auth.isAdmin() || route.routeConfig?.path === 'dispatch' ? true : router.createUrlTree(['/dispatch']);
  }));
};



