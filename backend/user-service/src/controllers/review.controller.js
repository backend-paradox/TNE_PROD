const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get user's reviews
 */
const getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, page = 1, limit = 20 } = req.query;

    const where = { userProfileId: userId };
    if (type) {
      where.reviewType = type.toUpperCase();
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      prisma.review.count({ where })
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Submit a review
 */
const submitReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      reviewType,
      targetId,
      bookingId,
      rating,
      title,
      content,
      targetName,
      targetImage,
      images,
      aspectRatings,
      pros,
      cons,
      tripDate,
      travelType
    } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if already reviewed
    const existing = await prisma.review.findUnique({
      where: {
        userProfileId_reviewType_targetId: {
          userProfileId: userId,
          reviewType: reviewType.toUpperCase(),
          targetId
        }
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this item'
      });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userProfileId: userId,
        reviewType: reviewType.toUpperCase(),
        targetId,
        bookingId,
        rating,
        title,
        content,
        targetName,
        targetImage,
        images,
        aspectRatings,
        pros,
        cons,
        tripDate: tripDate ? new Date(tripDate) : null,
        travelType,
        isVerified: !!bookingId // Mark as verified if booking ID provided
      }
    });

    // Update user's total reviews count
    await prisma.userProfile.update({
      where: { id: userId },
      data: { totalReviews: { increment: 1 } }
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update a review
 */
const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const {
      rating,
      title,
      content,
      images,
      aspectRatings,
      pros,
      cons
    } = req.body;

    const review = await prisma.review.findFirst({
      where: {
        id: parseInt(reviewId),
        userProfileId: userId
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const updated = await prisma.review.update({
      where: { id: parseInt(reviewId) },
      data: {
        rating: rating !== undefined ? rating : review.rating,
        title: title !== undefined ? title : review.title,
        content: content !== undefined ? content : review.content,
        images: images !== undefined ? images : review.images,
        aspectRatings: aspectRatings !== undefined ? aspectRatings : review.aspectRatings,
        pros: pros !== undefined ? pros : review.pros,
        cons: cons !== undefined ? cons : review.cons
      }
    });

    res.json({
      success: true,
      message: 'Review updated',
      data: updated
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a review
 */
const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    const review = await prisma.review.findFirst({
      where: {
        id: parseInt(reviewId),
        userProfileId: userId
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await prisma.review.delete({
      where: { id: parseInt(reviewId) }
    });

    // Update user's total reviews count
    await prisma.userProfile.update({
      where: { id: userId },
      data: { totalReviews: { decrement: 1 } }
    });

    res.json({
      success: true,
      message: 'Review deleted'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get reviews for a specific item (package, hotel, etc.)
 */
const getItemReviews = async (req, res) => {
  try {
    const { type, targetId } = req.params;
    const { page = 1, limit = 20, sort = 'recent' } = req.query;

    const orderBy = sort === 'helpful'
      ? { helpfulCount: 'desc' }
      : sort === 'rating_high'
        ? { rating: 'desc' }
        : sort === 'rating_low'
          ? { rating: 'asc' }
          : { createdAt: 'desc' };

    const where = {
      reviewType: type.toUpperCase(),
      targetId,
      isApproved: true
    };

    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: parseInt(limit),
        include: {
          userProfile: {
            select: {
              id: true,
              name: true,
              profilePicUrl: true,
              isVerified: true
            }
          }
        }
      }),
      prisma.review.count({ where }),
      prisma.review.aggregate({
        where,
        _avg: { rating: true },
        _count: { rating: true }
      })
    ]);

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where,
      _count: { rating: true }
    });

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach(r => {
      distribution[r.rating] = r._count.rating;
    });

    res.json({
      success: true,
      data: {
        reviews,
        stats: {
          averageRating: stats._avg.rating || 0,
          totalReviews: stats._count.rating,
          ratingDistribution: distribution
        }
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get item reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Mark review as helpful
 */
const markHelpful = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if already marked
    const existing = await prisma.reviewHelpful.findUnique({
      where: {
        reviewId_userProfileId: {
          reviewId: parseInt(reviewId),
          userProfileId: userId
        }
      }
    });

    if (existing) {
      // Remove helpful mark
      await prisma.reviewHelpful.delete({
        where: { id: existing.id }
      });
      await prisma.review.update({
        where: { id: parseInt(reviewId) },
        data: { helpfulCount: { decrement: 1 } }
      });
      return res.json({
        success: true,
        message: 'Helpful mark removed',
        data: { isHelpful: false }
      });
    }

    // Add helpful mark
    await prisma.reviewHelpful.create({
      data: {
        reviewId: parseInt(reviewId),
        userProfileId: userId
      }
    });
    await prisma.review.update({
      where: { id: parseInt(reviewId) },
      data: { helpfulCount: { increment: 1 } }
    });

    res.json({
      success: true,
      message: 'Marked as helpful',
      data: { isHelpful: true }
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Report a review
 */
const reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await prisma.review.update({
      where: { id: parseInt(reviewId) },
      data: { reportCount: { increment: 1 } }
    });

    // TODO: Create a separate reports table and notify admins

    res.json({
      success: true,
      message: 'Review reported. Our team will review it.'
    });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyReviews,
  submitReview,
  updateReview,
  deleteReview,
  getItemReviews,
  markHelpful,
  reportReview
};
