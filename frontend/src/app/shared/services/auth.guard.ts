import { Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      // Redirect to admin login if not authenticated
      this.router.navigate(['/admin/login']);
      return false;
    }
  }
}

// Functional guard version for new Angular 15+ syntax
export const authGuard: CanActivateFn = (route, state) => {
  const authService = new AuthService(null as any);
  const router = new Router();

  if (authService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['/admin/login']);
    return false;
  }
};
