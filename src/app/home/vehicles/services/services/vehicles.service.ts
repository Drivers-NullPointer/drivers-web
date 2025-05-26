import { inject, Injectable, signal, Signal } from '@angular/core';
import { IPaginationServices } from '../../../../shared/pagination/interfaces/IPaginationServices';
import { BehaviorSubject, map, Observable, single, Subject, tap } from 'rxjs';
import { PaginationRequest } from '../../../../shared/pagination/model/pagination.request';
import { PaginatedResult } from '../../../../shared/pagination/model/pagination.result';
import { Vehicle } from '../../model/vehicle';
import { environment } from '../../../../../environments/environment';
import { generatePaginationQuery } from '../../../../utils/query-pagination/generate-pagination-query';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Make } from '../../model/make';
import { Model } from '../../model/model';
import { Color } from '../../model/Color';
import { PaginationServices } from '../../../../shared/pagination/interfaces/PaginationServices';

@Injectable({
  providedIn: 'root'
})
export class VehiclesService extends PaginationServices {
  private readonly http = inject(HttpClient);

  private readonly controller = environment.apiUrl + environment.apiVersion + '/vehicles';

  getAllPaginated<Vehicle>(paginationRequest: PaginationRequest): Observable<PaginatedResult<Vehicle>> {
    const params = generatePaginationQuery(paginationRequest);
    return this.http.get<PaginatedResult<Vehicle>>(this.controller, { params });
  }


  getListMake(paginationRequest: PaginationRequest): Observable<Make[]> {
    const params = generatePaginationQuery(paginationRequest);
    return this.http.get<PaginatedResult<Make>>(
      `${this.controller}/catalog/makes`, { params }
    ).pipe(
      map((result: PaginatedResult<Make>) => result.result)
    );
  }

  getListModel(make: string, paginationRequest: PaginationRequest): Observable<Model[]> {
    const params = generatePaginationQuery(paginationRequest);
    return this.http.get<PaginatedResult<Model>>(
      `${this.controller}/catalog/makes/${make}/models`,
      { params }
    ).pipe(
      map((result: PaginatedResult<Model>) => result.result)
    );
  }

  getListColor(): Observable<Color[]> {
    return this.http.get<Color[]>(`${this.controller}/catalog/colors`);
  }

  create(result: Vehicle) {
    return this.http.post<Vehicle>(this.controller, result).pipe(
      tap(() => this.notifyChange())
    );
  }

  delete(id: number) {
    return this.http.delete(`${this.controller}/${id}`).pipe(
      tap(() => this.notifyChange())
    );
  }
  update(id: number, result: Vehicle) {
    return this.http.patch<Vehicle>(`${this.controller}/${id}`, result).pipe(
      tap(() => this.notifyChange())
    );
  }

}
