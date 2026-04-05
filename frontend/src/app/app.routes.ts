import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'trips',
    loadComponent: () => import('./pages/trips/trips.component').then(m => m.TripsComponent)
  },
  {
    path: 'trip/:id',
    loadComponent: () => import('./pages/trip-detail/trip-detail.component').then(m => m.TripDetailComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'contacts',
    loadComponent: () => import('./pages/contacts/contacts.component').then(m => m.ContactsComponent)
  },
  {
    path: 'reviews',
    loadComponent: () => import('./pages/reviews/reviews.component').then(m => m.ReviewsComponent)
  },
  {
    path: 'faq',
    loadComponent: () => import('./pages/faq/faq.component').then(m => m.FAQComponent)
  },
  {
    path: 'registration/:tripId',
    loadComponent: () => import('./pages/registration/registration.component').then(m => m.RegistrationComponent)
  },
  {
    path: 'payment/:registrationId',
    loadComponent: () => import('./pages/payment/payment.component').then(m => m.PaymentComponent)
  },
  {
    path: 'payment-success/:paymentId',
    loadComponent: () => import('./pages/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent)
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./admin/login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'admin/trips',
    loadComponent: () => import('./admin/trip-management/trip-management.component').then(m => m.TripManagementComponent)
  }
];
