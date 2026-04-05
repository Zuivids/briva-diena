import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div class="container">
        <a class="navbar-brand fw-bold fs-5" routerLink="/">
          🌍 Brīva diena
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
          <ul class="navbar-nav ms-auto">
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
            <li class="nav-item ms-2">
              <a 
                class="nav-link btn btn-outline-primary btn-sm px-3" 
                routerLink="/admin/login">
                Admin
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav-link.active {
      color: #0d6efd !important;
      font-weight: 500;
    }
    
    .navbar-brand {
      color: #0d6efd !important;
    }
  `]
})
export class NavbarComponent {}
