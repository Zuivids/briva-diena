import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="contacts-container">
      <div class="container mt-5">
        <h2>Kontakti</h2>
        <p class="text-muted">Contacts page will be implemented here</p>
      </div>
    </div>
  `
})
export class ContactsComponent {}
