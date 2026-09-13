import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordComponent } from './reset-password.component';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const activatedRouteMock = {
  queryParams: of({ token: 'mock-token' }), // Mock de los parámetros de la URL
};


describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  const authService = jasmine.createSpyObj<AuthService>('AuthService', ['resetPassword']);
  const router = jasmine.createSpyObj('Router', ['navigate']);


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent, NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('after ngOnInit should get token from query params', () => {
    component.ngOnInit();
    expect(component["token"]()).toBe('mock-token');
  });


  it('should not submit if form is invalid', () => {
    component.ngOnInit();
    component.form.patchValue({ password: '123' });
    component.onSubmit();

    expect(component.form.controls.password.errors).toEqual({ minlength: { requiredLength: 6, actualLength: 3 } });
  });

  it('should submit if form is valid and success', () => {

    authService.resetPassword.and.returnValue(of(void 0));

    component.ngOnInit();
    component.form.patchValue({
      password: '123456',
      confirmPassword: '123456'
    });

    component.onSubmit();

    expect(authService.resetPassword).toHaveBeenCalledWith({
      token: 'mock-token',
      password: '123456'
    })

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });


  it('should not submit if passwords do not match', () => {
    component.ngOnInit();
    component.form.patchValue({
      password: '123456',
      confirmPassword: '1234567'
    });

    component.onSubmit();


    expect(component.form.controls.confirmPassword.errors).toEqual({ different: true });

  });

  it('should enable form when has error', () => {
    authService.resetPassword.and.returnValue(throwError(() => new Error()));
    component.ngOnInit();
    component.form.patchValue({
      password: '123456',
      confirmPassword: '123456'
    });

    component.onSubmit();

    expect(component.form.enabled).toBeTrue();

  });


  it('should enable toggle password visibility', () => {
    component["_isPasswordVisible1"].set(true);
    component.togglePassword1(new MouseEvent('click'));
    expect(component.isPasswordVisible1()).toBeFalse();
  });

  it('should enable toggle password visibility', () => {
    component["_isPasswordVisible2"].set(false);
    component.togglePassword2(new MouseEvent('click'));
    expect(component.isPasswordVisible2()).toBeTrue();
  });

});
