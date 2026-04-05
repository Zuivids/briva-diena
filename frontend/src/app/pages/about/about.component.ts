import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="about-container">
      <div class="container mt-5">
        <h2>Par Brīva diena</h2>
        <p class="text-muted">About page will be implemented here</p>
      </div>
    </div>
  `
})
export class AboutComponent {}
