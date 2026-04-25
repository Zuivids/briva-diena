export interface Trip {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  priceCents: number;
  currency: string;
  availableSpots: number;
  landingSection?: string;
  images?: string[];
  createdAt?: string;
  transportationType?: string;
  accommodation?: string;
  airlineCompany?: string;
  includedBaggageSize?: string;
  groupSize?: number;
  priceIncluded?: string;
  extraCharge?: string;
  itineraryJson?: string;
  flightScheduleJson?: string;
  paymentInfo?: string;
  tripDurationDays?: number;
  hidden?: boolean;
}

export interface TripDay {
  dayNumber: number;
  date: string;
  description: string;
  imagePath?: string | null;
}

export interface TripFilter {
  month?: number;
  durationDays?: string;
  maxPrice?: number;
}
