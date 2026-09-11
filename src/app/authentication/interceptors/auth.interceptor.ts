import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, map, Observable, switchMap, throwError } from "rxjs";
import { TokenService } from "../services/token.service";
import { AuthService } from "../services/auth.service";
import { apiPath, publicSessionPaths } from './api-scope';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    const path = apiPath(req.url);
    if (path === null) return next(req);
    if (publicSessionPaths.has(path)) {
        return next(req.clone({ headers: req.headers.delete('Authorization'), withCredentials: true }));
    }
    const tokenServices = inject(TokenService);
    const authService = inject(AuthService);
    const token = tokenServices.getAccessToken();
    const version = tokenServices.sessionVersion;

    const inSession = (source: Observable<HttpEvent<unknown>>) => source.pipe(map(event => {
        if (version !== tokenServices.sessionVersion) throw new Error('SESSION_CHANGED');
        return event;
    }));
    const retryOnce = (currentToken: string) => inSession(next(signingRequestInterceptor(req, currentToken))).pipe(
        catchError(error => {
            if (error.status === 401 && tokenServices.getAccessToken() === currentToken) authService.expireSession(version);
            return throwError(() => error);
        })
    );

    req = signingRequestInterceptor(req, token);

    return inSession(next(req)).pipe(
        catchError((error) => {
            if (error.status === 401 && token && version === tokenServices.sessionVersion) {
                const currentToken = tokenServices.getAccessToken();
                if (!currentToken) return throwError(() => error);
                if (currentToken !== token) return retryOnce(currentToken);
                return authService.refreshToken().pipe(
                    switchMap(response => version === tokenServices.sessionVersion
                        ? retryOnce(response.token)
                        : throwError(() => new Error('SESSION_CHANGED')))
                );
            }
            return throwError(() => error);
        })
    );
}


const signingRequestInterceptor = (req: HttpRequest<any>, accessToken: string) => {
    return req.clone({
        headers: accessToken ? req.headers.set('Authorization', `Bearer ${accessToken}`) : req.headers.delete('Authorization'),
        withCredentials: true
    });
}
