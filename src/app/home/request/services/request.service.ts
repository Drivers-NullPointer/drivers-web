import { inject, Injectable, signal } from '@angular/core';
import { IPaginationServices } from '../../../shared/pagination/interfaces/IPaginationServices';
import { Subject, Observable } from 'rxjs';
import { PaginationRequest } from '../../../shared/pagination/model/pagination.request';
import { PaginatedResult } from '../../../shared/pagination/model/pagination.result';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { generatePaginationQuery } from '../../../utils/query-pagination/generate-pagination-query';
import { RequestTrip } from '../model/request';
import { PaginationServices } from '../../../shared/pagination/interfaces/PaginationServices';

@Injectable({
  providedIn: 'root'
})
export class RequestService extends PaginationServices {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly controller = environment.apiUrl + environment.apiVersion + '/request';


  getAllPaginated<RequestTrip>(paginationRequest: PaginationRequest): Observable<PaginatedResult<RequestTrip>> {
    const params = generatePaginationQuery(paginationRequest);
    return this.http.get<PaginatedResult<RequestTrip>>(this.controller, { params });
  }
}
