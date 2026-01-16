// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

// User Profile from user-service
export interface UserProfile {
  id: number;
  authId: number;
  name: string;
  email: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  dateOfBirth?: string;
  profilePicUrl?: string;
  bio?: string | null;
  languages?: string[];
  nationality?: string | null;
  passportCountry?: string | null;
  travelStyle?: 'BUDGET' | 'MID_RANGE' | 'LUXURY' | 'BACKPACKER';
  interests?: string[];
  occupation?: string | null;
  socialLinks?: {
    instagram?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
    facebook?: string | null;
  };
  visitedCities?: string[];
  totalTrips?: number;
  totalCountries?: number;
  totalCities?: number;
  totalReviews?: number;
  rating?: number;
  isVerified?: boolean;
  emergencyContact?: EmergencyContact;
  preferences?: UserPreferences;
  addresses?: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  name?: string;
  phone?: string;
  relationship?: string;
}

export interface UserPreferences {
  notifications?: boolean;
  newsletter?: boolean;
  travelStyles?: string[];
}

// Extended Travel Preferences
export interface TravelPreferences {
  // Airline preferences
  preferredAirlines?: string[];
  seatPreference?: 'WINDOW' | 'AISLE' | 'MIDDLE';
  classPreference?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

  // Meal preferences
  mealPreference?: 'VEGETARIAN' | 'NON_VEGETARIAN' | 'VEGAN' | 'HALAL' | 'KOSHER' | 'NONE';
  dietaryRestrictions?: string[];

  // Accommodation preferences
  hotelPreferences?: {
    starRating?: number;
    roomType?: 'SINGLE' | 'DOUBLE' | 'SUITE';
    smoking?: boolean;
    floor?: 'LOW' | 'HIGH' | 'NO_PREFERENCE';
  };

  // Notification preferences
  notifications?: boolean;
  newsletter?: boolean;

  // Travel styles
  travelStyles?: string[];
}

// KYC Types
export type KYCDocumentType = 'AADHAAR' | 'PAN' | 'PASSPORT' | 'DRIVING_LICENSE' | 'VOTER_ID';
export type KYCDocumentStatus = 'SUBMITTED' | 'VERIFIED' | 'REJECTED' | 'PENDING';

export interface KYCDocument {
  id: number;
  documentType: KYCDocumentType;
  documentNumber: string;
  documentName?: string;
  frontImageUrl: string;
  backImageUrl?: string;
  status: KYCDocumentStatus;
  expiryDate?: string;
  submittedAt: string;
  verifiedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface KYCStatus {
  isComplete: boolean;
  verified: number;
  pending: number;
  rejected: number;
  total: number;
  documents: Array<{
    type: string;
    status: string;
    submittedAt: string;
    verifiedAt?: string;
  }>;
}

export interface KYCSubmitData {
  documentType: KYCDocumentType;
  documentNumber: string;
  documentName?: string;
  frontImageUrl: string;
  backImageUrl?: string;
  expiryDate?: string;
}

// Login History Types
export interface LoginHistoryItem {
  id: number;
  userId: number;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface LoginHistoryResponse {
  history: LoginHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Address {
  id: number;
  type: 'HOME' | 'WORK' | 'OTHER';
  label?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isDefault: boolean;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  dateOfBirth?: string;
  profilePicUrl?: string;
  bio?: string | null;
  languages?: string[];
  nationality?: string | null;
  passportCountry?: string | null;
  travelStyle?: 'BUDGET' | 'MID_RANGE' | 'LUXURY' | 'BACKPACKER';
  interests?: string[];
  occupation?: string | null;
  socialLinks?: {
    instagram?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
    facebook?: string | null;
  };
  emergencyContact?: EmergencyContact;
  preferences?: UserPreferences;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Trip Types
export interface Trip {
  id: string;
  title: string;
  slug: string;
  destination: string;
  country: string;
  images: string[];
  thumbnail: string;
  duration: {
    days: number;
    nights: number;
  };
  price: {
    adult: number;
    child: number;
    infant: number;
    originalPrice?: number;
    discount?: number;
  };
  rating?: number;
  reviewCount?: number;
  category: TripCategory;
  tripType: TripType[];
  highlights: string[];
  description: string;
  shortDescription: string;
  overview: string;
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  startDates: string[];
  maxGroupSize: number;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  bestSeason: string;
  cancellationPolicy: string;
  featured: boolean;
  popular: boolean;
  isPopular: boolean;
  newArrival: boolean;
  tags: string[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: ('Breakfast' | 'Lunch' | 'Dinner')[];
  accommodation?: string;
  transferInfo?: string;
}

export type TripCategory = 
  | 'Domestic'
  | 'International'
  | 'Beach'
  | 'Mountain'
  | 'Adventure'
  | 'Honeymoon'
  | 'Family'
  | 'Group'
  | 'Luxury'
  | 'Budget'
  | 'beach'
  | 'mountain'
  | 'adventure'
  | 'cultural'
  | 'wildlife'
  | 'pilgrimage'
  | 'honeymoon'
  | 'family'
  | 'luxury'
  | 'budget';

export type TripType = 
  | 'Beach'
  | 'Mountain'
  | 'Cultural'
  | 'Adventure'
  | 'Wildlife'
  | 'Romantic'
  | 'Pilgrimage'
  | 'Wellness';

// Search & Filter Types
export interface SearchFilters {
  destination: string;
  startDate: string | null;
  endDate: string | null;
  travelers: {
    adults: number;
    children: number;
    infants: number;
  };
  priceRange: [number, number];
  duration: [number, number];
  categories: TripCategory[];
  tripTypes: TripType[];
  rating: number | null;
  sortBy: SortOption;
}

export type SortOption = 
  | 'recommended'
  | 'price-low'
  | 'price-high'
  | 'price_low'
  | 'price_high'
  | 'rating'
  | 'duration-short'
  | 'duration-long'
  | 'duration_short'
  | 'duration_long'
  | 'popularity';

// Booking Types
export interface Traveler {
  id: string;
  type: 'adult' | 'child' | 'infant';
  title?: 'Mr' | 'Mrs' | 'Ms' | 'Master' | 'Miss';
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  nationality: string;
  idType?: 'aadhar' | 'passport' | 'driving_license' | 'voter_id';
  idNumber?: string;
  passportNumber?: string;
  passportExpiry?: string;
  specialRequests?: string;
  specialRequirements?: string;
}

export interface BookingContact {
  name?: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface Booking {
  id: string;
  tripId: string;
  trip: Trip;
  userId: string;
  travelers: Traveler[];
  contact: BookingContact;
  travelDate: string;
  totalTravelers: {
    adults: number;
    children: number;
    infants: number;
  };
  pricing: BookingPricing;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  specialRequests?: string;
}

export interface BookingPricing {
  basePrice: number;
  adultTotal: number;
  childTotal: number;
  infantTotal: number;
  subtotal: number;
  taxes: number;
  serviceFee: number;
  discount: number;
  promoCode?: string;
  total: number;
}

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'refunded';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

// Review Types
export interface Review {
  id: string;
  tripId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  travelDate: string;
  createdAt: string;
  helpful: number;
  images?: string[];
}

// Notification Types
export interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'offer' | 'reminder' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
