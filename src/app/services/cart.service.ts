import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { Product } from './product.service';

export interface CartItem {
  product_id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export interface CartResponse {
  items: CartItem[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private cartSubject = new BehaviorSubject<CartResponse>({ items: [], total: 0 });
  public cartItems$ = this.cartItemsSubject.asObservable();
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  addToCart(product: Product): void {
    const params = new URLSearchParams();
    params.append('product_id', product.id.toString());
    params.append('title', product.title);
    params.append('price', product.price.toString());
    params.append('image', product.image);
    params.append('quantity', '1');

    this.http.post(`${this.apiUrl}/add?${params.toString()}`, {}, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      switchMap(() => this.getCart()),
      tap(cart => {
        this.cartItemsSubject.next(cart.items);
        this.cartSubject.next(cart);
      })
    ).subscribe({
      next: () => {
        this.snackBar.open(`${product.title} added to cart!`, 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.snackBar.open('Failed to add item to cart', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    });
  }

  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(this.apiUrl);
  }

  /** Updates item quantity. Returns observable that emits the updated cart. */
  updateCartItem(productId: number, quantity: number): Observable<CartResponse> {
    const params = new URLSearchParams();
    params.append('quantity', quantity.toString());

    return this.http.put(`${this.apiUrl}/update/${productId}?${params.toString()}`, {}).pipe(
      switchMap(() => this.getCart()),
      tap(cart => {
        this.cartItemsSubject.next(cart.items);
        this.cartSubject.next(cart);
      })
    );
  }

  /** Removes item from cart. Returns observable that emits the updated cart. */
  removeFromCart(productId: number): Observable<CartResponse> {
    return this.http.delete(`${this.apiUrl}/remove/${productId}`).pipe(
      switchMap(() => this.getCart()),
      tap(cart => {
        this.cartItemsSubject.next(cart.items);
        this.cartSubject.next(cart);
      })
    );
  }

  /** Clears entire cart. Returns observable that emits the empty cart. */
  clearCart(): Observable<CartResponse> {
    return this.http.delete(`${this.apiUrl}/clear`).pipe(
      switchMap(() => this.getCart()),
      tap(cart => {
        this.cartItemsSubject.next(cart.items);
        this.cartSubject.next(cart);
      })
    );
  }

  

  getCartItemCount(): number {
    return this.cartItemsSubject.value.reduce((total, item) => total + item.quantity, 0);
  }

  getCartTotal(): number {
    return this.cartItemsSubject.value.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}
