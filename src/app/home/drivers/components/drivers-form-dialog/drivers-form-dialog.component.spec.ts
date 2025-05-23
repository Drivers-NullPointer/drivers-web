import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DriversFormDialogComponent } from './drivers-form-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DialogData } from '../../model/dialog.data';
import { Driver } from '../../model/driver.types';
import { DialogAction } from '../../../../shared/model/Dialog.action';
import { DriversService } from '../../services/drivers.service';
import { ToastService } from '../../../../shared/toast/toast.service';


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
    component.formDriver.patchValue({
      ...driver,
    });

    component.save();
    expect(component.formDriver.valid).toBeTrue();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
