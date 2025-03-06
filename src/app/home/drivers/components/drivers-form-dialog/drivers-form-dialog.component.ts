import { Component, inject, input, model, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Driver } from '../../model/driver.types';
import { DialogData } from '../../model/dialog.data';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogAction } from '../../../../shared/model/Dialog.action';
import { MatInputModule } from '@angular/material/input';
import { constants } from '../../../../constants/constants';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { SelectProfilePictureComponent } from "../../../../shared/select-profile-picture/select-profile-picture.component";
import { DatePipe } from '@angular/common';
import { SimpleInputComponent } from "../../../../shared/custom-inputs/simple-input/simple-input.component";

@Component({
  selector: 'app-edit-form-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    SelectProfilePictureComponent,
    SimpleInputComponent
  ],
  templateUrl: './drivers-form-dialog.component.html',
  styleUrl: './drivers-form-dialog.component.css'
})
export class DriversFormDialogComponent implements OnInit {


  readonly dialogRef: MatDialogRef<DriversFormDialogComponent> = inject(MatDialogRef<DriversFormDialogComponent>);
  private readonly dialogData = inject<DialogData<Driver>>(MAT_DIALOG_DATA);


  readonly drive?: Driver = this.dialogData.data;
  readonly action = this.dialogData.action;

  readonly DialogAction = DialogAction;

  photoData = signal<string | undefined>(this.drive?.imageProfile).asReadonly();
  readonly selecteFile: File | undefined;

  readonly formDriver = new FormGroup({
    name: new FormControl(this.drive?.name, [Validators.required]),
    lastname: new FormControl(this.drive?.lastname, [Validators.required]),
    email: new FormControl(this.drive?.email, [Validators.required, Validators.pattern(constants.PATTERN_EMAIL)]),
    phone: new FormControl(this.drive?.phone, [Validators.required]),
    birthdate: new FormControl(this.drive?.birthdate, [Validators.required]),
  });



  ngOnInit(): void {
    if (this.action === DialogAction.OBSERVE) {
      this.formDriver.disable();
      return;
    }

    if (this.action === DialogAction.EDIT) {
      this.formDriver.removeControl('birthdate' as never);
      return;
    }
  }



  save() {
    if (this.formDriver.valid) {
      this.dialogRef.close({
        ...this.formDriver.value,
        imageProfileFile: this.selecteFile
      });
    }
  }
}
