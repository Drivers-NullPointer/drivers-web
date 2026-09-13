import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { VehicleFormComponent } from './vehicle-form.component';
import { VehiclesService } from '../../services/services/vehicles.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Color } from '../../model/Color';
import { Model } from '../../model/model';
import { Make } from '../../model/make';
import { of } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DialogData } from '../../../drivers/model/dialog.data';
import { Vehicle } from '../../model/vehicle';
import { DialogAction } from '../../../../shared/model/Dialog.action';
import { PaginatedResult } from '../../../../shared/pagination/model/pagination.result';

const color: Color[] = [
  {
    id: 1,
    name: 'Red',
    hex: '#FF0000'
  },
  {
    id: 2,
    name: 'Green',
    hex: '#00FF00'
  }
];

const models: Model[] = [
  {
    id: 1,
    name: 'Model 1', makeId: 1
  },
  {
    id: 2,
    name: 'Model 2', makeId: 1
  }
];

const makes: Make[] = [
  {
    id: 1,
    name: 'Make 1'
  },
  {
    id: 2,
    name: 'Make 2'
  }
];

const dialogData: DialogData<Vehicle> = {
  data: {
    year: 2020, makeId: 1, modelId: 1, colorId: 1,
    id: 1,
    number: 123,
    isRotulated: false,
    make: 'Make 1',
    model: 'Model 1',
    color: 'Red',
    plates: '123'
  },
  action: DialogAction.OBSERVE
}

const vehicleResponse: PaginatedResult<Vehicle> = {
  result: [],
  pagination: {
    page: 1,
    limit: 1,
    totalElements: 1,
    totalPages: 1
  }
}

describe('VehicleFormComponent', () => {
  let component: VehicleFormComponent;
  let fixture: ComponentFixture<VehicleFormComponent>;
  let vehiclesService: jasmine.SpyObj<VehiclesService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<VehicleFormComponent>>;

  beforeEach(async () => {

    vehiclesService = jasmine.createSpyObj<VehiclesService>('VehiclesService', ['getAllPaginated', 'notifyChange', 'getListMake', 'getListModel', 'getListColor', 'create']);
    dialogRefSpy = jasmine.createSpyObj<MatDialogRef<VehicleFormComponent>>('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [VehicleFormComponent],
      providers: [
        provideNoopAnimations(),
        { provide: VehiclesService, useValue: vehiclesService },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    })
      .compileComponents();

    vehiclesService.getAllPaginated.and.returnValue(of(vehicleResponse));
    vehiclesService.getListColor.and.returnValue(of(color));
    vehiclesService.getListModel.and.returnValue(of(models));
    vehiclesService.getListMake.and.returnValue(of(makes));

    fixture = TestBed.createComponent(VehicleFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads makes once and does not request models for free text', fakeAsync(() => {
    fixture.detectChanges();
    component.vehicleForm.controls.make.setValue('Make 1', { emitEvent: true });
    tick(500);
    expect(vehiclesService.getListMake).toHaveBeenCalledOnceWith();
    expect(vehiclesService.getListModel).not.toHaveBeenCalled();
    expect(component.vehicleForm.controls.make.hasError('catalogSelection')).toBeTrue();
  }));

  it('requests models by selected make ID and resets the prior model', fakeAsync(() => {
    fixture.detectChanges();
    component.vehicleForm.controls.model.setValue('Model 1', { emitEvent: true });
    component.vehicleForm.controls.make.setValue({ id: 1, value: 'Make 1' });
    tick(500);
    expect(vehiclesService.getListModel).toHaveBeenCalledOnceWith(1);
    expect(component.vehicleForm.controls.model.value).toBe('');
    expect(component.modelOptions()).toEqual([{ id: 1, value: 'Model 1' }, { id: 2, value: 'Model 2' }]);
  }));

  it('should not request models when model control changes without make value', fakeAsync(() => {
    fixture.detectChanges();
    component.vehicleForm.controls.model.setValue('Model 1', { emitEvent: true });
    tick(500);
    expect(vehiclesService.getListModel).not.toHaveBeenCalled();
  }));

  it('should save vehicle when form is valid', () => {
    component.vehicleForm.setValue({
      make: { id: 1, value: 'Make 1' },
      model: { id: 1, value: 'Model 1' },
      color: 1,
      number: 123,
      plates: 'ABC123',
      year: 2020,
      isRotulated: false
    });
    component.save();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ number: 123, plates: 'ABC123', year: 2020, modelId: 1, colorId: 1, isRotulated: false });

  });

});



describe('VehicleFormComponent', () => {
  let component: VehicleFormComponent;
  let fixture: ComponentFixture<VehicleFormComponent>;
  let vehiclesService: jasmine.SpyObj<VehiclesService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<VehicleFormComponent>>;

  beforeEach(async () => {

    vehiclesService = jasmine.createSpyObj<VehiclesService>('VehiclesService', ['getAllPaginated', 'notifyChangeSignal', 'getListMake', 'getListModel', 'getListColor', 'create']);
    dialogRefSpy = jasmine.createSpyObj<MatDialogRef<VehicleFormComponent>>('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [VehicleFormComponent],
      providers: [
        provideNoopAnimations(),
        { provide: VehiclesService, useValue: vehiclesService },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: dialogData }
      ]
    })
      .compileComponents();

    vehiclesService.getAllPaginated.and.returnValue(of(vehicleResponse));
    vehiclesService.getListColor.and.returnValue(of(color));
    vehiclesService.getListModel.and.returnValue(of(models));
    vehiclesService.getListMake.and.returnValue(of(makes));

    fixture = TestBed.createComponent(VehicleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with form disable', () => {

    expect(component).toBeTruthy();
    component.ngOnInit();
    expect(component.vehicleForm.disabled).toBeTrue();
  });

});
