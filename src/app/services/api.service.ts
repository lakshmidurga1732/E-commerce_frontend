import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl: string;

  constructor() {
    this.apiUrl = environment.apiUrl;
  }

  getApiUrl(): string {
    return this.apiUrl;
  }

  getAuthUrl(): string {
    return `${this.apiUrl}/auth`;
  }

  getProductsUrl(): string {
    return `${this.apiUrl}/products`;
  }

  getCartUrl(): string {
    return `${this.apiUrl}/cart`;
  }

  getOrdersUrl(): string {
    return `${this.apiUrl}/orders`;
  }
}
