import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';
import { DialogService } from '../../shared/simple-dialog/services/dialog.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginResponse } from '../model/LoginResponse';
import { messages } from '../../constants/constants';

const loginResponse: LoginResponse = {
  token: 'token',
  refreshToken: 'refresh',
  user: { id: 1, name: 'Admin', email: 'admin@example.com', roleId: 1, isEmailVerified: true }
};

const credentials = {
  email: 'email@example.com',
  password: 'password'
}


describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let dialogService: jasmine.SpyObj<DialogService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {

    authService = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    dialogService = jasmine.createSpyObj<DialogService>('DialogService', ['showErrorMessage']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideNoopAnimations(),
        { provide: AuthService, useValue: authService },
        { provide: DialogService, useValue: dialogService },
        { provide: Router, useValue: router }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error messages when form is invalid', () => {
    component.login();

    expect(dialogService.showErrorMessage).toHaveBeenCalledWith(messages.INVALID_FORM);
  });



  it('should navigate to home when login is successful', () => {


    authService.login.and.returnValue(of(loginResponse));

    component.formLogin.setValue(credentials);

    component.login();

    expect(router.navigate).toHaveBeenCalledWith(['/dispatch']);
  });

  it('should show when 404 error', () => {
    const error = { status: 404 };
    authService.login.and.returnValue(
      throwError(() => error)
    );

    component.formLogin.setValue(credentials);

    component.login();

    expect(dialogService.showErrorMessage).toHaveBeenCalledWith(messages.LOGIN.ERROR_NOT_FOUND);
  });


  it('should show when 401 error', () => {
    const error = { status: 401 };
    authService.login.and.returnValue(
      throwError(() => error)
    );

    component.formLogin.setValue(credentials);

    component.login();

    expect(dialogService.showErrorMessage).toHaveBeenCalledWith(messages.LOGIN.ERROR_UNAUTHORIZED);
  });

  it('should show when generic error', () => {
    const error = { status: 500 };
    authService.login.and.returnValue(
      throwError(() => error)
    );

    component.formLogin.setValue(credentials);

    component.login();

    expect(dialogService.showErrorMessage).toHaveBeenCalledWith(messages.LOGIN.ERROR_GENERIC);
  });


  it('should toggle password', () => {
    const event = new MouseEvent('click');
    const currentValue = false;
    component['_isPasswordVisible'].set(currentValue);
    component.togglePassword(event);
    expect(component.isPasswordVisible()).toBe(!currentValue);
  });

  it('should navigate to forgot password', () => {
    component.forgotPassword();
    expect(router.navigate).toHaveBeenCalledWith(['/send-reset-password']);
  });

});
