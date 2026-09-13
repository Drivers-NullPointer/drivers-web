import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, UrlTree } from '@angular/router';
import { firstValueFrom, Observable, of, Subject } from 'rxjs';
import { canActivateGuardLogin } from './login.guard';
import { AuthService } from '../services/auth.service';

describe('canActivateGuardLogin', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: Router;
  const run = () => TestBed.runInInjectionContext(() =>
    canActivateGuardLogin({} as any, { url: '/dispatch' } as any)) as Observable<boolean | UrlTree>;
  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['ensurePanelSession']);
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AuthService, useValue: auth }] });
    router = TestBed.inject(Router);
  });
  it('handles a server-verified panel session', async () => {
    auth.ensurePanelSession.and.returnValue(of(true));
    expect(await firstValueFrom(run())).toEqual(router.createUrlTree(['/dispatch']));
    expect(auth.ensurePanelSession).toHaveBeenCalledOnceWith();
  });
  it('handles a denied or expired session', async () => {
    auth.ensurePanelSession.and.returnValue(of(false));
    expect(await firstValueFrom(run())).toEqual(true);
  });
  it('waits for session verification instead of trusting cached tokens', () => {
    const pending = new Subject<boolean>();
    auth.ensurePanelSession.and.returnValue(pending);
    const results: (boolean | UrlTree)[] = [];
    run().subscribe(value => results.push(value));
    expect(results).toEqual([]);
    pending.next(true); pending.complete();
    expect(results).toEqual([router.createUrlTree(['/dispatch'])]);
  });
  it('does not imperatively navigate from a guard', async () => {
    const navigate = spyOn(router, 'navigate');
    auth.ensurePanelSession.and.returnValue(of(false));
    await firstValueFrom(run());
    expect(navigate).not.toHaveBeenCalled();
  });
});
