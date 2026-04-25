import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <footer class="site-footer">
      <div class="footer-inner container-fluid px-4 px-md-5">

        <!-- Divider -->
        <div class="footer-divider"></div>

        <!-- Newsletter + Email signup row -->
        <div class="footer-newsletter-row">
          <div class="footer-newsletter-text">
            <h4 class="footer-newsletter-title">Pievienojies!</h4>
            <p class="footer-newsletter-sub">Uzzini par jaunākajiem ceļojumiem un īpašiem piedāvājumiem!</p>
          </div>
          <div class="footer-email-signup">
            <form (ngSubmit)="onEmailSignup()" class="email-signup-form">
              <div class="email-signup-group">
                <label for="footer-email" class="visually-hidden">E-pasts</label>
                <input
                  id="footer-email"
                  type="email"
                  [(ngModel)]="signupEmail"
                  name="signupEmail"
                  placeholder="E-pasts"
                  autocomplete="email"
                  required
                  class="email-signup-input"
                />
                <button type="submit" class="email-signup-btn" aria-label="Pieteikties">
                  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="18" height="18">
                    <path clip-rule="evenodd" d="m11.246 5.31759c.0322-.07821.0833-.14723.1486-.20093.0654-.0537.143-.09041.2259-.10686.083-.01645.1688-.01214.2497.01257.0808.0247.1544.06902.214.12902l4.104 4.104c.0478.04765.0857.10426.1115.16659.0259.06232.0392.12913.0392.19661 0 .06747-.0133.13429-.0392.19661-.0258.06233-.0637.11893-.1115.16659l-4.104 4.10401c-.0963.0963-.227.1504-.3632.1504s-.2669-.0541-.3632-.1504-.1504-.227-.1504-.3632.0541-.2669.1504-.3632l3.2288-3.2278h-11.0736c-.13606 0-.26654-.0541-.36275-.15027-.0962-.0962-.15025-.22669-.15025-.36274 0-.13606.05405-.26654.15025-.36275.09621-.0962.22669-.15025.36275-.15025h11.0736l-3.2288-3.2278c-.0721-.07178-.1212-.16335-.1411-.2631s-.0097-.20316.0293-.2971z" fill="currentColor" fill-rule="evenodd"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Contact info row -->
        <div class="footer-contact-row">
          <div class="footer-contact-item">
            <span class="footer-contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" width="18" height="18">
                <path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                  d="M6.033 3.5c-.2.533-.333 1.1-.333 1.667 0 .566.1 1.1.3 1.6L4.633 8.133A8.567 8.567 0 0 0 11.867 15.4l1.366-1.366c.5.2 1.034.3 1.6.3.567 0 1.134-.133 1.667-.333v3.3c0 .367-.3.666-.667.666C7.8 18 2 12.2 2 5c0-.367.3-.667.667-.667h3.3c-.034.034 0 .034.066.167Z"/>
              </svg>
            </span>
            <a href="tel:+37126382259" class="footer-contact-link">+371 12345678</a>
          </div>
          <div class="footer-contact-item">
            <span class="footer-contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" width="18" height="18">
                <path stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"
                  d="M2.5 5.5h15v10h-15z"/>
                <path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                  d="m2.5 5.5 7.5 5.5 7.5-5.5"/>
              </svg>
            </span>
            <a href="mailto:info&#64;brivadiena.lv" class="footer-contact-link">info&#64;brivadiena.lv</a>
          </div>

          <!-- Footer nav links -->
          <div class="footer-nav-links">
            <a routerLink="/faq" class="footer-nav-link">BUJ</a>
            <a routerLink="/about" class="footer-nav-link">Par mums</a>
            <a routerLink="/contacts" class="footer-nav-link">Kontakti</a>
          </div>
        </div>

        <!-- Bottom bar -->
        <div class="footer-bottom">
          <div class="footer-bottom-left">
            <span class="footer-copyright">&#169; 2026 <a routerLink="/">Brīva diena</a></span>
            <a routerLink="/policies/privacy-policy" class="footer-policy-link">Privātuma politika</a>
            <span class="footer-designedBy">Izstrādāja
              <a href="https://www.linkedin.com/in/m%C4%81rti%C5%86%C5%A1-%C5%BEaimis-0a9b21394" target="_blank" rel="noopener noreferrer" class="footer-designedBy-link">
                <svg class="footer-linkedin-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="13" height="13" aria-hidden="true">
                  <path d="M17 2H3a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1ZM6.94 15.5H4.56V8h2.38v7.5ZM5.75 6.965a1.378 1.378 0 1 1 0-2.756 1.378 1.378 0 0 1 0 2.756ZM15.5 15.5h-2.38v-3.647c0-.87-.016-1.988-1.212-1.988-1.213 0-1.399.948-1.399 1.927V15.5H8.13V8h2.284v1.023h.031c.318-.602 1.094-1.236 2.252-1.236 2.41 0 2.854 1.587 2.854 3.648L15.5 15.5Z"/>
                </svg>
                Mārtiņš Žaimis
              </a>
            </span>
          </div>
          <div class="footer-bottom-right">
            <!-- Facebook -->
            <a href="https://www.facebook.com/share/18j47Z1B7r/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="footer-social-link">
              <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 10.049C18 5.603 14.419 2 10 2c-4.419 0-8 3.603-8 8.049C2 14.067 4.925 17.396 8.75 18v-5.624H6.719v-2.328h2.03V8.275c0-2.017 1.195-3.132 3.023-3.132.874 0 1.79.158 1.79.158v1.98h-1.009c-.994 0-1.303.621-1.303 1.258v1.51h2.219l-.355 2.326H11.25V18c3.825-.604 6.75-3.933 6.75-7.951Z"/>
              </svg>
            </a>
            <!-- Instagram -->
            <a href="https://www.instagram.com/briva.diena/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="footer-social-link">
              <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M13.23 3.492c-.84-.037-1.096-.046-3.23-.046-2.144 0-2.39.01-3.238.055-.776.027-1.195.164-1.487.273a2.43 2.43 0 0 0-.912.593 2.486 2.486 0 0 0-.602.922c-.11.282-.238.702-.274 1.486-.046.84-.046 1.095-.046 3.23 0 2.134.01 2.39.046 3.229.004.51.097 1.016.274 1.495.145.365.319.639.602.913.282.282.538.456.92.602.474.176.974.268 1.479.273.848.046 1.103.046 3.238.046 2.134 0 2.39-.01 3.23-.046.784-.036 1.203-.164 1.486-.273.374-.146.648-.329.921-.602.283-.283.447-.548.602-.922.177-.476.27-.979.274-1.486.037-.84.046-1.095.046-3.23 0-2.134-.01-2.39-.055-3.229-.027-.784-.164-1.204-.274-1.495a2.43 2.43 0 0 0-.593-.913 2.604 2.604 0 0 0-.92-.602c-.284-.11-.703-.237-1.488-.273ZM6.697 2.05c.857-.036 1.131-.045 3.302-.045 1.1-.014 2.202.001 3.302.045.664.014 1.321.14 1.943.374a3.968 3.968 0 0 1 1.414.922c.41.397.728.88.93 1.414.23.622.354 1.279.365 1.942C18 7.56 18 7.824 18 10.005c0 2.17-.01 2.444-.046 3.292-.036.858-.173 1.442-.374 1.943-.2.53-.474.976-.92 1.423a3.896 3.896 0 0 1-1.415.922c-.51.191-1.095.337-1.943.374-.857.036-1.122.045-3.302.045-2.171 0-2.445-.009-3.302-.055-.849-.027-1.432-.164-1.943-.364a4.152 4.152 0 0 1-1.414-.922 4.128 4.128 0 0 1-.93-1.423c-.183-.51-.329-1.085-.365-1.943C2.009 12.45 2 12.167 2 10.004c0-2.161 0-2.435.055-3.302.027-.848.164-1.432.365-1.942a4.44 4.44 0 0 1 .92-1.414 4.18 4.18 0 0 1 1.415-.93c.51-.183 1.094-.33 1.943-.366Zm.427 4.806a4.105 4.105 0 1 1 5.805 5.805 4.105 4.105 0 0 1-5.805-5.805Zm1.882 5.371a2.668 2.668 0 1 0 2.042-4.93 2.668 2.668 0 0 0-2.042 4.93Zm5.922-5.942a.958.958 0 1 1-1.355-1.355.958.958 0 0 1 1.355 1.355Z" clip-rule="evenodd"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  `,
  styles: [`
    .site-footer {
      background: #fff;
      border-top: 1px solid #e8e8e8;
      padding-top: 20px;
      padding-bottom: 40px;
    }

    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Divider */
    .footer-divider {
      width: 100%;
      height: 1px;
      background: #e8e8e8;
      margin-bottom: 32px;
    }

    /* Newsletter row */
    .footer-newsletter-row {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 32px;
    }

    .footer-newsletter-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 8px;
    }

    .footer-newsletter-sub {
      font-size: 0.875rem;
      color: #555;
      margin: 0;
    }

    .footer-email-signup {
      flex: 0 0 auto;
      width: 100%;
      max-width: 360px;
    }

    .email-signup-group {
      display: flex;
      align-items: center;
      border: 1px solid #ccc;
      border-radius: 39px;
      overflow: hidden;
      background: #fff;
    }

    .email-signup-input {
      flex: 1;
      border: none;
      outline: none;
      padding: 10px 16px;
      font-size: 0.875rem;
      background: transparent;
    }

    .email-signup-btn {
      background: none;
      border: none;
      padding: 10px 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      color: #000;
      transition: color 0.15s;
    }

    .email-signup-btn:hover {
      color: #e87722;
    }

    /* Contact row */
    .footer-contact-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 24px;
      margin-bottom: 20px;
    }

    .footer-contact-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .footer-contact-icon {
      color: #555;
      display: flex;
      align-items: center;
    }

    .footer-contact-link {
      font-size: 0.9375rem;
      color: #555;
      text-decoration: none;
    }

    .footer-contact-link:hover {
      color: #e87722;
    }

    .footer-nav-links {
      display: flex;
      gap: 20px;
      margin-left: auto;
    }

    .footer-nav-link {
      font-size: 0.875rem;
      color: #333;
      text-decoration: none;
    }

    .footer-nav-link:hover {
      color: #e87722;
    }

    /* Bottom bar */
    .footer-bottom {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-top: 1px solid #e8e8e8;
      padding-top: 12px;
    }

    .footer-bottom-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .footer-copyright {
      font-size: 0.75rem;
      color: #555;
    }

    .footer-copyright a {
      color: inherit;
      text-decoration: none;
    }

    .footer-policy-link {
      font-size: 0.75rem;
      color: #555;
      text-decoration: none;
    }

    .footer-policy-link:hover {
      color: #e87722;
    }

    .footer-designedBy {
      font-size: 0.75rem;
      color: #888;
    }

    .footer-designedBy-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #555;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.15s;
    }

    .footer-designedBy-link:hover {
      color: #0a66c2;
    }

    .footer-linkedin-icon {
      vertical-align: middle;
      flex-shrink: 0;
    }

    .footer-bottom-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .footer-social-link {
      color: #333;
      display: flex;
      align-items: center;
      transition: color 0.15s;
    }

    .footer-social-link:hover {
      color: #e87722;
    }

    @media (max-width: 768px) {
      .footer-newsletter-row {
        flex-direction: column;
        align-items: flex-start;
      }

      .footer-email-signup {
        max-width: 100%;
        width: 100%;
      }

      .footer-nav-links {
        margin-left: 0;
        flex-wrap: wrap;
      }
    }
  `]
})
export class FooterComponent {
  signupEmail = '';

  onEmailSignup() {
    // Newsletter signup handled by backend
    console.log('Newsletter signup:', this.signupEmail);
    this.signupEmail = '';
  }
}
