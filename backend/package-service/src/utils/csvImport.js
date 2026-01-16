const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Frontend CineTrip data for merging (since CSV is missing price, image, duration, category)
// Using local destination images for cinematic context
const frontendCineTripData = {
  'cinematrip': {
    price: 45999,
    priceDisplay: '₹45,999',
    duration: '3-5 Days',
    category: 'Travel',
    image: '/assets/images/destinations/domestic/north-india/kashmir/kashmir_new_01.jpg',
    deliveryTime: '7-10 Days',
    popular: true
  },
  'pre-wedding-shoot': {
    price: 35999,
    priceDisplay: '₹35,999',
    duration: '2 Days',
    category: 'Wedding',
    image: '/assets/images/destinations/domestic/rajasthan/udaipur/udaipur_palace_01.jpeg',
    deliveryTime: '5-7 Days',
    popular: true
  },
  'honeymoon-movie': {
    price: 55999,
    priceDisplay: '₹55,999',
    duration: '5-7 Days',
    category: 'Wedding',
    image: '/assets/images/destinations/international/asia/maldives/maldives_resort_01.jpeg',
    deliveryTime: '10-14 Days',
    popular: true
  },
  'memory-lane-trip': {
    price: 42999,
    priceDisplay: '₹42,999',
    duration: '3-4 Days',
    category: 'Travel',
    image: '/assets/images/destinations/domestic/south-india/goa/goa_sunset_02.jpeg',
    deliveryTime: '7-10 Days',
    popular: false
  },
  'love-story-cinematrip': {
    price: 48999,
    priceDisplay: '₹48,999',
    duration: '4-5 Days',
    category: 'Wedding',
    image: '/assets/images/destinations/domestic/north-india/kashmir/kashmir_valley_01.jpeg',
    deliveryTime: '10-12 Days',
    popular: false
  },
  'anniversary-celebration': {
    price: 39999,
    priceDisplay: '₹39,999',
    duration: '2-3 Days',
    category: 'Celebration',
    image: '/assets/images/destinations/domestic/south-india/kerala/kerala_backwaters_01.jpeg',
    deliveryTime: '5-7 Days',
    popular: false
  },
  'birthday-celebration': {
    price: 25999,
    priceDisplay: '₹25,999',
    duration: '1 Day',
    category: 'Celebration',
    image: '/assets/images/destinations/domestic/rajasthan/jaipur/jaipur_palace_01.jpeg',
    deliveryTime: '3-5 Days',
    popular: false
  },
  'personal-events': {
    price: 32999,
    priceDisplay: '₹32,999',
    duration: '1-2 Days',
    category: 'Events',
    image: '/assets/images/destinations/domestic/south-india/goa/goa_new_01.jpg',
    deliveryTime: '5-7 Days',
    popular: false
  },
  'yacht-experiences': {
    price: 75999,
    priceDisplay: '₹75,999',
    duration: '1-3 Days',
    category: 'Luxury',
    image: '/assets/images/destinations/international/asia/maldives/maldives_beach_02.jpeg',
    deliveryTime: '7-10 Days',
    popular: true
  },
  'corporate-film-trip': {
    price: 65999,
    priceDisplay: '₹65,999',
    duration: '2-4 Days',
    category: 'Corporate',
    image: '/assets/images/destinations/international/asia/dubai/dubai_skyline_01.jpeg',
    deliveryTime: '10-14 Days',
    popular: false
  },
  'proposal-engagement': {
    price: 29999,
    priceDisplay: '₹29,999',
    duration: '1 Day',
    category: 'Wedding',
    image: '/assets/images/destinations/international/europe/paris/paris_eiffel_tower_01.jpeg',
    deliveryTime: '2-3 Days',
    popular: true
  },
  'babymoon-trip': {
    price: 44999,
    priceDisplay: '₹44,999',
    duration: '3-4 Days',
    category: 'Travel',
    image: '/assets/images/destinations/domestic/south-india/kerala/kerala_houseboat_02.jpeg',
    deliveryTime: '7-10 Days',
    popular: false
  },
  'family-trip': {
    price: 52999,
    priceDisplay: '₹52,999',
    duration: '4-6 Days',
    category: 'Travel',
    image: '/assets/images/destinations/international/asia/thailand/thailand_beach_02.jpeg',
    deliveryTime: '10-14 Days',
    popular: true
  },
  'adventure-cinematrip': {
    price: 58999,
    priceDisplay: '₹58,999',
    duration: '5-7 Days',
    category: 'Adventure',
    image: '/assets/images/destinations/domestic/north-india/ladakh/ladakh_landscape_01.jpeg',
    deliveryTime: '10-14 Days',
    popular: false
  },
  'yacht-experience': {
    price: 75999,
    priceDisplay: '₹75,999',
    duration: '1-3 Days',
    category: 'Luxury',
    image: '/assets/images/destinations/international/asia/maldives/maldives_beach_02.jpeg',
    deliveryTime: '7-10 Days',
    popular: true
  },
  'graduation-film': {
    price: 22999,
    priceDisplay: '₹22,999',
    duration: '1 Day',
    category: 'Celebration',
    image: '/assets/images/destinations/domestic/rajasthan/jaipur/jaipur_hawa_mahal_02.jpeg',
    deliveryTime: '3-5 Days',
    popular: false
  },
  'retirement-celebration': {
    price: 35999,
    priceDisplay: '₹35,999',
    duration: '1-2 Days',
    category: 'Celebration',
    image: '/assets/images/destinations/domestic/north-india/varanasi/varanasi_ghat_01.jpeg',
    deliveryTime: '5-7 Days',
    popular: false
  },
  'travel-vlog-package': {
    price: 38999,
    priceDisplay: '₹38,999',
    duration: '3-5 Days',
    category: 'Travel',
    image: '/assets/images/destinations/international/asia/bali/bali_rice_terraces_01.jpeg',
    deliveryTime: '7-10 Days',
    popular: false
  },
  'solo-traveler-film': {
    price: 32999,
    priceDisplay: '₹32,999',
    duration: '2-4 Days',
    category: 'Travel',
    image: '/assets/images/destinations/domestic/north-india/himachal/himachal_mountains_01.jpeg',
    deliveryTime: '5-7 Days',
    popular: false
  },
  'destination-wedding-film': {
    price: 125999,
    priceDisplay: '₹1,25,999',
    duration: '3-5 Days',
    category: 'Wedding',
    image: '/assets/images/destinations/domestic/rajasthan/udaipur/rajasthan_new_01.jpg',
    deliveryTime: '14-21 Days',
    popular: true
  },
  'music-video-trip': {
    price: 85999,
    priceDisplay: '₹85,999',
    duration: '2-4 Days',
    category: 'Creative',
    image: '/assets/images/destinations/international/asia/dubai/dubai_burj_khalifa_02.jpeg',
    deliveryTime: '10-14 Days',
    popular: false
  },
  'travel-documentary': {
    price: 95999,
    priceDisplay: '₹95,999',
    duration: '7-10 Days',
    category: 'Travel',
    image: '/assets/images/destinations/international/europe/switzerland/switzerland_alps_01.jpeg',
    deliveryTime: '21-30 Days',
    popular: false
  },
  // Default values for new packages from CSV that don't have frontend data
  'default': {
    price: 35000,
    priceDisplay: '₹35,000',
    duration: '2-3 Days',
    category: 'Travel',
    image: '/assets/images/destinations/domestic/north-india/kashmir/kashmir_new_01.jpg',
    deliveryTime: '7-10 Days',
    popular: false
  }
};

// Parse pipe-separated string to array
function parseArray(str) {
  if (!str || str === '') return [];
  return str.split('|').map(s => s.trim()).filter(Boolean);
}

// Parse JSON string safely
function parseJSON(str) {
  if (!str || str === '') return [];
  try {
    return JSON.parse(str);
  } catch (e) {
    console.warn('Failed to parse JSON:', str.substring(0, 100));
    return [];
  }
}

// Parse price string to number (e.g., "₹45,999" -> 45999)
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const num = priceStr.replace(/[₹,\s]/g, '');
  return parseInt(num, 10) || 0;
}

// Format price to display string
function formatPrice(price) {
  return `₹${price.toLocaleString('en-IN')}`;
}

// Import Tour Packages from CSV
async function importTourPackages(csvPath) {
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  const packages = records.map((row, index) => ({
    packageId: row.id || `PKG${String(index + 1).padStart(3, '0')}`,
    slug: row.slug,
    name: row.name,
    destination: row.destination || '',
    state: row.state || '',
    country: row.country || 'India',
    category: row.category || 'Domestic',
    tagline: row.tagline || '',
    shortDescription: row.short_description || '',
    longDescription: row.long_description || '',
    duration: row.duration || '',
    startingPrice: parsePrice(row.starting_price),
    priceType: row.price_type || 'Per Person',
    bestSeason: row.best_season || '',
    difficulty: row.difficulty || 'Easy',
    maxGroupSize: parseInt(row.max_group_size, 10) || 20,
    tags: parseArray(row.tags),
    highlights: parseArray(row.highlights),
    inclusions: parseArray(row.inclusions),
    exclusions: parseArray(row.exclusions),
    itinerary: parseJSON(row.itinerary),
    faqs: parseJSON(row.faqs),
    rating: parseFloat(row.rating) || 0,
    reviewCount: parseInt(row.review_count, 10) || 0,
    trending: row.trending === 'Yes' || row.trending === 'true' || row.trending === 'True',
    popular: row.popular === 'Yes' || row.popular === 'true' || row.popular === 'True',
    isActive: row.status !== 'Inactive',
    imageUrl: row.image_url || '',
    galleryImages: parseArray(row.gallery_images),
    sortOrder: index
  }));

  return packages;
}

// Import CineTrip Packages from CSV (merging with frontend data)
async function importCineTripPackages(csvPath) {
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  const packages = records
    .filter(row => row.slug && row.name) // Skip rows without slug or name
    .map((row, index) => {
      // Get frontend data or defaults
      const frontendData = frontendCineTripData[row.slug] || frontendCineTripData['default'];

      // Parse features from CSV (pipe-separated) or use default
      const csvFeatures = parseArray(row.features);
      const features = csvFeatures.length > 0 ? csvFeatures : ['Professional Equipment', '4K Quality'];

      return {
        packageId: row.package_id || `CT${String(index + 1).padStart(3, '0')}`,
        slug: row.slug,
        name: row.name,
        shortDescription: row.short_description || `Professional ${row.name} experience with cinematic quality.`,
        longDescription: row.long_description || null,
        image: frontendData.image,
        price: frontendData.price,
        priceDisplay: frontendData.priceDisplay,
        duration: frontendData.duration,
        category: frontendData.category,
        features: features,
        deliveryTime: frontendData.deliveryTime,
        popular: frontendData.popular,
        featured: row.featured === 'Yes' || row.featured === 'true',
        isActive: row.status !== 'Inactive',
        sortOrder: index
      };
    });

  return packages;
}

module.exports = {
  importTourPackages,
  importCineTripPackages
};
