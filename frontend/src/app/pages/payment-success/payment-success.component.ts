import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="payment-success-container">
      <div class="container mt-5">
        <h2>Maksājums Veiksmīgi Pabeigts</h2>
        <p class="text-muted">Payment success page will be implemented here</p>
      </div>
    </div>
  `
})
export class PaymentSuccessComponent {}
