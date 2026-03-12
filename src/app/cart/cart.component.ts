import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem, CartResponse } from '../services/cart.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PaymentContextService } from '../services/payment-context.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  cart: CartResponse | null = null;
  isLoading = true;
  updatingItemId: number | null = null;
  displayedColumns: string[] = ['product', 'price', 'quantity', 'total', 'buyNow', 'actions'];

  constructor(
    private cartService: CartService,
    public router: Router,
    private authService: AuthService,
    private paymentContext: PaymentContextService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.isLoading = false;
        // Force change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.isLoading = false;
        this.cart = { items: [], total: 0 };
        // Force change detection
        this.cdr.detectChanges();
      }
    });
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeFromCart(item.product_id);
      return;
    }
    this.updatingItemId = item.product_id;
    this.cartService.updateCartItem(item.product_id, newQuantity).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.updatingItemId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.updatingItemId = null;
        this.snackBar.open('Failed to update quantity', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.snackBar.open('Item removed from cart', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Failed to remove item', 'Close', { duration: 3000 });
      }
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.snackBar.open('Cart cleared', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Failed to clear cart', 'Close', { duration: 3000 });
      }
    });
  }

  goToPayment(): void {
    this.paymentContext.clear();
    this.router.navigate(['/payment']);
  }

  buySingleItem(item: CartItem): void {
    this.paymentContext.setSingleItem(item);
    this.router.navigate(['/payment'], { state: { singleItem: item } });
  }

  goBackToHome(): void {
    this.router.navigate(['/home']);
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get currentUser() {
    return this.authService.currentUser$;
  }
}
