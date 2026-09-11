import { HttpBackend, HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AccountDeletionService {
  // Public email/token flow: never attach an unrelated signed-in account or refresh on an invalid link.
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly url = `${environment.apiUrl}${environment.apiVersion}/account`;

  request(email: string) {
    return this.http.post<void>(`${this.url}/deletion-request`, { email });
  }

  confirm(token: string) {
    return this.http.delete<void>(`${this.url}/deletion-confirmation`, {
      params: new HttpParams().set('token', token)
    });
  }
}
