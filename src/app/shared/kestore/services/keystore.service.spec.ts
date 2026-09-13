import { TestBed } from '@angular/core/testing';

import { KeystoreService } from './keystore.service';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { throwError } from 'rxjs';

describe('KeystoreService', () => {
  let service: KeystoreService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]

    });
    service = TestBed.inject(KeystoreService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get maps key if not cached', (done) => {
    const key = 'mapsKey';
    service.getMapsKey().then((response) => {
      expect(response).toBe(key);
      done();
    });
    const req = httpController.expectOne(service['controller']);
    req.flush({ apiKey: key, mapId: 'mapId' });
  });

  it('should get maps key if cached', (done) => {
    const key = 'mapsKey';
    service['_mapsKey'] = key;
    service.getMapsKey().then((response) => {
      expect(response).toBe(key);
      done();
    });
  });

  it('should catch error on get maps key', (done) => {
    service.getMapsKey().catch((error) => {
      expect(error).toBeInstanceOf(HttpErrorResponse);
      done();
    });
    const req = httpController.expectOne(service['controller']);
    req.flush(null, { status: 0, statusText: 'Unknown Error' });
  });



  it('should get map id if not cached', (done) => {
    const key = 'mapId';
    service.getMapId().then((response) => {
      expect(response).toBe(key);
      done();
    });
    const req = httpController.expectOne(service['controller']);
    req.flush({ apiKey: 'mapsKey', mapId: key });
  });

  it('should get map id if cached', (done) => {
    const key = 'mapId';
    service['_mapId'] = key;
    service.getMapId().then((response) => {
      expect(response).toBe(key);
      done();
    });
  });

  it('should catch error on get map id', (done) => {
    service.getMapId().catch((error) => {
      expect(error).toBeInstanceOf(HttpErrorResponse);
      done();
    });
    const req = httpController.expectOne(service['controller']);
    req.flush(null, { status: 0, statusText: 'Unknown Error' });
  });
});
