import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CartService, CartItem, CartResponse } from '../services/cart.service';
import { PaymentContextService } from '../services/payment-context.service';
import { OrderService, OrderCreate } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements OnInit, OnDestroy {
  paymentForm: FormGroup;
  addressForm: FormGroup;
  cart: CartResponse | null = null;
  displayItems: CartItem[] = [];
  orderTotal = 0;
  isSingleItemPayment = false;
  isLoading = false;
  isPlacingOrder = false;
  
  cartLoaded = false;
  private navSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cartService: CartService,
    private paymentContext: PaymentContextService,

    private orderService: OrderService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.paymentForm = this.fb.group({
      paymentMethod: ['cod']
    });
    this.addressForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      zip_code: ['', [Validators.required, Validators.pattern(/^[0-9]{5,6}$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });
  }

  ngOnInit(): void {
    this.applyPaymentContext();
    this.loadCartData();
    this.navSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        if (e.urlAfterRedirects?.includes('/payment') || e.url?.includes('/payment')) {
          this.applyPaymentContext();
          this.loadCartData();
        }
      });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
    if (!this.router.url.includes('order-success')) {
      this.paymentContext.clear();
    }
  }

  /** Re-apply single-item vs full-cart from context (run on init and every time we land on payment). */
  applyPaymentContext(): void {
    const singleItem = this.paymentContext.getSingleItem();
    if (singleItem) {
      this.isSingleItemPayment = true;
      this.displayItems = [{ ...singleItem }];
      this.orderTotal = singleItem.price * singleItem.quantity;
      this.cartLoaded = true;
    } else {
      this.isSingleItemPayment = false;
      this.displayItems = [];
      this.orderTotal = 0;
      this.cartLoaded = false;
    }
    this.cdr.detectChanges();
  }

  onPaymentMethodChange(method: string): void {
    this.paymentForm.patchValue({ paymentMethod: method });
  }

  loadCartData(): void {
    if (!this.isSingleItemPayment) this.cartLoaded = false;
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        if (!this.isSingleItemPayment) {
          this.displayItems = [...cart.items];
          this.orderTotal = cart.total;
        }
        this.cartLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.router.navigate(['/cart']);
      }
    });
  }

 

  canPlaceOrder(): boolean {
    const base = this.addressForm.valid && this.displayItems.length > 0 && !this.isPlacingOrder;
    return base;
  }

  onPlaceOrder(): void {
    if (!this.canPlaceOrder()) {
      return;
    }

    this.isPlacingOrder = true;
    const shippingAddress = this.addressForm.value;

    const orderData: OrderCreate = {
      items: this.displayItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      })),
      total: this.orderTotal,
      shipping_address: shippingAddress
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        this.isPlacingOrder = false;
        this.paymentContext.clear();
        this.cartService.clearCart().subscribe();
        this.snackBar.open('Order placed successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/order-success'], { state: { orderId: order.id } });
      },
      error: () => {
        this.isPlacingOrder = false;
        this.snackBar.open('Failed to place order. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  onGoBack(): void {
    this.paymentContext.clear();
    this.router.navigate(['/cart']);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get currentUser() {
    return this.authService.currentUser$;
  }
}
