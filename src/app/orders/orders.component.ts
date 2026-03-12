import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';

interface OrderItem {
  product_id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  total: number;
  created_at: string;
  items: OrderItem[];
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatTooltipModule
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  expandedOrder: number | null = null;

  constructor(
    private orderService: OrderService,
    public router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    console.log('Loading orders...');

    this.orderService.getOrders().subscribe({
      next: (response: any) => {
        console.log('API Response:', response);

        this.orders = Array.isArray(response) ? response.map((order: any) => {
          console.log('Mapping order:', order);

          return {
            id: order.id,
            total: order.total,
            created_at: order.created_at,
            items: order.items ? order.items.map((item: any) => ({
              product_id: item.product_id,
              product_name: item.product_name || 'Unknown Product',
              product_image: item.product_image || '',
              quantity: item.quantity,
              price: item.price
            })) : []
          };
        }).sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ) : [];

        console.log('Mapped orders:', this.orders);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading = false;
        this.orders = [];
        this.cdr.detectChanges();
      }
    });
  }

  toggleOrderExpansion(orderId: number | null): void {
    this.expandedOrder = orderId;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFirstImageUrl(imageUrls: string): string {
    if (!imageUrls) return '';

    console.log('Original image URLs:', imageUrls);

    const firstUrl = imageUrls.split(';')[0]?.trim() || '';
    const cleanUrl = firstUrl.split('\n')[0]?.trim() || '';

    console.log('Cleaned image URL:', cleanUrl);
    return cleanUrl;
  }

  getOrderStatus(order: Order): string {
    const orderDate = new Date(order.created_at);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

    console.log(`Order ${order.id} status: ${daysDiff} days old`);

    if (daysDiff === 0) return 'Processing';
    if (daysDiff <= 2) return 'Shipped';
    if (daysDiff <= 5) return 'In Transit';
    return 'Delivered';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Processing': return '#ff9800';
      case 'Shipped': return '#2196f3';
      case 'In Transit': return '#9c27b0';
      case 'Delivered': return '#4caf50';
      default: return '#666';
    }
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get currentUser() {
    return this.authService.currentUser$;
  }
}
