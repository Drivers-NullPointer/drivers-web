import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AdminDashboard } from './model/admin-dashboard';

@Injectable({ providedIn: 'root' })
export class OverviewService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}${environment.apiVersion}/admin/dashboard`;

  getDashboard() {
    return this.http.get<AdminDashboard>(this.endpoint);
  }
}
