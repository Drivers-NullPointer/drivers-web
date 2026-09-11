import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { DeleteAccountComponent } from './delete-account.component';
import { AccountDeletionService } from './account-deletion.service';

describe('DeleteAccountComponent', () => {
  let api: jasmine.SpyObj<AccountDeletionService>;
  let snapshot: { data: { confirmDeletion?: boolean }, queryParamMap: ReturnType<typeof convertToParamMap> };
  beforeEach(() => {
    api = jasmine.createSpyObj('AccountDeletionService', ['request', 'confirm']);
    snapshot = { data: {}, queryParamMap: convertToParamMap({}) };
    TestBed.configureTestingModule({
      imports: [DeleteAccountComponent],
      providers: [provideNoopAnimations(), provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot } },
        { provide: AccountDeletionService, useValue: api }]
    });
  });
  it('renders a disabled submit and rejects empty or malformed email', () => {
    const f = TestBed.createComponent(DeleteAccountComponent); f.detectChanges();
    expect(f.nativeElement.querySelector('button').disabled).toBeTrue();
    f.componentInstance.onConfirm(); f.componentInstance.email.setValue('invalid'); f.componentInstance.onConfirm();
    expect(api.request).not.toHaveBeenCalled(); f.destroy();
  });
  it('requests the email link once and only reports success after response', () => {
    const f = TestBed.createComponent(DeleteAccountComponent); const c = f.componentInstance;
    const response = new Subject<void>(); api.request.and.returnValue(response);
    c.email.setValue(' user@example.com '); c.onConfirm(); c.onConfirm();
    expect(api.request).toHaveBeenCalledOnceWith('user@example.com');
    expect(c.completed).toBeFalse(); expect(c.message).toBe('');
    response.next(); response.complete(); f.detectChanges();
    expect(c.message).toContain('no elimina'); expect(c.completed).toBeTrue();
    expect(f.nativeElement.querySelector('[role="status"]')).toBeTruthy(); f.destroy();
  });
  it('reports request errors without claiming deletion and permits retry', () => {
    const c = TestBed.createComponent(DeleteAccountComponent).componentInstance;
    api.request.and.returnValue(throwError(() => new Error('offline')));
    c.email.setValue('user@example.com'); c.onConfirm();
    expect(c.completed).toBeFalse(); expect(c.error).toBeTruthy(); expect(c.canSubmit).toBeTrue();
  });
  it('does not submit a destructive confirmation on opening a valid link', () => {
    snapshot.data.confirmDeletion = true; snapshot.queryParamMap = convertToParamMap({ token: 'signed-token' });
    const f = TestBed.createComponent(DeleteAccountComponent); f.detectChanges();
    expect(api.confirm).not.toHaveBeenCalled(); expect(f.nativeElement.querySelector('input')).toBeNull();
    api.confirm.and.returnValue(of(undefined)); f.componentInstance.onConfirm(); f.componentInstance.onConfirm();
    expect(api.confirm).toHaveBeenCalledOnceWith('signed-token');
    expect(f.componentInstance.message).toContain('programada'); f.destroy();
  });
  it('blocks confirmation without a token', () => {
    snapshot.data.confirmDeletion = true;
    const c = TestBed.createComponent(DeleteAccountComponent).componentInstance; c.onConfirm();
    expect(c.canSubmit).toBeFalse(); expect(c.error).toContain('token'); expect(api.confirm).not.toHaveBeenCalled();
  });
  it('keeps invalid or expired confirmation links in error state', () => {
    snapshot.data.confirmDeletion = true; snapshot.queryParamMap = convertToParamMap({ token: 'expired' });
    api.confirm.and.returnValue(throwError(() => ({ status: 401 })));
    const c = TestBed.createComponent(DeleteAccountComponent).componentInstance; c.onConfirm();
    expect(c.completed).toBeFalse(); expect(c.message).toBe(''); expect(c.error).toContain('caducado');
  });
});
