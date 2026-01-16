const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tour.controller');

// Special routes (before :slug to avoid conflicts)
router.get('/search', tourController.search);
router.get('/trending', tourController.getTrending);
router.get('/popular', tourController.getPopular);
router.get('/domestic', tourController.getDomestic);
router.get('/international', tourController.getInternational);
router.get('/visa-free', tourController.getVisaFree);
router.get('/by-continent/:continent', tourController.getByContinent);
router.get('/by-duration', tourController.getByDuration);
router.get('/by-tags/:tags', tourController.getByTags);
router.get('/by-id/:id', tourController.getById);

// Review routes (before :slug to avoid conflicts)
router.get('/:slug/reviews', tourController.getReviews);
router.post('/:slug/reviews', tourController.createReview);
router.get('/:slug/reviews/stats', tourController.getReviewStats);
router.post('/reviews/:reviewId/helpful', tourController.markReviewHelpful);

// CRUD routes
router.get('/', tourController.getAll);
router.get('/:slug', tourController.getBySlug);
router.post('/', tourController.create);
router.put('/:id', tourController.update);
router.delete('/:id', tourController.delete);

module.exports = router;
