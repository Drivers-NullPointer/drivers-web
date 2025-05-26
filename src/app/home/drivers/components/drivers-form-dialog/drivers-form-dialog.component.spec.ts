import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DriversFormDialogComponent } from './drivers-form-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DialogData } from '../../model/dialog.data';
import { Driver } from '../../model/driver.types';
import { DialogAction } from '../../../../shared/model/Dialog.action';
import { DriversService } from '../../services/drivers.service';
import { ToastService } from '../../../../shared/toast/toast.service';
import { of, throwError } from 'rxjs';


const driver = {
  id: 1,
  name: 'test',
  email: 'example@emial.com',
  birthdate: new Date().toISOString(),
  lastname: 'test',
  phone: '123456789',
}


const driverObserverData: DialogData<Driver> = {
  action: DialogAction.OBSERVE,
  data: driver
};

const driverEditData: DialogData<Driver> = {
  action: DialogAction.EDIT,
  data: driver
};

const driverCreateData: DialogData<Driver> = {
  action: DialogAction.CREATE,
  data: driver
};


describe('EditFormDialogComponent with create action', () => {
  let component: DriversFormDialogComponent;
  let fixture: ComponentFixture<DriversFormDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<DriversFormDialogComponent>>;
  let driversServiceMock: jasmine.SpyObj<DriversService>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {

    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    driversServiceMock = jasmine.createSpyObj<DriversService>('DriversService', ['createDriver', 'updateDriver']);
    toastServiceMock = jasmine.createSpyObj<ToastService>('ToastService', ['showError', 'showSuccess', 'showSuccessMessage', 'showErrorMessage']);

    await TestBed.configureTestingModule({
      imports: [DriversFormDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: driverCreateData },
        { provide: DriversService, useValue: driversServiceMock },
        { provide: ToastService, useValue: toastServiceMock }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DriversFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should validate formDriver and is greater than 18 years old', () => {
    component.formDriver.patchValue({
      ...driver,
      birthdate: new Date(new Date().setFullYear(new Date().getFullYear() - 20)).toISOString()
    });

    driversServiceMock.createDriver.and.returnValue(of({ ...driver, id: 1 }));

    component.save();

    expect(component.formDriver.controls.birthdate.errors?.['minor']).toBeFalsy();
  });

  it('should validate formDriver and is less than 18 years old', () => {
    component.formDriver.patchValue({
      ...driver,
      birthdate: new Date(new Date().setFullYear(new Date().getFullYear() - 15)).toISOString()
    });

    component.save();

    expect(component.formDriver.controls.birthdate.errors?.['minor']).toBeTruthy();
  });

  it("should create a driver when form is valid", () => {
    component.formDriver.patchValue({
      ...driver,
      birthdate: new Date(new Date().setFullYear(new Date().getFullYear() - 20)).toISOString()
    });

    driversServiceMock.createDriver.and.returnValue(of({ ...driver, id: 1 }));

    component.save();

    expect(component.formDriver.valid).toBeTrue();
    expect(driversServiceMock.createDriver).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it("should show success message when driver is created", () => {
    component.formDriver.patchValue({
      ...driver,
      birthdate: new Date(new Date().setFullYear(new Date().getFullYear() - 20)).toISOString()
    });

    driversServiceMock.createDriver.and.returnValue(of({ ...driver, id: 1 }));

    component.save();

    expect(toastServiceMock.showSuccessMessage).toHaveBeenCalledWith({
      title: 'Conductor creado',
      message: 'Se ha creado el conductor'
    });
  });

  it("should show error message when create driver fails", () => {
    const errorMessage = 'Error al crear el conductor';
    driversServiceMock.createDriver.and.returnValue(
      throwError(() => ({ message: errorMessage }))
    );

    component.formDriver.patchValue({
      ...driver,
      birthdate: new Date(new Date().setFullYear(new Date().getFullYear() - 20)).toISOString()
    });

    component.save();

    expect(toastServiceMock.showErrorMessage).toHaveBeenCalledWith({
      title: 'Error al crear conductor', message: 'No se ha podido crear el conductor'
    });
  });
});



describe('EditFormDialogComponent with observer action', () => {
  let component: DriversFormDialogComponent;
  let fixture: ComponentFixture<DriversFormDialogComponent>;
  let driversServiceMock: jasmine.SpyObj<DriversService>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;


  beforeEach(async () => {

    driversServiceMock = jasmine.createSpyObj<DriversService>('DriversService', ['createDriver', 'updateDriver']);
    toastServiceMock = jasmine.createSpyObj<ToastService>('ToastService', ['showError', 'showSuccess', 'showSuccessMessage', 'showErrorMessage']);

    await TestBed.configureTestingModule({
      imports: [DriversFormDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: driverObserverData },
        { provide: DriversService, useValue: driversServiceMock },
        { provide: ToastService, useValue: toastServiceMock }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DriversFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});

describe('EditFormDialogComponent with edit action', () => {
  let component: DriversFormDialogComponent;
  let fixture: ComponentFixture<DriversFormDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<DriversFormDialogComponent>>;
  let driversServiceMock: jasmine.SpyObj<DriversService>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {

    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    driversServiceMock = jasmine.createSpyObj<DriversService>('DriversService', ['createDriver', 'updateDriver']);
    toastServiceMock = jasmine.createSpyObj<ToastService>('ToastService', ['showError', 'showSuccess', 'showSuccessMessage', 'showErrorMessage']);

    await TestBed.configureTestingModule({
      imports: [DriversFormDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: driverEditData },
        { provide: DriversService, useValue: driversServiceMock },
        { provide: ToastService, useValue: toastServiceMock }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DriversFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });




  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should nothing if the form is invalid', () => {
    component.formDriver.reset();

    component.save();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('should close dialog with formDriver value', () => {

    driversServiceMock.updateDriver.and.returnValue(of(driver));

    component.formDriver.patchValue({
      ...driver,
    });

    component.save();
    expect(component.formDriver.valid).toBeTrue();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it("when save info and no have changes create correctly", () => {

    driversServiceMock.updateDriver.and.returnValue(of(driver));

    component.formDriver.patchValue({
      ...driver,
    });

    component.save();

    expect(toastServiceMock.showSuccessMessage).toHaveBeenCalledWith({
      title: 'Conductor actualizado',
      message: 'Se ha actualizado el conductor'
    });
  });

  it("catch error when update driver", () => {
    const errorMessage = 'Error al actualizar el conductor';
    driversServiceMock.updateDriver.and.returnValue(
      throwError(() => ({ message: errorMessage }))
    );

    component.formDriver.patchValue({
      ...driver,
    });

    component.save();

    expect(toastServiceMock.showErrorMessage).toHaveBeenCalledWith({
      title: 'Error', message: 'No se ha podido actualizar el conductor'
    });
  });


  it('should return correct messages for known errors and default for unknown', () => {
    const defaultMsg = 'Mensaje por defecto';
    const cases = [
      { error: 'PHONE_ALREADY_EXISTS', expected: 'El número de telefono ya existe, por favor verifica el número de telefono' },
      { error: 'EMAIL_ALREADY_EXISTS', expected: 'El email ya existe, por favor verifica el email' },
      { error: 'DRIVER_NOT_FOUND', expected: 'El conductor no existe, por favor verifica el id' },
      { error: 'DRIVER_ALREADY_EXISTS', expected: 'El conductor ya existe, por favor verifica el id' },
      { error: 'UNKNOWN_ERROR', expected: defaultMsg },
      { error: '', expected: defaultMsg }
    ];

    for (const testCase of cases) {
      expect(component.getErrorMessage(testCase.error as any, defaultMsg)).toBe(testCase.expected);
    }
  });

});
