import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../services/product.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() buyNow = new EventEmitter<Product>();
  imageLoading = true;

  constructor(private router: Router) {}

  onAddToCart(): void {
    this.addToCart.emit(this.product);
  }

  onBuyNow(): void {
    this.buyNow.emit(this.product);
  }

  onImageLoad(event: Event): void {
    this.imageLoading = false;
    const img = event.target as HTMLImageElement;
    img.classList.remove('loading');
  }

  onImageError(event: Event): void {
    this.imageLoading = false;
    const img = event.target as HTMLImageElement;
    img.classList.remove('loading');
    // Set a fallback image using dummyimage
    img.src = `https://dummyimage.com/300x300/cccccc/ffffff&text=Product+Image`;
    img.onerror = null; // Prevent infinite loop
  }

  getStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    return [
      ...Array(fullStars).fill('star'),
      ...(halfStar ? ['star_half'] : []),
      ...Array(emptyStars).fill('star_border')
    ];
  }
}
