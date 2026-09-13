import { TestBed } from '@angular/core/testing';

import { DriversService } from './drivers.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PaginatedResult } from '../../../shared/pagination/model/pagination.result';
import { Driver, CreateDriverDto, UpdateDriverDto } from '../model/driver.types';
import { generatePaginationQuery } from '../../../utils/query-pagination/generate-pagination-query';


const paginationRequest = {
  page: 1,
  pageSize: 10,
  search: '',
  sort: '',
  filter: '',
};

const paginationResponse: PaginatedResult<Driver> = {
  pagination: {
    page: 1,
    limit: 10,
    totalElements: 1,
    totalPages: 1,
  },
  result: []
};

const createDriverDto: CreateDriverDto = {
  status: 'AVAILABLE',
  name: 'test',
  email: 'example@emial.com',
  birthdate: new Date().toISOString(),
  lastname: 'test',
  phone: '123456789',
};

const driver: Driver = {
  id: 1,
  ...createDriverDto,
}

const updateDriverDto: UpdateDriverDto = {
  ...createDriverDto,
}

describe('DriversService', () => {
  let service: DriversService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(DriversService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return paginated drivers', (done) => {
    service.getAllPaginated<Driver>(paginationRequest).subscribe((response) => {
      expect(response).toEqual(paginationResponse);
      done();
    });

    const query = generatePaginationQuery(paginationRequest);

    const req = httpController.expectOne(`${service['controller']}?${query}`);
    req.flush(paginationResponse);
  });

  it('does not expose an admin create-driver endpoint', () => {
    expect('createDriver' in service).toBeFalse();
    httpController.expectNone(service['controller']);
  });

  it('should delete a driver', (done) => {
    service.deleteDriver(1).subscribe(() => {
      expect(service.notifyChangeSignal()).toBeGreaterThan(0);
      done();
    });

    const req = httpController.expectOne(`${service['controller']}/1`);
    req.flush({});
  });

  it('should update a driver without img profile', (done) => {
    service.updateDriver(1, updateDriverDto).subscribe((response) => {
      expect(response).toEqual(driver);
      done();
    });

    const req = httpController.expectOne(`${service['controller']}/1`);
    req.flush(driver);
  });

  it('should update a driver with img profile', (done) => {
    const updateDriverDtoWithImg: UpdateDriverDto = {
      ...updateDriverDto,
      imageProfileFile: new File([''], 'test.jpg')
    };

    service.updateDriver(1, updateDriverDtoWithImg).subscribe((response) => {
      expect(response).toEqual(driver);
      done();
    });

    const req = httpController.expectOne(`${service['controller']}/1`);
    req.flush(driver);
  });

  it("should update a driver with error without custom error", (done) => {
    const updateDriverDtoWithError: UpdateDriverDto = {
      ...updateDriverDto,
      imageProfileFile: new File([''], 'test.jpg')
    };

    service.updateDriver(1, updateDriverDtoWithError).subscribe({
      next: () => { },
      error: (error) => {
        expect(error).toBeInstanceOf(ErrorEvent);
        done();
      }
    });

    const req = httpController.expectOne(`${service['controller']}/1`);
    req.error(new ErrorEvent('error'));
  });

  it('should update a driver with error with custom error', (done) => {
    const updateDriverDtoWithError: UpdateDriverDto = {
      ...updateDriverDto,
      imageProfileFile: new File([''], 'test.jpg')
    };

    service.updateDriver(1, updateDriverDtoWithError).subscribe({
      next: () => { },
      error: (error) => {
        expect(error).toEqual({ message: 'error' });
        done();
      }
    });

    const req = httpController.expectOne(`${service['controller']}/1`);
    req.flush({ message: 'error' }, { status: 500, statusText: 'error' });

  });

  it('sends profile image as multipart data on update', () => {
    const image = new File(['photo'], 'driver.jpg');
    service.updateDriver(1, { ...updateDriverDto, imageProfileFile: image }).subscribe();
    const req = httpController.expectOne(`${service['controller']}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.get('file')).toBe(image);
    expect(req.request.body.has('imageProfile')).toBeFalse();
    expect(req.request.body.get('name')).toBe(updateDriverDto.name);
    req.flush(driver);
  });


});
