import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendResetPasswordComponent } from './send-reset-password.component';
import { AuthService } from '../services/auth.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

describe('SendResetPasswordComponent', () => {
  let component: SendResetPasswordComponent;
  let fixture: ComponentFixture<SendResetPasswordComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['sendResetPassword']);
    await TestBed.configureTestingModule({
      imports: [SendResetPasswordComponent, NoopAnimationsModule],
      providers: [{ provide: AuthService, useValue: authService }]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SendResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should not send reset password when form is invalid', () => {
    component.sendEmail();
    expect(authService.sendResetPassword).not.toHaveBeenCalled();
  });


  it('should send reset password when form is valid', () => {

    authService.sendResetPassword.and.returnValue(of(void 0));

    component.form.patchValue({ email: 'example@email.com' });
    component.sendEmail();
    expect(authService.sendResetPassword).toHaveBeenCalled();
    expect(component.isLoading()).toBeFalse();
  });

  it('should show error message when send reset password fails', () => {
    authService.sendResetPassword.and.returnValue(throwError(() => new Error('Error')));
    component.form.patchValue({ email: 'example@email.com' });

    component.sendEmail();
    expect(authService.sendResetPassword).toHaveBeenCalled();

    expect(component.isLoading()).toBeFalse();

  });
});
