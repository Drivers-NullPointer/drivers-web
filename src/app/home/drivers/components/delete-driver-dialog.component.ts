import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Driver } from '../model/driver.types';

@Component({
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Eliminar cuenta del conductor</h2>
    <mat-dialog-content>
      <p>¿Eliminar la cuenta de {{ driver.name }} {{ driver.lastname }} (conductor #{{ driver.id }})?</p>
      <p>{{ driver.email }}</p>
      <p>Se anonimizará su cuenta y se revocarán sus sesiones. Esta acción no se puede deshacer.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false" cdkFocusInitial>Cancelar</button>
      <button mat-button color="warn" [mat-dialog-close]="true">Eliminar cuenta</button>
    </mat-dialog-actions>
  `
})
export class DeleteDriverDialogComponent {
  readonly driver = inject<Driver>(MAT_DIALOG_DATA);
}
