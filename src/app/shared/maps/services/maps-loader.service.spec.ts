import { TestBed } from '@angular/core/testing';

import { MapsLoaderService } from './maps-loader.service';
import { KeystoreService } from '../../kestore/services/keystore.service';

describe('MapsLoaderService', () => {
  let service: MapsLoaderService;
  let keystoreServiceSpy: jasmine.SpyObj<KeystoreService>;
  let previousCallback: unknown;

  beforeEach(() => {
    previousCallback = (window as any).__onGoogleLoaded;
    keystoreServiceSpy = jasmine.createSpyObj<KeystoreService>('KeystoreService', ['getMapId', 'getMapsKey']);

    TestBed.configureTestingModule({
      providers: [
        { provide: KeystoreService, useValue: keystoreServiceSpy }
      ]
    });
    service = TestBed.inject(MapsLoaderService);
  });

  afterEach(() => {
    if (previousCallback === undefined) delete (window as any).__onGoogleLoaded;
    else (window as any).__onGoogleLoaded = previousCallback;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should if has promise in cache', async () => {
    const apiKey = '123';
    keystoreServiceSpy.getMapsKey.and.returnValue(Promise.resolve(apiKey));


    service["promise"] = Promise.resolve('google maps api loaded');

    const result = await service.load();
    expect(result).toBe('google maps api loaded');
  });

  it('should load google maps api', async () => {
    const apiKey = '123';
    keystoreServiceSpy.getMapsKey.and.returnValue(Promise.resolve(apiKey));

    // Exercise script creation and the provider callback without contacting Google.
    const append = spyOn(document.head, 'appendChild').and.callFake(<T extends Node>(node: T): T => {
      expect(node).toBeInstanceOf(HTMLScriptElement);
      const script = node as unknown as HTMLScriptElement;
      const url = new URL(script.src);
      expect(url.origin).toBe('https://maps.googleapis.com');
      expect(url.pathname).toBe('/maps/api/js');
      expect(url.searchParams.get('key')).toBe(apiKey);
      expect(url.searchParams.get('callback')).toBe('__onGoogleLoaded');
      expect(url.searchParams.get('loading')).toBe('async');
      expect(script.type).toBe('text/javascript');
      (window as any).__onGoogleLoaded();
      return node;
    });

    const result = await service.load();
    expect(result).toBe('google maps api loaded');
    expect(await service.load()).toBe('google maps api loaded');
    expect(append).toHaveBeenCalledTimes(1);
  });

  it('propagates configuration failures without injecting a script', async () => {
    const error = new Error('Configuration unavailable');
    keystoreServiceSpy.getMapsKey.and.callFake(() => Promise.reject(error));
    const append = spyOn(document.head, 'appendChild');
    await expectAsync(service.load()).toBeRejectedWith(error);
    expect(append).not.toHaveBeenCalled();
  });
});
