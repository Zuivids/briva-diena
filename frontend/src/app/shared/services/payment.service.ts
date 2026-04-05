import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Registration } from '../models/registration.model';
import { Payment, PaymentIntent } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8080/api';
  private registrationsUrl = `${this.apiUrl}/registrations`;
  private paymentsUrl = `${this.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new registration
   */
  createRegistration(registration: Registration): Observable<Registration> {
    return this.http.post<Registration>(this.registrationsUrl, registration);
  }

  /**
   * Get registration details
   */
  getRegistration(registrationId: string): Observable<Registration> {
    return this.http.get<Registration>(`${this.registrationsUrl}/${registrationId}`);
  }

  /**
   * Create a payment intent for Stripe
   */
  createPaymentIntent(registrationId: string, amount: number): Observable<PaymentIntent> {
    return this.http.post<PaymentIntent>(`${this.paymentsUrl}/create-intent`, {
      registrationId,
      amount
    });
  }

  /**
   * Confirm a payment after Stripe checkout
   */
  confirmPayment(registrationId: string, paymentIntentId: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.paymentsUrl}/confirm`, {
      registrationId,
      paymentIntentId
    });
  }

  /**
   * Get payment details
   */
  getPayment(paymentId: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.paymentsUrl}/${paymentId}`);
  }

  /**
   * Create a Stripe Checkout session
   */
  createCheckoutSession(registrationId: string, amount: number): Observable<{ sessionId: string; url: string }> {
    return this.http.post<{ sessionId: string; url: string }>(`${this.paymentsUrl}/checkout-session`, {
      registrationId,
      amount
    });
  }

  /**
   * Get payment status
   */
  getPaymentStatus(paymentId: string): Observable<{ status: string; amount: number }> {
    return this.http.get<{ status: string; amount: number }>(`${this.paymentsUrl}/${paymentId}/status`);
  }
}
