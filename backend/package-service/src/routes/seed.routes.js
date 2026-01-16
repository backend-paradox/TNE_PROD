const express = require('express');
const router = express.Router();
const { seedTourPackages, seedCineTripPackages, seedDestinations, seedAll } = require('../utils/seed');
const { seedCineTripReviews } = require('../utils/seedReviews');
const { seedTourReviews } = require('../utils/seedTourReviews');

// POST /api/v1/seed/tour-packages - Seed tour packages from CSV
router.post('/tour-packages', async (req, res) => {
  try {
    const count = await seedTourPackages();
    res.json({
      success: true,
      message: `Successfully seeded ${count} tour packages`,
      count
    });
  } catch (error) {
    console.error('Error seeding tour packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed tour packages',
      error: error.message
    });
  }
});

// POST /api/v1/seed/cinetrip-packages - Seed cinetrip packages from CSV
router.post('/cinetrip-packages', async (req, res) => {
  try {
    const count = await seedCineTripPackages();
    res.json({
      success: true,
      message: `Successfully seeded ${count} cinetrip packages`,
      count
    });
  } catch (error) {
    console.error('Error seeding cinetrip packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed cinetrip packages',
      error: error.message
    });
  }
});

// POST /api/v1/seed/destinations - Seed destinations
router.post('/destinations', async (req, res) => {
  try {
    const count = await seedDestinations();
    res.json({
      success: true,
      message: `Successfully seeded ${count} destinations`,
      count
    });
  } catch (error) {
    console.error('Error seeding destinations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed destinations',
      error: error.message
    });
  }
});

// POST /api/v1/seed/cinetrip-reviews - Seed CineTrip package reviews
router.post('/cinetrip-reviews', async (req, res) => {
  try {
    const count = await seedCineTripReviews();
    res.json({
      success: true,
      message: `Successfully seeded ${count} CineTrip reviews`,
      count
    });
  } catch (error) {
    console.error('Error seeding CineTrip reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed CineTrip reviews',
      error: error.message
    });
  }
});

// POST /api/v1/seed/tour-reviews - Seed Tour package reviews
router.post('/tour-reviews', async (req, res) => {
  try {
    const count = await seedTourReviews();
    res.json({
      success: true,
      message: `Successfully seeded ${count} Tour reviews`,
      count
    });
  } catch (error) {
    console.error('Error seeding Tour reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed Tour reviews',
      error: error.message
    });
  }
});

// POST /api/v1/seed/all - Seed all packages and destinations
router.post('/all', async (req, res) => {
  try {
    const tourCount = await seedTourPackages();
    const cineTripCount = await seedCineTripPackages();
    const destinationCount = await seedDestinations();
    res.json({
      success: true,
      message: 'Successfully seeded all data',
      tourPackages: tourCount,
      cineTripPackages: cineTripCount,
      destinations: destinationCount
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed data',
      error: error.message
    });
  }
});

module.exports = router;
