import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject, throwError } from 'rxjs';
import { DriversService } from './services/drivers.service';
import { DriversComponent } from './drivers.component';
import { Driver } from './model/driver.types';
import { ToastService } from '../../shared/toast/toast.service';
import { environment } from '../../../environments/environment';

describe('Driver account deletion HTTP', () => {
  it('uses the driver endpoint and not the user endpoint', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const service = TestBed.inject(DriversService); const http = TestBed.inject(HttpTestingController);
    const notify = spyOn(service, 'notifyChange'); service.deleteDriver(7).subscribe();
    const req = http.expectOne(`${environment.apiUrl}${environment.apiVersion}/admin/drivers/7`);
    expect(req.request.method).toBe('DELETE'); req.flush(null); expect(notify).toHaveBeenCalledTimes(1); http.verify();
  });
  it('does not refresh the list as if deletion succeeded on failure', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const service = TestBed.inject(DriversService); const http = TestBed.inject(HttpTestingController);
    const notify = spyOn(service, 'notifyChange'); service.deleteDriver(7).subscribe({ error: () => {} });
    http.expectOne(`${environment.apiUrl}${environment.apiVersion}/admin/drivers/7`).flush(null, { status: 403, statusText: 'Forbidden' });
    expect(notify).not.toHaveBeenCalled(); http.verify();
  });
});

describe('Driver account deletion confirmation', () => {
  let api: jasmine.SpyObj<DriversService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let toast: jasmine.SpyObj<ToastService>;
  const driver = { id: 7, name: 'Test', lastname: 'Driver', email: 'driver@example.com' } as Driver;
  beforeEach(() => {
    api = jasmine.createSpyObj('DriversService', ['deleteDriver']);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    toast = jasmine.createSpyObj('ToastService', ['showSuccessMessage', 'showErrorMessage']);
    TestBed.configureTestingModule({ providers: [
      { provide: DriversService, useValue: api }, { provide: MatDialog, useValue: dialog }, { provide: ToastService, useValue: toast }
    ] });
  });
  function component() { return TestBed.runInInjectionContext(() => new DriversComponent()); }
  it('cancellation makes no request', () => {
    dialog.open.and.returnValue({ afterClosed: () => of(false) } as any);
    component().paginationActions[1].action(driver); expect(api.deleteDriver).not.toHaveBeenCalled();
  });
  it('requires confirmation and blocks duplicate dialogs and submissions', () => {
    const confirmation = new Subject<boolean>(); const response = new Subject<void>();
    dialog.open.and.returnValue({ afterClosed: () => confirmation } as any); api.deleteDriver.and.returnValue(response);
    const c = component(); c.paginationActions[1].action(driver); c.paginationActions[1].action(driver);
    expect(dialog.open).toHaveBeenCalledTimes(1); expect(api.deleteDriver).not.toHaveBeenCalled();
    confirmation.next(true); c.paginationActions[1].action(driver);
    expect(api.deleteDriver).toHaveBeenCalledOnceWith(7); expect(toast.showSuccessMessage).not.toHaveBeenCalled();
    response.next(); response.complete(); expect(toast.showSuccessMessage).toHaveBeenCalledTimes(1);
  });
  it('reports deletion errors and unlocks a subsequent confirmation', () => {
    dialog.open.and.returnValue({ afterClosed: () => of(true) } as any);
    api.deleteDriver.and.returnValue(throwError(() => new Error('offline')));
    const c = component(); c.paginationActions[1].action(driver); c.paginationActions[1].action(driver);
    expect(dialog.open).toHaveBeenCalledTimes(2); expect(toast.showSuccessMessage).not.toHaveBeenCalled();
    expect(toast.showErrorMessage).toHaveBeenCalledTimes(2);
  });
});
