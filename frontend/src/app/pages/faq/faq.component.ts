import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="faq-container">
      <div class="container mt-5">
        <h2>BUJ (Biežāk Uzdotie Jautājumi)</h2>
        <p class="text-muted">FAQ page will be implemented here</p>
      </div>
    </div>
  `
})
export class FAQComponent {}
