// // auth.interceptor.ts
// import { Injectable } from '@angular/core';
// import {
//   HttpRequest,
//   HttpHandler,
//   HttpEvent,
//   HttpInterceptor,
//   HttpErrorResponse
// } from '@angular/common/http';
// import { Observable, throwError, BehaviorSubject } from 'rxjs';
// import { catchError, filter, take, switchMap } from 'rxjs/operators';
// import { AuthService } from './services/AuthService.service';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//   private isRefreshing = false;
//   private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

//   constructor(private authService: AuthService) {}

//   intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
//     // Add auth header and userId if needed
//     if (this.shouldAddAuthHeader(request)) {
//       request = this.addAuthHeaders(request);
//     }

//     return next.handle(request).pipe(
//       catchError((error: HttpErrorResponse) => {
//         if (error.status === 401 && this.shouldAttemptRefresh(request)) {
//           return this.handle401Error(request, next);
//         }
//         return throwError(() => error);
//       })
//     );
//   }

//   private shouldAddAuthHeader(request: HttpRequest<any>): boolean {
//     const token = this.authService.getToken();
//     const isAuthEndpoint = request.url.includes('/auth/login') || 
//                           request.url.includes('/auth/refresh') ||
//                           request.url.includes('/auth/register');
    
//     return !!(token && !isAuthEndpoint);
//   }

//   private shouldAttemptRefresh(request: HttpRequest<any>): boolean {
//     const isLoginRequest = request.url.includes('/auth/login');
//     const isRefreshRequest = request.url.includes('/auth/refresh');
//     const hasRefreshToken = !!this.authService.getRefreshToken();
    
//     return !isLoginRequest && !isRefreshRequest && hasRefreshToken;
//   }

//   // private addAuthHeaders(request: HttpRequest<any>): HttpRequest<any> {
//   //   // ... existing token handling ...
//   //   if (request.url.includes('/groups') && ['POST', 'PUT'].includes(request.method)) {
//   //     const currentBody = request.body;
//   //     if (currentBody && typeof currentBody === 'object' && !currentBody.command) {
//   //       modifiedRequest = modifiedRequest.clone({
//   //         body: { ...currentBody, command: 'CreateGroup' } // or appropriate command
//   //       });
//   //     }
//   //   }
  
//   //   return modifiedRequest;
//   // }
//   //-----------
//   private addAuthHeaders(request: HttpRequest<any>): HttpRequest<any> {
//     const token = this.authService.getToken();
//     const userId = this.authService.getUserId();
    
//     if (!token) return request;
    
//     let modifiedRequest = request.clone({
//       headers: request.headers.set('Authorization', `Bearer ${token}`)
//     });
  
//     // For attendance endpoint, add userId to body
//     if (userId && request.url.includes('/Attendance/record-group')) {
//       const currentBody = request.body;
//       if (currentBody) {
//         modifiedRequest = modifiedRequest.clone({
//           body: { ...currentBody, markedBy: userId }
//         });
//       }
//     }
    
//     return modifiedRequest;
//   }
//   private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     if (!this.isRefreshing) {
//       this.isRefreshing = true;
//       this.refreshTokenSubject.next(null);

//       return this.authService.refreshAuthToken().pipe(
//         switchMap((tokenResponse: any) => {
//           this.isRefreshing = false;
//           this.refreshTokenSubject.next(tokenResponse.token);
          
//           // Re-add headers with new token
//           return next.handle(this.addAuthHeaders(request));
//         }),
//         catchError((error) => {
//           this.isRefreshing = false;
//           this.authService.logout();
//           return throwError(() => error);
//         })
//       );
//     }

//     return this.refreshTokenSubject.pipe(
//       filter(token => token !== null),
//       take(1),
//       switchMap((token) => next.handle(this.addAuthHeaders(request)))
//     );
//   }
// }
// auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './services/AuthService.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Add auth header and modify request based on user context
    if (this.shouldAddAuthHeader(request)) {
      request = this.addAuthHeaders(request);
      request = this.addUserContextToRequest(request);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && this.shouldAttemptRefresh(request)) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private shouldAddAuthHeader(request: HttpRequest<any>): boolean {
    const token = this.authService.getToken();
    const isAuthEndpoint = request.url.includes('/auth/login') || 
                          request.url.includes('/auth/refresh') ||
                          request.url.includes('/auth/register');
    
    return !!(token && !isAuthEndpoint);
  }

  private shouldAttemptRefresh(request: HttpRequest<any>): boolean {
    const isLoginRequest = request.url.includes('/auth/login');
    const isRefreshRequest = request.url.includes('/auth/refresh');
    const hasRefreshToken = !!this.authService.getRefreshToken();
    
    return !isLoginRequest && !isRefreshRequest && hasRefreshToken;
  }

  private addAuthHeaders(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getToken();
    
    if (!token) return request;
    
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  private addUserContextToRequest(request: HttpRequest<any>): HttpRequest<any> {
    const userId = this.authService.getUserId();
    const userRole = this.authService.getUserRole();
    
    if (!userId) {
      console.warn('No userId found when trying to add user context to request');
      return request;
    }

    let modifiedRequest = request;
    
    // Handle POST/PUT requests - Add createdBy field
    if (['POST', 'PUT'].includes(request.method) && request.body) {
      modifiedRequest = this.addCreatedByField(request, userId);
    }

    // Handle GET requests for teachers - Add user filtering
    if (request.method === 'GET' && userRole === 'teacher') {
      modifiedRequest = this.addTeacherFiltering(request, userId);
    }

    // Handle specific endpoints
    modifiedRequest = this.handleSpecificEndpoints(modifiedRequest, userId);

    return modifiedRequest;
  }

  private addCreatedByField(request: HttpRequest<any>, userId: string): HttpRequest<any> {
    const currentBody = request.body;
    
    // Skip if body is not an object
    if (!currentBody || typeof currentBody !== 'object') {
      return request;
    }

    // For CreateGroup command specifically
    if (currentBody.command === 'CreateGroup') {
      console.log('Adding createdBy to CreateGroup command:', userId);
      return request.clone({
        body: { ...currentBody, createdBy: userId }
      });
    }

    // For groups endpoint without command
    if (request.url.includes('/groups') || request.url.includes('/Groups')) {
      console.log('Adding createdBy to groups endpoint:', userId);
      return request.clone({
        body: { ...currentBody, createdBy: userId }
      });
    }

    // For other relevant endpoints
    const relevantEndpoints = ['/assignments', '/announcements', '/materials'];
    const isRelevantEndpoint = relevantEndpoints.some(endpoint => 
      request.url.includes(endpoint)
    );

    if (isRelevantEndpoint && !currentBody.createdBy) {
      console.log('Adding createdBy to relevant endpoint:', request.url, userId);
      return request.clone({
        body: { ...currentBody, createdBy: userId }
      });
    }

    return request;
  }

  private addTeacherFiltering(request: HttpRequest<any>, userId: string): HttpRequest<any> {
    // Add teacher-specific filtering for GET requests
    const teacherFilterEndpoints = ['/groups', '/students', '/assignments'];
    const shouldFilter = teacherFilterEndpoints.some(endpoint => 
      request.url.includes(endpoint)
    );

    if (shouldFilter) {
      const url = new URL(request.url, window.location.origin);
      
      // Add teacher filter parameter
      if (request.url.includes('/groups')) {
        url.searchParams.set('teacherId', userId);
      } else if (request.url.includes('/students')) {
        url.searchParams.set('teacherId', userId);
      } else if (request.url.includes('/assignments')) {
        url.searchParams.set('createdBy', userId);
      }

      return request.clone({
        url: url.toString()
      });
    }

    return request;
  }

  private handleSpecificEndpoints(request: HttpRequest<any>, userId: string): HttpRequest<any> {
    // Handle attendance endpoint - record-group
    if (request.url.includes('/Attendance/record-group') || 
        request.url.includes('/attendance/record-group')) {
      const currentBody = request.body;
      if (currentBody) {
        console.log('Adding markedBy to attendance endpoint:', userId);
        return request.clone({
          body: { ...currentBody, markedBy: userId }
        });
      }
    }

    // Handle grades endpoint
    if (request.url.includes('/grades') && ['POST', 'PUT'].includes(request.method)) {
      const currentBody = request.body;
      if (currentBody && !currentBody.gradedBy) {
        console.log('Adding gradedBy to grades endpoint:', userId);
        return request.clone({
          body: { ...currentBody, gradedBy: userId }
        });
      }
    }

    return request;
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshAuthToken().pipe(
        switchMap((tokenResponse: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(tokenResponse.token);
          
          // Re-add headers and context with new token
          const modifiedRequest = this.addAuthHeaders(request);
          const contextRequest = this.addUserContextToRequest(modifiedRequest);
          return next.handle(contextRequest);
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => error);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => {
        const modifiedRequest = this.addAuthHeaders(request);
        const contextRequest = this.addUserContextToRequest(modifiedRequest);
        return next.handle(contextRequest);
      })
    );
  }
}