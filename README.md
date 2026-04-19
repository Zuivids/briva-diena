# briva-diena

Brivadiena.lv — roadmap and implementation checklist for a travel-agency website.

This repository will host a travel agency web application with:

- Angular frontend (responsive, single-page) showing a full-viewport, multi-image background slideshow
- Java Spring Boot backend (REST API) serving trips, images, and handling orders
- Secure payment processing (Stripe recommended) so customers can buy trips without creating accounts
- Transactional email delivery of tickets/confirmations after successful payment

Goals and constraints

- No user accounts required: purchases are tied only to an email address supplied at checkout.
- Images are stored in a database / object store and served to the frontend for the dynamic background.
- PCI scope minimized by using a hosted payment flow or client-side Elements; card data must never be stored on our servers.

Mini contract (inputs / outputs / success criteria)

- Inputs: trip catalog and images (admin-provided), buyer email and payment details (buyer-provided at checkout)
- Outputs: order record, payment confirmation, transactional email with booking details (and optional attachment)
- Success criteria: buyer can browse trips, purchase a trip securely, and receive an email confirmation; images rotate in the background.

High-level architecture

- Frontend: Angular app that fetches trips and image lists from the backend. Uses Stripe Checkout or Stripe Elements for payments.
- Backend: Spring Boot REST API (Java 17+) with endpoints for trips, images, orders, and webhook endpoints for payment events.
- Database: PostgreSQL for structured data; image metadata in DB, image files in cloud object storage (S3/compatible) or local filesystem for dev.
- Email: SendGrid / Mailgun / SMTP for transactional emails.

Actionable todo list

1. Create README roadmap (this file) — done
2. Initialize backend — create Spring Boot app skeleton, REST endpoints, build config
3. Design database — tables for trips, trip_images, orders, payments; migrations using Flyway or Liquibase
4. Image storage & serving — uploads, metadata, endpoint for background images (pre-signed URLs if using S3)
5. Payment integration — implement Stripe Checkout/Elements, server-side payment intents, and webhook handler
6. Email delivery — integrate SendGrid/Mailgun; send confirmation after payment
7. Frontend (Angular) — landing page with background slideshow, trip list, purchase flow (collect email)
8. Testing & CI — unit, integration, and e2e tests; GitHub Actions to build and test
9. Deployment & infra — Dockerfiles, deployments, secrets management, backups
10. Docs & next steps — developer setup guide, API docs (OpenAPI), admin usage

Detailed implementation steps (recommended)

Backend (Spring Boot)

- Create a Spring Boot project (start.spring.io) with: Web, Data JPA, PostgreSQL driver, Flyway (or Liquibase), Mail, and optionally Security for admin endpoints.
- Expose REST endpoints:
  - GET /api/trips — list trips with minimal metadata
  - GET /api/trips/{id} — trip detail including price and image IDs
  - GET /api/images/background — list of background image URLs (or pre-signed URLs)
  - POST /api/orders — create an order (creates a payment intent with Stripe and returns client secret or checkout session URL)
  - POST /api/webhooks/stripe — handle payment events (payment_intent.succeeded or checkout.session.completed) to mark order paid and send email
- Use DTOs and map entities to avoid leaking internal fields. Validate inputs (email format, trip id exists).

Database & images

- Schema sketch:
  - trips(id, title, description, price_cents, currency, created_at)
  - trip_images(id, trip_id, path_or_key, caption, is_background, sort_order)
  - orders(id, trip_id, buyer_email, amount_cents, currency, status, payment_id, created_at)
  - payments(id, order_id, provider, provider_payment_id, status, received_at)
- Store files in S3 (preferred) or local storage in dev. Keep only metadata in DB. If using S3, backend can produce pre-signed upload URLs for an admin panel.

Payment processing (security notes)

- Recommended: Stripe. Two safe approaches:
  1.  Stripe Checkout: server creates a Checkout Session and returns the session URL; Stripe hosts the payment page (simplest, least PCI scope).
  2.  Stripe Elements + Payment Intents: keep card entry in Stripe Elements on the frontend and create PaymentIntent server-side—recommended if you want a custom checkout UI.
- Always keep secret keys out of source code; use environment variables and secrets manager. Verify webhooks using Stripe's signing secret.

Email delivery

- Use SendGrid or another transactional email provider. After payment confirmed by webhook, backend generates and sends a booking email to buyer_email. Optionally attach a PDF ticket (use iText or OpenPDF) or include booking details inline.

Frontend (Angular)

- Create Angular workspace with Angular CLI.
- Components/pages:
  - Home: full-viewport background slideshow (use Angular animations or a lightweight carousel library). Fetch images from /api/images/background.
  - Trips: grid/list of trips
  - Trip detail modal: details and Buy button
  - Checkout: collects buyer email and triggers payment flow (redirect to Stripe Checkout or use Elements + PaymentIntent)
  - Success page: shows order reference and indicates that confirmation was emailed
- Keep the background image loader efficient: preload low-res images first, lazy-load full-res, and cache URLs.

Dev & run (quick local suggestions)

- Backend (Spring Boot via Maven):
  - Set env vars: DATABASE_URL, STRIPE_SECRET, STRIPE_WEBHOOK_SECRET, SENDGRID_API_KEY
  - Run: mvn spring-boot:run
- Frontend (Angular):
  - Install Angular CLI: npm i -g @angular/cli
  - In frontend directory: npm install
  - Run: ng serve --host 0.0.0.0 --port 4200

Recommended libraries and tools

- Backend: Spring Boot, Spring Data JPA, Flyway, Jackson, Stripe Java SDK, SendGrid Java SDK
- Frontend: Angular, Angular Router, HttpClient, Stripe.js, ngx-owl-carousel (or homegrown lightweight slider)
- DB: PostgreSQL
- Devops: Docker, GitHub Actions, AWS S3 (or MinIO locally) for images

Edge cases & testing

- Empty image sets: provide a fallback background image
- Payment failures and retries: handle declined cards and network issues; send failure emails to admin if payments inconsistent
- Duplicate webhook events: idempotency keys for order updates
- Missing emails or malformed addresses: validate and fail-safe UX

Next steps (practical first tasks you can do now)

1. Initialize a Git repo structure with two folders: `backend/` (Spring Boot) and `frontend/` (Angular). Add .gitignore, LICENSE, and basic README (this file).
2. Bootstrap Spring Boot via start.spring.io and commit skeleton to `backend/`.
3. Scaffold Angular app in `frontend/` and implement the Home background component to consume `/api/images/background`.

If you'd like, I can scaffold the initial `backend` and `frontend` projects, create example endpoints for trips and images, and wire a Stripe test flow. Tell me which step to start and any preferences (Maven or Gradle, cloud provider for images, Stripe vs another payments provider).

Completion summary

- This README now contains a complete roadmap and step-by-step plan to build the Angular + Spring Boot travel site with secure payments and email confirmations. The task checklist was also recorded in the workspace todo tracker so we can mark progress.
