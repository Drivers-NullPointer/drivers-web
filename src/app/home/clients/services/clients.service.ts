import { inject, Injectable, signal } from '@angular/core';
import { IPaginationServices } from '../../../shared/pagination/interfaces/IPaginationServices';
import { Subject, Observable } from 'rxjs';
import { PaginationRequest } from '../../../shared/pagination/model/pagination.request';
import { PaginatedResult } from '../../../shared/pagination/model/pagination.result';
import { HttpClient } from '@angular/common/http';
import { generatePaginationQuery } from '../../../utils/query-pagination/generate-pagination-query';
import { Client } from '../model/client';
import { PaginationServices } from '../../../shared/pagination/interfaces/PaginationServices';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientsService extends PaginationServices {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly controller = environment.apiUrl + environment.apiVersion + '/client';

  getAllPaginated<Client>(paginationRequest: PaginationRequest): Observable<PaginatedResult<Client>> {
    const params = generatePaginationQuery(paginationRequest);
    return this.http.get<PaginatedResult<Client>>(this.controller, { params });
  }

}
