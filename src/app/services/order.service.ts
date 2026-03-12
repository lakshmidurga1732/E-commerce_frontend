import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CartItem } from './cart.service';

export interface OrderItemCreate {
  product_id: number;
  quantity: number;
  price: number;
}

export interface OrderCreate {
  items: OrderItemCreate[];
  total: number;
  shipping_address: {
    name: string;
    address: string;
    city: string;
    zip_code: string;
    phone: string;
  };
}

export interface OrderResponse {
  id: number;
  total: number;
  created_at: string;
  items: OrderItemCreate[];
}

export interface PaymentInfo {
  card_number: string;
  expiry_date: string;
  cvv: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(orderData: OrderCreate): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.apiUrl}/create`, orderData);
  }

  getOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(this.apiUrl);
  }

  getOrder(orderId: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/${orderId}`);
  }

  // Simulate payment processing
  processPayment(paymentInfo: PaymentInfo): Observable<{ success: boolean; message: string }> {
    // Simulate payment processing delay
    return new Observable(observer => {
      setTimeout(() => {
        // Simulate payment validation
        if (paymentInfo.card_number && paymentInfo.expiry_date && paymentInfo.cvv) {
          observer.next({ success: true, message: 'Payment processed successfully' });
        } else {
          observer.next({ success: false, message: 'Invalid payment information' });
        }
        observer.complete();
      }, 2000);
    });
  }
}
