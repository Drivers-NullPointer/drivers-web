import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast.service';
import { ToastrService } from 'ngx-toastr';

describe('ToastService', () => {
  let toastrService: ToastrService;
  let service: ToastService;

  beforeEach(() => {
    toastrService = jasmine.createSpyObj<ToastrService>('ToastrService', ['success', 'error']);
    TestBed.configureTestingModule({
      providers: [{ provide: ToastrService, useValue: toastrService }]
    });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call success', () => {
    service.showSuccess('message', 'title');
    expect(toastrService.success).toHaveBeenCalled();
  });

  it('should call error', () => {
    service.showError('message', 'title');
    expect(toastrService.error).toHaveBeenCalled();
  });

  it('should call showSuccessMessage with default title', () => {
    service.showSuccessMessage({ message: 'message' });
    expect(toastrService.success).toHaveBeenCalledWith('message', 'Exito');
  });

  it('should call showErrorMessage with default title', () => {
    service.showErrorMessage({ message: 'message' });
    expect(toastrService.error).toHaveBeenCalledWith('message', 'Error');
  });

  it('should call showSuccessMessage with custom title', () => {
    service.showSuccessMessage({ title: 'Custom Title', message: 'message' });
    expect(toastrService.success).toHaveBeenCalledWith('message', 'Custom Title');
  });

  it('should call showErrorMessage with custom title', () => {
    service.showErrorMessage({ title: 'Custom Title', message: 'message' });
    expect(toastrService.error).toHaveBeenCalledWith('message', 'Custom Title');
  });
});
