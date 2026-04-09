import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contacts-page">

      <!-- Header -->
      <div class="contacts-header text-center">
        <div class="container">
          <h2 class="contacts-title">Kontakti</h2>
          <div class="contacts-info">
            <p>Info tālrunis: <a href="tel:+37126382259"><strong>+371 26 382 259</strong></a></p>
            <p>E-pasts: <a href="mailto:info&#64;brivadiena.lv"><strong>info&#64;brivadiena.lv</strong></a></p>
            <h3 class="mt-4">Rekvizīti</h3>
            <p>
              <strong>SIA "Brīva diena"</strong><br>
              PVN nr.: LV123456789<br>
              Tūrisma operatora licence Nr.T-12345678<br>
              Juridiskā adrese: Rīga, Latvija
            </p>
            <p class="mt-3">Vai arī sazinies izmantojot formu zemāk:</p>
          </div>
        </div>
      </div>

      <!-- Contact Form -->
      <div class="contacts-form-section">
        <div class="container">
          <div class="form-wrapper mx-auto">
            <form (ngSubmit)="onSubmit()" #contactForm="ngForm">
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <input
                    type="text"
                    class="form-control contact-input"
                    placeholder="Vārds"
                    [(ngModel)]="formData.name"
                    name="name"
                  />
                </div>
                <div class="col-md-6">
                  <input
                    type="email"
                    class="form-control contact-input"
                    placeholder="E-pasts"
                    [(ngModel)]="formData.email"
                    name="email"
                    required
                  />
                </div>
              </div>
              <div class="mb-3">
                <input
                  type="tel"
                  class="form-control contact-input"
                  placeholder="Tālrunis"
                  [(ngModel)]="formData.phone"
                  name="phone"
                />
              </div>
              <div class="mb-3">
                <textarea
                  class="form-control contact-input"
                  rows="8"
                  placeholder="Tava ziņa"
                  [(ngModel)]="formData.message"
                  name="message"
                ></textarea>
              </div>
              <div class="text-center">
                <button type="submit" class="btn btn-submit">Nosūtīt ziņu</button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .contacts-page {
      min-height: 100vh;
      background: #fff;
    }

    .contacts-header {
      padding: 40px 0 32px;
    }

    .contacts-title {
      color: #e87722;
      font-size: 2.25rem;
      font-weight: 600;
      margin-bottom: 24px;
    }

    .contacts-info {
      max-width: 35ch;
      margin: 0 auto;
      font-size: 0.9375rem;
      line-height: 1.6;
    }

    .contacts-info a {
      color: inherit;
      text-decoration: none;
    }

    .contacts-info a:hover {
      color: #e87722;
    }

    .contacts-info h3 {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .contacts-form-section {
      padding: 0 0 80px;
    }

    .form-wrapper {
      max-width: 600px;
    }

    .contact-input {
      border: 2px solid #e0e0e0;
      border-radius: 4px;
      padding: 0.75rem 1rem;
      font-size: 0.9375rem;
      background: #fff;
      transition: border-color 0.15s;
    }

    .contact-input:focus {
      border-color: #e87722;
      box-shadow: none;
      outline: none;
    }

    textarea.contact-input {
      resize: vertical;
      min-height: 160px;
    }

    .btn-submit {
      background: #e87722;
      color: #fff;
      border: none;
      border-radius: 14px;
      padding: 12px 28px;
      font-size: 0.9375rem;
      font-weight: 500;
      transition: background 0.15s;
    }

    .btn-submit:hover {
      background: #cf6510;
      color: #fff;
    }
  `]
})
export class ContactsComponent {
  formData = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  onSubmit() {
    // Form submission handled by backend
    console.log('Contact form submitted', this.formData);
    this.formData = { name: '', email: '', phone: '', message: '' };
  }
}
