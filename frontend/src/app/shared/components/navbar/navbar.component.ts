import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light border-bottom fixed-top" style="background-color: rgba(255,255,255,0.5); backdrop-filter: blur(6px);">
      <div class="container">
        <a class="navbar-brand fw-bold fs-5" routerLink="/">
          <img src="logo.png" alt="logo" height="40" />
          <span class="brand-name">Brīva diena</span>
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto align-items-center gap-1">
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/trips"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: false }">
                Ceļojumi
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/about"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: false }">
                Par Brīva diena
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/contacts"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: false }">
                Kontakti
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/reviews"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: false }">
                Atsauksmes
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/faq"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: false }">
                BUJ
              </a>
            </li>

            <!-- Pieteikties button — navigates to trips so user can pick a trip -->
            <li class="nav-item ms-1">
              <a class="btn btn-register" routerLink="/trips">
                Pieteikties
              </a>
            </li>

            <!-- Admin icon-only button -->
            <li class="nav-item ms-1">
              <a class="btn btn-admin-icon" routerLink="/admin/login" title="Admin pieslēgšanās" aria-label="Admin pieslēgšanās">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.029 10 8 10c-2.029 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav-link {
      color: #444;
      font-weight: 400;
      transition: color 0.2s;
    }

    .nav-link:hover,
    .nav-link.active {
      color: #e87722 !important;
      font-weight: 500;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-name {
      color: #e87722;
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
      border: 1.5px solid #ccc;
      border-radius: 50%;
      color: #666;
      background: transparent;
      text-decoration: none;
      transition: border-color 0.2s, color 0.2s;
    }

    .btn-admin-icon:hover {
      border-color: #e87722;
      color: #e87722;
    }
  `]
})
export class NavbarComponent {}
