const prisma = require('../config/prisma');
const axios = require('axios');

class AdminService {
  constructor() {
    this.authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
    this.userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3002';
    this.bookingServiceUrl = process.env.BOOKING_SERVICE_URL || 'http://booking-service:3004';
    this.paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3007';
    this.reviewServiceUrl = process.env.REVIEW_SERVICE_URL || 'http://review-service:3009';
    this.vendorServiceUrl = process.env.VENDOR_SERVICE_URL || 'http://vendor-service:3010';
    this.catalogServiceUrl = process.env.CATALOG_SERVICE_URL || 'http://catalog-service:4001';
  }

  /**
   * Get dashboard overview statistics
   */
  async getDashboardStats() {
    try {
      const [users, bookings, payments, reviews, vendors] = await Promise.allSettled([
        axios.get(`${this.userServiceUrl}/api/v1/users`, { timeout: 3000 }),
        axios.get(`${this.bookingServiceUrl}/api/v1/bookings/admin/all`, { timeout: 3000 }),
        axios.get(`${this.paymentServiceUrl}/api/v1/payments/admin/payments`, { timeout: 3000 }),
        axios.get(`${this.reviewServiceUrl}/api/v1/reviews/admin/pending`, { timeout: 3000 }),
        axios.get(`${this.vendorServiceUrl}/api/v1/vendors/admin/all`, { timeout: 3000 })
      ]);

      const stats = {
        users: {
          total: users.status === 'fulfilled' ? users.value.data.data.total || 0 : 0,
          active: users.status === 'fulfilled' ? users.value.data.data.profiles?.filter(p => !p.deletedAt).length || 0 : 0
        },
        bookings: {
          total: bookings.status === 'fulfilled' ? bookings.value.data.data.total || 0 : 0,
          pending: bookings.status === 'fulfilled' ? bookings.value.data.data.bookings?.filter(b => b.status === 'PENDING').length || 0 : 0,
          confirmed: bookings.status === 'fulfilled' ? bookings.value.data.data.bookings?.filter(b => b.status === 'CONFIRMED').length || 0 : 0,
          cancelled: bookings.status === 'fulfilled' ? bookings.value.data.data.bookings?.filter(b => b.status === 'CANCELLED').length || 0 : 0
        },
        revenue: {
          total: payments.status === 'fulfilled' ? this.calculateTotalRevenue(payments.value.data.data.payments || []) : 0,
          successful: payments.status === 'fulfilled' ? payments.value.data.data.payments?.filter(p => p.status === 'SUCCESS').length || 0 : 0,
          pending: payments.status === 'fulfilled' ? payments.value.data.data.payments?.filter(p => p.status === 'PENDING').length || 0 : 0
        },
        reviews: {
          total: reviews.status === 'fulfilled' ? reviews.value.data.data.total || 0 : 0,
          pending: reviews.status === 'fulfilled' ? reviews.value.data.data.reviews?.length || 0 : 0
        },
        vendors: {
          total: vendors.status === 'fulfilled' ? vendors.value.data.data.total || 0 : 0,
          pending: vendors.status === 'fulfilled' ? vendors.value.data.data.vendors?.filter(v => v.status === 'PENDING').length || 0 : 0,
          active: vendors.status === 'fulfilled' ? vendors.value.data.data.vendors?.filter(v => v.status === 'APPROVED').length || 0 : 0
        }
      };

      return stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error.message);
      throw new Error('Failed to fetch dashboard statistics');
    }
  }

  /**
   * Get analytics data for a date range
   */
  async getAnalytics(startDate, endDate, groupBy = 'day') {
    try {
      const snapshots = await prisma.analyticsSnapshot.findMany({
        where: {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        orderBy: { date: 'asc' }
      });

      return {
        snapshots,
        summary: this.calculateSummary(snapshots)
      };
    } catch (error) {
      console.error('Error fetching analytics:', error.message);
      throw new Error('Failed to fetch analytics data');
    }
  }

  /**
   * Generate analytics snapshot for a specific date
   */
  async generateSnapshot(date = new Date()) {
    try {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      // Fetch data from all services
      const [users, bookings, payments, vendors, reviews] = await Promise.allSettled([
        this.fetchUserMetrics(targetDate),
        this.fetchBookingMetrics(targetDate),
        this.fetchPaymentMetrics(targetDate),
        this.fetchVendorMetrics(targetDate),
        this.fetchReviewMetrics(targetDate)
      ]);

      const snapshot = await prisma.analyticsSnapshot.upsert({
        where: { date: targetDate },
        update: {
          ...this.extractMetrics(users, 'users'),
          ...this.extractMetrics(bookings, 'bookings'),
          ...this.extractMetrics(payments, 'payments'),
          ...this.extractMetrics(vendors, 'vendors'),
          ...this.extractMetrics(reviews, 'reviews')
        },
        create: {
          date: targetDate,
          ...this.extractMetrics(users, 'users'),
          ...this.extractMetrics(bookings, 'bookings'),
          ...this.extractMetrics(payments, 'payments'),
          ...this.extractMetrics(vendors, 'vendors'),
          ...this.extractMetrics(reviews, 'reviews')
        }
      });

      return snapshot;
    } catch (error) {
      console.error('Error generating snapshot:', error.message);
      throw new Error('Failed to generate analytics snapshot');
    }
  }

  /**
   * Log admin action
   */
  async logAction(adminId, action, resource, resourceId, details = null, req = null) {
    try {
      return await prisma.adminAction.create({
        data: {
          adminId,
          action,
          resource,
          resourceId,
          details,
          ipAddress: req?.ip || null,
          userAgent: req?.get('user-agent') || null
        }
      });
    } catch (error) {
      console.error('Error logging admin action:', error.message);
    }
  }

  /**
   * Get admin activity logs
   */
  async getActivityLogs(filters = {}) {
    const { adminId, resource, action, startDate, endDate, page = 1, limit = 50 } = filters;

    const where = {};
    if (adminId) where.adminId = parseInt(adminId);
    if (resource) where.resource = resource;
    if (action) where.action = action;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.adminAction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.adminAction.count({ where })
    ]);

    return {
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * System settings management
   */
  async getSettings() {
    return await prisma.systemSetting.findMany({
      orderBy: { key: 'asc' }
    });
  }

  async getSetting(key) {
    return await prisma.systemSetting.findUnique({
      where: { key }
    });
  }

  async updateSetting(key, value, description, updatedBy) {
    return await prisma.systemSetting.upsert({
      where: { key },
      update: { value, description, updatedBy },
      create: { key, value, description, updatedBy }
    });
  }

  async deleteSetting(key) {
    return await prisma.systemSetting.delete({
      where: { key }
    });
  }

  /**
   * Platform notifications
   */
  async createNotification(type, title, message, severity = 'MEDIUM') {
    return await prisma.platformNotification.create({
      data: { type, title, message, severity }
    });
  }

  async getNotifications(filters = {}) {
    const { isRead, type, severity, page = 1, limit = 20 } = filters;

    const where = {};
    if (isRead !== undefined) where.isRead = isRead === 'true';
    if (type) where.type = type;
    if (severity) where.severity = severity;

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.platformNotification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.platformNotification.count({ where })
    ]);

    return {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async markNotificationAsRead(id, adminId) {
    return await prisma.platformNotification.update({
      where: { id: parseInt(id) },
      data: { isRead: true, readBy: adminId, readAt: new Date() }
    });
  }

  /**
   * System health check
   */
  async checkSystemHealth() {
    const services = [
      { name: 'Auth Service', url: `${this.authServiceUrl}/health` },
      { name: 'User Service', url: `${this.userServiceUrl}/health` },
      { name: 'Booking Service', url: `${this.bookingServiceUrl}/health` },
      { name: 'Payment Service', url: `${this.paymentServiceUrl}/health` },
      { name: 'Review Service', url: `${this.reviewServiceUrl}/health` },
      { name: 'Vendor Service', url: `${this.vendorServiceUrl}/health` },
      { name: 'Catalog Service', url: `${this.catalogServiceUrl}/health` }
    ];

    const healthChecks = await Promise.allSettled(
      services.map(async (service) => {
        try {
          const start = Date.now();
          const response = await axios.get(service.url, { timeout: 3000 });
          const responseTime = Date.now() - start;
          return {
            name: service.name,
            status: 'UP',
            responseTime: `${responseTime}ms`,
            timestamp: response.data.timestamp
          };
        } catch (error) {
          return {
            name: service.name,
            status: 'DOWN',
            error: error.message
          };
        }
      })
    );

    return healthChecks.map((result, index) => ({
      service: services[index].name,
      ...(result.status === 'fulfilled' ? result.value : { status: 'DOWN', error: result.reason.message })
    }));
  }

  // Helper methods
  calculateTotalRevenue(payments) {
    return payments
      .filter(p => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  }

  calculateSummary(snapshots) {
    if (!snapshots.length) return null;

    return {
      totalUsers: snapshots[snapshots.length - 1].totalUsers,
      totalBookings: snapshots[snapshots.length - 1].totalBookings,
      totalRevenue: snapshots.reduce((sum, s) => sum + parseFloat(s.bookingRevenue), 0),
      averageRating: snapshots.reduce((sum, s) => sum + s.averageRating, 0) / snapshots.length,
      newUsersGrowth: this.calculateGrowth(snapshots, 'newUsers'),
      bookingsGrowth: this.calculateGrowth(snapshots, 'newBookings'),
      revenueGrowth: this.calculateGrowth(snapshots, 'bookingRevenue')
    };
  }

  calculateGrowth(snapshots, field) {
    if (snapshots.length < 2) return 0;
    const first = parseFloat(snapshots[0][field]);
    const last = parseFloat(snapshots[snapshots.length - 1][field]);
    if (first === 0) return 100;
    return ((last - first) / first * 100).toFixed(2);
  }

  async fetchUserMetrics(date) {
    try {
      const response = await axios.get(`${this.userServiceUrl}/api/v1/users`);
      const users = response.data.data.profiles || [];
      return {
        totalUsers: users.length,
        newUsers: users.filter(u => new Date(u.createdAt).toDateString() === date.toDateString()).length,
        activeUsers: users.filter(u => !u.deletedAt).length
      };
    } catch (error) {
      return { totalUsers: 0, newUsers: 0, activeUsers: 0 };
    }
  }

  async fetchBookingMetrics(date) {
    try {
      const response = await axios.get(`${this.bookingServiceUrl}/api/v1/bookings/admin/all`);
      const bookings = response.data.data.bookings || [];
      return {
        totalBookings: bookings.length,
        newBookings: bookings.filter(b => new Date(b.createdAt).toDateString() === date.toDateString()).length,
        confirmedBookings: bookings.filter(b => b.status === 'CONFIRMED').length,
        cancelledBookings: bookings.filter(b => b.status === 'CANCELLED').length
      };
    } catch (error) {
      return { totalBookings: 0, newBookings: 0, confirmedBookings: 0, cancelledBookings: 0 };
    }
  }

  async fetchPaymentMetrics(date) {
    try {
      const response = await axios.get(`${this.paymentServiceUrl}/api/v1/payments/admin/payments`);
      const payments = response.data.data.payments || [];
      const successPayments = payments.filter(p => p.status === 'SUCCESS');
      return {
        totalRevenue: this.calculateTotalRevenue(payments),
        bookingRevenue: this.calculateTotalRevenue(successPayments),
        refundAmount: 0
      };
    } catch (error) {
      return { totalRevenue: 0, bookingRevenue: 0, refundAmount: 0 };
    }
  }

  async fetchVendorMetrics(date) {
    try {
      const response = await axios.get(`${this.vendorServiceUrl}/api/v1/vendors/admin/all`);
      const vendors = response.data.data.vendors || [];
      return {
        totalVendors: vendors.length,
        activeVendors: vendors.filter(v => v.status === 'APPROVED').length,
        pendingVendors: vendors.filter(v => v.status === 'PENDING').length
      };
    } catch (error) {
      return { totalVendors: 0, activeVendors: 0, pendingVendors: 0 };
    }
  }

  async fetchReviewMetrics(date) {
    try {
      const response = await axios.get(`${this.reviewServiceUrl}/api/v1/reviews/admin/pending`);
      const reviews = response.data.data.reviews || [];
      return {
        totalReviews: reviews.length,
        newReviews: reviews.filter(r => new Date(r.createdAt).toDateString() === date.toDateString()).length,
        averageRating: reviews.reduce((sum, r) => sum + r.overallRating, 0) / (reviews.length || 1)
      };
    } catch (error) {
      return { totalReviews: 0, newReviews: 0, averageRating: 0 };
    }
  }

  extractMetrics(promiseResult, type) {
    if (promiseResult.status === 'fulfilled') {
      return promiseResult.value;
    }
    // Return default values based on type
    const defaults = {
      users: { totalUsers: 0, newUsers: 0, activeUsers: 0 },
      bookings: { totalBookings: 0, newBookings: 0, confirmedBookings: 0, cancelledBookings: 0 },
      payments: { totalRevenue: 0, bookingRevenue: 0, refundAmount: 0 },
      vendors: { totalVendors: 0, activeVendors: 0, pendingVendors: 0 },
      reviews: { totalReviews: 0, newReviews: 0, averageRating: 0 }
    };
    return defaults[type] || {};
  }
}

module.exports = new AdminService();
