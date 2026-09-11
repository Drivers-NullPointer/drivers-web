import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogData } from '../../../drivers/model/dialog.data';
import { SaveVehicle, Vehicle } from '../../model/vehicle';
import { DialogAction } from '../../../../shared/model/Dialog.action';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { debounceTime, distinctUntilChanged, filter, Subscription, map } from 'rxjs';
import { VehiclesService } from '../../services/services/vehicles.service';
import { Make } from '../../model/make';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PaginatedResult } from '../../../../shared/pagination/model/pagination.result';
import { PaginationRequest } from '../../../../shared/pagination/model/pagination.request';
import { Model } from '../../model/model';
import { Color } from '../../model/Color';
import { MatSelectModule } from '@angular/material/select';
import { SimpleInputComponent } from "../../../../shared/custom-inputs/simple-input/simple-input.component";
import { AutoCompleteValue } from '../../../../shared/model/AutoCompleteValue';
import { OptionsInputComponent } from "../../../../shared/custom-inputs/options-input/options-input.component";
import { DropDownOption } from '../../../../shared/model/DropDownOption';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatSelectModule,
    SimpleInputComponent,
    OptionsInputComponent,
    MatIconModule
  ],
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.css'
})
export class VehicleFormComponent implements OnInit, OnDestroy {


  private readonly vehicleService = inject(VehiclesService);

  readonly dialogRef: MatDialogRef<VehicleFormComponent> = inject(MatDialogRef<VehicleFormComponent>);
  private readonly dialogData = inject<DialogData<Vehicle>>(MAT_DIALOG_DATA);


  readonly vehicle?: Vehicle = this.dialogData.data;
  readonly action = this.dialogData.action;
  readonly DialogAction = DialogAction;
  private makeSubscribe?: Subscription;
  private modelSubscribe?: Subscription;

  readonly vehicleForm = new FormGroup({
    make: new FormControl<AutoCompleteValue | string>(this.vehicle ? { id: this.vehicle.makeId, value: this.vehicle.make } : '', [Validators.required, this.catalogSelection]),
    model: new FormControl<AutoCompleteValue | string>(this.vehicle ? { id: this.vehicle.modelId, value: this.vehicle.model } : '', [Validators.required, this.catalogSelection]),
    color: new FormControl<number | null>(this.vehicle?.colorId ?? null, [Validators.required]),
    plates: new FormControl(this.vehicle?.plates, [Validators.required, Validators.minLength(5), Validators.maxLength(20)]),
    number: new FormControl(this.vehicle?.number, [Validators.required, Validators.min(1)]),
    year: new FormControl(this.vehicle?.year, [Validators.required, Validators.min(1980), Validators.max(2100)]),
    isRotulated: new FormControl(this.vehicle?.isRotulated, [Validators.required])
  });

  readonly makeOptions = signal<AutoCompleteValue[]>([])
  readonly modelOptions = signal<AutoCompleteValue[]>([])
  readonly colors = signal<DropDownOption[]>([])
  readonly isModelEnabled = signal(!!this.vehicle);
  readonly makeErrors = [{ type: 'required', message: 'Selecciona una marca.' }, { type: 'catalogSelection', message: 'Selecciona una opción del catálogo.' }];
  readonly modelErrors = [{ type: 'required', message: 'Selecciona primero una marca y después un modelo.' }, { type: 'catalogSelection', message: 'Selecciona una opción del catálogo.' }];



  ngOnInit(): void {

    if (this.action === DialogAction.OBSERVE) {
      this.vehicleForm.disable();
      return;
    }

    this.loadColors();
    this.vehicleService.getListMake().subscribe({
      next: makes => this.makeOptions.set(makes.map(make => ({ id: make.id, value: make.name })))
    });

    this.makeSubscribe = this.vehicleForm.controls.make.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter((value): value is AutoCompleteValue => !!value && typeof value === 'object')
      )
      .subscribe((value) => {
        if (value) {
          this.isModelEnabled.set(true);
          this.vehicleForm.controls.model.setValue('');
          this.vehicleService.getListModel(Number(value.id)).subscribe({
            next: models => {
              const map = models.map(model => <AutoCompleteValue>{
                id: model.id,
                value: model.name
              });
              this.modelOptions.set(map);
            }
          });
        }
      });
  }

  loadColors() {
    this.vehicleService.getListColor().subscribe({
      next: colors => {
        const map = colors.map(color => <DropDownOption>{
          id: color.id,
          value: color.name,
          data: color
        });
        this.colors.set(map);
      }
    });
  }

  save() {
    this.vehicleForm.markAllAsTouched();
    if (this.vehicleForm.valid) {
      const model = this.vehicleForm.controls.model.value;
      const vehicleFrom: SaveVehicle = {
        number: Number(this.vehicleForm.controls.number.value),
        plates: this.vehicleForm.controls.plates.value!,
        isRotulated: this.vehicleForm.controls.isRotulated.value!,
        year: Number(this.vehicleForm.controls.year.value),
        modelId: Number(model && typeof model === 'object' ? model.id : this.vehicle?.modelId),
        colorId: Number(this.vehicleForm.controls.color.value)
      };
      this.dialogRef.close(vehicleFrom);
    }
  }

  private catalogSelection(control: AbstractControl): ValidationErrors | null {
    return control.value && typeof control.value === 'object' ? null : { catalogSelection: true };
  }

  private getPaginationRequest(
    search: string,
  ) {
    return <PaginationRequest>{
      page: 1,
      limit: 3,
      search
    }
  }


  ngOnDestroy(): void {
    this.makeSubscribe?.unsubscribe();
    this.modelSubscribe?.unsubscribe();
  }

}
