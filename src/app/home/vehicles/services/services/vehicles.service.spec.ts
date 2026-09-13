import { TestBed } from '@angular/core/testing';

import { VehiclesService } from './vehicles.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../../environments/environment';
import { PaginatedResult } from '../../../../shared/pagination/model/pagination.result';
import { Vehicle } from '../../model/vehicle';
import { Make } from '../../model/make';
import { Model } from '../../model/model';
import { Color } from '../../model/Color';

const paginationResult: PaginatedResult<Vehicle> = {
  pagination: {
    page: 1,
    totalElements: 1,
    totalPages: 1,
    limit: 1
  },
  result: []
}

const makeResult: Make[] = [
  {
    id: 1,
    name: 'make'
  }
];
const modelResult: Model[] = [
  {
    id: 1,
    name: 'model', makeId: 1
  }
];
const colorResult: Color[] = [
  {
    id: 1,
    name: 'color',
    hex: '#000000'
  }
];


describe('VehiclesService', () => {
  let service: VehiclesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(VehiclesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all paginated vehicles', (done) => {

    service.getAllPaginated({}).subscribe((data) => {
      expect(data).toEqual(paginationResult);
      done();
    });

    const req = httpTestingController.expectOne(`${service['controller']}`);
    expect(req.request.method).toEqual('GET');
    req.flush(paginationResult);
  });

  it('should get list of makes', (done) => {
    service.getListMake().subscribe((data) => {
      expect(data).toEqual(makeResult);
      done();
    });

    const req = httpTestingController.expectOne(`${service['controller']}/catalog/makes`);
    expect(req.request.method).toEqual('GET');
    req.flush(makeResult);
  });

  it('should get list of models', (done) => {
    service.getListModel(1).subscribe((data) => {
      expect(data).toEqual(modelResult);
      done();
    });

    const req = httpTestingController.expectOne(`${service['controller']}/catalog/makes/1/models`);
    expect(req.request.method).toEqual('GET');
    req.flush(modelResult);
  });

  it('should get list of colors', (done) => {
    service.getListColor().subscribe((data) => {
      expect(data).toEqual(colorResult);
      done();
    });

    const req = httpTestingController.expectOne(`${service['controller']}/catalog/colors`);
    expect(req.request.method).toEqual('GET');
    req.flush(colorResult);
  });

  it('should create a vehicle', (done) => {
    service.create({} as Vehicle).subscribe(() => {
      done();
    });

    const req = httpTestingController.expectOne(`${service['controller']}`);
    expect(req.request.method).toEqual('POST');
    req.flush({});
  });

  it('does not expose unsupported vehicle deletion', () => {
    expect('delete' in service).toBeFalse();
    httpTestingController.expectNone(`${service['controller']}/1`);
  });

  it('should update a vehicle', (done) => {
    service.update(1, {} as Vehicle).subscribe(() => {
      done();
    });

    const req = httpTestingController.expectOne(`${service['controller']}/1`);
    expect(req.request.method).toEqual('PUT');
    req.flush({});
  });

});
