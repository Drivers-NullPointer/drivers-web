import { inject, Injectable, signal, Signal } from '@angular/core';
import { IPaginationServices } from '../../../../shared/pagination/interfaces/IPaginationServices';
import { BehaviorSubject, map, Observable, single, Subject, tap } from 'rxjs';
import { PaginationRequest } from '../../../../shared/pagination/model/pagination.request';
import { PaginatedResult } from '../../../../shared/pagination/model/pagination.result';
import { SaveVehicle, Vehicle } from '../../model/vehicle';
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

  private readonly controller = environment.apiUrl + environment.apiVersion + '/admin/vehicles';

  getAllPaginated<Vehicle>(paginationRequest: PaginationRequest): Observable<PaginatedResult<Vehicle>> {
    const params = generatePaginationQuery(paginationRequest);
    return this.http.get<PaginatedResult<Vehicle>>(this.controller, { params });
  }


  getListMake(): Observable<Make[]> {
    return this.http.get<Make[]>(`${this.controller}/catalog/makes`);
  }

  getListModel(makeId: number): Observable<Model[]> {
    return this.http.get<Model[]>(`${this.controller}/catalog/makes/${makeId}/models`);
  }

  getListColor(): Observable<Color[]> {
    return this.http.get<Color[]>(`${this.controller}/catalog/colors`);
  }

  create(result: SaveVehicle) {
    return this.http.post<Vehicle>(this.controller, result).pipe(
      tap(() => this.notifyChange())
    );
  }

  update(id: number, result: SaveVehicle) {
    return this.http.put<Vehicle>(`${this.controller}/${id}`, result).pipe(
      tap(() => this.notifyChange())
    );
  }

}
