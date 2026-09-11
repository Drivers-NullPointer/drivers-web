import { inject, Injectable } from '@angular/core';
import { KeystoreService } from '../../kestore/services/keystore.service';

@Injectable({
  providedIn: 'root'
})
export class MapsLoaderService {

  private readonly keystoreService: KeystoreService = inject(KeystoreService);

  private promise?: Promise<any>;


  public async load() {
    const apiKey = (await this.keystoreService.getMapsKey()).trim();
    const url = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__onGoogleLoaded&loading=async`;
    if (!this.promise) {
      this.promise = new Promise(resolve => {

        (window as any)['__onGoogleLoaded'] = () => {
          resolve('google maps api loaded');
        };

        let node = document.createElement('script');
        node.src = url;
        node.type = 'text/javascript';
        document.getElementsByTagName('head')[0].appendChild(node);
      });
    }

    return this.promise;
  }
}
