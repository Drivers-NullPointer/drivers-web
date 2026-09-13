import { TestBed } from '@angular/core/testing';

import { TripService } from './trip.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Trip } from '../model/Trip';
import { PaginatedResult } from '../../../shared/pagination/model/pagination.result';

const paginationResult: PaginatedResult<Trip> = {
  pagination: {
    page: 1,
    totalElements: 100,
    totalPages: 10,
    limit: 10
  },
  result: []
};

describe('TripService', () => {
  let service: TripService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(TripService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all paginated trips', (done) => {
    service.getAllPaginated({}).subscribe(
      response => {
        expect(response).toEqual(paginationResult);
        done();
      });
    const req = httpController.expectOne(service['controller']);
    req.flush(paginationResult);
  });
});
