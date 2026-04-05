import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="payment-container">
      <div class="container mt-5">
        <h2>Maksājums</h2>
        <p class="text-muted">Payment page will be implemented here</p>
      </div>
    </div>
  `
})
export class PaymentComponent {}
