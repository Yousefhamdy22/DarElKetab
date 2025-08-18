// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from './services/AuthService.service';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(route, state);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(childRoute, state);
  }

  private checkAuth(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      // Check if route requires specific role
    //  const expectedRoles = route.data['roles'] as Array<string>;
      
      // if (expectedRoles) {
      //   const userRole = this.authService.getCurrentUser()?.role;
      //   if (userRole && expectedRoles.includes(userRole)) {
      //     return true;
      //   } else {
      //     // User doesn't have required role
      //     this.router.navigate(['/unauthorized']);
      //     return false;
      //   }
      // }
      
      return true;
    }

    // Not logged in, redirect to login page with the return URL
    // this.router.navigate(['/login'], { 
    //   queryParams: { returnUrl: state.url } 
    // });
    return false;
  }
}

// role.guard.ts - Separate guard for role-based access
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as Array<string>;
    
    if (!expectedRoles || expectedRoles.length === 0) {
      return true;
    }

    const user = this.authService.getCurrentUser();
    
    if (user && expectedRoles.includes(user.role)) {
      return true;
    }

    // User doesn't have required role
   // this.router.navigate(['/unauthorized']);
    return false;
  }
}