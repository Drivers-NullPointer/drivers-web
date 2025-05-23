import { Component, inject, input, model, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CreateDriverDto, Driver, UpdateDriverDto } from '../../model/driver.types';
import { DialogData } from '../../model/dialog.data';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogAction } from '../../../../shared/model/Dialog.action';
import { MatInputModule } from '@angular/material/input';
import { constants, messages } from '../../../../constants/constants';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { SelectProfilePictureComponent } from "../../../../shared/select-profile-picture/select-profile-picture.component";
import { DatePipe } from '@angular/common';
import { SimpleInputComponent } from "../../../../shared/custom-inputs/simple-input/simple-input.component";
import { DateInputComponent } from "../../../../shared/custom-inputs/date-imput/date-input.component";
import { DriversService } from '../../services/drivers.service';
import { ToastService } from '../../../../shared/toast/toast.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CenterProgressComponent } from "../../../../shared/pagination/components/center-progress/center-progress.component";
import { merge } from 'rxjs';

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
    SimpleInputComponent,
    DateInputComponent,
    MatProgressSpinnerModule,
    CenterProgressComponent
  ],
  templateUrl: './drivers-form-dialog.component.html',
  styleUrl: './drivers-form-dialog.component.css'
})
export class DriversFormDialogComponent {


  readonly dialogRef: MatDialogRef<DriversFormDialogComponent> = inject(MatDialogRef<DriversFormDialogComponent>);
  private readonly dialogData = inject<DialogData<Driver>>(MAT_DIALOG_DATA);

  readonly drive?: Driver = this.dialogData.data;
  readonly action = this.dialogData.action;

  readonly DialogAction = DialogAction;

  photoData = signal<string | undefined>(this.drive?.imageProfile).asReadonly();
  readonly selecteFile: File | undefined;
  readonly maxDate = new Date();

  readonly driverServices: DriversService = inject(DriversService);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal<boolean>(false);

  readonly formDriver = new FormGroup({
    name: new FormControl(this.drive?.name, [Validators.required]),
    lastname: new FormControl(this.drive?.lastname, [Validators.required]),
    email: new FormControl(this.drive?.email, [Validators.required, Validators.pattern(constants.PATTERN_EMAIL)]),
    phone: new FormControl(this.drive?.phone, [Validators.required]),
    birthdate: new FormControl(this.drive?.birthdate, [Validators.required]),
  });

  readonly errors = {
    name: [
      { type: 'required', message: 'El nombre es requerido' },
    ],
    lastname: [
      { type: 'required', message: 'El apellido es requerido' },
    ],
    email: [
      { type: 'required', message: 'El email es requerido' },
      { type: 'pattern', message: 'El email no es valido' },
    ],
    phone: [
      { type: 'required', message: 'El telefono es requerido' },
    ],
    birthdate: [
      { type: 'required', message: 'La fecha de nacimiento es requerida' },
      { type: 'minor', message: 'El conductor debe ser mayor de edad' },
    ],
  }


  save(): void {

    this.formDriver.markAllAsTouched();

    this.validateForm();

    if (!this.formDriver.valid) {
      this.toast.showErrorMessage({ message: "Los campos son requeridos" })
      return;
    }


    if (this.action === DialogAction.CREATE) {
      const createDriverDto = this.getCreateDriverDto();
      this.createDriver(createDriverDto);
      return;
    }

    if (this.action === DialogAction.EDIT) {
      const updateDriverDto = this.getUpdateDriverDto();
      this.updateDriver(this.drive!.id, updateDriverDto);
      return;
    }
  }


  private getUpdateDriverDto(): UpdateDriverDto {
    return {
      name: this.formDriver.controls.name.value ?? undefined,
      lastname: this.formDriver.controls.lastname.value ?? undefined,
      email: this.formDriver.controls.email.value ?? undefined,
      phone: this.formDriver.controls.phone.value ?? undefined,
      imageProfileFile: this.selecteFile
    }
  }


  private getCreateDriverDto(): CreateDriverDto {
    const birthdateValue = this.formDriver.controls.birthdate.value!;
    const birthdate = new Date(birthdateValue).toISOString()
    return {
      name: this.formDriver.controls.name.value!,
      lastname: this.formDriver.controls.lastname.value!,
      email: this.formDriver.controls.email.value!,
      phone: this.formDriver.controls.phone.value!,
      birthdate: birthdate,
      imageProfileFile: this.selecteFile
    }
  }


  private validateForm(): void {
    if (this.action === DialogAction.CREATE) {

      const birthdate = this.formDriver.controls.birthdate.value!;

      const birthdateDate = new Date(birthdate);

      const age = new Date().getFullYear() - birthdateDate.getFullYear();

      if (age < 18) {
        this.formDriver.controls.birthdate.setErrors({ minor: true });
      }

    }
  }


  private createDriver(
    createDriverDto: CreateDriverDto
  ): void {
    this.isLoading.set(true);
    this.driverServices.createDriver(createDriverDto).subscribe({
      next: () => {
        this.toast.showSuccessMessage({
          title: 'Conductor creado',
          message: 'Se ha creado el conductor'
        });
        this.dialogRef.close(true);
        this.isLoading.set(false);
      },
      error: (error) => {
        const errorMessage = this.getErrorMessage(error.message, 'No se ha podido crear el conductor')
        this.toast.showErrorMessage({
          title: "Error al crear conductor",
          message: errorMessage
        })
        this.isLoading.set(false);
      }
    })
  }

  private updateDriver(
    id: number,
    updateDriver: UpdateDriverDto
  ): void {
    this.isLoading.set(true);
    this.driverServices.updateDriver(id, updateDriver).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.showSuccessMessage({
          title: 'Conductor actualizado',
          message: 'Se ha actualizado el conductor'
        })
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMessage = this.getErrorMessage(error.message, 'No se ha podido actualizar el conductor')
        this.toast.showErrorMessage({
          title: 'Error',
          message: errorMessage
        })
      }
    })
  }

  private getErrorMessage(
    error: string,
    defaultMessage: string
  ): string {

    if (error === 'PHONE_ALREADY_EXISTS') {
      return 'El número de telefono ya existe, por favor verifica el número de telefono';
    }

    if (error === 'EMAIL_ALREADY_EXISTS') {
      return 'El email ya existe, por favor verifica el email';
    }

    if (error === 'DRIVER_NOT_FOUND') {
      return 'El conductor no existe, por favor verifica el id';
    }

    if (error === 'DRIVER_ALREADY_EXISTS') {
      return 'El conductor ya existe, por favor verifica el id';
    }

    return defaultMessage;
  }
}
