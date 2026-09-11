import { inject, Injectable, signal, Signal } from '@angular/core';
import { IPaginationServices } from '../../../shared/pagination/interfaces/IPaginationServices';
import { BehaviorSubject, catchError, Observable, pipe, Subject, tap, throwError } from 'rxjs';
import { PaginatedResult } from '../../../shared/pagination/model/pagination.result';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PaginationRequest } from '../../../shared/pagination/model/pagination.request';
import { generatePaginationQuery } from '../../../utils/query-pagination/generate-pagination-query';
import { Driver, UpdateDriverDto, CreateDriverDto } from '../model/driver.types';
import { PaginationServices } from '../../../shared/pagination/interfaces/PaginationServices';
import { catchCustomError } from '../../../utils/catch-error/catch-error.fs';

@Injectable({
  providedIn: 'root'
})
export class DriversService extends PaginationServices {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly controller = environment.apiUrl + environment.apiVersion + '/admin/drivers';

  getAllPaginated<Driver>(
    paginationRequest: PaginationRequest
  ): Observable<PaginatedResult<Driver>> {

    const params = generatePaginationQuery(paginationRequest);
    return this.http.get<PaginatedResult<Driver>>(this.controller, { params });
  }

  private driverToFormData(driver: CreateDriverDto | UpdateDriverDto): FormData {
    const formData = new FormData();
    Object.entries(driver).forEach(([key, value]) => {
      if (key === 'imageProfileFile') {
        if (value) {
          // * If the value is a file, we append it to the formData
          formData.append('imageProfile', value as File);
        }
      } else {
        formData.append(key, value as string);
      }
    });

    return formData;
  }

  deleteDriver(driverId: number) {
    return this.http.delete<void>(`${this.controller}/${driverId}`).pipe(
      tap(() => this.notifyChange())
    );
  }
  updateDriver(id: number, driver: UpdateDriverDto) {
    const driverFormData = this.driverToFormData(driver);
    return this.http.put<Driver>(`${this.controller}/${id}`, driverFormData).pipe(
      tap(() => this.notifyChange()),
      catchCustomError
    );
  }




}
