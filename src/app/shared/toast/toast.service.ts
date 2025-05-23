import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';


export interface ToastOptions {
  title?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private readonly toastr: ToastrService = inject(ToastrService);

  showSuccess(message: string, title: string) {
    this.toastr.success(message, title);
  }


  showError(message: string, title: string) {
    this.toastr.error(message, title);
  }

  showSuccessMessage({
    title = 'Exito',
    message
  }: ToastOptions) {
    this.toastr.success(message, title);
  }


  showErrorMessage(
    {
      title = 'Error',
      message
    }: ToastOptions) {

    this.toastr.error(message, title);
  }


}
