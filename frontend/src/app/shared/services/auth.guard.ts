import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AdminStateService } from './admin-state.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private adminState: AdminStateService, private router: Router) {}

  canActivate(): boolean {
    if (this.adminState.isLoggedIn) {
      return true;
    }
    this.router.navigate(['/admin/login']);
    return false;
  }
}
