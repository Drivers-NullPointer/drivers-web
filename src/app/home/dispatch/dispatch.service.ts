import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PaginatedResult } from '../../shared/pagination/model/pagination.result';
import { Driver } from '../drivers/model/driver.types';
import { RequestTrip } from '../request/model/request';
import { Trip } from '../trips/model/Trip';

export interface DispatchClient { id: number; name: string; lastname: string; email: string; }
export interface DispatchAddress { street: string; latitude: number; longitude: number; }
export interface DispatchRequest { clientId: number; startAddress: DispatchAddress; endAddress: DispatchAddress; idempotencyKey: string; }
export interface DispatchHistory { id: number; previousState: string | null; newState: string; changedByUserId: number; actorRole: string; reason: string | null; createdAt: string; }

@Injectable({ providedIn: 'root' })
export class DispatchService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}${environment.apiVersion}/admin`;

  drivers(page: number, search: string) {
    return this.http.get<PaginatedResult<Driver>>(`${this.base}/drivers`, { params: { page, limit: 20, search } });
  }
  clients(search: string) {
    return this.http.get<PaginatedResult<DispatchClient>>(`${this.base}/clients`, { params: { search, limit: 20 } });
  }
  requests(page: number) {
    return this.http.get<PaginatedResult<RequestTrip>>(`${this.base}/trip-requests`, {
      params: { page, limit: 20, state: 'PENDING', order: 'ASC' }
    });
  }
  trips(page: number, state: string) {
    return this.http.get<PaginatedResult<Trip>>(`${this.base}/trips`, { params: { page, limit: 20, state } });
  }
  create(request: DispatchRequest) { return this.http.post<RequestTrip>(`${this.base}/trip-requests`, request); }
  history(tripId: string) { return this.http.get<DispatchHistory[]>(`${this.base}/trips/${tripId}/history`); }
  assign(requestId: number, driverId: number) {
    return this.http.post<Trip>(`${this.base}/trip-requests/${requestId}/assign`, { driverId });
  }
  cancel(tripId: string, reason: string) {
    return this.http.post<Trip>(`${this.base}/trips/${tripId}/cancel`, { reason });
  }
}
