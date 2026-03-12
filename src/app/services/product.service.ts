import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      map(response => {
        // Ensure we have an array
        const products = Array.isArray(response) ? response : [];
        this.productsSubject.next(products);
        return products;
      })
    );
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/category/${category}`);
  }

  searchProducts(query: string): Observable<Product[]> {
    return this.products$.pipe(
      map(products => {
        if (!query.trim()) {
          return products;
        }
        return products.filter(product =>
          product.title.toLowerCase().includes(query.toLowerCase())
        );
      })
    );
  }

  getCategories(): Observable<string[]> {
    return this.products$.pipe(
      map(products => {
        const categories = [...new Set(products.map(product => product.category))];
        return categories;
      })
    );
  }
}
