import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { DispatchComponent } from './dispatch.component';
import { DispatchService } from './dispatch.service';
import { Driver } from '../drivers/model/driver.types';
import { RequestTrip } from '../request/model/request';

describe('DispatchComponent', () => {
  let api: jasmine.SpyObj<DispatchService>;
  const empty = { result: [], pagination: { page: 0, limit: 20, totalElements: 0, totalPages: 0 } };
  beforeEach(() => {
    api = jasmine.createSpyObj('DispatchService', ['drivers', 'requests', 'trips', 'clients', 'create', 'assign', 'cancel', 'history']);
    api.drivers.and.returnValue(of(empty)); api.requests.and.returnValue(of(empty)); api.trips.and.returnValue(of(empty));
    api.clients.and.returnValue(of(empty));
    TestBed.configureTestingModule({ imports: [DispatchComponent], providers: [provideRouter([]), { provide: DispatchService, useValue: api }] });
  });
  it('does not infer receipt from assignment and renders the explicit app receipt', () => {
    const fixture = TestBed.createComponent(DispatchComponent);
    const c = fixture.componentInstance;
    api.trips.and.returnValue(of({ ...empty, result: [
      { id: 'pending', state: 'ASSIGNED', driverId: 1, clientId: 2 } as any,
      { id: 'received', state: 'ASSIGNED', driverId: 3, clientId: 4, driverReceivedAt: '2026-09-12T12:00:00' } as any
    ] }));
    c.refresh(); fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('Sin acuse de recepción');
    expect(rows[1].textContent).toContain('Recibido por la app');
    expect(rows[1].textContent).toContain('No implica lectura');
    fixture.destroy();
  });
  it('loads operations and stops polling after destruction', fakeAsync(() => {
    const fixture = TestBed.createComponent(DispatchComponent);
    tick(0); expect(api.requests).toHaveBeenCalledTimes(1);
    tick(15000); expect(api.requests).toHaveBeenCalledTimes(2);
    fixture.destroy(); tick(15000); expect(api.requests).toHaveBeenCalledTimes(2);
  }));
  it('rejects incomplete requests and invalid coordinates', () => {
    const fixture = TestBed.createComponent(DispatchComponent); const component = fixture.componentInstance;
    component.create(); expect(api.create).not.toHaveBeenCalled();
    component.form.controls.startLat.setValue(91); expect(component.form.controls.startLat.invalid).toBeTrue(); fixture.destroy();
  });
  it('blocks dispatch of expired requests', () => {
    const fixture = TestBed.createComponent(DispatchComponent); const component = fixture.componentInstance;
    component.selectedDriver.set({ id: 2, name: 'Taxi', status: 'AVAILABLE' } as Driver);
    component.assign({ id: 3, expiresAt: '2000-01-01T00:00:00Z' } as RequestTrip);
    expect(api.assign).not.toHaveBeenCalled(); fixture.destroy();
  });
  it('explains stale GPS rejection and clears the selected driver', () => {
    const fixture = TestBed.createComponent(DispatchComponent); const c = fixture.componentInstance;
    c.selectedDriver.set({ id: 2, name: 'Taxi', status: 'AVAILABLE' } as Driver);
    api.assign.and.returnValue(throwError(() => ({ status: 409, error: { message: 'DRIVER_LOCATION_REQUIRED' } })));
    c.assign({ id: 3 } as RequestTrip);
    expect(c.error()).toContain('GPS vigente');
    expect(c.selectedDriver()).toBeNull(); expect(c.busy()).toBeFalse();
    fixture.destroy();
  });
  it('keeps last data and reports refresh failures', () => {
    const fixture = TestBed.createComponent(DispatchComponent); const component = fixture.componentInstance;
    component.refresh(); const previous = component.drivers();
    api.drivers.and.returnValue(throwError(() => new Error('offline'))); component.refresh();
    expect(component.drivers()).toBe(previous); expect(component.error()).toContain('desactualizados'); fixture.destroy();
  });
  it('does not cancel without a reason', () => {
    const fixture = TestBed.createComponent(DispatchComponent); fixture.componentInstance.cancel();
    expect(api.cancel).not.toHaveBeenCalled(); fixture.destroy();
  });
  it('sends client and coordinates and prevents double submission', () => {
    const fixture = TestBed.createComponent(DispatchComponent); const component = fixture.componentInstance;
    const response = new Subject<RequestTrip>(); api.create.and.returnValue(response);
    component.form.setValue({ clientId: 7, startStreet: ' Origen ', startLat: 19, startLng: -98,
      endStreet: ' Destino ', endLat: 20, endLng: -99 });
    component.create(); component.create();
    expect(api.create).toHaveBeenCalledOnceWith({ clientId: 7,
      idempotencyKey: jasmine.any(String),
      startAddress: { street: 'Origen', latitude: 19, longitude: -98 },
      endAddress: { street: 'Destino', latitude: 20, longitude: -99 } });
    response.next({ id: 99 } as RequestTrip); response.complete();
    expect(component.message()).toContain('#99'); expect(component.form.controls.clientId.value).toBeNull(); fixture.destroy();
  });
  it('reuses the creation key after an ambiguous failure and changes it after editing', () => {
    const fixture = TestBed.createComponent(DispatchComponent); const c = fixture.componentInstance;
    api.create.and.returnValue(throwError(() => ({ status: 0 })));
    c.form.setValue({ clientId: 7, startStreet: 'Origin', startLat: 19, startLng: -98,
      endStreet: 'Destination', endLat: 20, endLng: -99 });
    c.create(); const first = api.create.calls.mostRecent().args[0].idempotencyKey;
    c.create(); expect(api.create.calls.mostRecent().args[0].idempotencyKey).toBe(first);
    c.form.controls.endStreet.setValue('Changed'); c.create();
    expect(api.create.calls.mostRecent().args[0].idempotencyKey).not.toBe(first);
    fixture.destroy();
  });
  it('clears successful attempt and reports terminal replay honestly', () => {
    const fixture = TestBed.createComponent(DispatchComponent); const c = fixture.componentInstance;
    api.create.and.returnValue(of({ id: 42, state: 'CANCELLED' } as RequestTrip));
    const form = { clientId: 7, startStreet: 'Origin', startLat: 19, startLng: -98,
      endStreet: 'Destination', endLat: 20, endLng: -99 };
    c.form.setValue(form); c.create(); const first = api.create.calls.mostRecent().args[0].idempotencyKey;
    expect(c.message()).toContain('CANCELLED');
    c.form.setValue(form); c.create(); expect(api.create.calls.mostRecent().args[0].idempotencyKey).not.toBe(first);
    fixture.destroy();
  });
  it('loads audited history without exposing editing screens', () => {
    const fixture = TestBed.createComponent(DispatchComponent);
    api.history.and.returnValue(of([{ id: 1, previousState: null, newState: 'ASSIGNED', changedByUserId: 6,
      actorRole: 'OPERATOR', reason: 'TRIP_REQUEST_ASSIGNED_BY_OPERATOR', createdAt: '2026-09-11T12:00:00Z' }]));
    fixture.componentInstance.showHistory({ id: 'trip-1' } as any); fixture.detectChanges();
    expect(api.history).toHaveBeenCalledOnceWith('trip-1'); expect(fixture.nativeElement.textContent).toContain('OPERATOR');
    fixture.componentInstance.closeHistory(); expect(fixture.componentInstance.historyTarget()).toBeNull(); fixture.destroy();
  });
  it('does not populate a different trip with stale history and reports errors', () => {
    const fixture = TestBed.createComponent(DispatchComponent); const c = fixture.componentInstance;
    const first = new Subject<any[]>(); api.history.and.returnValues(first, throwError(() => new Error('offline')));
    c.showHistory({ id: 'first' } as any); c.showHistory({ id: 'second' } as any);
    first.next([{ id: 1 }]); first.complete();
    expect(c.historyRows()).toEqual([]); expect(c.historyError()).toBeTruthy(); expect(c.historyLoading()).toBeFalse(); fixture.destroy();
  });
  it('interprets offset-free expiration as UTC', () => {
    const fixture = TestBed.createComponent(DispatchComponent);
    expect(fixture.componentInstance.utc('2026-09-11T14:00:00')).toBe('2026-09-11T14:00:00Z');
    expect(fixture.componentInstance.utc('2026-09-11T14:00:00Z')).toBe('2026-09-11T14:00:00Z'); fixture.destroy();
  });
  it('renders the dispatch form and empty operational lists', () => {
    const fixture = TestBed.createComponent(DispatchComponent);
    fixture.componentInstance.refresh(); fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('h1')?.textContent).toContain('Despacho');
    expect(page.querySelectorAll('input[type="number"]').length).toBe(4);
    expect(page.textContent).toContain('Sin solicitudes pendientes');
    expect(page.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBeTrue();
    fixture.destroy();
  });
});
