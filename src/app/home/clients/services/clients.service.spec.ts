import { TestBed } from '@angular/core/testing';

import { ClientsService } from './clients.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PaginatedResult } from '../../../shared/pagination/model/pagination.result';
import { Client } from '../model/client';
import { PaginationRequest } from '../../../shared/pagination/model/pagination.request';
import { generatePaginationQuery } from '../../../utils/query-pagination/generate-pagination-query';


const paginationResponseClient: PaginatedResult<Client> = {
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 100,
    totalPages: 10
  },
  result: []
};

const paginationRequest: PaginationRequest = {
  page: 1,
  limit: 10,
  search: '',
  sort: '',
  order: ''
};



describe('ClientsService', () => {
  let service: ClientsService;
  let httpClient: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(ClientsService);
    httpClient = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a list of clients', () => {


    service.getAllPaginated<Client>(paginationRequest).subscribe((response) => {
      expect(response).toEqual(paginationResponseClient);
    });

    const query = generatePaginationQuery(paginationRequest);

    const req = httpClient.expectOne(`${service['controller']}?${query}`);
    expect(req.request.method).toBe('GET');
    req.flush(paginationResponseClient);
  });


});
