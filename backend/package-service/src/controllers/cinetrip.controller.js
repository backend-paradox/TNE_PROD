const cineTripService = require('../services/cinetrip.service');
const cineTripReviewService = require('../services/cinetrip-review.service');

class CineTripController {
  // GET /api/v1/cinetrip-packages
  async getAll(req, res) {
    try {
      const packages = await cineTripService.getAll(req.query);
      res.json({
        success: true,
        data: packages,
        count: packages.length
      });
    } catch (error) {
      console.error('Error fetching cinetrip packages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cinetrip packages',
        error: error.message
      });
    }
  }

  // GET /api/v1/cinetrip-packages/featured
  async getFeatured(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 8;
      const packages = await cineTripService.getFeatured(limit);
      res.json({
        success: true,
        data: packages,
        count: packages.length
      });
    } catch (error) {
      console.error('Error fetching featured packages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch featured packages',
        error: error.message
      });
    }
  }

  // GET /api/v1/cinetrip-packages/category/:category
  async getByCategory(req, res) {
    try {
      const { category } = req.params;
      const packages = await cineTripService.getByCategory(category);
      res.json({
        success: true,
        data: packages,
        count: packages.length
      });
    } catch (error) {
      console.error('Error fetching packages by category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch packages by category',
        error: error.message
      });
    }
  }

  // GET /api/v1/cinetrip-packages/:slug
  async getBySlug(req, res) {
    try {
      const { slug } = req.params;
      const pkg = await cineTripService.getBySlug(slug);

      if (!pkg) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      res.json({
        success: true,
        data: pkg
      });
    } catch (error) {
      console.error('Error fetching package:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch package',
        error: error.message
      });
    }
  }

  // POST /api/v1/cinetrip-packages
  async create(req, res) {
    try {
      const pkg = await cineTripService.create(req.body);
      res.status(201).json({
        success: true,
        data: pkg,
        message: 'Package created successfully'
      });
    } catch (error) {
      console.error('Error creating package:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create package',
        error: error.message
      });
    }
  }

  // PUT /api/v1/cinetrip-packages/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const pkg = await cineTripService.update(id, req.body);
      res.json({
        success: true,
        data: pkg,
        message: 'Package updated successfully'
      });
    } catch (error) {
      console.error('Error updating package:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update package',
        error: error.message
      });
    }
  }

  // DELETE /api/v1/cinetrip-packages/:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      await cineTripService.delete(id);
      res.json({
        success: true,
        message: 'Package deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting package:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete package',
        error: error.message
      });
    }
  }

  // ==================== REVIEW ENDPOINTS ====================

  // GET /api/v1/cinetrip-packages/:slug/reviews
  async getReviews(req, res) {
    try {
      const { slug } = req.params;
      const result = await cineTripReviewService.getReviewsByPackageId(slug);
      res.json({
        success: true,
        data: result.reviews,
        stats: result.stats
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews',
        error: error.message
      });
    }
  }

  // POST /api/v1/cinetrip-packages/:slug/reviews
  async createReview(req, res) {
    try {
      const { slug } = req.params;
      const reviewData = req.body;

      // Validate required fields
      if (!reviewData.userId || !reviewData.userName || !reviewData.userEmail) {
        return res.status(400).json({
          success: false,
          message: 'User information is required'
        });
      }

      if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      const review = await cineTripReviewService.createReview(slug, reviewData);
      res.status(201).json({
        success: true,
        data: review,
        message: 'Review submitted successfully'
      });
    } catch (error) {
      console.error('Error creating review:', error);
      const statusCode = error.message.includes('already reviewed') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to create review',
        error: error.message
      });
    }
  }

  // GET /api/v1/cinetrip-packages/:slug/reviews/stats
  async getReviewStats(req, res) {
    try {
      const { slug } = req.params;
      const stats = await cineTripReviewService.getReviewStats(slug);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching review stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch review stats',
        error: error.message
      });
    }
  }

  // POST /api/v1/cinetrip-packages/reviews/:reviewId/helpful
  async markReviewHelpful(req, res) {
    try {
      const { reviewId } = req.params;
      const review = await cineTripReviewService.markReviewHelpful(reviewId);
      res.json({
        success: true,
        data: review,
        message: 'Review marked as helpful'
      });
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark review as helpful',
        error: error.message
      });
    }
  }
}

module.exports = new CineTripController();
