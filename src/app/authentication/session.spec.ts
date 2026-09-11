import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { authInterceptor } from './interceptors/auth.interceptor';
import { apiPath } from './interceptors/api-scope';
import { canActivatePanelChild, canActivateGuardHome } from './guard/home.guard';
import { DashboardComponent } from '../home/dashboard/components/dashboard/dashboard.component';
import { environment } from '../../environments/environment';

describe('Panel session and concurrent authentication', () => {
  const base = environment.apiUrl + environment.apiVersion;
  const response = (token = 'fresh', roleId = 1) => ({ token, user: { id: 10, name: 'Test', email: 'test@example.com', roleId, isEmailVerified: true } });
  let http: HttpTestingController;
  let client: HttpClient;
  let auth: AuthService;
  let tokens: TokenService;
  let router: jasmine.SpyObj<Router>;
  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']);
    router.navigate.and.returnValue(Promise.resolve(true));
    router.createUrlTree.and.callFake((parts: any[]) => ({ path: parts[0] } as any));
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([authInterceptor])),
      provideHttpClientTesting(), { provide: Router, useValue: router }] });
    http = TestBed.inject(HttpTestingController); client = TestBed.inject(HttpClient);
    auth = TestBed.inject(AuthService); tokens = TestBed.inject(TokenService);
    tokens.setAccessToken('old');
  });
  afterEach(() => http.verify({ ignoreCancelled: true }));
  const failure = { error: () => {} };

  it('shares one refresh among concurrent 401s and retries both with the new token', () => {
    const received: unknown[] = [];
    client.get(base + '/admin/drivers').subscribe(v => received.push(v));
    client.get(base + '/admin/clients').subscribe(v => received.push(v));
    const a = http.expectOne(base + '/admin/drivers'); const b = http.expectOne(base + '/admin/clients');
    a.flush(null, { status: 401, statusText: 'Unauthorized' });
    b.flush(null, { status: 401, statusText: 'Unauthorized' });
    const refresh = http.expectOne(auth.refreshTokenPath);
    expect(refresh.request.headers.has('Authorization')).toBeFalse(); expect(refresh.request.withCredentials).toBeTrue();
    refresh.flush(response());
    for (const path of ['/admin/drivers', '/admin/clients']) {
      const retry = http.expectOne(base + path); expect(retry.request.headers.get('Authorization')).toBe('Bearer fresh'); retry.flush({});
    }
    expect(received.length).toBe(2); expect(router.navigate).not.toHaveBeenCalled();
  });

  it('a late 401 reuses the refreshed token without rotating the cookie again', () => {
    client.get(base + '/admin/drivers').subscribe(); client.get(base + '/admin/clients').subscribe();
    const a = http.expectOne(base + '/admin/drivers'); const b = http.expectOne(base + '/admin/clients');
    a.flush(null, { status: 401, statusText: 'Unauthorized' }); http.expectOne(auth.refreshTokenPath).flush(response());
    http.expectOne(base + '/admin/drivers').flush({});
    b.flush(null, { status: 401, statusText: 'Unauthorized' });
    const retry = http.expectOne(base + '/admin/clients'); expect(retry.request.headers.get('Authorization')).toBe('Bearer fresh'); retry.flush({});
    http.expectNone(auth.refreshTokenPath);
  });

  it('does not clear session for a 403 or 500 on the replayed resource', () => {
    for (const status of [403, 500]) {
      client.get(base + '/admin/drivers').subscribe(failure);
      http.expectOne(base + '/admin/drivers').flush(null, { status: 401, statusText: 'Unauthorized' });
      http.expectOne(auth.refreshTokenPath).flush(response());
      http.expectOne(base + '/admin/drivers').flush(null, { status, statusText: 'Rejected' });
      expect(tokens.getAccessToken()).toBe('fresh');
    }
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('clears and redirects once if the shared refresh is unauthorized', () => {
    let errors = 0;
    for (const path of ['/admin/drivers', '/admin/clients']) client.get(base + path).subscribe({ error: () => errors++ });
    for (const path of ['/admin/drivers', '/admin/clients']) http.expectOne(base + path).flush(null, { status: 401, statusText: 'Unauthorized' });
    http.expectOne(auth.refreshTokenPath).flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(errors).toBe(2); expect(tokens.getAccessToken()).toBe(''); expect(router.navigate).toHaveBeenCalledTimes(1);
  });

  it('does not recurse if the resource still rejects the refreshed token', () => {
    client.get(base + '/admin/drivers').subscribe(failure);
    http.expectOne(base + '/admin/drivers').flush(null, { status: 401, statusText: 'Unauthorized' });
    http.expectOne(auth.refreshTokenPath).flush(response());
    http.expectOne(base + '/admin/drivers').flush(null, { status: 401, statusText: 'Unauthorized' });
    http.expectNone(auth.refreshTokenPath); expect(tokens.getAccessToken()).toBe('');
  });

  it('preserves session on transient refresh failure and allows a subsequent attempt', () => {
    auth.refreshToken().subscribe(failure);
    http.expectOne(auth.refreshTokenPath).flush(null, { status: 503, statusText: 'Unavailable' });
    expect(tokens.getAccessToken()).toBe('old');
    auth.refreshToken().subscribe(); http.expectOne(auth.refreshTokenPath).flush(response());
    expect(tokens.getAccessToken()).toBe('fresh'); expect(router.navigate).not.toHaveBeenCalled();
  });

  it('bounds a hung refresh and releases the in-flight slot', fakeAsync(() => {
    auth.refreshToken().subscribe(failure); const pending = http.expectOne(auth.refreshTokenPath);
    tick(15001); expect(pending.cancelled).toBeTrue(); expect(tokens.getAccessToken()).toBe('old');
    auth.refreshToken().subscribe(); http.expectOne(auth.refreshTokenPath).flush(response());
  }));

  it('logout cancels refresh and no stale response restores the session', () => {
    auth.refreshToken().subscribe(); const pending = http.expectOne(auth.refreshTokenPath);
    auth.logout().subscribe(); expect(pending.cancelled).toBeTrue(); expect(tokens.getAccessToken()).toBe('');
    const logout = http.expectOne(auth.logoutPath); expect(logout.request.headers.has('Authorization')).toBeFalse(); logout.flush(null);
    http.expectNone(auth.refreshTokenPath);
  });

  it('old requests never retry using another account after session change', () => {
    client.get(base + '/admin/clients').subscribe(failure); const pending = http.expectOne(base + '/admin/clients');
    auth.clearSession(); tokens.setAccessToken('other-account');
    pending.flush(null, { status: 401, statusText: 'Unauthorized' });
    http.expectNone(auth.refreshTokenPath); http.expectNone(base + '/admin/clients'); expect(tokens.getAccessToken()).toBe('other-account');
  });

  it('does not send credentials to third-party or similar-prefix URLs', () => {
    for (const url of ['https://external.example/data', base + '-other/resource']) {
      client.get(url).subscribe(failure); const req = http.expectOne(url);
      expect(req.request.headers.has('Authorization')).toBeFalse(); expect(req.request.withCredentials).toBeFalse();
      req.flush(null, { status: 401, statusText: 'Unauthorized' });
    }
    http.expectNone(auth.refreshTokenPath); expect(apiPath(base + '/admin/clients?q=login')).toBe('/admin/clients');
  });

  it('does not deliver successful old-account data into a new session', () => {
    let delivered = false; let error: any;
    client.get(base + '/admin/clients').subscribe({ next: () => delivered = true, error: e => error = e });
    const pending = http.expectOne(base + '/admin/clients'); auth.clearSession(); tokens.setAccessToken('other-account');
    pending.flush({ privateData: 'old account' });
    expect(delivered).toBeFalse(); expect(error.message).toBe('SESSION_CHANGED'); expect(tokens.getAccessToken()).toBe('other-account');
  });

  it('does not let a completed old logout clear a subsequent login', () => {
    auth.logout().subscribe(); const logout = http.expectOne(auth.logoutPath);
    auth.login({ email: 'test@example.com', password: 'secret' }).subscribe();
    expect(logout.cancelled).toBeTrue(); http.expectOne(auth.loginPath).flush(response('new-account'));
    expect(tokens.getAccessToken()).toBe('new-account');
  });

  it('public account requests are not signed or refreshed', () => {
    client.post(base + '/account/deletion-request', { email: 'test@example.com' }).subscribe(failure);
    const req = http.expectOne(base + '/account/deletion-request'); expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush(null, { status: 401, statusText: 'Unauthorized' }); http.expectNone(auth.refreshTokenPath);
  });

  it('does not attach an empty bearer token', () => {
    auth.clearSession(); client.get(base + '/admin/clients').subscribe(failure);
    const req = http.expectOne(base + '/admin/clients'); expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush(null, { status: 401, statusText: 'Unauthorized' }); http.expectNone(auth.refreshTokenPath);
  });

  it('allows operator login but limits navigation to dispatch', () => {
    auth.login({ email: 'test@example.com', password: 'secret' }).subscribe();
    http.expectOne(auth.loginPath).flush(response('operator', 6));
    expect(auth.roleId()).toBe(6); expect(auth.isAdmin()).toBeFalse();
    const c = TestBed.runInInjectionContext(() => new DashboardComponent()); expect(c.listDestinations.map(d => d.route)).toEqual(['dispatch']);
    const runGuard = (path: string) => TestBed.runInInjectionContext(() => canActivatePanelChild({ routeConfig: { path } } as any, {} as any)) as Observable<boolean | UrlTree>;
    runGuard('dispatch').subscribe(result => expect(result).toBeTrue());
    runGuard('drivers').subscribe(result => expect(result).toEqual({ path: '/dispatch' } as any));
  });

  it('keeps admin navigation and checks panel session against server authorization', () => {
    auth.ensurePanelSession().subscribe(result => expect(result).toBeTrue());
    http.expectOne(base + '/admin/session').flush({ roleId: 1 });
    const c = TestBed.runInInjectionContext(() => new DashboardComponent()); expect(c.listDestinations.length).toBeGreaterThan(1);
  });

  it('shares startup renewal and panel access checks', () => {
    auth.clearSession(); let count = 0;
    auth.ensurePanelSession().subscribe(result => { expect(result).toBeTrue(); count++; });
    auth.ensurePanelSession().subscribe(result => { expect(result).toBeTrue(); count++; });
    http.expectOne(auth.refreshTokenPath).flush(response('operator', 6));
    http.expectOne(base + '/admin/session').flush({ roleId: 6 }); expect(count).toBe(2);
  });

  it('rejects non-panel login and closes its refresh cookie', () => {
    let error: any;
    auth.login({ email: 'test@example.com', password: 'secret' }).subscribe({ error: e => error = e });
    http.expectOne(auth.loginPath).flush(response('client', 5)); http.expectOne(auth.logoutPath).flush(null);
    expect(error.status).toBe(403); expect(tokens.getAccessToken()).toBe(''); expect(auth.roleId()).toBeNull();
  });

  it('cancels login on logout without resurrecting the account', () => {
    auth.login({ email: 'test@example.com', password: 'secret' }).subscribe(); const login = http.expectOne(auth.loginPath);
    auth.logout().subscribe(); expect(login.cancelled).toBeTrue(); http.expectOne(auth.logoutPath).flush(null);
    expect(tokens.getAccessToken()).toBe('');
  });

  it('denies the home guard when the server refuses panel access', () => {
    const result = TestBed.runInInjectionContext(() => canActivateGuardHome({} as any, { url: '/dispatch' } as any)) as Observable<boolean | UrlTree>;
    result.subscribe(value => expect(value).toEqual({ path: '/login' } as any));
    http.expectOne(base + '/admin/session').flush(null, { status: 403, statusText: 'Forbidden' }); http.expectOne(auth.logoutPath).flush(null);
    expect(tokens.getAccessToken()).toBe('');
  });
});
