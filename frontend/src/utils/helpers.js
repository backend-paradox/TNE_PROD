import { format, parseISO } from 'date-fns';

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

// Calculate number of nights
export const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Get error message from API response
export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  // Prefer nested error.message that our backend returns: { error: { code, message, stack } }
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data?.error) {
    // In some cases error might be a string already; avoid passing objects to React
    const maybeError = error.response.data.error;
    if (typeof maybeError === 'string') return maybeError;
    if (maybeError?.message) return maybeError.message;
  }
  if (error?.message) {
    return error.message;
  }
  return fallback;
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Generate booking number display
export const formatBookingNumber = (bookingNumber) => {
  return bookingNumber || 'N/A';
};

// Get booking status color
export const getBookingStatusColor = (status) => {
  const colors = {
    PENDING: '#FFA500',
    PAYMENT_PENDING: '#FF6B6B',
    CONFIRMED: '#4CAF50',
    CANCELLED: '#F44336',
    COMPLETED: '#2196F3',
  };
  return colors[status] || '#757575';
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate star rating array
export const generateStarArray = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push('full');
  }
  if (hasHalfStar) {
    stars.push('half');
  }
  while (stars.length < 5) {
    stars.push('empty');
  }
  return stars;
};

// Debounce function
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Local storage helpers
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);
    }
  },
  remove: (key) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  },
};
