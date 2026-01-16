const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TourReviewService {
  /**
   * Get all reviews for a specific tour package
   * @param {string} packageId - Package ID or slug
   * @returns {Promise<Object>} Reviews and stats
   */
  async getReviewsByPackageId(packageId) {
    try {
      // First, find the package by slug or id
      const pkg = await prisma.tourPackage.findFirst({
        where: {
          OR: [
            { id: packageId },
            { slug: packageId },
            { packageId: packageId }
          ]
        }
      });

      if (!pkg) {
        throw new Error('Package not found');
      }

      // Fetch reviews
      const reviews = await prisma.tourPackageReview.findMany({
        where: {
          packageId: pkg.id
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Calculate star distribution
      const starDistribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      };

      reviews.forEach(review => {
        if (review.rating >= 1 && review.rating <= 5) {
          starDistribution[review.rating]++;
        }
      });

      return {
        reviews,
        stats: {
          averageRating: pkg.rating ? parseFloat(pkg.rating) : 0,
          totalReviews: pkg.reviewCount || 0,
          starDistribution
        }
      };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  /**
   * Create a new review for a tour package
   * @param {string} packageId - Package ID or slug
   * @param {Object} reviewData - Review data (userId, userName, userEmail, rating, comment)
   * @returns {Promise<Object>} Created review
   */
  async createReview(packageId, reviewData) {
    try {
      // Find the package
      const pkg = await prisma.tourPackage.findFirst({
        where: {
          OR: [
            { id: packageId },
            { slug: packageId },
            { packageId: packageId }
          ]
        }
      });

      if (!pkg) {
        throw new Error('Package not found');
      }

      // Validate rating
      if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Check if user already reviewed this package
      const existingReview = await prisma.tourPackageReview.findFirst({
        where: {
          packageId: pkg.id,
          userId: reviewData.userId
        }
      });

      if (existingReview) {
        throw new Error('You have already reviewed this package');
      }

      // Create the review
      const review = await prisma.tourPackageReview.create({
        data: {
          packageId: pkg.id,
          userId: reviewData.userId,
          userName: reviewData.userName,
          userEmail: reviewData.userEmail,
          rating: reviewData.rating,
          comment: reviewData.comment || '',
          verified: reviewData.verified || false
        }
      });

      // Update package rating and review count
      await this.updatePackageRating(pkg.id);

      return review;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  /**
   * Update package average rating and review count
   * @param {string} packageId - Package ID
   * @returns {Promise<void>}
   */
  async updatePackageRating(packageId) {
    try {
      // Get all reviews for this package
      const reviews = await prisma.tourPackageReview.findMany({
        where: { packageId },
        select: { rating: true }
      });

      const reviewCount = reviews.length;
      const averageRating = reviewCount > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

      // Update package
      await prisma.tourPackage.update({
        where: { id: packageId },
        data: {
          rating: parseFloat(averageRating.toFixed(1)),
          reviewCount
        }
      });
    } catch (error) {
      console.error('Error updating package rating:', error);
      throw error;
    }
  }

  /**
   * Get review statistics for a tour package
   * @param {string} packageId - Package ID or slug
   * @returns {Promise<Object>} Review statistics
   */
  async getReviewStats(packageId) {
    try {
      const { stats } = await this.getReviewsByPackageId(packageId);
      return stats;
    } catch (error) {
      console.error('Error fetching review stats:', error);
      throw error;
    }
  }

  /**
   * Mark a review as helpful
   * @param {string} reviewId - Review ID
   * @returns {Promise<Object>} Updated review
   */
  async markReviewHelpful(reviewId) {
    try {
      const review = await prisma.tourPackageReview.update({
        where: { id: reviewId },
        data: {
          helpful: {
            increment: 1
          }
        }
      });
      return review;
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      throw error;
    }
  }
}

module.exports = new TourReviewService();
