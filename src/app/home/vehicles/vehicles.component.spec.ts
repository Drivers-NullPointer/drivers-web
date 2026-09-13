import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiclesComponent } from './vehicles.component';
import { VehiclesService } from './services/services/vehicles.service';
import { ToastService } from '../../shared/toast/toast.service';
import { PaginatedResult } from '../../shared/pagination/model/pagination.result';
import { Vehicle } from './model/vehicle';
import { of, Subject, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';


const vehicleServiceMock: Vehicle = {
  year: 2020, makeId: 1, modelId: 1, colorId: 1,
  id: 1,
  model: 'Corolla',
  plates: 'ABC123',
  make: 'Toyota',
  color: 'Red',
  isRotulated: true,
  number: 1
}

const paginatedResultMock: PaginatedResult<Vehicle> = {
  result: [
    vehicleServiceMock
  ],
  pagination: {
    page: 1,
    limit: 1,
    totalElements: 1,
    totalPages: 1
  }
};


describe('VehiclesComponent', () => {
  let component: VehiclesComponent;
  let fixture: ComponentFixture<VehiclesComponent>;
  let vehicleService: jasmine.SpyObj<VehiclesService>;
  let toastsServiceSpy: jasmine.SpyObj<ToastService>;
  let matDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    vehicleService = jasmine.createSpyObj<VehiclesService>('VehiclesService', ['getAllPaginated', 'notifyChangeSignal', 'update', 'create']);
    toastsServiceSpy = jasmine.createSpyObj<ToastService>('ToastService', ['showSuccess', 'showError']);
    matDialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [VehiclesComponent],
      providers: [
        provideNoopAnimations(),
        { provide: VehiclesService, useValue: vehicleService },
        { provide: ToastService, useValue: toastsServiceSpy },
        { provide: MatDialog, useValue: matDialog }
      ]
    })
      .compileComponents();

    vehicleService.getAllPaginated.and.returnValue(of(paginatedResultMock));

    vehicleService.create.and.returnValue(of(vehicleServiceMock));
    vehicleService.update.and.returnValue(of(vehicleServiceMock));

    fixture = TestBed.createComponent(VehiclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should edit vehicle show edit modal and succes update', () => {

    matDialog.open = jasmine.createSpy().and.returnValue({
      afterClosed: () => of(vehicleServiceMock),
      close: () => { }
    });

    component.paginationActions[0].action(vehicleServiceMock);

    expect(matDialog.open).toHaveBeenCalled();
    expect(toastsServiceSpy.showSuccess).toHaveBeenCalled();

  });

  it('should edit vehicle show edit modal and error update', () => {

    matDialog.open = jasmine.createSpy().and.returnValue({
      afterClosed: () => of(vehicleServiceMock),
      close: () => { }
    });

    vehicleService.update.and.returnValue(
      throwError(() => new Error('Error'))
    );

    component.paginationActions[0].action(vehicleServiceMock);

    expect(matDialog.open).toHaveBeenCalled();
    expect(toastsServiceSpy.showError).toHaveBeenCalled();
  });

  it('does not expose vehicle deletion', () => {
    expect(component.paginationActions.map(action => action.name)).toEqual(['Editar', 'Ver']);
  });

  it('does not mutate a vehicle when observation closes', () => {
    matDialog.open.and.returnValue({ afterClosed: () => of(vehicleServiceMock) } as any);
    component.paginationActions[1].action(vehicleServiceMock);
    expect(vehicleService.update).not.toHaveBeenCalled();
    expect(vehicleService.create).not.toHaveBeenCalled();
  });

  it('should create vehicle success', () => {

    matDialog.open = jasmine.createSpy().and.returnValue({
      afterClosed: () => of(vehicleServiceMock),
      close: () => { }
    });

    component.generalActions[0].action();

    expect(vehicleService.create).toHaveBeenCalled();
    expect(toastsServiceSpy.showSuccess).toHaveBeenCalled();
  });

  it('should create vehicle error', () => {

    matDialog.open = jasmine.createSpy().and.returnValue({
      afterClosed: () => of(vehicleServiceMock),
      close: () => { }
    });

    vehicleService.create.and.returnValue(
      throwError(() => new Error('Error'))
    );

    component.generalActions[0].action();

    expect(vehicleService.create).toHaveBeenCalled();
    expect(toastsServiceSpy.showError).toHaveBeenCalled();
  });

  it('should see vehicle and show modal', () => {

    matDialog.open = jasmine.createSpy().and.returnValue({
      afterClosed: () => of(vehicleServiceMock),
      close: () => { }
    });

    component.paginationActions[1].action(vehicleServiceMock);

    expect(matDialog.open).toHaveBeenCalled();
  });

  it('should edit vehicle show edit modal and return null', () => {

    matDialog.open = jasmine.createSpy().and.returnValue({
      afterClosed: () => of(null),
      close: () => { }
    });

    component.paginationActions[0].action(vehicleServiceMock);

    expect(matDialog.open).toHaveBeenCalled();
  });

  it('should the isRotulated transform to string', () => {

    const result = component.vehicleColums.find(c => c.key === 'isRotulated')?.transform?.(true);
    expect(result).toEqual('Si');
  });

  it('should the isRotulated transform to string', () => {

    const result = component.vehicleColums.find(c => c.key === 'isRotulated')?.transform?.(false);
    expect(result).toEqual('No');
  });
});
