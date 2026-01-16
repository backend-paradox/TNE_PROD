// Chatbot Types

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  action?: string;
  data?: ChatMessageData;
}

// Quick reply button with display text and action value
export interface QuickReply {
  text: string;
  value: string;
}

export interface ChatMessageData {
  packages?: Package[];
  destinations?: Destination[];
  package?: PackageDetails;
  booking?: BookingSummary;
  suggestions?: string[];
  quick_replies?: QuickReply[];  // Structured quick replies with text/value
  source?: string;
  // Booking flow flags
  payment_required?: boolean;
  expert_callback?: boolean;
  callbackRequested?: boolean;
  status?: string;
}

export interface Package {
  package_id: string;
  title: string;
  destination: string;
  duration: string;
  price: number;
  discount_price: number | null;
  highlights: string[];
  image_url: string | null;
  rating: number;
  review_count: number;
  trip_type: string;
  featured: boolean;
}

export interface PackageDetails extends Package {
  description: string;
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  min_travelers: number;
  max_travelers: number;
  availability: number;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

export interface Destination {
  id: number;
  name: string;
  slug: string;
  country: string;
  state: string | null;
  description: string | null;
  image_url: string | null;
  highlights: string[];
  best_time: string | null;
  package_count: number;
}

export interface BookingSummary {
  packageId: string;
  packageTitle: string;
  destination: string;
  travelDate: string;
  travelers: {
    total: number;
    adults?: number;
    children?: number;
  };
  pricePerPerson: number;
  totalPrice: number;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface ConversationContext {
  currentStep: string;
  destination: string | null;
  travelDate: string | null;
  travelers: {
    total: number;
    adults?: number;
    children?: number;
  } | null;
  tripType: string | null;
  budget: {
    min?: number;
    max?: number;
  } | null;
  selectedPackageId: string | null;
  selectedPackage: {
    packageId: string;
    title: string;
    price: number;
    discountPrice?: number;
  } | null;
  contact: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
}

export interface ChatbotResponse {
  status: 'success' | 'incomplete' | 'error';
  action: string;
  message: string;
  data?: ChatMessageData;
  context?: ConversationContext;
  next_prompt?: string;
  missing_fields?: string[];
  session_id: string;
  timestamp: string;
  code?: string;
  retry?: boolean;
}

export interface ChatbotState {
  sessionId: string | null;
  messages: ChatMessage[];
  context: ConversationContext | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export const ACTION_TYPES = {
  SHOW_MESSAGE: 'show_message',
  SHOW_PACKAGES: 'show_packages',
  SHOW_DESTINATIONS: 'show_destinations',
  SHOW_PACKAGE_DETAILS: 'show_package_details',
  REQUEST_INPUT: 'request_user_input',
  CONFIRM_BOOKING: 'confirm_booking',
  BOOKING_INITIATED: 'booking_initiated',
  ERROR: 'error'
} as const;
