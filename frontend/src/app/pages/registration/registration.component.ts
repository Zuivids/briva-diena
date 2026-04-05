import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="registration-container">
      <div class="container mt-5">
        <h2>Pieteikšanās ceļojumam</h2>
        <p class="text-muted">Registration form will be implemented here</p>
      </div>
    </div>
  `
})
export class RegistrationComponent {}
