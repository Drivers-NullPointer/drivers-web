import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AccountDeletionService } from './account-deletion.service';
import { environment } from '../../../environments/environment';

describe('AccountDeletionService', () => {
  let api: AccountDeletionService;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}${environment.apiVersion}/account`;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(withInterceptors([(req, next) => next(req.clone({ setHeaders: { Authorization: 'unrelated-user' } }))])),
      provideHttpClientTesting()
    ] });
    api = TestBed.inject(AccountDeletionService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('sends only the email to the public request endpoint', () => {
    api.request('user@example.com').subscribe();
    const req = http.expectOne(`${url}/deletion-request`);
    expect(req.request.method).toBe('POST'); expect(req.request.body).toEqual({ email: 'user@example.com' });
    expect(req.request.headers.has('Authorization')).toBeFalse(); req.flush(null);
  });
  it('confirms only the supplied token without current-account credentials', () => {
    api.confirm('a+b&c').subscribe();
    const req = http.expectOne(r => r.url === `${url}/deletion-confirmation`);
    expect(req.request.method).toBe('DELETE'); expect(req.request.params.get('token')).toBe('a+b&c');
    expect(req.request.headers.has('Authorization')).toBeFalse(); expect(req.request.withCredentials).toBeFalse(); req.flush(null);
  });
});
