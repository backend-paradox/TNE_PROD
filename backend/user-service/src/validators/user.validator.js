const { z } = require('zod');

// ==================== Profile Validators ====================

const createProfileSchema = z.object({
  body: z.object({
    authId: z.number().int().positive(),
    name: z.string().min(2).max(120),
    email: z.string().email(),
    phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/).optional().nullable(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
    dateOfBirth: z.string().datetime().optional().nullable(),
    profilePicUrl: z.string().url().optional().nullable(),
    // New profile fields
    bio: z.string().max(500).optional().nullable(),
    languages: z.array(z.string().max(50)).optional(),
    nationality: z.string().max(100).optional().nullable(),
    passportCountry: z.string().max(100).optional().nullable(),
    travelStyle: z.enum(['BUDGET', 'MID_RANGE', 'LUXURY', 'BACKPACKER']).optional().nullable(),
    interests: z.array(z.string().max(50)).optional(),
    occupation: z.string().max(100).optional().nullable(),
    socialLinks: z
      .object({
        instagram: z.string().url().optional().nullable(),
        linkedin: z.string().url().optional().nullable(),
        twitter: z.string().url().optional().nullable(),
        facebook: z.string().url().optional().nullable(),
      })
      .optional(),
    // Legacy fields (backward compatibility)
    emergencyContact: z.record(z.any()).optional(),
    preferences: z.record(z.any()).optional(),
  }),
});

// ==================== Address Validators ====================

const addAddressSchema = z.object({
  body: z.object({
    type: z.enum(['HOME', 'WORK', 'OTHER']).default('HOME'),
    label: z.string().max(50).optional(),
    addressLine1: z.string().min(1).max(255),
    addressLine2: z.string().max(255).optional(),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    country: z.string().min(1).max(100),
    pincode: z.string().regex(/^\d{6}$/),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    isDefault: z.boolean().default(false),
  }),
});

const updateAddressSchema = z.object({
  body: z.object({
    type: z.enum(['HOME', 'WORK', 'OTHER']).optional(),
    label: z.string().max(50).optional(),
    addressLine1: z.string().min(1).max(255).optional(),
    addressLine2: z.string().max(255).optional(),
    city: z.string().min(1).max(100).optional(),
    state: z.string().min(1).max(100).optional(),
    country: z.string().min(1).max(100).optional(),
    pincode: z.string().regex(/^\d{6}$/).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    isDefault: z.boolean().optional(),
  }),
});

// ==================== KYC Validators ====================

const submitKYCSchema = z.object({
  body: z.object({
    documentType: z.enum(['AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE', 'VOTER_ID']),
    documentNumber: z.string().min(1).max(50),
    documentName: z.string().max(100).optional(),
    frontImageUrl: z.string().url(),
    backImageUrl: z.string().url().optional(),
    expiryDate: z.string().date().optional(),
  }),
});

const verifyKYCSchema = z.object({
  body: z.object({
    status: z.enum(['VERIFIED', 'REJECTED']),
    rejectionReason: z.string().min(1).optional(),
  }),
});

// ==================== Travel Preferences Validators ====================

const travelPreferencesSchema = z.object({
  body: z.object({
    preferredDestinations: z.array(z.string().max(100)).optional(),
    avoidDestinations: z.array(z.string().max(100)).optional(),
    dietaryRestrictions: z
      .array(z.enum(['VEGETARIAN', 'VEGAN', 'HALAL', 'KOSHER', 'GLUTEN_FREE', 'NUT_FREE', 'LACTOSE_FREE', 'NONE']))
      .optional(),
    accommodationTypes: z
      .array(z.enum(['HOTEL', 'HOSTEL', 'AIRBNB', 'CAMPING', 'RESORT', 'HOMESTAY', 'COUCHSURFING']))
      .optional(),
    travelPace: z.enum(['SLOW', 'MODERATE', 'FAST']).optional().nullable(),
    budgetPerDayMin: z.number().int().min(0).optional().nullable(),
    budgetPerDayMax: z.number().int().min(0).optional().nullable(),
    budgetCurrency: z.string().length(3).optional(),
    smokingPreference: z.enum(['SMOKER', 'NON_SMOKER', 'NO_PREFERENCE']).optional().nullable(),
    petFriendly: z.boolean().optional(),
    accessibilityNeeds: z.record(z.boolean()).optional(),
    preferredGroupSize: z.number().int().min(1).max(50).optional().nullable(),
    preferredAgeRangeMin: z.number().int().min(18).max(100).optional().nullable(),
    preferredAgeRangeMax: z.number().int().min(18).max(100).optional().nullable(),
    preferredGender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional().nullable(),
  }),
});

// ==================== Travel Document Validators ====================

const addTravelDocumentSchema = z.object({
  body: z.object({
    type: z.enum(['PASSPORT', 'VISA', 'TRAVEL_INSURANCE', 'VACCINATION']),
    documentNumber: z.string().min(1).max(50),
    documentName: z.string().max(100).optional(),
    issuingCountry: z.string().min(1).max(100),
    issueDate: z.string().date().optional(),
    expiryDate: z.string().date().optional(),
    visaType: z.string().max(50).optional(),
    visaCountry: z.string().max(100).optional(),
    visaEntryType: z.enum(['Single', 'Multiple']).optional(),
    documentUrl: z.string().url().optional(),
  }),
});

const updateTravelDocumentSchema = z.object({
  body: z.object({
    documentNumber: z.string().min(1).max(50).optional(),
    documentName: z.string().max(100).optional(),
    issuingCountry: z.string().min(1).max(100).optional(),
    issueDate: z.string().date().optional(),
    expiryDate: z.string().date().optional(),
    visaType: z.string().max(50).optional(),
    visaCountry: z.string().max(100).optional(),
    visaEntryType: z.enum(['Single', 'Multiple']).optional(),
    documentUrl: z.string().url().optional(),
  }),
});

// ==================== Emergency Contact Validators ====================

const addEmergencyContactSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(120),
    relationship: z.string().min(1).max(50),
    phone: z.string().regex(/^[0-9]{10,15}$/),
    email: z.string().email().optional().nullable(),
    countryCode: z.string().max(5).optional(),
    isPrimary: z.boolean().default(false),
  }),
});

const updateEmergencyContactSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(120).optional(),
    relationship: z.string().min(1).max(50).optional(),
    phone: z.string().regex(/^[0-9]{10,15}$/).optional(),
    email: z.string().email().optional().nullable(),
    countryCode: z.string().max(5).optional(),
    isPrimary: z.boolean().optional(),
  }),
});

// ==================== User Block Validators ====================

const blockUserSchema = z.object({
  body: z.object({
    blockedUserId: z.number().int().positive(),
    reason: z.string().max(500).optional(),
  }),
});

const unblockUserSchema = z.object({
  params: z.object({
    userId: z.coerce.number().int().positive(),
  }),
});

// ==================== Common Validators ====================

const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    status: z.enum(['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED']).optional(),
  }),
});

const idParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

module.exports = {
  // Profile
  createProfileSchema,
  updateProfileSchema,
  // Address
  addAddressSchema,
  updateAddressSchema,
  // KYC
  submitKYCSchema,
  verifyKYCSchema,
  // Travel Preferences
  travelPreferencesSchema,
  // Travel Documents
  addTravelDocumentSchema,
  updateTravelDocumentSchema,
  // Emergency Contacts
  addEmergencyContactSchema,
  updateEmergencyContactSchema,
  // Block
  blockUserSchema,
  unblockUserSchema,
  // Common
  paginationSchema,
  idParamSchema,
};
