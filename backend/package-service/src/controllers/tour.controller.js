const tourService = require('../services/tour.service');
const tourReviewService = require('../services/tour-review.service');

class TourController {
  // GET /api/v1/tour-packages
  async getAll(req, res) {
    try {
      const packages = await tourService.getAll(req.query);
      res.json({
        success: true,
        data: packages,
        count: packages.length
      });
    } catch (error) {
      console.error('Error fetching tour packages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tour packages',
        error: error.message
      });
    }
  }

  // GET /api/v1/tour-packages/trending
  async getTrending(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 4;
      const packages = await tourService.getTrending(limit);
      res.json({
        success: true,
        data: packages,
        count: packages.length
      });
    } catch (error) {
      console.error('Error fetching trending packages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch trending packages',
        error: error.message
      });
    }
  }

  // GET /api/v1/tour-packages/popular
  async getPopular(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 8;
      const packages = await tourService.getPopular(limit);
      res.json({
        success: true,
        data: packages,
        count: packages.length
      });
    } catch (error) {
      console.error('Error fetching popular packages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch popular packages',
        error: error.message
      });
    }
  }

  // GET /api/v1/tour-packages/domestic
  async getDomestic(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      const packages = await tourService.getDomestic(limit);
      res.json({
        success: true,
        data: packages,
        count: packages.length
      });
    } catch (error) {
      console.error('Error fetching domestic packages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch domestic packages',
        error: error.message
      });
    }
  }

  // GET /api/v1/tour-packages/international
  async getInternational(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      const packages = await tourService.getInternational(limit);
      res.json({
        success: true,
        data: packages,
        count: packages.length
      });
    } catch (error) {
      console.error('Error fetching international packages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch international packages',
        error: error.message
      });
    }
  }

  // GET /api/v1/tour-packages/by-tags/:tags
  async getByTags(req, res) {
    try {
      const { tags } = req.params;
      const packages = await tourService.getByTags(tags);
      res.json({
        success: true,
        data: packages,
        count: packages.length
      });
    } catch (error) {
      console.error('Error fetching packages by tags:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch packages by tags',
        error: error.message
      });
    }
  }

  // GET /api/v1/tour-packages/visa-free
  async getVisaFree(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 8;
      const packages = await tourService.getVisaFree(limit);
      res.json({
        success: true,
        data: packages,
        count: packages.length
      });
    } catch (error) {
      console.error('Error fetching visa-free packages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch visa-free packages',
        error: error.message
      });
    }
  }

  // GET /api/v1/tour-packages/by-continent/:continent
  async getByContinent(req, res) {
    try {
      const { continent } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      const packages = await tourService.getByContinent(continent, limit);
      res.json({
        success: true,
        data: packages,
        count: packages.length
      });
    } catch (error) {
      console.error('Error fetching packages by continent:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch packages by continent',
        error: error.message
      });
    }
  }

  // GET /api/v1/tour-packages/by-duration
  async getByDuration(req, res) {
    try {
      const minDays = req.query.min ? parseInt(req.query.min) : 1;
      const maxDays = req.query.max ? parseInt(req.query.max) : 99;
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      const packages = await tourService.getByDuration(minDays, maxDays, limit);
      res.json({
        success: true,
        data: packages,
        count: packages.length
      });
    } catch (error) {
      console.error('Error fetching packages by duration:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch packages by duration',
        error: error.message
      });
    }
  }

  // GET /api/v1/tour-packages/search
  async search(req, res) {
    try {
      const { q, category, limit } = req.query;
      const packages = await tourService.search(q, category, parseInt(limit) || 10);
      res.json({
        success: true,
        data: packages,
        count: packages.length
      });
    } catch (error) {
      console.error('Error searching packages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search packages',
        error: error.message
      });
    }
  }

  // GET /api/v1/tour-packages/by-id/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const pkg = await tourService.getById(id);

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
      console.error('Error fetching package by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch package',
        error: error.message
      });
    }
  }

  // GET /api/v1/tour-packages/:slug
  async getBySlug(req, res) {
    try {
      const { slug } = req.params;
      const pkg = await tourService.getBySlug(slug);

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

  // POST /api/v1/tour-packages
  async create(req, res) {
    try {
      const pkg = await tourService.create(req.body);
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

  // PUT /api/v1/tour-packages/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const pkg = await tourService.update(id, req.body);
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

  // DELETE /api/v1/tour-packages/:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      await tourService.delete(id);
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

  // GET /api/v1/tour-packages/:slug/reviews
  async getReviews(req, res) {
    try {
      const { slug } = req.params;
      const result = await tourReviewService.getReviewsByPackageId(slug);
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

  // POST /api/v1/tour-packages/:slug/reviews
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

      const review = await tourReviewService.createReview(slug, reviewData);
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

  // GET /api/v1/tour-packages/:slug/reviews/stats
  async getReviewStats(req, res) {
    try {
      const { slug } = req.params;
      const stats = await tourReviewService.getReviewStats(slug);
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

  // POST /api/v1/tour-packages/reviews/:reviewId/helpful
  async markReviewHelpful(req, res) {
    try {
      const { reviewId } = req.params;
      const review = await tourReviewService.markReviewHelpful(reviewId);
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

module.exports = new TourController();
