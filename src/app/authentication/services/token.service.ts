import { Injectable } from '@angular/core';
import { constants } from '../../constants/constants';
import { TokenData } from '../model/TokenData';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private accessToken?: string = undefined;
  private version = 0;
  get sessionVersion(): number { return this.version; }

  constructor() { }


  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  getAccessToken(): string {
    return this.accessToken ?? '';
  }

  clearAccessToken(): void {
    this.version++;
    this.accessToken = undefined;
  }

}
