import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TripsComponent } from './trips.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TripService } from './services/trip.service';
import { PaginatedResult } from '../../shared/pagination/model/pagination.result';
import { Trip } from './model/Trip';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../shared/toast/toast.service';

const paginationResult: PaginatedResult<Trip> = {
  pagination: {
    page: 1,
    totalElements: 100,
    totalPages: 10,
    limit: 10
  },
  result: []
};

const trip: Trip = {
  id: "1",
  startAt: '2026-09-12T10:00:00',
  endAt: null,
  state: "IN_PROGRESS",
  clientId: 1,
  driverId: 1,
  driver: {
    id: 1,
    name: "Driver Name", lastname: "Test"
  },
};


describe('TripsComponent', () => {
  let component: TripsComponent;
  let fixture: ComponentFixture<TripsComponent>;
  let tripsServiceSpy: jasmine.SpyObj<TripService>;
  let matDialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {

    tripsServiceSpy = jasmine.createSpyObj<TripService>('TripService', ['getAllPaginated', 'getById', 'notifyChangeSignal']);
    matDialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [TripsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['showError']) },
        { provide: TripService, useValue: tripsServiceSpy },
        { provide: MatDialog, useValue: matDialogSpy }
      ]
    })
      .compileComponents();

    tripsServiceSpy.getAllPaginated.and.returnValue(of(paginationResult));
    tripsServiceSpy.getById.and.returnValue(of(trip));

    fixture = TestBed.createComponent(TripsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call when click on visibility show trip dialog', () => {
    component.paginationActions[0].action(trip);
    expect(tripsServiceSpy.getById).toHaveBeenCalledWith(trip.id);
    expect(matDialogSpy.open).toHaveBeenCalled();
  });

  it('should convert trip state to string', () => {
    expect(component.tripStateToString('ASSIGNED')).toBe('Asignado');
    expect(component.tripStateToString('DRIVER_EN_ROUTE')).toBe('Conductor en camino');
    expect(component.tripStateToString('DRIVER_ARRIVED')).toBe('Conductor en el punto');
    expect(component.tripStateToString('IN_PROGRESS')).toBe('En curso');
    expect(component.tripStateToString('COMPLETED')).toBe('Finalizado');
    expect(component.tripStateToString('CANCELLED')).toBe('Cancelado');
    expect(component.tripStateToString('unknown')).toBe('Desconocido');
  });

  it('should return "Sin fecha" when date is null or undefined', () => {
    expect(component.dateToString(undefined)).toBe('Sin fecha');
    expect(component.dateToString(null)).toBe('Sin fecha');
  });

  it('should return formatted date and time string when date is valid', () => {
    const date = new Date('2023-10-10T10:10:10');
    const expectedDateString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    expect(component.dateToString(date)).toBe(expectedDateString);
    expect(component.dateToString('2023-10-10T10:10:10')).toBe(expectedDateString);
  });


  it('uses clientId because the trip response has no client object', () => {
    const clientColumn = component.tripsColumns.find(col => col.key === 'clientId');
    expect(clientColumn).toBeDefined();
    expect(clientColumn!.transform).toBeUndefined();
  });

  it('should transform driver name correctly', () => {
    const driver = { name: 'Jane', lastname: 'Smith' };
    const driverColumn = component.tripsColumns.find(col => col.key === 'driver');
    expect(driverColumn!.transform!(driver)).toBe('Jane Smith');
    expect(driverColumn!.transform!(null)).toBe('Sin conductor');
  });

});
