/**
 * PDF Generation Configuration
 * Contains all styling, branding, and layout settings for itinerary PDFs
 */

module.exports = {
  // Page configuration
  pdfConfig: {
    pageSize: 'A4',
    pageWidth: 595.28,  // A4 width in points
    pageHeight: 841.89, // A4 height in points
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50
    },
  },

  // Trip & Event Brand Colors
  colors: {
    // Primary (Teal)
    primary: '#0d9488',
    primaryLight: '#14b8a6',
    primaryDark: '#0f766e',
    primaryBg: '#f0fdfa',

    // Accent colors
    orange: '#f97316',
    rose: '#fb7185',
    amber: '#f59e0b',
    accent: '#ff6b35', // Coral/orange for important info boxes (TCS, alerts)

    // Neutrals
    gray900: '#111827',
    gray800: '#1f2937',
    gray700: '#374151',
    gray600: '#4b5563',
    gray500: '#6b7280',
    gray400: '#9ca3af',
    gray300: '#d1d5db',
    gray200: '#e5e7eb',
    gray100: '#f3f4f6',
    gray50: '#f9fafb',

    white: '#ffffff',
    black: '#000000',

    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Typography
  fonts: {
    primary: 'Poppins',
    bold: 'Poppins-Bold',
    semibold: 'Poppins-SemiBold',
    // Fallback fonts (if Poppins not available)
    fallback: 'Helvetica',
  },

  fontSize: {
    display: 32,  // For major headings and cover page titles
    h1: 28,
    h2: 22,
    h3: 18,
    h4: 16,
    h5: 14,
    body: 12,
    small: 10,
    tiny: 8,
    caption: 9,   // For fine print and disclaimers
  },

  // Spacing constants
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
    section: 40,  // Spacing between major sections
  },

  // Line height multipliers
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Company branding
  branding: {
    companyName: 'TRIP & EVENT',
    tagline: 'Explore • Experience • Enjoy',
    subtitle: "World's First CineMatrip Brand",

    // Contact information
    phone: '+919007000777',
    email: 'info@tripandevent.com',
    website: 'www.tripandevent.com',

    // Social media
    social: {
      instagram: '@tripandevent',
      facebook: 'tripandevent',
      youtube: '@tripandevent',
      linkedin: 'trip-and-event',
    },

    // Address (if needed)
    address: {
      line1: 'Trip & Event',
      city: 'India',
    }
  },

  // Icon/Symbol configurations
  // NOTE: Using ASCII characters instead of Unicode emojis as Poppins font doesn't support emoji glyphs
  icons: {
    checkmark: '✓',      // Keep if it renders, otherwise fallback to '√' or '+'
    cross: '×',          // Changed from '✗' to standard multiplication symbol
    star: '*',           // Changed from '★' to asterisk
    location: '•',       // Changed from 📍 to bullet point
    calendar: '[Date]',  // Changed from 📅 to text label
    clock: '[Time]',     // Changed from ⏱️ to text label
    hotel: '[Hotel]',    // Changed from 🏨 to text label
    meal: {
      breakfast: 'B',    // Changed from ☕ to single letter
      lunch: 'L',        // Changed from 🍽️ to single letter
      dinner: 'D',       // Changed from 🌙 to single letter
    },
    activity: '•',       // Changed from 🎯 to bullet point
    transport: '[Car]',  // Changed from 🚗 to text label
  },

  // Payment schedule configuration
  paymentSchedule: {
    defaultMilestones: 4,
    intervalDays: 30,
    milestoneNames: ['Down Payment', 'Milestone 1', 'Milestone 2', 'Final Payment'],
    fullPaymentDiscountPercent: 5, // 5% discount for full upfront payment
  },

  // Standard policy texts
  policies: {
    cancellation: {
      title: 'Cancellation Policy',
      timeline: [
        {
          period: 'More than 30 days before departure',
          refund: '100% refund (minus processing fee)',
          color: '#10b981' // success green
        },
        {
          period: '15-30 days before departure',
          refund: '50% refund',
          color: '#f59e0b' // warning amber
        },
        {
          period: '7-15 days before departure',
          refund: '25% refund',
          color: '#fb7185' // rose
        },
        {
          period: 'Less than 7 days before departure',
          refund: 'No refund',
          color: '#ef4444' // error red
        },
      ],
      notes: [
        'Cancellation charges are calculated from the date of booking confirmation.',
        'TCS once collected cannot be refunded in case of cancellation.',
        'Processing fee of ₹500 per person is non-refundable.',
      ]
    },

    dateChange: {
      title: 'Date Change Policy',
      timeline: [
        {
          period: 'Till 20 days before departure',
          fee: '₹1,500 + fare difference',
        },
        {
          period: '12-20 days before departure',
          fee: '₹14,500 + fare difference',
        },
        {
          period: 'Less than 12 days before departure',
          fee: 'Not allowed',
        },
      ],
    },

    termsAndConditions: [
      'Package prices are subject to change based on hotel availability and applicable taxes.',
      'Valid government-issued photo ID is mandatory for all travelers.',
      'Hotels check-in time is typically 2:00 PM and check-out is 11:00 AM. Early check-in/late check-out subject to availability.',
      'Itinerary is subject to change due to weather conditions, local events, or unforeseen circumstances.',
      'Trip & Event is not responsible for delays or changes due to circumstances beyond our control.',
      'Travel insurance is highly recommended for all travelers.',
      'Final payment must be completed before departure as per payment schedule.',
      'Special dietary requirements should be informed at least 7 days before departure.',
    ],
  },

  // Curator/Travel Expert configuration
  curator: {
    defaultTitle: 'Travel Specialist',
    defaultMessage: "We'll ensure your journey is perfect from start to finish",
    placeholderColor: '#0d9488', // Teal color for initials placeholder
    defaultAvailability: 'Available 24/7',
  },

  // Image paths
  images: {
    logo: 'images/Logo.png', // Corrected path to uploaded logo file
    watermark: '/assets/images/watermark.png', // optional
  },

  // Table styling defaults
  table: {
    headerBg: '#0d9488',
    headerColor: '#ffffff',
    rowBg: '#ffffff',
    altRowBg: '#f9fafb',
    borderColor: '#e5e7eb',
    cellPadding: 8,
    borderWidth: 0.5,
  },
};
