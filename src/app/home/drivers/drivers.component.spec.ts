import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriversComponent } from './drivers.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ToastService } from '../../shared/toast/toast.service';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DriversService } from './services/drivers.service';
import { PaginatedResult } from '../../shared/pagination/model/pagination.result';
import { Driver } from './model/driver.types';
import { of, throwError } from 'rxjs';
import { messages } from '../../constants/constants';
import { DriverStatus } from './model/driver.status';


const paginationResponseDriver: PaginatedResult<Driver> = {
  pagination: {
    currentPage: 1,
    totalItems: 100,
    totalPages: 10,
    pageSize: 10
  },
  result: []
};

const driver: Driver = {
  id: 1,
  name: 'name',
  lastname: 'lastname',
  email: 'email',
  phone: 'phone',
  imageProfile: 'imageProfile',
  birthdate: new Date().toISOString()
};


describe('DriversComponent', () => {
  let component: DriversComponent;
  let fixture: ComponentFixture<DriversComponent>;
  let toastsServiceSpy: jasmine.SpyObj<ToastService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let driversServiceSpy: jasmine.SpyObj<DriversService>;

  beforeEach(async () => {
    toastsServiceSpy = jasmine.createSpyObj<ToastService>('ToastService', ['showSuccess', 'showError', 'showSuccessMessage', 'showErrorMessage']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    driversServiceSpy = jasmine.createSpyObj<DriversService>('DriversService', ['createDriver', 'updateDriver', 'deleteDriver', 'getAllPaginated', 'notifyChangeSignal']);

    await TestBed.configureTestingModule({
      imports: [DriversComponent],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ToastService, useValue: toastsServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: DriversService, useValue: driversServiceSpy }
      ]
    })
      .compileComponents();

    driversServiceSpy.getAllPaginated.and.returnValue(of(paginationResponseDriver));
    fixture = TestBed.createComponent(DriversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should edit driver with null response (cancel response)', () => {

    const dialogRefSpy = jasmine.createSpyObj({
      afterClosed: of(null),
      close: null
    });

    dialogSpy.open.and.returnValue(dialogRefSpy);

    component.paginationActions[0].action(driver);
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('should edit driver update success', () => {

    const dialogRefSpy = jasmine.createSpyObj({
      afterClosed: of(driver),
      close: null
    });

    dialogSpy.open.and.returnValue(dialogRefSpy);
    driversServiceSpy.updateDriver.and.returnValue(of(driver));

    component.paginationActions[0].action(driver);
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('should edit driver update error', () => {

    const dialogRefSpy = jasmine.createSpyObj({
      afterClosed: of(driver),
      close: null
    });

    dialogSpy.open.and.returnValue(dialogRefSpy);
    driversServiceSpy.updateDriver.and.returnValue(throwError(() => new Error('error')));

    component.paginationActions[0].action(driver);
    expect(dialogSpy.open).toHaveBeenCalled();
  });


  it('should create driver and success response', () => {

    const dialogRefSpy = jasmine.createSpyObj({
      afterClosed: of(driver),
      close: null
    });

    dialogSpy.open.and.returnValue(dialogRefSpy);
    driversServiceSpy.createDriver.and.returnValue(of(driver));

    component.generalActions[0].action();
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('should create driver and error response', () => {

    const dialogRefSpy = jasmine.createSpyObj({
      afterClosed: of(driver),
      close: null
    });

    dialogSpy.open.and.returnValue(dialogRefSpy);
    driversServiceSpy.createDriver.and.returnValue(throwError(() => new Error('error')));

    component.generalActions[0].action();
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('should delete driver and success response', () => {

    driversServiceSpy.deleteDriver.and.returnValue(of(driver));

    component.paginationActions[1].action(driver);
    expect(toastsServiceSpy.showSuccessMessage).toHaveBeenCalledWith({
      title: 'Conductor eliminado',
      message: 'Se ha eliminado el conductor'
    })
  });

  it('should delete driver and error response', () => {

    driversServiceSpy.deleteDriver.and.returnValue(throwError(() => new Error('error')));

    component.paginationActions[1].action(driver);
    expect(toastsServiceSpy.showErrorMessage).toHaveBeenCalledWith({
      message: 'No se ha podido eliminar el conductor'
    })
  });

  it('should see the drivers', () => {

    const dialogRefSpy = jasmine.createSpyObj({
      afterClosed: of(null),
      close: null
    });

    dialogSpy.open.and.returnValue(dialogRefSpy);
    component.paginationActions[2].action(driver);
    expect(dialogSpy.open).toHaveBeenCalled();

  });


  it('should show correct map status in the column ', () => {

    const status = DriverStatus.AVARIABLE;
    const expectedStatus = component.driverColumns[5]?.transform?.(status);

    expect(expectedStatus).toBe(expectedStatus);

  });


  it('should return correct label for each driver status', () => {
    const expectations = [
      { input: DriverStatus.NO_AVARIABLE, expected: 'No disponible' },
      { input: DriverStatus.AVARIABLE, expected: 'Disponible' },
      { input: DriverStatus.IN_TRIP, expected: 'En viaje' },
      { input: DriverStatus.SUSPENDED, expected: 'Suspendido' },
      { input: DriverStatus.NO_VERIFICATE, expected: 'No verificado' },
      { input: 'UNKNOWN', expected: 'No disponible' },
      { input: null, expected: 'No disponible' },
      { input: undefined, expected: 'No disponible' },
    ];

    for (const { input, expected } of expectations) {
      expect(component.changeStatus(input)).toBe(expected);
    }
  });

});
