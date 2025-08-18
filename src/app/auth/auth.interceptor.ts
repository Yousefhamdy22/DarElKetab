import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from './services/AuthService.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('Intercepting request:', request.url);

    // Skip auth for login/refresh endpoints
    if (this.isAuthEndpoint(request.url)) {
      return next.handle(request);
    }

    // Add auth header if token exists
    const token = this.authService.getToken();
    if (token) {
      request = this.addAuthHeaders(request, token);
      // Add user context to request body for relevant endpoints
      request = this.addUserContextToRequest(request);
    } else {
      // No token available, redirect to login
      console.warn('No token available, redirecting to login');
      this.handleAuthError();
      return throwError(() => new HttpErrorResponse({
        error: { message: 'No authentication token available' },
        status: 401,
        statusText: 'Unauthorized'
      }));
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error in interceptor:', {
          status: error.status,
          url: error.url,
          message: error.message,
          error: error.error
        });
        
        return this.handleHttpError(error, request, next);
      })
    );
  }

  private addAuthHeaders(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  private handleHttpError(
    error: HttpErrorResponse, 
    request: HttpRequest<any>, 
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    // Handle authentication errors
    if (this.isAuthError(error)) {
      return this.handleAuthenticationError(error, request, next);
    }
    
    // Handle redirect to login (ASP.NET Core default behavior)
    if (this.isRedirectToLogin(error)) {
      console.error('Request was redirected to login page - authentication failed');
      this.handleAuthError();
      return throwError(() => new HttpErrorResponse({
        error: { message: 'Authentication required - redirected to login' },
        status: 401,
        statusText: 'Unauthorized',
      //  url: error.url
      }));
    }

    // Return other errors as-is
    return throwError(() => error);
  }

  private isAuthError(error: HttpErrorResponse): boolean {
    return error.status === 401 || error.status === 403;
  }

  private isRedirectToLogin(error: HttpErrorResponse): boolean {
    return error.status === 404 && 
           (error.url?.includes('/Account/Login') || 
            error.url?.includes('ReturnUrl=') || false);
  }

  private handleAuthenticationError(
    error: HttpErrorResponse, 
    request: HttpRequest<any>, 
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    // If we have a refresh token, try to refresh
    if (this.authService.getRefreshToken() && !this.isRefreshRequest(request)) {
      return this.handle401Error(request, next);
    }
    
    // Otherwise, logout and redirect
    this.handleAuthError();
    return throwError(() => error);
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshAuthToken().pipe(
        switchMap((tokenResponse: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(tokenResponse.token);
          
          // Retry the original request with new token
          const retryRequest = this.addAuthHeaders(request, tokenResponse.token);
          const contextRequest = this.addUserContextToRequest(retryRequest);
          return next.handle(contextRequest);
        }),
        catchError((refreshError) => {
          this.isRefreshing = false;
          console.error('Token refresh failed:', refreshError);
          this.handleAuthError();
          return throwError(() => refreshError);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    }

    // If already refreshing, wait for the new token
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => {
        const retryRequest = this.addAuthHeaders(request, token);
        const contextRequest = this.addUserContextToRequest(retryRequest);
        return next.handle(contextRequest);
      })
    );
  }

  private isAuthEndpoint(url: string): boolean {
    const authEndpoints = [
      '/auth/login', 
      '/auth/refresh', 
      '/Account/Login',
      '/api/auth/login',
      '/api/auth/refresh'
    ];
    return authEndpoints.some(endpoint => url.includes(endpoint));
  }

  private isRefreshRequest(request: HttpRequest<any>): boolean {
    return request.url.includes('/auth/refresh') || 
           request.url.includes('/api/auth/refresh');
  }

  private handleAuthError(): void {
    console.log('Authentication error - logging out user');
    
    // Clear tokens and user data
    // this.authService.clearTokens();
    
    // Navigate to login
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: this.router.url },
      replaceUrl: true 
    });
  }

  private addUserContextToRequest(request: HttpRequest<any>): HttpRequest<any> {
    const userId = this.authService.getUserId();
    
    if (!userId || !request.body) {
      return request;
    }

    // Add markedBy for attendance endpoints
    if (request.url.includes('/Attendance/record-group') || 
        request.url.includes('/attendance/record-group')) {
      return request.clone({
        body: { ...request.body, markedBy: userId }
      });
    }

    // Add createdBy for group creation
    if ((request.url.includes('/groups') || request.url.includes('/Groups')) && 
        ['POST', 'PUT'].includes(request.method)) {
      return request.clone({
        body: { ...request.body, createdBy: userId }
      });
    }

    return request;
  }
}