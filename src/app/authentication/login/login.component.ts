import { Component, inject, Signal, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { constants, messages } from '../../constants/constants';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../services/auth.service';
import { LoginDTO } from '../model/LoginDTO';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { finalize, merge, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from '../../shared/simple-dialog/services/dialog.service';
import { ErrorForm } from '../../shared/model/ErrorForm';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SimpleInputComponent } from '../../shared/custom-inputs/simple-input/simple-input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CommonModule,
    SimpleInputComponent,
    CommonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private readonly authService: AuthService = inject(AuthService);
  private readonly dialogService: DialogService = inject(DialogService);
  private readonly router: Router = inject(Router);

  readonly formLogin = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern(constants.PATTERN_EMAIL)]),
    password: new FormControl('', [Validators.required])
  });

  private _isLoading = signal<boolean>(false);
  isLoading = this._isLoading.asReadonly();

  private _isPasswordVisible = signal<boolean>(false);
  isPasswordVisible = this._isPasswordVisible.asReadonly();


  readonly validators = {
    email: [
      { type: 'required', message: messages.EMAIL.REQUIRED },
      { type: 'pattern', message: messages.EMAIL.INVALID_PATTERN }
    ],
    password: [
      { type: 'required', message: messages.PASSWORD.REQUIRED }
    ]
  }


  login() {
    this.formLogin.markAllAsTouched();
    if (!this.formLogin.valid) {
      this.dialogService.showErrorMessage(messages.INVALID_FORM);
      return;
    }

    const loginDTO = this.generateLoginForm();
    this.loginWithCredential(loginDTO)

  }

  private loginWithCredential(loginDTO: LoginDTO) {
    this._isLoading.set(true);
    this.formLogin.disable();
    this.authService.login(loginDTO)
      .subscribe({
        next: () => this.router.navigate(['/dispatch']),
        error: (error) => this.validateErrors(error)
      })
      .add(() => {
        this._isLoading.set(false);
        this.formLogin.enable();
      });
  }

  private generateLoginForm(): LoginDTO {
    const email = this.formLogin.controls.email.value!;
    const password = this.formLogin.controls.password.value!;

    return {
      email: email,
      password: password
    };
  }

  private validateErrors(error: any) {
    if (error.status === 404) {
      this.dialogService.showErrorMessage(messages.LOGIN.ERROR_NOT_FOUND);
      return;
    }

    if (error.status === 401) {
      this.dialogService.showErrorMessage(messages.LOGIN.ERROR_UNAUTHORIZED);
      return;
    }

    if (error.status === 403) {
      this.dialogService.showErrorMessage('Esta cuenta no tiene acceso a la central. Usa una cuenta ADMIN, SUPERADMIN u OPERATOR.');
      return;
    }

    this.dialogService.showErrorMessage(messages.LOGIN.ERROR_GENERIC);
  }

  togglePassword(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this._isPasswordVisible.update(value => !value);
  }

  forgotPassword() {
    this.router.navigate(['/send-reset-password']);
  }


}


