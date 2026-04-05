export interface Registration {
  id?: string;
  tripId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  personalId?: string; // Personas kods (optional)
  passportNumber?: string;
  passportExpiryDate?: Date;
  createdAt?: Date;
}
