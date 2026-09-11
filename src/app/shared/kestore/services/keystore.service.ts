import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MapsConfigurationResponse } from '../models/key.response';

@Injectable({
  providedIn: 'root'
})
export class KeystoreService {
  readonly http = inject(HttpClient);

  private readonly controller = environment.apiUrl + environment.apiVersion + '/public-config/maps';

  private _mapsKey?: string;
  private _mapId?: string;
  private configurationPromise?: Promise<MapsConfigurationResponse>;

  private getConfiguration(): Promise<MapsConfigurationResponse> {
    this.configurationPromise ??= firstValueFrom(this.http.get<MapsConfigurationResponse>(this.controller));
    return this.configurationPromise;
  }


  async getMapsKey() {

    if (this._mapsKey) return this._mapsKey;

    try {
      const configuration = await this.getConfiguration();
      this._mapsKey = configuration.apiKey.trim();
      return this._mapsKey;
    } catch (error) {
      throw error;
    }
  }

  async getMapId() {
    if (this._mapId) return this._mapId;

    try {
      const configuration = await this.getConfiguration();
      this._mapId = configuration.mapId.trim();
      return this._mapId;
    } catch (error) {
      throw error;
    }
  }

}
