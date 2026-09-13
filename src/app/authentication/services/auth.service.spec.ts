import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LoginDTO } from '../model/LoginDTO';
import { LoginResponse } from '../model/LoginResponse';
import { RefreshResponse } from '../model/RefreshResponse';
import { TokenService } from './token.service';

const loginDTO: LoginDTO = {
  email: 'example@mail.com',
  password: 'password'
};
const mockResponse: LoginResponse = {
  token: 'token',
  refreshToken: 'refreshToken',
  user: { id: 1, name: 'Admin', email: 'admin@example.com', roleId: 1, isEmailVerified: true }
};

const refreshTokenResponse: RefreshResponse = {
  token: 'token',
  refreshToken: 'refreshToken',
};


describe('AuthService', () => {
  let service: AuthService;
  let httpClient: HttpTestingController;
  let tokenServiceSpy: TokenService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(AuthService);
    httpClient = TestBed.inject(HttpTestingController);

    tokenServiceSpy = TestBed.inject(TokenService);
  });

  afterEach(() => {
    httpClient.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call login', (done) => {

    service.login(loginDTO).subscribe({
      next: (res) => {
        expect(res).toEqual(mockResponse);

        expect(tokenServiceSpy.getAccessToken()).toEqual(
          mockResponse.token
        );

        done();
      },
      error: (error) => {
        fail('Expected no errors, but got ' + error);
        done();
      }
    });

    const req = httpClient.expectOne(service.loginPath);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should call refreshToken', (done) => {

    service.refreshToken().subscribe({
      next: (res) => {
        expect(res).toEqual(refreshTokenResponse);

        expect(tokenServiceSpy.getAccessToken()).toEqual(
          refreshTokenResponse.token
        );

        done();
      },
      error: (error) => {
        fail('Expected no errors, but got ' + error);
        done();
      }
    });

    const req = httpClient.expectOne(service.refreshTokenPath);
    expect(req.request.method).toBe('POST');
    req.flush(refreshTokenResponse);
  });


  it('should call verify account', (done) => {

    service.verifyAccount('token').subscribe({
      next: (res) => {
        expect(res).toEqual('Success');

        done();
      },
      error: (error) => {
        fail('Expected no errors, but got ' + error);
        done();
      }
    });

    const req = httpClient.expectOne(`${service.verifyAccountPath}?token=token`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('text');
    req.flush('Success');
  });

  it('should call reset password', (done) => {

    service.resetPassword({ token: 'token', password: 'password' }).subscribe({
      next: (res) => {
        expect(res).toBeNull();
        done();
      },
      error: (error) => {
        fail('Expected no errors, but got ' + error);
        done();
      }
    });

    const req = httpClient.expectOne(service.resetPasswordPath);
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('should call send reset password', (done) => {

    service.sendResetPassword({ email: 'email' }).subscribe({
      next: (res) => {
        expect(res).toBeNull();
        done();
      },
      error: (error) => {
        fail('Expected no errors, but got ' + error);
        done();
      }
    });

    const req = httpClient.expectOne(service.sendResetPasswordPath);
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

});
