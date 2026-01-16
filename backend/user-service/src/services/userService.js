const axios = require('axios');
const prisma = require('../config/prisma');
const config = require('../config/env');
const { ApiError } = require('../../../shared/src/utils');

// Maximum addresses per user to prevent abuse
const MAX_ADDRESSES_PER_USER = 10;
const MAX_EMERGENCY_CONTACTS = 5;
const MAX_CONNECTIONS = 1000;

// Logger helper
const log = {
  info: (msg, meta = {}) => console.log(`[USER-SERVICE] INFO: ${msg}`, JSON.stringify(meta)),
  warn: (msg, meta = {}) => console.warn(`[USER-SERVICE] WARN: ${msg}`, JSON.stringify(meta)),
  error: (msg, meta = {}) => console.error(`[USER-SERVICE] ERROR: ${msg}`, JSON.stringify(meta)),
};

class UserService {
  // ==================== Profile Management ====================

  async createProfile({ authId, name, email, phone }) {
    try {
      const profile = await prisma.userProfile.create({
        data: {
          authId,
          name,
          email,
          phone,
        },
      });
      log.info('Profile created', { authId, profileId: profile.id });
      return profile;
    } catch (error) {
      log.error('Failed to create profile', { authId, error: error.message });
      throw error;
    }
  }

  async getProfileByAuthId(authId) {
    // FIX: Filter out soft-deleted profiles
    const profile = await prisma.userProfile.findFirst({
      where: { authId, deletedAt: null },
      include: {
        addresses: { orderBy: { isDefault: 'desc' } },
        kycDocuments: { orderBy: { createdAt: 'desc' } },
        travelPreferences: true,
        travelDocuments: { orderBy: { createdAt: 'desc' } },
        emergencyContacts: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }] },
      },
    });
    return profile;
  }

  async getProfileById(id) {
    // FIX: Filter out soft-deleted profiles
    const profile = await prisma.userProfile.findFirst({
      where: { id, deletedAt: null },
      include: {
        addresses: { orderBy: { isDefault: 'desc' } },
        kycDocuments: { where: { status: { in: ['VERIFIED', 'SUBMITTED'] } }, orderBy: { createdAt: 'desc' } },
        travelPreferences: true,
      },
    });
    return profile;
  }

  async getProfileByEmail(email) {
    if (!email) return null;
    return prisma.userProfile.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        deletedAt: null,
      },
      select: {
        authId: true,
        name: true,
        email: true,
        profilePicUrl: true,
      },
    });
  }

  async updateProfile(authId, data) {
    const {
      name,
      phone,
      gender,
      maritalStatus,
      dateOfBirth,
      profilePicUrl,
      bio,
      languages,
      nationality,
      passportCountry,
      travelStyle,
      interests,
      occupation,
      socialLinks,
      emergencyContact,
      preferences,
      visitedCities,
    } = data;

    try {
      const profile = await prisma.userProfile.update({
        where: { authId },
        data: {
          ...(name && { name }),
          ...(phone !== undefined && { phone }),
          ...(gender && { gender }),
          ...(maritalStatus && { maritalStatus }),
          ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
          ...(profilePicUrl !== undefined && { profilePicUrl }),
          ...(bio !== undefined && { bio }),
          ...(languages && { languages }),
          ...(nationality !== undefined && { nationality }),
          ...(passportCountry !== undefined && { passportCountry }),
          ...(travelStyle !== undefined && { travelStyle }),
          ...(interests && { interests }),
          ...(occupation !== undefined && { occupation }),
          ...(socialLinks && { socialLinks }),
          ...(emergencyContact && { emergencyContact }),
          ...(preferences && { preferences }),
          ...(visitedCities && { visitedCities }),
        },
        include: {
          addresses: true,
          kycDocuments: true,
          travelPreferences: true,
          emergencyContacts: true,
        },
      });
      log.info('Profile updated', { authId });
      return profile;
    } catch (error) {
      log.error('Failed to update profile', { authId, error: error.message });
      throw error;
    }
  }

  async deleteProfile(authId) {
    const profile = await prisma.userProfile.update({
      where: { authId },
      data: { deletedAt: new Date() },
    });
    log.info('Profile soft-deleted', { authId });
    return profile;
  }

  async getAllProfiles({ page = 1, limit = 20, search }) {
    const skip = (page - 1) * limit;
    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [profiles, total] = await Promise.all([
      prisma.userProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { addresses: true, kycDocuments: true } },
        },
      }),
      prisma.userProfile.count({ where }),
    ]);

    return {
      profiles,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ==================== Address Management ====================

  async addAddress(authId, addressData) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    // Check address limit
    const addressCount = await prisma.address.count({ where: { userProfileId: profile.id } });
    if (addressCount >= MAX_ADDRESSES_PER_USER) {
      throw ApiError.badRequest(`Maximum ${MAX_ADDRESSES_PER_USER} addresses allowed per user`);
    }

    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { userProfileId: profile.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: { userProfileId: profile.id, ...addressData },
    });
    return address;
  }

  async updateAddress(authId, addressId, addressData) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userProfile: { authId, deletedAt: null } },
    });
    if (!address) throw ApiError.notFound('Address not found');

    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { userProfileId: address.userProfileId, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id: addressId },
      data: addressData,
    });
    return updated;
  }

  async deleteAddress(authId, addressId) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userProfile: { authId, deletedAt: null } },
    });
    if (!address) throw ApiError.notFound('Address not found');

    await prisma.address.delete({ where: { id: addressId } });
    return { message: 'Address deleted successfully' };
  }

  async getAddresses(authId) {
    const profile = await prisma.userProfile.findFirst({
      where: { authId, deletedAt: null },
      include: { addresses: { orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] } },
    });
    if (!profile) throw ApiError.notFound('Profile not found');
    return profile.addresses;
  }

  // ==================== KYC Management ====================

  async submitKYCDocument(authId, kycData) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    // Basic URL validation for document URLs
    if (kycData.frontImageUrl && !this.isValidUrl(kycData.frontImageUrl)) {
      throw ApiError.badRequest('Invalid front image URL');
    }
    if (kycData.backImageUrl && !this.isValidUrl(kycData.backImageUrl)) {
      throw ApiError.badRequest('Invalid back image URL');
    }

    const existing = await prisma.kYCDocument.findFirst({
      where: {
        userProfileId: profile.id,
        documentType: kycData.documentType,
        status: { in: ['VERIFIED', 'SUBMITTED'] },
      },
    });
    if (existing) throw ApiError.conflict(`${kycData.documentType} document already submitted`);

    const kycDocument = await prisma.kYCDocument.create({
      data: {
        userProfileId: profile.id,
        ...kycData,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });
    log.info('KYC document submitted', { profileId: profile.id, docType: kycData.documentType });
    return kycDocument;
  }

  // Helper to validate URLs
  isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  async getKYCDocuments(authId) {
    const profile = await prisma.userProfile.findFirst({
      where: { authId, deletedAt: null },
      include: { kycDocuments: { orderBy: { createdAt: 'desc' } } },
    });
    if (!profile) throw ApiError.notFound('Profile not found');
    return profile.kycDocuments;
  }

  async getKYCDocument(authId, documentId) {
    const document = await prisma.kYCDocument.findFirst({
      where: { id: documentId, userProfile: { authId, deletedAt: null } },
    });
    return document;
  }

  async verifyKYCDocument(documentId, adminId, status, rejectionReason = null) {
    const data = {
      status,
      ...(status === 'VERIFIED' && { verifiedAt: new Date(), verifiedBy: adminId }),
      ...(status === 'REJECTED' && { rejectedAt: new Date(), rejectionReason }),
    };

    const document = await prisma.kYCDocument.update({
      where: { id: documentId },
      data,
    });
    log.info('KYC document status updated', { documentId, status, adminId });
    return document;
  }

  async getAllKYCDocuments({ page = 1, limit = 20, status }) {
    const skip = (page - 1) * limit;
    const where = { ...(status && { status }) };

    const [documents, total] = await Promise.all([
      prisma.kYCDocument.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          userProfile: { select: { id: true, name: true, email: true, phone: true } },
        },
      }),
      prisma.kYCDocument.count({ where }),
    ]);

    return {
      documents,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getKYCStatus(authId) {
    const profile = await prisma.userProfile.findFirst({
      where: { authId, deletedAt: null },
      include: { kycDocuments: true },
    });
    if (!profile) throw ApiError.notFound('Profile not found');

    const documents = profile.kycDocuments;
    const verified = documents.filter((d) => d.status === 'VERIFIED').length;
    const pending = documents.filter((d) => d.status === 'SUBMITTED').length;
    const rejected = documents.filter((d) => d.status === 'REJECTED').length;
    const isKYCComplete = verified >= 2;

    return {
      isComplete: isKYCComplete,
      verified,
      pending,
      rejected,
      total: documents.length,
      documents: documents.map((d) => ({
        type: d.documentType,
        status: d.status,
        submittedAt: d.submittedAt,
        verifiedAt: d.verifiedAt,
      })),
    };
  }

  // ==================== Travel Preferences Management ====================

  async getTravelPreferences(authId) {
    const profile = await prisma.userProfile.findFirst({
      where: { authId, deletedAt: null },
      include: { travelPreferences: true },
    });
    if (!profile) throw ApiError.notFound('Profile not found');
    return profile.travelPreferences;
  }

  async upsertTravelPreferences(authId, preferencesData) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    const preferences = await prisma.travelPreferences.upsert({
      where: { userProfileId: profile.id },
      update: preferencesData,
      create: { userProfileId: profile.id, ...preferencesData },
    });
    return preferences;
  }

  async deleteTravelPreferences(authId) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    await prisma.travelPreferences.delete({
      where: { userProfileId: profile.id },
    });
    return { message: 'Travel preferences deleted successfully' };
  }

  // ==================== Travel Document Management ====================

  async getTravelDocuments(authId) {
    const profile = await prisma.userProfile.findFirst({
      where: { authId, deletedAt: null },
      include: { travelDocuments: { orderBy: { createdAt: 'desc' } } },
    });
    if (!profile) throw ApiError.notFound('Profile not found');
    return profile.travelDocuments;
  }

  async addTravelDocument(authId, documentData) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    const document = await prisma.travelDocument.create({
      data: {
        userProfileId: profile.id,
        ...documentData,
        ...(documentData.issueDate && { issueDate: new Date(documentData.issueDate) }),
        ...(documentData.expiryDate && { expiryDate: new Date(documentData.expiryDate) }),
      },
    });
    return document;
  }

  async updateTravelDocument(authId, documentId, documentData) {
    const document = await prisma.travelDocument.findFirst({
      where: { id: documentId, userProfile: { authId, deletedAt: null } },
    });
    if (!document) throw ApiError.notFound('Travel document not found');

    const updated = await prisma.travelDocument.update({
      where: { id: documentId },
      data: {
        ...documentData,
        ...(documentData.issueDate && { issueDate: new Date(documentData.issueDate) }),
        ...(documentData.expiryDate && { expiryDate: new Date(documentData.expiryDate) }),
      },
    });
    return updated;
  }

  async deleteTravelDocument(authId, documentId) {
    const document = await prisma.travelDocument.findFirst({
      where: { id: documentId, userProfile: { authId, deletedAt: null } },
    });
    if (!document) throw ApiError.notFound('Travel document not found');

    await prisma.travelDocument.delete({ where: { id: documentId } });
    return { message: 'Travel document deleted successfully' };
  }

  async getExpiringDocuments(authId, daysAhead = 30) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysAhead);

    const documents = await prisma.travelDocument.findMany({
      where: {
        userProfileId: profile.id,
        expiryDate: { lte: expiryDate, gte: new Date() },
      },
      orderBy: { expiryDate: 'asc' },
    });
    return documents;
  }

  // ==================== Emergency Contact Management ====================

  async getEmergencyContacts(authId) {
    const profile = await prisma.userProfile.findFirst({
      where: { authId, deletedAt: null },
      include: { emergencyContacts: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }] } },
    });
    if (!profile) throw ApiError.notFound('Profile not found');
    return profile.emergencyContacts;
  }

  async addEmergencyContact(authId, contactData) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    // Check contact limit
    const contactCount = await prisma.emergencyContact.count({ where: { userProfileId: profile.id } });
    if (contactCount >= MAX_EMERGENCY_CONTACTS) {
      throw ApiError.badRequest(`Maximum ${MAX_EMERGENCY_CONTACTS} emergency contacts allowed`);
    }

    if (contactData.isPrimary) {
      await prisma.emergencyContact.updateMany({
        where: { userProfileId: profile.id },
        data: { isPrimary: false },
      });
    }

    const contact = await prisma.emergencyContact.create({
      data: { userProfileId: profile.id, ...contactData },
    });
    return contact;
  }

  async updateEmergencyContact(authId, contactId, contactData) {
    const contact = await prisma.emergencyContact.findFirst({
      where: { id: contactId, userProfile: { authId, deletedAt: null } },
    });
    if (!contact) throw ApiError.notFound('Emergency contact not found');

    if (contactData.isPrimary) {
      await prisma.emergencyContact.updateMany({
        where: { userProfileId: contact.userProfileId, id: { not: contactId } },
        data: { isPrimary: false },
      });
    }

    const updated = await prisma.emergencyContact.update({
      where: { id: contactId },
      data: contactData,
    });
    return updated;
  }

  async deleteEmergencyContact(authId, contactId) {
    const contact = await prisma.emergencyContact.findFirst({
      where: { id: contactId, userProfile: { authId, deletedAt: null } },
    });
    if (!contact) throw ApiError.notFound('Emergency contact not found');

    await prisma.emergencyContact.delete({ where: { id: contactId } });
    return { message: 'Emergency contact deleted successfully' };
  }

  // ==================== User Block Management ====================

  async getBlockedUsers(authId) {
    const profile = await prisma.userProfile.findFirst({
      where: { authId, deletedAt: null },
      include: {
        blockedUsers: {
          include: {
            blockedUser: { select: { id: true, name: true, email: true, profilePicUrl: true } },
          },
        },
      },
    });
    if (!profile) throw ApiError.notFound('Profile not found');
    return profile.blockedUsers;
  }

  async blockUser(authId, blockedUserId, reason = null) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    if (profile.id === blockedUserId) throw ApiError.badRequest('Cannot block yourself');

    const targetUser = await prisma.userProfile.findFirst({ where: { id: blockedUserId, deletedAt: null } });
    if (!targetUser) throw ApiError.notFound('User to block not found');

    const existing = await prisma.userBlock.findUnique({
      where: { blockerUserId_blockedUserId: { blockerUserId: profile.id, blockedUserId } },
    });
    if (existing) throw ApiError.conflict('User already blocked');

    const block = await prisma.userBlock.create({
      data: { blockerUserId: profile.id, blockedUserId, reason },
    });
    return block;
  }

  async unblockUser(authId, blockedUserId) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    const block = await prisma.userBlock.findUnique({
      where: { blockerUserId_blockedUserId: { blockerUserId: profile.id, blockedUserId } },
    });
    if (!block) throw ApiError.notFound('User not in block list');

    await prisma.userBlock.delete({
      where: { blockerUserId_blockedUserId: { blockerUserId: profile.id, blockedUserId } },
    });
    return { message: 'User unblocked successfully' };
  }

  async isUserBlocked(authId, targetUserId) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) return false;

    const block = await prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerUserId: profile.id, blockedUserId: targetUserId },
          { blockerUserId: targetUserId, blockedUserId: profile.id },
        ],
      },
    });
    return !!block;
  }

  // ==================== Stats & Verification ====================

  async updateUserStats(userId, { totalTrips, rating, totalReviews }) {
    try {
      const updated = await prisma.userProfile.update({
        where: { id: userId },
        data: {
          ...(totalTrips !== undefined && { totalTrips }),
          ...(rating !== undefined && { rating }),
          ...(totalReviews !== undefined && { totalReviews }),
        },
      });
      return updated;
    } catch (error) {
      log.error('Failed to update user stats', { userId, error: error.message });
      throw error;
    }
  }

  async verifyUser(userId) {
    const result = await prisma.userProfile.update({
      where: { id: userId },
      data: { isVerified: true },
    });

    log.info('User verified', { userId });
    return result;
  }

  async unverifyUser(userId) {
    const result = await prisma.userProfile.update({
      where: { id: userId },
      data: { isVerified: false },
    });

    log.info('User unverified', { userId });
    return result;
  }

  // ==================== Location & Nearby Travellers ====================

  async updateLocation(authId, { latitude, longitude, locationName }) {
    if (!latitude || !longitude) {
      throw ApiError.badRequest('Latitude and longitude are required');
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw ApiError.badRequest('Invalid coordinates');
    }

    const profile = await prisma.userProfile.update({
      where: { authId },
      data: {
        currentLocationLat: latitude,
        currentLocationLng: longitude,
        currentLocationName: locationName || null,
        locationUpdatedAt: new Date(),
      },
    });
    log.info('Location updated', { authId, latitude, longitude });
    return {
      latitude: profile.currentLocationLat,
      longitude: profile.currentLocationLng,
      locationName: profile.currentLocationName,
      updatedAt: profile.locationUpdatedAt,
    };
  }

  async getNearbyTravellers(authId, { radiusKm = 50, page = 1, limit = 20 }) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    if (!profile.currentLocationLat || !profile.currentLocationLng) {
      throw ApiError.badRequest('Please update your location first');
    }

    const skip = (page - 1) * limit;
    const lat = profile.currentLocationLat;
    const lng = profile.currentLocationLng;

    // Get blocked user IDs (both directions)
    const blocks = await prisma.userBlock.findMany({
      where: {
        OR: [{ blockerUserId: profile.id }, { blockedUserId: profile.id }],
      },
      select: { blockerUserId: true, blockedUserId: true },
    });
    const blockedIds = new Set(
      blocks.flatMap((b) => [b.blockerUserId, b.blockedUserId])
    );
    blockedIds.delete(profile.id); // Remove self

    // Haversine formula for distance calculation (in km)
    // Using raw SQL for efficient geospatial query
    const radiusDegrees = radiusKm / 111; // Approximate degrees for latitude

    // Location must be updated within last 7 days to be considered "active"
    const activeThreshold = new Date();
    activeThreshold.setDate(activeThreshold.getDate() - 7);

    const nearbyUsers = await prisma.userProfile.findMany({
      where: {
        id: { notIn: [...blockedIds, profile.id] },
        deletedAt: null,
        currentLocationLat: { not: null },
        currentLocationLng: { not: null },
        locationUpdatedAt: { gte: activeThreshold },
        // Bounding box filter (rough filter, then calculate exact distance)
        AND: [
          { currentLocationLat: { gte: lat - radiusDegrees } },
          { currentLocationLat: { lte: lat + radiusDegrees } },
          { currentLocationLng: { gte: lng - radiusDegrees } },
          { currentLocationLng: { lte: lng + radiusDegrees } },
        ],
      },
      select: {
        id: true,
        name: true,
        profilePicUrl: true,
        bio: true,
        nationality: true,
        travelStyle: true,
        interests: true,
        visitedCities: true,
        socialVibeScore: true,
        isVerified: true,
        rating: true,
        totalTrips: true,
        currentLocationLat: true,
        currentLocationLng: true,
        currentLocationName: true,
        locationUpdatedAt: true,
      },
      orderBy: [{ isVerified: 'desc' }, { socialVibeScore: 'desc' }],
    });

    // Calculate exact distance and filter
    const usersWithDistance = nearbyUsers
      .map((user) => {
        const distance = this.calculateDistance(
          lat,
          lng,
          user.currentLocationLat,
          user.currentLocationLng
        );
        return { ...user, distanceKm: Math.round(distance * 10) / 10 };
      })
      .filter((user) => user.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    // Paginate
    const paginatedUsers = usersWithDistance.slice(skip, skip + limit);
    const total = usersWithDistance.length;

    return {
      users: paginatedUsers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Haversine formula to calculate distance between two points
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(deg) {
    return deg * (Math.PI / 180);
  }

  async updateSocialVibeScore(userId, score) {
    if (score < 0 || score > 100) {
      throw ApiError.badRequest('Social vibe score must be between 0 and 100');
    }

    const profile = await prisma.userProfile.update({
      where: { id: userId },
      data: { socialVibeScore: score },
    });
    return profile;
  }

  // ==================== Search & Discovery ====================

  async searchUsers({ page = 1, limit = 20, search, travelStyle, verified, minRating }) {
    const skip = (page - 1) * limit;
    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { bio: { contains: search, mode: 'insensitive' } },
          { nationality: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(travelStyle && { travelStyle }),
      ...(verified !== undefined && { isVerified: verified }),
      ...(minRating && { rating: { gte: minRating } }),
    };

    const [users, total] = await Promise.all([
      prisma.userProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isVerified: 'desc' }, { rating: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          name: true,
          profilePicUrl: true,
          bio: true,
          nationality: true,
          travelStyle: true,
          interests: true,
          isVerified: true,
          rating: true,
          totalTrips: true,
        },
      }),
      prisma.userProfile.count({ where }),
    ]);

    return {
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getInterestSuggestions(query = '', limit = 10) {
    const normalizedQuery = String(query || '').trim().toLowerCase();
    const maxResults = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 50)) : 10;

    const profiles = await prisma.userProfile.findMany({
      where: {
        deletedAt: null,
        interests: { not: null },
      },
      select: { interests: true },
    });

    const matches = [];
    const seen = new Set();

    profiles.forEach((profile) => {
      const interests = Array.isArray(profile.interests) ? profile.interests : [];
      interests.forEach((interest) => {
        const value = String(interest || '').trim();
        if (!value) return;
        const lower = value.toLowerCase();
        if (normalizedQuery && !lower.includes(normalizedQuery)) return;
        if (seen.has(lower)) return;
        seen.add(lower);
        matches.push({ value, lower });
      });
    });

    if (normalizedQuery) {
      matches.sort((a, b) => {
        const aExact = a.lower === normalizedQuery;
        const bExact = b.lower === normalizedQuery;
        if (aExact !== bExact) return aExact ? -1 : 1;
        const aStarts = a.lower.startsWith(normalizedQuery);
        const bStarts = b.lower.startsWith(normalizedQuery);
        if (aStarts !== bStarts) return aStarts ? -1 : 1;
        return a.value.localeCompare(b.value);
      });
    } else {
      matches.sort((a, b) => a.value.localeCompare(b.value));
    }

    return matches.slice(0, maxResults).map((item) => item.value);
  }

  // ==================== Connection/Friend Management ====================

  async sendConnectionRequest(authId, targetUserId, message = null) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    const resolvedTargetAuthId = Number(targetUserId);
    let targetProfile = null;
    if (Number.isFinite(resolvedTargetAuthId)) {
      targetProfile = await prisma.userProfile.findFirst({
        where: { authId: resolvedTargetAuthId, deletedAt: null },
      });
    }

    if (!targetProfile) {
      targetProfile = await prisma.userProfile.findFirst({
        where: { id: targetUserId, deletedAt: null },
      });
    }

    if (!targetProfile) throw ApiError.notFound('User not found');

    const targetProfileId = targetProfile.id;

    if (profile.id === targetProfileId) {
      throw ApiError.badRequest('Cannot send connection request to yourself');
    }

    // Check if blocked
    const isBlocked = await this.isUserBlocked(authId, targetProfileId);
    if (isBlocked) throw ApiError.forbidden('Cannot connect with this user');

    // Check connection limit
    const connectionCount = await prisma.userConnection.count({
      where: {
        OR: [
          { requesterId: profile.id, status: 'ACCEPTED' },
          { addresseeId: profile.id, status: 'ACCEPTED' },
        ],
      },
    });
    if (connectionCount >= MAX_CONNECTIONS) {
      throw ApiError.badRequest(`Maximum ${MAX_CONNECTIONS} connections allowed`);
    }

    // Check for existing connection in either direction
    const existing = await prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId: profile.id, addresseeId: targetProfileId },
          { requesterId: targetProfileId, addresseeId: profile.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw ApiError.conflict('Already connected with this user');
      }
      if (existing.status === 'PENDING') {
        if (existing.requesterId === profile.id) {
          throw ApiError.conflict('Connection request already sent');
        } else {
          // They sent request to us, auto-accept
          return this.acceptConnection(authId, existing.id);
        }
      }
      if (existing.status === 'BLOCKED') {
        throw ApiError.forbidden('Cannot connect with this user');
      }
      if (existing.status === 'REJECTED') {
        // Allow resending after rejection - update existing
        const updated = await prisma.userConnection.update({
          where: { id: existing.id },
          data: {
            requesterId: profile.id,
            addresseeId: targetProfileId,
            status: 'PENDING',
            message,
            requestedAt: new Date(),
            respondedAt: null,
          },
          include: {
            addressee: { select: { id: true, name: true, profilePicUrl: true } },
          },
        });
        log.info('Connection request resent', { from: profile.id, to: targetUserId });
        return updated;
      }
    }

    const connection = await prisma.userConnection.create({
      data: {
        requesterId: profile.id,
        addresseeId: targetProfileId,
        message,
        status: 'PENDING',
      },
      include: {
        addressee: { select: { id: true, name: true, profilePicUrl: true } },
      },
    });
    log.info('Connection request sent', { from: profile.id, to: targetUserId });
    return connection;
  }

  async acceptConnection(authId, connectionId) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    const connection = await prisma.userConnection.findFirst({
      where: { id: connectionId, addresseeId: profile.id, status: 'PENDING' },
    });
    if (!connection) throw ApiError.notFound('Connection request not found');

    const updated = await prisma.$transaction(async (tx) => {
      const conn = await tx.userConnection.update({
        where: { id: connectionId },
        data: { status: 'ACCEPTED', respondedAt: new Date() },
        include: {
          requester: { select: { id: true, authId: true, name: true, profilePicUrl: true } },
          addressee: { select: { id: true, authId: true, name: true, profilePicUrl: true } },
        },
      });

      // Create activity for both users
      await tx.userActivity.createMany({
        data: [
          {
            userProfileId: profile.id,
            type: 'CONNECTION_MADE',
            title: `Connected with ${conn.requester.name}`,
            metadata: { connectionId: conn.id, userId: conn.requester.id },
            referenceType: 'connection',
            referenceId: String(conn.id),
          },
          {
            userProfileId: conn.requester.id,
            type: 'CONNECTION_MADE',
            title: `Connected with ${conn.addressee.name}`,
            metadata: { connectionId: conn.id, userId: conn.addressee.id },
            referenceType: 'connection',
            referenceId: String(conn.id),
          },
        ],
      });

      return conn;
    });

    log.info('Connection accepted', { connectionId, by: profile.id });

    // Auto-create DIRECT conversation between the two users
    await this._createDirectConversation(updated.requester.authId, updated.addressee.authId);

    return updated;
  }

  /**
   * Create a DIRECT conversation between two users via chat-service
   * @private
   */
  async _createDirectConversation(authId1, authId2) {
    try {
      const chatServiceUrl = config.services?.chat || process.env.CHAT_SERVICE_URL;

      if (!chatServiceUrl) {
        log.warn('Chat service URL not configured, skipping DM creation');
        return null;
      }

      const response = await axios.post(
        `${chatServiceUrl}/conversations`,
        {
          type: 'DIRECT',
          participantIds: [authId2], // The other user
        },
        {
          headers: {
            'X-Internal-Service': 'user-service',
            'X-User-Auth-Id': String(authId1),
            'Content-Type': 'application/json',
          },
        }
      );

      log.info('Direct conversation created', {
        authId1,
        authId2,
        conversationId: response.data?.data?.id || response.data?.id,
      });

      return response.data?.data || response.data;
    } catch (error) {
      // Don't fail connection acceptance if DM creation fails
      log.error('Failed to create direct conversation', {
        authId1,
        authId2,
        error: error.message,
      });
      return null;
    }
  }

  async rejectConnection(authId, connectionId) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    const connection = await prisma.userConnection.findFirst({
      where: { id: connectionId, addresseeId: profile.id, status: 'PENDING' },
    });
    if (!connection) throw ApiError.notFound('Connection request not found');

    await prisma.userConnection.update({
      where: { id: connectionId },
      data: { status: 'REJECTED', respondedAt: new Date() },
    });
    log.info('Connection rejected', { connectionId, by: profile.id });
  }

  async removeConnection(authId, targetUserId) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    const connection = await prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId: profile.id, addresseeId: targetUserId, status: 'ACCEPTED' },
          { requesterId: targetUserId, addresseeId: profile.id, status: 'ACCEPTED' },
        ],
      },
    });
    if (!connection) throw ApiError.notFound('Connection not found');

    await prisma.userConnection.delete({ where: { id: connection.id } });
    log.info('Connection removed', { user: profile.id, removed: targetUserId });
  }

  async cancelConnectionRequest(authId, connectionId) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    const connection = await prisma.userConnection.findFirst({
      where: { id: connectionId, requesterId: profile.id, status: 'PENDING' },
    });
    if (!connection) throw ApiError.notFound('Connection request not found');

    await prisma.userConnection.delete({ where: { id: connectionId } });
    log.info('Connection request cancelled', { connectionId, by: profile.id });
  }

  async getConnections(authId, { page = 1, limit = 20 }) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    const skip = (page - 1) * limit;

    const [connections, total] = await Promise.all([
      prisma.userConnection.findMany({
        where: {
          OR: [
            { requesterId: profile.id, status: 'ACCEPTED' },
            { addresseeId: profile.id, status: 'ACCEPTED' },
          ],
        },
        skip,
        take: limit,
        orderBy: { respondedAt: 'desc' },
        include: {
          requester: {
            select: {
              id: true, authId: true, name: true, profilePicUrl: true, bio: true,
              travelStyle: true, isVerified: true, currentLocationName: true,
            },
          },
          addressee: {
            select: {
              id: true, authId: true, name: true, profilePicUrl: true, bio: true,
              travelStyle: true, isVerified: true, currentLocationName: true,
            },
          },
        },
      }),
      prisma.userConnection.count({
        where: {
          OR: [
            { requesterId: profile.id, status: 'ACCEPTED' },
            { addresseeId: profile.id, status: 'ACCEPTED' },
          ],
        },
      }),
    ]);

    // Map to return the connected user (not self)
    const connectedUsers = connections.map((conn) => ({
      connectionId: conn.id,
      connectedAt: conn.respondedAt,
      user: conn.requesterId === profile.id ? conn.addressee : conn.requester,
    }));

    return {
      connections: connectedUsers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getPendingRequests(authId, { page = 1, limit = 20 }) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      prisma.userConnection.findMany({
        where: { addresseeId: profile.id, status: 'PENDING' },
        skip,
        take: limit,
        orderBy: { requestedAt: 'desc' },
        include: {
          requester: {
            select: {
              id: true, authId: true, name: true, profilePicUrl: true, bio: true,
              travelStyle: true, isVerified: true, interests: true,
            },
          },
        },
      }),
      prisma.userConnection.count({
        where: { addresseeId: profile.id, status: 'PENDING' },
      }),
    ]);

    return {
      requests: requests.map((r) => ({
        connectionId: r.id,
        message: r.message,
        requestedAt: r.requestedAt,
        user: r.requester,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSentRequests(authId, { page = 1, limit = 20 }) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      prisma.userConnection.findMany({
        where: { requesterId: profile.id, status: 'PENDING' },
        skip,
        take: limit,
        orderBy: { requestedAt: 'desc' },
        include: {
          addressee: {
            select: {
              id: true, authId: true, name: true, profilePicUrl: true, bio: true,
              travelStyle: true, isVerified: true,
            },
          },
        },
      }),
      prisma.userConnection.count({
        where: { requesterId: profile.id, status: 'PENDING' },
      }),
    ]);

    return {
      requests: requests.map((r) => ({
        connectionId: r.id,
        message: r.message,
        requestedAt: r.requestedAt,
        user: r.addressee,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getConnectionStatus(authId, targetUserId) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    if (profile.id === targetUserId) {
      return { status: 'SELF', connectionId: null };
    }

    const connection = await prisma.userConnection.findFirst({
      where: {
        OR: [
          { requesterId: profile.id, addresseeId: targetUserId },
          { requesterId: targetUserId, addresseeId: profile.id },
        ],
      },
    });

    if (!connection) {
      return { status: 'NONE', connectionId: null };
    }

    if (connection.status === 'ACCEPTED') {
      return { status: 'CONNECTED', connectionId: connection.id };
    }

    if (connection.status === 'PENDING') {
      if (connection.requesterId === profile.id) {
        return { status: 'PENDING_SENT', connectionId: connection.id };
      } else {
        return { status: 'PENDING_RECEIVED', connectionId: connection.id };
      }
    }

    return { status: connection.status, connectionId: connection.id };
  }

  async getMutualConnections(authId, targetUserId, { page = 1, limit = 10 }) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    // Get my connections
    const myConnections = await prisma.userConnection.findMany({
      where: {
        OR: [
          { requesterId: profile.id, status: 'ACCEPTED' },
          { addresseeId: profile.id, status: 'ACCEPTED' },
        ],
      },
      select: { requesterId: true, addresseeId: true },
    });
    const myConnectionIds = new Set(
      myConnections.flatMap((c) => [c.requesterId, c.addresseeId])
    );
    myConnectionIds.delete(profile.id);

    // Get target's connections
    const targetConnections = await prisma.userConnection.findMany({
      where: {
        OR: [
          { requesterId: targetUserId, status: 'ACCEPTED' },
          { addresseeId: targetUserId, status: 'ACCEPTED' },
        ],
      },
      select: { requesterId: true, addresseeId: true },
    });
    const targetConnectionIds = new Set(
      targetConnections.flatMap((c) => [c.requesterId, c.addresseeId])
    );
    targetConnectionIds.delete(targetUserId);

    // Find intersection
    const mutualIds = [...myConnectionIds].filter((id) => targetConnectionIds.has(id));

    const skip = (page - 1) * limit;
    const paginatedIds = mutualIds.slice(skip, skip + limit);

    const mutualUsers = await prisma.userProfile.findMany({
      where: { id: { in: paginatedIds }, deletedAt: null },
      select: {
        id: true, name: true, profilePicUrl: true, bio: true,
        travelStyle: true, isVerified: true,
      },
    });

    return {
      mutualConnections: mutualUsers,
      pagination: {
        page,
        limit,
        total: mutualIds.length,
        totalPages: Math.ceil(mutualIds.length / limit),
      },
    };
  }

  async getSuggestedConnections(authId, limit = 10) {
    const profile = await prisma.userProfile.findFirst({
      where: { authId, deletedAt: null },
      include: { travelPreferences: true },
    });
    if (!profile) throw ApiError.notFound('Profile not found');

    // Get existing connections and blocks to exclude
    const [connections, blocks] = await Promise.all([
      prisma.userConnection.findMany({
        where: {
          OR: [{ requesterId: profile.id }, { addresseeId: profile.id }],
          status: { in: ['ACCEPTED', 'PENDING', 'BLOCKED'] },
        },
        select: { requesterId: true, addresseeId: true },
      }),
      prisma.userBlock.findMany({
        where: { OR: [{ blockerUserId: profile.id }, { blockedUserId: profile.id }] },
        select: { blockerUserId: true, blockedUserId: true },
      }),
    ]);

    const excludeIds = new Set([
      profile.id,
      ...connections.flatMap((c) => [c.requesterId, c.addresseeId]),
      ...blocks.flatMap((b) => [b.blockerUserId, b.blockedUserId]),
    ]);

    // Find users with similar travel style and interests
    const suggestions = await prisma.userProfile.findMany({
      where: {
        id: { notIn: [...excludeIds] },
        deletedAt: null,
        OR: [
          ...(profile.travelStyle ? [{ travelStyle: profile.travelStyle }] : []),
          ...(profile.nationality ? [{ nationality: profile.nationality }] : []),
        ],
      },
      take: limit * 2, // Get more to filter
      orderBy: [{ isVerified: 'desc' }, { socialVibeScore: 'desc' }, { rating: 'desc' }],
      select: {
        id: true, name: true, profilePicUrl: true, bio: true,
        travelStyle: true, interests: true, nationality: true,
        isVerified: true, rating: true, socialVibeScore: true,
      },
    });

    // Calculate match scores
    const scored = suggestions.map((user) => {
      let score = 0;
      if (user.travelStyle === profile.travelStyle) score += 30;
      if (user.nationality === profile.nationality) score += 10;

      // Interest overlap
      const myInterests = profile.interests || [];
      const theirInterests = user.interests || [];
      const overlap = myInterests.filter((i) => theirInterests.includes(i)).length;
      score += overlap * 10;

      if (user.isVerified) score += 15;
      score += (user.socialVibeScore || 0) / 10;

      return { ...user, matchScore: Math.min(score, 100) };
    });

    // Sort by score and take limit
    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored.slice(0, limit);
  }

  // ==================== Activity Feed ====================

  async createActivity(authId, activityData) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    const activity = await prisma.userActivity.create({
      data: {
        userProfileId: profile.id,
        type: activityData.type,
        title: activityData.title,
        description: activityData.description,
        metadata: activityData.metadata,
        referenceType: activityData.referenceType,
        referenceId: activityData.referenceId,
        isPublic: activityData.isPublic !== false,
      },
    });
    return activity;
  }

  async createActivityByUserId(userId, activityData) {
    const activity = await prisma.userActivity.create({
      data: {
        userProfileId: userId,
        type: activityData.type,
        title: activityData.title,
        description: activityData.description,
        metadata: activityData.metadata,
        referenceType: activityData.referenceType,
        referenceId: activityData.referenceId,
        isPublic: activityData.isPublic !== false,
      },
    });
    return activity;
  }

  async getActivityFeed(authId, { page = 1, limit = 20, type }) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    // Get connection IDs
    const connections = await prisma.userConnection.findMany({
      where: {
        OR: [
          { requesterId: profile.id, status: 'ACCEPTED' },
          { addresseeId: profile.id, status: 'ACCEPTED' },
        ],
      },
      select: { requesterId: true, addresseeId: true },
    });
    const connectionIds = connections.map((c) =>
      c.requesterId === profile.id ? c.addresseeId : c.requesterId
    );

    const skip = (page - 1) * limit;
    const where = {
      userProfileId: { in: [profile.id, ...connectionIds] },
      isPublic: true,
      ...(type && { type }),
    };

    const [activities, total] = await Promise.all([
      prisma.userActivity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          userProfile: {
            select: { id: true, name: true, profilePicUrl: true, isVerified: true },
          },
        },
      }),
      prisma.userActivity.count({ where }),
    ]);

    return {
      activities,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUserActivities(authId, targetUserId, { page = 1, limit = 20, type }) {
    const profile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!profile) throw ApiError.notFound('Profile not found');

    const userId = targetUserId || profile.id;
    const isOwnProfile = userId === profile.id;

    const skip = (page - 1) * limit;
    const where = {
      userProfileId: userId,
      ...(type && { type }),
      ...(!isOwnProfile && { isPublic: true }),
    };

    const [activities, total] = await Promise.all([
      prisma.userActivity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          userProfile: {
            select: { id: true, name: true, profilePicUrl: true, isVerified: true },
          },
        },
      }),
      prisma.userActivity.count({ where }),
    ]);

    return {
      activities,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ==================== User Stats & Compatibility ====================

  async getUserStats(authId) {
    const profile = await prisma.userProfile.findFirst({
      where: { authId, deletedAt: null },
      include: {
        _count: {
          select: {
            sentConnections: { where: { status: 'ACCEPTED' } },
            receivedConnections: { where: { status: 'ACCEPTED' } },
            activities: true,
          },
        },
      },
    });
    if (!profile) throw ApiError.notFound('Profile not found');

    return {
      totalTrips: profile.totalTrips,
      totalReviews: profile.totalReviews,
      rating: profile.rating,
      socialVibeScore: profile.socialVibeScore,
      isVerified: profile.isVerified,
      connectionCount: profile._count.sentConnections + profile._count.receivedConnections,
      activityCount: profile._count.activities,
      visitedCitiesCount: (profile.visitedCities || []).length,
      memberSince: profile.createdAt,
    };
  }

  async getUserStatsById(userId) {
    const profile = await prisma.userProfile.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        _count: {
          select: {
            sentConnections: { where: { status: 'ACCEPTED' } },
            receivedConnections: { where: { status: 'ACCEPTED' } },
          },
        },
      },
    });
    if (!profile) throw ApiError.notFound('User not found');

    return {
      totalTrips: profile.totalTrips,
      totalReviews: profile.totalReviews,
      rating: profile.rating,
      isVerified: profile.isVerified,
      connectionCount: profile._count.sentConnections + profile._count.receivedConnections,
      visitedCitiesCount: (profile.visitedCities || []).length,
      memberSince: profile.createdAt,
    };
  }

  async calculateCompatibility(authId, targetUserId) {
    const [myProfile, targetProfile] = await Promise.all([
      prisma.userProfile.findFirst({
        where: { authId, deletedAt: null },
        include: { travelPreferences: true },
      }),
      prisma.userProfile.findFirst({
        where: { id: targetUserId, deletedAt: null },
        include: { travelPreferences: true },
      }),
    ]);

    if (!myProfile) throw ApiError.notFound('Profile not found');
    if (!targetProfile) throw ApiError.notFound('Target user not found');

    const breakdown = {
      travelStyle: 0,
      interests: 0,
      travelPace: 0,
      budget: 0,
      accommodationType: 0,
      languages: 0,
      verified: 0,
    };

    // Travel Style (25 points)
    if (myProfile.travelStyle && targetProfile.travelStyle) {
      breakdown.travelStyle = myProfile.travelStyle === targetProfile.travelStyle ? 25 : 10;
    }

    // Interests (25 points)
    const myInterests = myProfile.interests || [];
    const theirInterests = targetProfile.interests || [];
    if (myInterests.length && theirInterests.length) {
      const overlap = myInterests.filter((i) => theirInterests.includes(i)).length;
      const maxPossible = Math.min(myInterests.length, theirInterests.length);
      breakdown.interests = Math.round((overlap / maxPossible) * 25);
    }

    // Travel Pace (15 points)
    const myPrefs = myProfile.travelPreferences;
    const theirPrefs = targetProfile.travelPreferences;
    if (myPrefs?.travelPace && theirPrefs?.travelPace) {
      breakdown.travelPace = myPrefs.travelPace === theirPrefs.travelPace ? 15 : 5;
    }

    // Budget (15 points)
    if (myPrefs && theirPrefs) {
      const myMin = myPrefs.budgetPerDayMin || 0;
      const myMax = myPrefs.budgetPerDayMax || Infinity;
      const theirMin = theirPrefs.budgetPerDayMin || 0;
      const theirMax = theirPrefs.budgetPerDayMax || Infinity;
      // Check if budget ranges overlap
      if (myMin <= theirMax && theirMin <= myMax) {
        breakdown.budget = 15;
      } else {
        breakdown.budget = 5;
      }
    }

    // Accommodation Type (10 points)
    if (myPrefs?.accommodationTypes?.length && theirPrefs?.accommodationTypes?.length) {
      const overlap = myPrefs.accommodationTypes.filter((t) =>
        theirPrefs.accommodationTypes.includes(t)
      ).length;
      breakdown.accommodationType = overlap > 0 ? 10 : 0;
    }

    // Languages (5 points)
    const myLangs = myProfile.languages || [];
    const theirLangs = targetProfile.languages || [];
    if (myLangs.length && theirLangs.length) {
      const overlap = myLangs.filter((l) => theirLangs.includes(l)).length;
      breakdown.languages = overlap > 0 ? 5 : 0;
    }

    // Verification bonus (5 points)
    if (targetProfile.isVerified) breakdown.verified = 5;

    const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0);

    return {
      overallScore: totalScore,
      maxScore: 100,
      percentage: totalScore,
      breakdown,
      compatibilityLevel:
        totalScore >= 80 ? 'Excellent' :
        totalScore >= 60 ? 'Good' :
        totalScore >= 40 ? 'Moderate' : 'Low',
    };
  }

  async getPublicProfile(authId, targetUserId) {
    const myProfile = await prisma.userProfile.findFirst({ where: { authId, deletedAt: null } });
    if (!myProfile) throw ApiError.notFound('Profile not found');

    const profileSelect = {
      id: true,
      authId: true,
      name: true,
      profilePicUrl: true,
      bio: true,
      nationality: true,
      travelStyle: true,
      interests: true,
      visitedCities: true,
      isVerified: true,
      rating: true,
      totalTrips: true,
      totalReviews: true,
      socialVibeScore: true,
      currentLocationName: true,
      languages: true,
      occupation: true,
      socialLinks: true,
      createdAt: true,
    };

    let targetProfile = await prisma.userProfile.findFirst({
      where: { authId: targetUserId, deletedAt: null },
      select: profileSelect,
    });

    if (!targetProfile) {
      targetProfile = await prisma.userProfile.findFirst({
        where: { id: targetUserId, deletedAt: null },
        select: profileSelect,
      });
    }

    if (!targetProfile) throw ApiError.notFound('User not found');

    // Check if blocked (expects profile ids)
    const isBlocked = await this.isUserBlocked(authId, targetProfile.id);
    if (isBlocked) throw ApiError.forbidden('Cannot view this profile');

    // Get connection status
    const connectionStatus = await this.getConnectionStatus(authId, targetProfile.id);

    // Get mutual connections count
    const mutualData = await this.getMutualConnections(authId, targetProfile.id, { limit: 3 });

    return {
      ...targetProfile,
      connectionStatus: connectionStatus.status,
      connectionId: connectionStatus.connectionId,
      mutualConnectionsCount: mutualData.pagination.total,
      mutualConnectionsPreview: mutualData.mutualConnections,
    };
  }

  // ==================== Batch Operations (for internal service calls) ====================

  /**
   * Get user profiles in batch
   * @param {number[]} userIds - Array of user IDs (authIds) to fetch
   * @returns {Promise<Array>} Array of user profiles
   */
  async getUserProfilesBatch(userIds) {
    if (!userIds || userIds.length === 0) return [];

    const profiles = await prisma.userProfile.findMany({
      where: {
        authId: { in: userIds },
        deletedAt: null,
      },
      select: {
        id: true,
        authId: true,
        name: true,
        email: true,
        profilePicUrl: true,
        gender: true,
        bio: true,
        dateOfBirth: true,
        currentLocationName: true,
        interests: true,
        languages: true,
        createdAt: true,
      },
    });

    return profiles;
  }

  /**
   * Get connection statuses in batch
   * @param {number} currentUserId - Current user's ID (authId)
   * @param {number[]} targetUserIds - Array of target user IDs (authIds) to check
   * @returns {Promise<Object>} Map of userId => status (NONE, PENDING, ACCEPTED, REJECTED)
   */
  async getConnectionStatusesBatch(currentUserId, targetUserIds) {
    if (!targetUserIds || targetUserIds.length === 0) return {};

    const statusMap = {};
    targetUserIds.forEach(userId => {
      statusMap[userId] = { status: 'NONE', connectionId: null };
    });

    const uniqueAuthIds = Array.from(
      new Set([Number(currentUserId), ...targetUserIds.map((id) => Number(id))])
    ).filter((id) => Number.isFinite(id));
    if (uniqueAuthIds.length === 0) return statusMap;

    const profiles = await prisma.userProfile.findMany({
      where: {
        authId: { in: uniqueAuthIds },
        deletedAt: null,
      },
      select: {
        id: true,
        authId: true,
      },
    });

    const profileIdByAuthId = new Map(profiles.map((profile) => [profile.authId, profile.id]));
    const authIdByProfileId = new Map(profiles.map((profile) => [profile.id, profile.authId]));
    const currentProfileId = profileIdByAuthId.get(Number(currentUserId));
    if (!currentProfileId) return statusMap;

    const targetProfileIds = targetUserIds
      .map((id) => profileIdByAuthId.get(Number(id)))
      .filter((id) => Number.isFinite(id));
    if (targetProfileIds.length === 0) return statusMap;

    // Fetch all relevant connections in one query using profile IDs
    const connections = await prisma.userConnection.findMany({
      where: {
        OR: [
          {
            requesterId: currentProfileId,
            addresseeId: { in: targetProfileIds },
          },
          {
            addresseeId: currentProfileId,
            requesterId: { in: targetProfileIds },
          },
        ],
      },
      select: {
        id: true,
        requesterId: true,
        addresseeId: true,
        status: true,
      },
    });

    // Update with actual connection statuses
    connections.forEach(conn => {
      const otherProfileId = conn.requesterId === currentProfileId ? conn.addresseeId : conn.requesterId;
      const otherAuthId = authIdByProfileId.get(otherProfileId);
      if (otherAuthId !== undefined) {
        statusMap[otherAuthId] = { status: conn.status, connectionId: conn.id };
      }
    });

    return statusMap;
  }
}

module.exports = new UserService();
