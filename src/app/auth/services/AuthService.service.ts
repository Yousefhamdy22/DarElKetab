// auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environment/environment';

interface LoginResponse {
  user: {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'teacher';
    name: string;
    specialty?: string;
  };
  token: string;
  refreshToken: string;
  expiresIn?: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'teacher';
  name: string;
  specialty?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiBaseUrl = `${environment.apiUrl}`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenKey = 'auth_token';
  private refreshTokenKey = 'refresh_token';
  private userKey = 'current_user';
  
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    const user = this.getStoredUser();
    
    if (token && user && !this.isTokenExpired(token)) {
      this.currentUserSubject.next(user);
    } else {
      this.clearAuthData();
    }
  }


  register(formValue: any): Observable<any> {
    const command = this.handleCommand(formValue);
    return this.http.post(`${this.apiBaseUrl}/ApplicationUser/register`, { command }).pipe(
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Registration failed'));
      })
    );
  }


  update(formValue: any): Observable<any> {
    const command = this.handleCommand(formValue);
    return this.http.post(`${this.apiBaseUrl}/update`, { command }).pipe(
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Update failed'));
      })
    );
  }
  
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiBaseUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        
        if (response && response.token && response.user) {
          this.setAuthData(response);

          localStorage.setItem('token', response.token);
          localStorage.setItem('refreshToken', response.refreshToken);
          // Store user data
        this.currentUserSubject.next(response.user);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  
  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.nameid || payload.userId || payload.sub; // Adjust based on your token claims
    } catch (e) {
      return null;
    }
  }

  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    return user?.role || null;
  }
  // getUserId(): string | null {
  //   const token = localStorage.getItem('token');
  //   if (!token) return null;
    
  //   try {
  //     const payload = JSON.parse(atob(token.split('.')[1]));
  //     return payload.nameid; // or payload.userId depending on your claim
  //   } catch (e) {
  //     return null;
  //   }
  // }
  private setAuthData(response: LoginResponse): void {
    // Store token
    localStorage.setItem(this.tokenKey, response.token);
    
    // Store refresh token if provided
    if (response.refreshToken) {
      localStorage.setItem(this.refreshTokenKey, response.refreshToken);
    }
    
    // Store user data
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    
    // Update current user subject
    this.currentUserSubject.next(response.user);
  }

  logout(): void {
    // Optional: Call logout endpoint to invalidate token on server
    this.http.post(`${this.apiBaseUrl}/auth/logout`, {}).pipe(
      catchError(error => {
        console.error('Logout error:', error);
        return of(null);
      })
    ).subscribe();

    this.clearAuthData();
    this.router.navigate(['/login']);
  }
  private handleCommand(formValue: any): any {
    return formValue;
  }
  private clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const user = this.currentUserSubject.value;
    return !!(token && user && !this.isTokenExpired(token));
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  isTeacher(): boolean {
    return this.currentUserSubject.value?.role === 'teacher';
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }

  refreshAuthToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<LoginResponse>(`${this.apiBaseUrl}/auth/refresh`, {
      refreshToken
    }).pipe(
      tap(response => {
        if (response && response.token) {
          this.setAuthData(response);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Token refresh error:', error);
        this.clearAuthData();
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  }

  // Helper method to check if user has specific role
  hasRole(role: string): boolean {
    return this.currentUserSubject.value?.role === role;
  }

  // Helper method to check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    const userRole = this.currentUserSubject.value?.role;
    return userRole ? roles.includes(userRole) : false;
  }
}