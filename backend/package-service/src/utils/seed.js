require('dotenv').config();
const fs = require('fs');
const path = require('path');
const prisma = require('../config/prisma');
const { importCineTripPackages } = require('./csvImport');
const { tourPackages } = require('../data/tourPackages.seed');

const ROOT_DIR = path.resolve(__dirname, '../../../..');

// Fallback CineTrip data when CSV is not available
// Using local destination images for cinematic context
const fallbackCineTripPackages = [
  {
    packageId: 'CT001',
    slug: 'cinematrip',
    name: 'CinemaTrip Experience',
    shortDescription: 'Transform your travel into cinematic memories with our professional film crew.',
    longDescription: null,
    image: '/assets/images/destinations/domestic/north-india/kashmir/kashmir_new_01.jpg',
    price: 45999,
    priceDisplay: '₹45,999',
    duration: '3-5 Days',
    category: 'Travel',
    features: ['Professional Equipment', '4K Quality', 'Drone Shots', 'Color Grading'],
    deliveryTime: '7-10 Days',
    popular: true,
    featured: true,
    isActive: true,
    sortOrder: 0
  },
  {
    packageId: 'CT002',
    slug: 'pre-wedding-shoot',
    name: 'Pre-Wedding Shoot',
    shortDescription: 'Capture your love story with stunning cinematic pre-wedding shoots.',
    longDescription: null,
    image: '/assets/images/destinations/domestic/rajasthan/udaipur/udaipur_palace_01.jpeg',
    price: 35999,
    priceDisplay: '₹35,999',
    duration: '2 Days',
    category: 'Wedding',
    features: ['Professional Photography', 'Video Coverage', 'Makeup Coordination'],
    deliveryTime: '5-7 Days',
    popular: true,
    featured: true,
    isActive: true,
    sortOrder: 1
  },
  {
    packageId: 'CT003',
    slug: 'honeymoon-movie',
    name: 'Honeymoon Movie',
    shortDescription: 'Turn your honeymoon into a beautiful cinematic film.',
    longDescription: null,
    image: '/assets/images/destinations/international/asia/maldives/maldives_resort_01.jpeg',
    price: 55999,
    priceDisplay: '₹55,999',
    duration: '5-7 Days',
    category: 'Wedding',
    features: ['Romantic Shots', 'Destination Coverage', '4K Film'],
    deliveryTime: '10-14 Days',
    popular: true,
    featured: true,
    isActive: true,
    sortOrder: 2
  },
  {
    packageId: 'CT004',
    slug: 'family-trip',
    name: 'Family Trip Movie',
    shortDescription: 'Preserve precious family memories with a professionally shot travel film.',
    longDescription: null,
    image: '/assets/images/destinations/international/asia/thailand/thailand_beach_02.jpeg',
    price: 52999,
    priceDisplay: '₹52,999',
    duration: '4-6 Days',
    category: 'Travel',
    features: ['Family Moments', 'Candid Shots', 'Professional Editing'],
    deliveryTime: '10-14 Days',
    popular: true,
    featured: true,
    isActive: true,
    sortOrder: 3
  },
  {
    packageId: 'CT005',
    slug: 'anniversary-celebration',
    name: 'Anniversary Celebration',
    shortDescription: 'Celebrate your milestone anniversary with a cinematic memory.',
    longDescription: null,
    image: '/assets/images/destinations/domestic/south-india/kerala/kerala_backwaters_01.jpeg',
    price: 39999,
    priceDisplay: '₹39,999',
    duration: '2-3 Days',
    category: 'Celebration',
    features: ['Celebration Coverage', 'Event Filming', 'Highlight Reel'],
    deliveryTime: '5-7 Days',
    popular: false,
    featured: false,
    isActive: true,
    sortOrder: 4
  },
  {
    packageId: 'CT006',
    slug: 'birthday-celebration',
    name: 'Birthday Celebration',
    shortDescription: 'Make birthdays unforgettable with professional event coverage.',
    longDescription: null,
    image: '/assets/images/destinations/domestic/rajasthan/jaipur/jaipur_palace_01.jpeg',
    price: 25999,
    priceDisplay: '₹25,999',
    duration: '1 Day',
    category: 'Celebration',
    features: ['Party Coverage', 'Guest Interviews', 'Quick Delivery'],
    deliveryTime: '3-5 Days',
    popular: false,
    featured: false,
    isActive: true,
    sortOrder: 5
  },
  {
    packageId: 'CT007',
    slug: 'yacht-experiences',
    name: 'Yacht Experiences',
    shortDescription: 'Luxury yacht filming for the ultimate cinematic experience.',
    longDescription: null,
    image: '/assets/images/destinations/international/asia/maldives/maldives_beach_02.jpeg',
    price: 75999,
    priceDisplay: '₹75,999',
    duration: '1-3 Days',
    category: 'Luxury',
    features: ['Yacht Coverage', 'Aerial Shots', 'Premium Editing'],
    deliveryTime: '7-10 Days',
    popular: true,
    featured: true,
    isActive: true,
    sortOrder: 6
  },
  {
    packageId: 'CT008',
    slug: 'corporate-film-trip',
    name: 'Corporate Film Trip',
    shortDescription: 'Professional corporate event and team outing documentation.',
    longDescription: null,
    image: '/assets/images/destinations/international/asia/dubai/dubai_skyline_01.jpeg',
    price: 65999,
    priceDisplay: '₹65,999',
    duration: '2-4 Days',
    category: 'Corporate',
    features: ['Corporate Events', 'Team Building Coverage', 'Branded Content'],
    deliveryTime: '10-14 Days',
    popular: false,
    featured: false,
    isActive: true,
    sortOrder: 7
  },
  {
    packageId: 'CT009',
    slug: 'proposal-engagement',
    name: 'Proposal & Engagement',
    shortDescription: 'Capture the magical moment of your proposal cinematically.',
    longDescription: null,
    image: '/assets/images/destinations/international/europe/paris/paris_eiffel_tower_01.jpeg',
    price: 29999,
    priceDisplay: '₹29,999',
    duration: '1 Day',
    category: 'Wedding',
    features: ['Surprise Setup', 'Hidden Cameras', 'Quick Turnaround'],
    deliveryTime: '2-3 Days',
    popular: true,
    featured: true,
    isActive: true,
    sortOrder: 8
  },
  {
    packageId: 'CT010',
    slug: 'memory-lane-trip',
    name: 'Memory Lane Trip',
    shortDescription: 'Revisit special places and create a nostalgic travel film.',
    longDescription: null,
    image: '/assets/images/destinations/domestic/south-india/goa/goa_sunset_02.jpeg',
    price: 42999,
    priceDisplay: '₹42,999',
    duration: '3-4 Days',
    category: 'Travel',
    features: ['Location Revisits', 'Story Telling', 'Emotional Narrative'],
    deliveryTime: '7-10 Days',
    popular: false,
    featured: false,
    isActive: true,
    sortOrder: 9
  },
  {
    packageId: 'CT011',
    slug: 'babymoon-trip',
    name: 'Babymoon Trip',
    shortDescription: 'Document your special babymoon journey before the little one arrives.',
    longDescription: null,
    image: '/assets/images/destinations/domestic/south-india/kerala/kerala_houseboat_02.jpeg',
    price: 44999,
    priceDisplay: '₹44,999',
    duration: '3-4 Days',
    category: 'Travel',
    features: ['Maternity Shots', 'Couple Moments', 'Gentle Pacing'],
    deliveryTime: '7-10 Days',
    popular: false,
    featured: false,
    isActive: true,
    sortOrder: 10
  },
  {
    packageId: 'CT012',
    slug: 'personal-events',
    name: 'Personal Events',
    shortDescription: 'Professional coverage for any personal milestone or celebration.',
    longDescription: null,
    image: '/assets/images/destinations/domestic/south-india/goa/goa_new_01.jpg',
    price: 32999,
    priceDisplay: '₹32,999',
    duration: '1-2 Days',
    category: 'Events',
    features: ['Event Coverage', 'Guest Highlights', 'Same Day Edit Option'],
    deliveryTime: '5-7 Days',
    popular: false,
    featured: false,
    isActive: true,
    sortOrder: 11
  }
];

async function seedTourPackages() {
  console.log('📦 Seeding Tour Packages...');

  try {
    // Clear existing data
    await prisma.tourPackage.deleteMany({});
    console.log('  ✓ Cleared existing tour packages');

    // Use seed data from tourPackages.seed.js (27 packages from Website Product.xlsx)
    console.log(`  ✓ Using ${tourPackages.length} packages from seed data`);

    // Insert packages
    const result = await prisma.tourPackage.createMany({
      data: tourPackages,
      skipDuplicates: true
    });

    console.log(`  ✓ Inserted ${result.count} tour packages`);
    return result.count;
  } catch (error) {
    console.error('  ✗ Error seeding tour packages:', error.message);
    throw error;
  }
}

async function seedCineTripPackages() {
  console.log('🎬 Seeding CineTrip Packages...');

  const csvPath = path.join(ROOT_DIR, 'CinemaTrip_Packages_Cross_Checked.csv');

  try {
    // Clear existing data
    await prisma.cineTripPackage.deleteMany({});
    console.log('  ✓ Cleared existing cinetrip packages');

    let packages;

    // Check if CSV exists, otherwise use fallback data
    if (fs.existsSync(csvPath)) {
      // Import from CSV (merged with frontend data)
      packages = await importCineTripPackages(csvPath);
      console.log(`  ✓ Parsed ${packages.length} packages from CSV`);
    } else {
      // Use fallback inline data
      console.log('  ⚠ CSV not found, using fallback data');
      packages = fallbackCineTripPackages;
      console.log(`  ✓ Using ${packages.length} fallback packages`);
    }

    // Insert packages
    const result = await prisma.cineTripPackage.createMany({
      data: packages,
      skipDuplicates: true
    });

    console.log(`  ✓ Inserted ${result.count} cinetrip packages`);
    return result.count;
  } catch (error) {
    console.error('  ✗ Error seeding cinetrip packages:', error.message);
    throw error;
  }
}

async function seedAll() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              PACKAGE DATABASE SEEDING                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    const tourCount = await seedTourPackages();
    console.log('');
    const cineTripCount = await seedCineTripPackages();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              SEEDING COMPLETE                              ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  📦 Tour Packages: ${String(tourCount).padEnd(38)}║`);
    console.log(`║  🎬 CineTrip Packages: ${String(cineTripCount).padEnd(35)}║`);
    console.log('╚════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedAll();
}

module.exports = {
  seedTourPackages,
  seedCineTripPackages,
  seedAll
};
