import { Injectable } from '@angular/core';
import { CartItem } from './cart.service';

/**
 * Tracks whether payment is for a single item (Buy Now) or full cart.
 * Set before navigating to payment; cleared after order is placed or user leaves.
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentContextService {
  /** When set, payment page shows only this item and charges only this item. */
  singleItem: CartItem | null = null;

  setSingleItem(item: CartItem | null): void {
    this.singleItem = item;
  }

  getSingleItem(): CartItem | null {
    return this.singleItem;
  }

  isSingleItemPayment(): boolean {
    return this.singleItem != null;
  }

  clear(): void {
    this.singleItem = null;
  }
}
