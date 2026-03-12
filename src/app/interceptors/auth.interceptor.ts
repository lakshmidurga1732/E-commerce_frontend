import { Injectable, Inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private excludedUrls = ['/auth/login', '/auth/register'];

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: string
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Skip adding token for auth endpoints
    if (this.isExcludedUrl(request.url)) {
      return next.handle(request);
    }

    // Add auth token to request
    const token = this.getToken();
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expired or invalid
          this.logout();
        }
        
        return throwError(() => error);
      })
    );
  }

  private isExcludedUrl(url: string): boolean {
    return this.excludedUrls.some(excludedUrl => url.includes(excludedUrl));
  }

  private getToken(): string | null {
    try {
      return localStorage.getItem('token');
    } catch (e) {
      console.error('Error getting token:', e);
      return null;
    }
  }

  private logout(): void {
    try {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    } catch (e) {
      console.error('Error during logout:', e);
    }
  }
}
