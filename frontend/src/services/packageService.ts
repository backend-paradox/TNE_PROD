import axiosInstance from '@/app/axios';

// ==================== TYPES ====================

export interface TourPackage {
  id: string;
  packageId: string;
  slug: string;
  name: string;
  destination: string;
  state: string;
  country: string;
  category: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  duration: string;
  startingPrice: number;
  priceType: string;
  bestSeason: string | null;
  difficulty: string;
  maxGroupSize: number;
  tags: string[];
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  faqs: FAQ[];
  rating: number;
  reviewCount: number;
  trending: boolean;
  popular: boolean;
  isActive: boolean;
  imageUrl: string;
  galleryImages: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  // New fields for simplified database
  visaRequired: boolean;
  continent: string | null;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface CineTripPackage {
  id: string;
  packageId: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string | null;
  image: string;
  price: number;
  priceDisplay: string;
  duration: string;
  category: string;
  features: string[];
  deliveryTime: string | null;
  popular: boolean;
  featured: boolean;
  isActive: boolean;
  sortOrder: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CineTripReview {
  id: string;
  packageId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  helpful: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TourReview {
  id: string;
  packageId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  helpful: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  starDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface CreateReviewData {
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  verified?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

// ==================== TOUR PACKAGES API ====================

const TOUR_API_BASE = '/tour-packages';

export const tourPackagesAPI = {
  /**
   * Get all tour packages with optional filters
   */
  getAll: async (filters?: {
    category?: string;
    country?: string;
    trending?: boolean;
    popular?: boolean;
    tags?: string[];
  }): Promise<TourPackage[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.country) params.append('country', filters.country);
    if (filters?.trending !== undefined) params.append('trending', String(filters.trending));
    if (filters?.popular !== undefined) params.append('popular', String(filters.popular));
    if (filters?.tags) filters.tags.forEach(tag => params.append('tags', tag));

    const response = await axiosInstance.get(`${TOUR_API_BASE}?${params.toString()}`);
    return response.data.data || response.data;
  },

  /**
   * Get package by slug (for detail page)
   */
  getBySlug: async (slug: string): Promise<TourPackage | null> => {
    try {
      const response = await axiosInstance.get(`${TOUR_API_BASE}/${slug}`);
      return response.data.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  /**
   * Get trending packages (for homepage)
   */
  getTrending: async (limit: number = 4): Promise<TourPackage[]> => {
    const response = await axiosInstance.get(`${TOUR_API_BASE}/trending?limit=${limit}`);
    return response.data.data || response.data;
  },

  /**
   * Get popular packages
   */
  getPopular: async (limit: number = 8): Promise<TourPackage[]> => {
    const response = await axiosInstance.get(`${TOUR_API_BASE}/popular?limit=${limit}`);
    return response.data.data || response.data;
  },

  /**
   * Get domestic packages (India)
   */
  getDomestic: async (limit?: number): Promise<TourPackage[]> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await axiosInstance.get(`${TOUR_API_BASE}/domestic${params}`);
    return response.data.data || response.data;
  },

  /**
   * Get international packages
   */
  getInternational: async (limit?: number): Promise<TourPackage[]> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await axiosInstance.get(`${TOUR_API_BASE}/international${params}`);
    return response.data.data || response.data;
  },

  /**
   * Get packages by tags (e.g., visa-free, honeymoon)
   */
  getByTags: async (tags: string | string[]): Promise<TourPackage[]> => {
    const tagString = Array.isArray(tags) ? tags.join(',') : tags;
    const response = await axiosInstance.get(`${TOUR_API_BASE}/by-tags/${tagString}`);
    return response.data.data || response.data;
  },

  /**
   * Get visa-free international packages
   */
  getVisaFree: async (limit: number = 8): Promise<TourPackage[]> => {
    const response = await axiosInstance.get(`${TOUR_API_BASE}/visa-free?limit=${limit}`);
    return response.data.data || response.data;
  },

  /**
   * Get packages by continent (Asia, Europe, Middle East, Africa, Oceania)
   */
  getByContinent: async (continent: string, limit?: number): Promise<TourPackage[]> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await axiosInstance.get(`${TOUR_API_BASE}/by-continent/${continent}${params}`);
    return response.data.data || response.data;
  },

  /**
   * Get packages by duration range
   */
  getByDuration: async (minDays: number = 1, maxDays: number = 99, limit?: number): Promise<TourPackage[]> => {
    const params = new URLSearchParams();
    params.append('min', String(minDays));
    params.append('max', String(maxDays));
    if (limit) params.append('limit', String(limit));
    const response = await axiosInstance.get(`${TOUR_API_BASE}/by-duration?${params.toString()}`);
    return response.data.data || response.data;
  },

  /**
   * Get reviews for a tour package
   */
  getReviews: async (slug: string): Promise<{ reviews: TourReview[]; stats: ReviewStats }> => {
    const response = await axiosInstance.get(`${TOUR_API_BASE}/${slug}/reviews`);
    return {
      reviews: response.data.data || [],
      stats: response.data.stats || {
        averageRating: 0,
        totalReviews: 0,
        starDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      }
    };
  },

  /**
   * Submit a review for a tour package
   */
  createReview: async (slug: string, reviewData: CreateReviewData): Promise<TourReview> => {
    const response = await axiosInstance.post(`${TOUR_API_BASE}/${slug}/reviews`, reviewData);
    return response.data.data;
  },

  /**
   * Get review statistics for a tour package
   */
  getReviewStats: async (slug: string): Promise<ReviewStats> => {
    const response = await axiosInstance.get(`${TOUR_API_BASE}/${slug}/reviews/stats`);
    return response.data.data;
  },

  /**
   * Mark a review as helpful
   */
  markReviewHelpful: async (reviewId: string): Promise<TourReview> => {
    const response = await axiosInstance.post(`${TOUR_API_BASE}/reviews/${reviewId}/helpful`);
    return response.data.data;
  },
};

// ==================== CINETRIP PACKAGES API ====================

const CINETRIP_API_BASE = '/cinetrip-packages';

export const cineTripPackagesAPI = {
  /**
   * Get all CineTrip packages with optional filters
   */
  getAll: async (filters?: {
    category?: string;
    featured?: boolean;
    popular?: boolean;
  }): Promise<CineTripPackage[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.featured !== undefined) params.append('featured', String(filters.featured));
    if (filters?.popular !== undefined) params.append('popular', String(filters.popular));

    const response = await axiosInstance.get(`${CINETRIP_API_BASE}?${params.toString()}`);
    return response.data.data || response.data;
  },

  /**
   * Get CineTrip package by slug (for detail page)
   */
  getBySlug: async (slug: string): Promise<CineTripPackage | null> => {
    try {
      const response = await axiosInstance.get(`${CINETRIP_API_BASE}/${slug}`);
      return response.data.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  /**
   * Get featured CineTrip packages (for homepage)
   */
  getFeatured: async (limit: number = 8): Promise<CineTripPackage[]> => {
    const response = await axiosInstance.get(`${CINETRIP_API_BASE}/featured?limit=${limit}`);
    return response.data.data || response.data;
  },

  /**
   * Get CineTrip packages by category
   */
  getByCategory: async (category: string): Promise<CineTripPackage[]> => {
    const response = await axiosInstance.get(`${CINETRIP_API_BASE}/category/${category}`);
    return response.data.data || response.data;
  },

  /**
   * Get reviews for a CineTrip package
   */
  getReviews: async (slug: string): Promise<{ reviews: CineTripReview[]; stats: ReviewStats }> => {
    const response = await axiosInstance.get(`${CINETRIP_API_BASE}/${slug}/reviews`);
    return {
      reviews: response.data.data || [],
      stats: response.data.stats || {
        averageRating: 0,
        totalReviews: 0,
        starDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      }
    };
  },

  /**
   * Submit a review for a CineTrip package
   */
  createReview: async (slug: string, reviewData: CreateReviewData): Promise<CineTripReview> => {
    const response = await axiosInstance.post(`${CINETRIP_API_BASE}/${slug}/reviews`, reviewData);
    return response.data.data;
  },

  /**
   * Get review statistics for a CineTrip package
   */
  getReviewStats: async (slug: string): Promise<ReviewStats> => {
    const response = await axiosInstance.get(`${CINETRIP_API_BASE}/${slug}/reviews/stats`);
    return response.data.data;
  },

  /**
   * Mark a review as helpful
   */
  markReviewHelpful: async (reviewId: string): Promise<CineTripReview> => {
    const response = await axiosInstance.post(`${CINETRIP_API_BASE}/reviews/${reviewId}/helpful`);
    return response.data.data;
  },
};

// ==================== SEED API (Development) ====================

export const seedAPI = {
  /**
   * Seed tour packages from CSV
   */
  seedTourPackages: async (): Promise<{ success: boolean; count: number }> => {
    const response = await axiosInstance.post('/seed/tour-packages');
    return response.data;
  },

  /**
   * Seed CineTrip packages from CSV
   */
  seedCineTripPackages: async (): Promise<{ success: boolean; count: number }> => {
    const response = await axiosInstance.post('/seed/cinetrip-packages');
    return response.data;
  },

  /**
   * Seed all packages
   */
  seedAll: async (): Promise<{
    success: boolean;
    tourPackages: number;
    cineTripPackages: number;
  }> => {
    const response = await axiosInstance.post('/seed/all');
    return response.data;
  },
};

// Default export with all APIs
export default {
  tourPackages: tourPackagesAPI,
  cineTrip: cineTripPackagesAPI,
  seed: seedAPI,
};
