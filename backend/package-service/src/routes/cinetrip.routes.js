const express = require('express');
const router = express.Router();
const cineTripController = require('../controllers/cinetrip.controller');

// Special routes (before :slug to avoid conflicts)
router.get('/search', cineTripController.search);
router.get('/featured', cineTripController.getFeatured);
router.get('/category/:category', cineTripController.getByCategory);

// Review routes (before :slug to avoid conflicts)
router.get('/:slug/reviews', cineTripController.getReviews);
router.post('/:slug/reviews', cineTripController.createReview);
router.get('/:slug/reviews/stats', cineTripController.getReviewStats);
router.post('/reviews/:reviewId/helpful', cineTripController.markReviewHelpful);

// CRUD routes
router.get('/', cineTripController.getAll);
router.get('/:slug', cineTripController.getBySlug);
router.post('/', cineTripController.create);
router.put('/:id', cineTripController.update);
router.delete('/:id', cineTripController.delete);

module.exports = router;
