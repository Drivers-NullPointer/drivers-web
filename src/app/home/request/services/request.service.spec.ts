import { TestBed } from '@angular/core/testing';

import { RequestService } from './request.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RequestTrip } from '../model/request';
import { PaginatedResult } from '../../../shared/pagination/model/pagination.result';

const paginationResult: PaginatedResult<RequestTrip> = {
  pagination: {
    page: 1,
    totalElements: 1,
    totalPages: 1,
    limit: 1
  },
  result: []
};

describe('RequestService', () => {
  let service: RequestService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(RequestService);
    controller = TestBed.inject(HttpTestingController);
  });


  afterEach(() => {
    controller.verify();
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getAllPaginated', () => {
    service.getAllPaginated({}).subscribe(
      (response) => {
        expect(response).toEqual(paginationResult);
      }
    );

    const req = controller.expectOne(`${service['controller']}`);
    req.flush(paginationResult);
  });
});
