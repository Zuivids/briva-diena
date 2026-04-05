export interface Payment {
  id: string;
  registrationId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  stripeSessionId?: string;
  createdAt: Date;
}

export interface PaymentIntent {
  clientSecret: string;
  publishableKey: string;
}
