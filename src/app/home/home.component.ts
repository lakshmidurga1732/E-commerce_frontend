import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ProductService, Product } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { PaymentContextService } from '../services/payment-context.service';
import { AuthService, User } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ProductCardComponent,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading = true;
  searchForm: FormGroup;
  cartItemCount = 0;
  currentUser: Observable<User | null>;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private paymentContext: PaymentContextService,
    private fb: FormBuilder,
    public router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchForm = this.fb.group({
      searchQuery: ['']
    });
    this.currentUser = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.loadProducts();
    
    // Initialize cart loading
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.updateCartItemCount();
      },
      error: (error) => {
        console.error('Error initializing cart:', error);
        this.cartItemCount = 0;
      }
    });

    this.searchForm.get('searchQuery')!.valueChanges.subscribe(query => {
      this.filterProducts(query);
    });

    // Subscribe to cart changes for real-time updates
    this.cartService.cartItems$.subscribe(() => {
      this.updateCartItemCount();
    });
  }


  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.isLoading = false;
        // Force change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
        // Force change detection
        this.cdr.detectChanges();
      }
    });
  }

  filterProducts(query: string): void {
    if (!query.trim()) {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  onAddToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  onBuyNow(product: Product): void {
    const singleItem = {
      product_id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1
    };
    this.paymentContext.setSingleItem(singleItem);
    this.cartService.addToCart(product);
    this.router.navigate(['/payment'], { state: { singleItem } });
  }

  updateCartItemCount(): void {
    this.cartItemCount = this.cartService.getCartItemCount();
    // Force change detection
    this.cdr.detectChanges();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  get searchQueryControl(): FormControl {
    return this.searchForm.get('searchQuery') as FormControl;
  }
}
