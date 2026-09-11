import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AccountDeletionService } from './account-deletion.service';

@Component({
  selector: 'app-delete-account',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './delete-account.component.html',
  styleUrl: './delete-account.component.css'
})
export class DeleteAccountComponent {

  private readonly api = inject(AccountDeletionService);
  private readonly route = inject(ActivatedRoute);
  readonly confirmationMode = this.route.snapshot.data['confirmDeletion'] === true;
  private token = this.confirmationMode ? this.route.snapshot.queryParamMap.get('token') : null;
  readonly email = new FormControl('', { nonNullable: true,
    validators: [Validators.required, Validators.email, Validators.maxLength(200)] });
  busy = false;
  completed = false;
  message = '';
  error = this.confirmationMode && !this.token ? 'El enlace no contiene un token. Solicita uno nuevo.' : '';

  get canSubmit() {
    return !this.busy && !this.completed && (this.confirmationMode ? !!this.token : this.email.valid);
  }

  onConfirm() {
    if (this.busy || this.completed) return;
    if (!this.confirmationMode) this.email.setValue(this.email.value.trim());
    if (!this.canSubmit) { this.email.markAsTouched(); return; }
    this.busy = true;
    this.error = '';
    const request = this.confirmationMode ? this.api.confirm(this.token!) : this.api.request(this.email.value);
    request.pipe(finalize(() => this.busy = false)).subscribe({
      next: () => {
        this.completed = true;
        this.token = null;
        this.message = this.confirmationMode
          ? 'Eliminación programada. Revisa tu correo para consultar la fecha. Tus sesiones han sido revocadas.'
          : 'Solicitud recibida. Revisa tu correo para confirmar la eliminación. Enviar esta solicitud no elimina tu cuenta.';
      },
      error: () => {
        this.error = this.confirmationMode
          ? 'No se pudo confirmar. El enlace puede haber caducado o haberse utilizado; revisa tu correo antes de solicitar otro.'
          : 'No se pudo completar la solicitud. Revisa el correo introducido y tu conexión; si ya recibiste el enlace, utiliza ese correo.';
      }
    });
  }
}
