import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LoginDTO } from '../model/LoginDTO';
import { catchError, finalize, map, Observable, of, shareReplay, switchMap, tap, throwError, timeout } from 'rxjs';
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
  private readonly adminDashboardPath = environment.apiUrl + environment.apiVersion + '/admin/dashboard';
  private adminSessionCheck$?: Observable<boolean>;

  readonly loginPath = `${this.controller}/login`;
  readonly refreshTokenPath = `${this.controller}/refresh`;
  readonly verifyAccountPath = `${this.controller}/verify-account`;
  readonly resetPasswordPath = `${this.controller}/reset-password`;
  readonly sendResetPasswordPath = `${this.controller}/forgot-password`;
  readonly logoutPath = `${this.controller}/logout`;


  login(LoginDTO: LoginDTO) {
    return this.http.post<LoginResponse>(this.loginPath, LoginDTO).pipe(
      switchMap((response: LoginResponse) => {
        if (response.user.roleId !== 1 && response.user.roleId !== 2) {
          return this.http.post<void>(this.logoutPath, null).pipe(
            catchError(() => of(undefined)),
            switchMap(() => throwError(() => ({
              status: 403,
              error: { message: 'ADMIN_ACCESS_REQUIRED' }
            })))
          );
        }

        this.tokenService.setAccessToken(response.token);
        return of(response);
      })
    );
  }

  refreshToken() {
    return this.http.post<LoginResponse>(this.refreshTokenPath, null).pipe(
      tap((response: LoginResponse) => {
        this.tokenService.setAccessToken(response.token);
      })
    );
  }

  logout() {
    return this.http.post<void>(this.logoutPath, null).pipe(
      finalize(() => this.tokenService.clearAccessToken())
    );
  }

  /**
   * Restaura la cookie de sesión y verifica autorización real contra un
   * endpoint protegido para ADMIN/SUPERADMIN. No basta con tener un JWT.
   */
  ensureAdminSession(): Observable<boolean> {
    if (this.adminSessionCheck$) {
      return this.adminSessionCheck$;
    }

    const tokenReady$ = this.tokenService.getAccessToken()
      ? of(true)
      : this.refreshToken().pipe(map(() => true));

    this.adminSessionCheck$ = tokenReady$.pipe(
      switchMap(() => this.http.get(this.adminDashboardPath)),
      map(() => true),
      timeout(15000),
      catchError(error => {
        this.tokenService.clearAccessToken();

        // Una sesión válida pero sin rol administrativo debe cerrarse para
        // evitar que el refresh cookie vuelva a abrir el panel.
        if (error?.status === 403) {
          return this.http.post<void>(this.logoutPath, null).pipe(
            catchError(() => of(undefined)),
            map(() => false)
          );
        }

        return of(false);
      }),
      finalize(() => this.adminSessionCheck$ = undefined),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    return this.adminSessionCheck$;
  }

  clearSession(): void {
    this.tokenService.clearAccessToken();
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
