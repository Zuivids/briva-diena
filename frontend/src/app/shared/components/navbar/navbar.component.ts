import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AdminStateService } from '../../services/admin-state.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg fixed-top border-bottom"
         [class.navbar-admin]="isAdmin"
         [class.navbar-light]="!isAdmin"
         [style.background-color]="isAdmin ? 'rgba(105, 70, 5, 0.95)' : 'rgba(255,255,255,0.5)'"
         style="backdrop-filter: blur(6px);">
      <div class="container">
        <a class="navbar-brand fw-bold fs-5" routerLink="/">
          <span [class.brand-name]="!isAdmin" [class.brand-name-admin]="isAdmin">BRĪVA DIENA</span>
        </a>
        <button
          class="navbar-toggler"
          type="button"
          (click)="toggleMenu($event)"
          aria-controls="navbarNav"
          [attr.aria-expanded]="menuOpen"
          aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="navbar-collapse-custom" [class.show]="menuOpen" id="navbarNav">
          <ul class="navbar-nav ms-auto align-items-center gap-1">
            <li class="nav-item">
              <a class="nav-link" [class.nav-link-admin]="isAdmin"
                routerLink="/trips" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: false }" (click)="closeMenu()">
                Ceļojumi
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" [class.nav-link-admin]="isAdmin"
                routerLink="/about" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: false }" (click)="closeMenu()">
                Par Brīva diena
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" [class.nav-link-admin]="isAdmin"
                routerLink="/contacts" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: false }" (click)="closeMenu()">
                Kontakti
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" [class.nav-link-admin]="isAdmin"
                routerLink="/reviews" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: false }" (click)="closeMenu()">
                Atsauksmes
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" [class.nav-link-admin]="isAdmin"
                routerLink="/faq" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: false }" (click)="closeMenu()">
                BUJ
              </a>
            </li>

            <!-- Pieteikties button -->
            <li class="nav-item ms-1">
              <a class="btn btn-register" routerLink="/registration" (click)="closeMenu()">PIETEIKTIES</a>
            </li>

            <!-- Admin nav links — visible when logged in -->
            <li class="nav-item ms-1" *ngIf="isAdmin">
              <a class="nav-link nav-link-admin" routerLink="/admin/dashboard" routerLinkActive="active" (click)="closeMenu()">Sākums</a>
            </li>
            <li class="nav-item ms-1" *ngIf="isAdmin">
              <a class="nav-link nav-link-admin" routerLink="/admin/trips" routerLinkActive="active" (click)="closeMenu()">Ceļojumi</a>
            </li>
            <li class="nav-item ms-1" *ngIf="isAdmin">
              <a class="nav-link nav-link-admin" routerLink="/admin/registrations" routerLinkActive="active" (click)="closeMenu()">Pieteikumi</a>
            </li>
            <li class="nav-item ms-1" *ngIf="isAdmin">
              <button class="btn btn-sm btn-outline-admin" (click)="logout()">Iziet</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    /* Backdrop overlay - HIDDEN */
    .navbar-backdrop {
      display: none !important;
    }

    /* Custom collapse menu */
    .navbar-collapse-custom {
      position: fixed;
      top: 72px;
      right: 0;
      width: 30%;
      height: fit-content;
      background-color: #ffffff;
      backdrop-filter: none;
      z-index: 1040;
      padding: 24px 28px 28px;
      border-left: 1px solid rgba(92, 64, 51, 0.08);
      border-bottom: 1px solid rgba(92, 64, 51, 0.06);
      border-radius: 0 0 0 14px;
      transform: translateX(100%);
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: none;
      overflow-y: auto;
      flex-basis: auto !important;
      display: flex !important;
      min-width: 280px;
    }

    .navbar-collapse-custom.show {
      transform: translateX(0);
      box-shadow: -4px 12px 32px rgba(92, 64, 51, 0.10),
                  -1px 0 8px rgba(0, 0, 0, 0.04);
    }

    .navbar-admin ~ nav .navbar-collapse-custom {
      background-color: rgba(13, 110, 253, 0.95);
      backdrop-filter: blur(6px);
    }

    /* Admin mode backdrop */
    /* Removed - backdrop is hidden */

    /* Navbar items layout */
    .navbar-collapse-custom .navbar-nav {
      flex-direction: column;
      width: 100%;
      gap: 0;
    }

    .navbar-collapse-custom .nav-item {
      width: 100%;
      margin-left: 30px;
      padding: 0;
      flex: none;
    }

    .navbar-collapse-custom .nav-item:has(a:not(.nav-link)) {
      width: auto;
    }

    .navbar-collapse-custom .nav-item:has(.btn) {
      width: auto;
    }

    .navbar-collapse-custom .nav-item.ms-1 {
      margin-left: 0 !important;
    }

    .navbar-collapse-custom .nav-link {
      padding: 12px 0;
      border-bottom: 1px solid #f5f0ee;
      display: block;
      color: #444 !important;
      font-size: 0.92rem;
      font-weight: 400;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      transition: color 0.2s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                  letter-spacing 0.3s ease;
      transform-origin: left center;
    }

    .navbar-collapse-custom .nav-link:hover {
      transform: scale(1.07);
      letter-spacing: 0.09em;
    }

    .navbar-collapse-custom .nav-link-admin {
      color: #5C4033 !important;
      border-bottom-color: #cbb5ae;
    }

    .navbar-collapse-custom .nav-link:last-of-type {
      border-bottom: none;
    }

    .navbar-admin ~ nav .navbar-collapse-custom .nav-link {
      color: rgba(255, 255, 255, 0.88) !important;
      border-bottom-color: rgba(255, 255, 255, 0.1);
    }

    .navbar-collapse-custom .btn {
      width: 100%;
      margin-top: 10px;
    }

    .navbar-collapse-custom .btn-admin-icon {
      width: auto !important;
      flex: none;
    }

    .navbar-admin ~ nav .navbar-collapse-custom .btn-register {
      background-color: #fff;
      color: #0d6efd;
    }

    .navbar-admin ~ nav .navbar-collapse-custom .btn-register:hover {
      background-color: #f0f0f0;
      color: #0d6efd;
    }

    .nav-link {
      color: #444;
      font-weight: 400;
      transition: color 0.2s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: inline-block;
    }

    .nav-link:hover,
    .nav-link.active {
      color: #e87722 !important;
      font-weight: 500;
      transform: scale(1.10);
    }

    /* Admin mode: white nav links */
    .nav-link-admin {
      color: rgba(255, 255, 255, 0.88) !important;
      font-weight: 400;
    }

    .nav-link-admin:hover,
    .nav-link-admin.active {
      color: #fff !important;
      font-weight: 500;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 56px;
      padding: 12px 0;
    }

    .brand-name {
      color: #5C4033;
      line-height: 1.2;
      font-size: 1.4rem;
    }

    .brand-name-admin {
      color: #fff;
      line-height: 1.2;
      font-size: 1.4rem;
    }

    /* Orange "Pieteikties" button */
    .btn-register {
      background-color: #e87722;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 6px 18px;
      font-weight: 500;
      font-size: 0.9rem;
      text-decoration: none;
      transition: background-color 0.2s, transform 0.1s;
    }

    .btn-register:hover {
      background-color: #cf6510;
      color: #fff;
      transform: translateY(-1px);
    }

    /* Icon-only Admin button */
    .btn-admin-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      min-width: 36px;
      min-height: 36px;
      max-width: 36px;
      max-height: 36px;
      padding: 0;
      border: 1.5px solid #ccc;
      border-radius: 50%;
      color: #666;
      background: transparent;
      text-decoration: none;
      transition: border-color 0.2s, color 0.2s;
      flex: none;
    }

    .btn-admin-icon:hover {
      border-color: #e87722;
      color: #e87722;
    }

    /* Iziet button — adapts to context */
    .btn-outline-admin {
      color: #5C4033;
      border: 1.5px solid #5C4033;
      background: transparent;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      transition: background-color 0.2s, color 0.2s;
    }
    .btn-outline-admin:hover {
      background-color: #5C4033;
      color: #fff;
    }

    /* Responsive adjustments */
    @media (min-width: 992px) {
      .navbar-toggler {
        display: none !important;
      }

      .navbar-collapse-custom {
        display: flex !important;
        position: static;
        max-width: none;
        height: auto;
        width: auto;
        background: transparent !important;
        border: none !important;
        transform: none !important;
        padding: 0 !important;
        flex-basis: auto;
        overflow-y: visible;
        backdrop-filter: none !important;
      }

      .container {
        background: transparent !important;
        backdrop-filter: none !important;
      }

      .navbar-collapse-custom .navbar-nav {
        flex-direction: row !important;
        gap: 1rem !important;
        background: transparent !important;
        backdrop-filter: none !important;
      }

      .navbar-collapse-custom .nav-item {
        width: auto !important;
        margin-left: 1rem !important;
        padding: 0 !important;
        background: transparent !important;
      }

      .navbar-collapse-custom .nav-link {
        padding: 0;
        border-bottom: none;
      }

      .navbar-collapse-custom .btn {
        width: auto;
        margin-top: 0;
      }

      /* On desktop brown navbar, Iziet uses white */
      .btn-outline-admin {
        color: rgba(255, 255, 255, 0.88);
        border-color: rgba(255, 255, 255, 0.7);
      }
      .btn-outline-admin:hover {
        background-color: rgba(255, 255, 255, 0.15);
        color: #fff;
        border-color: #fff;
      }

      .navbar-backdrop {
        display: none !important;
      }

      /* On desktop, admin links are white (brown navbar background) */
      .navbar-collapse-custom .nav-link-admin {
        color: rgba(255, 255, 255, 0.88) !important;
        border-bottom: none;
      }
      .navbar-collapse-custom .nav-link-admin:hover,
      .navbar-collapse-custom .nav-link-admin.active {
        color: #fff !important;
      }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  isAdmin = false;
  menuOpen = false;
  private sub?: Subscription;

  constructor(private adminState: AdminStateService) {}

  ngOnInit(): void {
    this.sub = this.adminState.isLoggedIn$.subscribe(v => (this.isAdmin = v));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.adminState.logout();
    this.closeMenu();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const navbar = document.querySelector('.navbar');
    const menu = document.querySelector('.navbar-collapse-custom');
    
    if (navbar && menu && this.menuOpen) {
      // Check if click is outside navbar and menu
      if (!navbar.contains(target) && !menu.contains(target)) {
        this.closeMenu();
      }
    }
  }
}
