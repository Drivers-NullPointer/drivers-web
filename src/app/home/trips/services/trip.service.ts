import { inject, Injectable, signal } from '@angular/core';
import { IPaginationServices } from '../../../shared/pagination/interfaces/IPaginationServices';
import { Subject, Observable } from 'rxjs';
import { PaginationRequest } from '../../../shared/pagination/model/pagination.request';
import { PaginatedResult } from '../../../shared/pagination/model/pagination.result';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { generatePaginationQuery } from '../../../utils/query-pagination/generate-pagination-query';
import { Trip } from '../model/Trip';
import { PaginationServices } from '../../../shared/pagination/interfaces/PaginationServices';

@Injectable({
  providedIn: 'root'
})
export class TripService extends PaginationServices {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly controller = environment.apiUrl + environment.apiVersion + '/trips';

  getAllPaginated<Trip>(paginationRequest: PaginationRequest): Observable<PaginatedResult<Trip>> {
    const params = generatePaginationQuery(paginationRequest);
    return this.http.get<PaginatedResult<Trip>>(this.controller, { params });
  }
}
