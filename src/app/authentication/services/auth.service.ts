import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { LoginDTO } from '../model/LoginDTO';
import { catchError, defer, finalize, map, Observable, of, shareReplay, Subject, switchMap, takeUntil, tap, throwError, timeout } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { LoginResponse } from '../model/LoginResponse';
import { environment } from '../../../environments/environment';
import { ResetPasswordDTO } from '../model/ResetPasswordDTO';
import { SendForgotPassordDto } from '../model/SendForgotPassordDto';
import { SendForgotPasswordResponse } from '../model/SendForgotPasswordResponse';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly tokenService: TokenService = inject(TokenService);
  private readonly controller = environment.apiUrl + environment.apiVersion + '/auth';
  private readonly panelSessionPath = environment.apiUrl + environment.apiVersion + '/admin/session';
  private readonly router = inject(Router);
  private readonly sessionCancelled = new Subject<void>();
  private refreshInFlight$?: Observable<LoginResponse>;
  private readonly panelRole = signal<number | null>(null);
  readonly roleId = this.panelRole.asReadonly();
  readonly isAdmin = computed(() => this.panelRole() === 1 || this.panelRole() === 2);
  private adminSessionCheck$?: Observable<boolean>;

  readonly loginPath = `${this.controller}/login`;
  readonly refreshTokenPath = `${this.controller}/refresh`;
  readonly verifyAccountPath = `${this.controller}/verify-account`;
  readonly resetPasswordPath = `${this.controller}/reset-password`;
  readonly sendResetPasswordPath = `${this.controller}/forgot-password`;
  readonly logoutPath = `${this.controller}/logout`;


  login(LoginDTO: LoginDTO) {
    return defer(() => {
      this.clearSession();
      const version = this.tokenService.sessionVersion;
      return this.http.post<LoginResponse>(this.loginPath, LoginDTO).pipe(
      timeout(15000),
      takeUntil(this.sessionCancelled),
      switchMap((response: LoginResponse) => {
        if (version !== this.tokenService.sessionVersion) return throwError(() => new Error('SESSION_CHANGED'));
        if (![1, 2, 6].includes(response.user.roleId)) {
          return this.http.post<void>(this.logoutPath, null).pipe(
            timeout(15000),
            takeUntil(this.sessionCancelled),
            catchError(() => of(undefined)),
            switchMap(() => throwError(() => ({
              status: 403,
              error: { message: 'ADMIN_ACCESS_REQUIRED' }
            })))
          );
        }

        this.tokenService.setAccessToken(response.token);
        this.panelRole.set(response.user.roleId);
        return of(response);
      })
      );
    });
  }

  refreshToken() {
    return defer(() => {
      if (this.refreshInFlight$) return this.refreshInFlight$;
      const version = this.tokenService.sessionVersion;
      const refresh$ = this.http.post<LoginResponse>(this.refreshTokenPath, null).pipe(
        timeout(15000),
        takeUntil(this.sessionCancelled),
        tap(response => {
          if (version !== this.tokenService.sessionVersion) throw new Error('SESSION_CHANGED');
          this.tokenService.setAccessToken(response.token);
          this.panelRole.set(response.user.roleId);
        }),
        catchError(error => {
          if (error.status === 401 || error.status === 403) this.expireSession(version);
          return throwError(() => error);
        }),
        finalize(() => { if (this.refreshInFlight$ === refresh$) this.refreshInFlight$ = undefined; }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
      this.refreshInFlight$ = refresh$;
      return refresh$;
    });
  }

  logout() {
    return defer(() => {
      this.clearSession();
      return this.http.post<void>(this.logoutPath, null).pipe(timeout(15000), takeUntil(this.sessionCancelled));
    });
  }

  /**
   * Restaura la cookie de sesión y verifica autorización real contra un
   * endpoint protegido para ADMIN/SUPERADMIN/OPERATOR. No basta con tener un JWT.
   */
  ensurePanelSession(): Observable<boolean> {
    if (this.adminSessionCheck$) {
      return this.adminSessionCheck$;
    }

    const version = this.tokenService.sessionVersion;
    const tokenReady$ = this.tokenService.getAccessToken()
      ? of(true)
      : this.refreshToken().pipe(map(() => true));

    const check$ = tokenReady$.pipe(
      switchMap(() => this.http.get<{ roleId: number }>(this.panelSessionPath)),
      map(response => {
        if (version !== this.tokenService.sessionVersion) return false;
        if (![1, 2, 6].includes(response.roleId)) throw { status: 403 };
        this.panelRole.set(response.roleId);
        return true;
      }),
      timeout(15000),
      catchError(error => {
        if (version !== this.tokenService.sessionVersion) return of(false);

        // Una sesión válida pero sin rol administrativo debe cerrarse para
        // evitar que el refresh cookie vuelva a abrir el panel.
        if (error?.status === 403) {
          return this.logout().pipe(
            catchError(() => of(undefined)),
            map(() => false)
          );
        }

        return of(false);
      }),
      finalize(() => { if (this.adminSessionCheck$ === check$) this.adminSessionCheck$ = undefined; }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.adminSessionCheck$ = check$;
    return check$;
  }

  clearSession(): void {
    this.tokenService.clearAccessToken();
    this.panelRole.set(null);
    this.sessionCancelled.next();
    this.refreshInFlight$ = undefined;
    this.adminSessionCheck$ = undefined;
  }

  expireSession(version: number): void {
    if (version !== this.tokenService.sessionVersion) return;
    this.clearSession();
    void this.router.navigate(['/login']);
  }

  verifyAccount(token: string) {
    const queryParams = new URLSearchParams();
    queryParams.set('token', token);
    return this.http.get(`${this.verifyAccountPath}?${queryParams.toString()}`);
  }

  resetPassword(
    resetPasswordDTO: ResetPasswordDTO
  ) {
    return this.http.post(`${this.resetPasswordPath}`, resetPasswordDTO);
  }

  sendResetPassword(sendForgotPassordDto: SendForgotPassordDto) {
    return this.http.post<SendForgotPasswordResponse>(`${this.sendResetPasswordPath}`, sendForgotPassordDto);
  }
}
