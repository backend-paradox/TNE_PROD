/**
 * Excel to Seed Data Converter for Tour Packages
 *
 * Reads "Website Product.xlsx" and generates tourPackages.seed.js
 * with all 27 packages mapped to the tour_packages table schema.
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../../..');
const EXCEL_FILE = path.join(ROOT_DIR, 'Website Product.xlsx');
const OUTPUT_FILE = path.join(__dirname, '../data/tourPackages.seed.js');

// Image mappings based on destination/package name keywords
const imageMap = {
  // Domestic - North India
  'kashmir': {
    main: '/assets/images/destinations/domestic/north-india/kashmir/kashmir_new_01.jpg',
    gallery: [
      '/assets/images/destinations/domestic/north-india/kashmir/kashmir_new_01.jpg',
      '/assets/images/destinations/domestic/north-india/kashmir/kashmir_new_02.jpg',
      '/assets/images/destinations/domestic/north-india/kashmir/kashmir_valley_01.jpeg',
      '/assets/images/destinations/domestic/north-india/kashmir/kashmir_lake_02.jpeg',
      '/assets/images/destinations/domestic/north-india/kashmir/kashmir_mountains_03.jpeg'
    ]
  },
  'ladakh': {
    main: '/assets/images/destinations/domestic/north-india/ladakh/ladakh_landscape_01.jpeg',
    gallery: [
      '/assets/images/destinations/domestic/north-india/ladakh/ladakh_landscape_01.jpeg',
      '/assets/images/destinations/domestic/north-india/kashmir/kashmir_mountains_03.jpeg'
    ]
  },
  'manali': {
    main: '/assets/images/destinations/domestic/north-india/himachal/himachal_mountains_01.jpeg',
    gallery: [
      '/assets/images/destinations/domestic/north-india/himachal/himachal_mountains_01.jpeg',
      '/assets/images/destinations/domestic/north-india/kashmir/kashmir_mountains_03.jpeg'
    ]
  },
  'shimla': {
    main: '/assets/images/destinations/domestic/north-india/himachal/himachal_mountains_01.jpeg',
    gallery: [
      '/assets/images/destinations/domestic/north-india/himachal/himachal_mountains_01.jpeg'
    ]
  },
  'rishikesh': {
    main: '/assets/images/destinations/domestic/north-india/rishikesh/rishikesh_ganga_01.jpeg',
    gallery: [
      '/assets/images/destinations/domestic/north-india/rishikesh/rishikesh_ganga_01.jpeg'
    ]
  },
  'varanasi': {
    main: '/assets/images/destinations/domestic/north-india/varanasi/varanasi_ghat_01.jpeg',
    gallery: [
      '/assets/images/destinations/domestic/north-india/varanasi/varanasi_ghat_01.jpeg'
    ]
  },
  'agra': {
    main: '/assets/images/destinations/domestic/north-india/agra/agra_taj_mahal_01.jpeg',
    gallery: [
      '/assets/images/destinations/domestic/north-india/agra/agra_taj_mahal_01.jpeg'
    ]
  },
  'darjeeling': {
    main: '/assets/images/destinations/domestic/north-india/himachal/himachal_mountains_01.jpeg',
    gallery: [
      '/assets/images/destinations/domestic/north-india/himachal/himachal_mountains_01.jpeg'
    ]
  },
  'meghalaya': {
    main: '/assets/images/destinations/domestic/north-india/himachal/himachal_mountains_01.jpeg',
    gallery: [
      '/assets/images/destinations/domestic/north-india/himachal/himachal_mountains_01.jpeg'
    ]
  },
  // Domestic - Rajasthan
  'jaipur': {
    main: '/assets/images/destinations/domestic/rajasthan/jaipur/jaipur_new_01.jpeg',
    gallery: [
      '/assets/images/destinations/domestic/rajasthan/jaipur/jaipur_new_01.jpeg',
      '/assets/images/destinations/domestic/rajasthan/jaipur/jaipur_new_02.jpg',
      '/assets/images/destinations/domestic/rajasthan/jaipur/jaipur_palace_01.jpeg',
      '/assets/images/destinations/domestic/rajasthan/jaipur/jaipur_hawa_mahal_02.jpeg'
    ]
  },
  'rajasthan': {
    main: '/assets/images/destinations/domestic/rajasthan/udaipur/rajasthan_new_01.jpg',
    gallery: [
      '/assets/images/destinations/domestic/rajasthan/udaipur/rajasthan_new_01.jpg',
      '/assets/images/destinations/domestic/rajasthan/udaipur/rajasthan_new_02.jpg',
      '/assets/images/destinations/domestic/rajasthan/jaipur/jaipur_palace_01.jpeg',
      '/assets/images/destinations/domestic/rajasthan/udaipur/udaipur_palace_01.jpeg'
    ]
  },
  // Domestic - South India
  'kerala': {
    main: '/assets/images/destinations/domestic/south-india/kerala/kerala_new_01.jpg',
    gallery: [
      '/assets/images/destinations/domestic/south-india/kerala/kerala_new_01.jpg',
      '/assets/images/destinations/domestic/south-india/kerala/kerala_new_02.jpg',
      '/assets/images/destinations/domestic/south-india/kerala/kerala_backwaters_01.jpeg',
      '/assets/images/destinations/domestic/south-india/kerala/kerala_houseboat_02.jpeg'
    ]
  },
  'goa': {
    main: '/assets/images/destinations/domestic/south-india/goa/goa_new_01.jpg',
    gallery: [
      '/assets/images/destinations/domestic/south-india/goa/goa_new_01.jpg',
      '/assets/images/destinations/domestic/south-india/goa/goa_new_02.jpg',
      '/assets/images/destinations/domestic/south-india/goa/goa_beach_01.jpeg',
      '/assets/images/destinations/domestic/south-india/goa/goa_sunset_02.jpeg'
    ]
  },
  'ooty': {
    main: '/assets/images/destinations/domestic/south-india/mysore/mysore_palace_01.jpeg',
    gallery: [
      '/assets/images/destinations/domestic/south-india/mysore/mysore_palace_01.jpeg'
    ]
  },
  'mysore': {
    main: '/assets/images/destinations/domestic/south-india/mysore/mysore_palace_01.jpeg',
    gallery: [
      '/assets/images/destinations/domestic/south-india/mysore/mysore_palace_01.jpeg'
    ]
  },
  // Domestic - Islands
  'andaman': {
    main: '/assets/images/destinations/domestic/islands/andaman/andaman_new_01.jpg',
    gallery: [
      '/assets/images/destinations/domestic/islands/andaman/andaman_new_01.jpg',
      '/assets/images/destinations/domestic/islands/andaman/andaman_new_02.jpg',
      '/assets/images/destinations/domestic/islands/andaman/andaman_beach_01.jpeg'
    ]
  },
  // International - Asia
  'dubai': {
    main: '/assets/images/destinations/international/asia/dubai/dubai_skyline_01.jpeg',
    gallery: [
      '/assets/images/destinations/international/asia/dubai/dubai_skyline_01.jpeg',
      '/assets/images/destinations/international/asia/dubai/dubai_burj_khalifa_02.jpeg',
      '/assets/images/destinations/international/asia/dubai/dubai_cityscape_03.jpeg'
    ]
  },
  'thailand': {
    main: '/assets/images/destinations/international/asia/thailand/thailand_temple_01.jpeg',
    gallery: [
      '/assets/images/destinations/international/asia/thailand/thailand_temple_01.jpeg',
      '/assets/images/destinations/international/asia/thailand/thailand_beach_02.jpeg',
      '/assets/images/destinations/international/asia/thailand/thailand_resort_03.jpeg'
    ]
  },
  'maldives': {
    main: '/assets/images/destinations/international/asia/maldives/maldives_resort_01.jpeg',
    gallery: [
      '/assets/images/destinations/international/asia/maldives/maldives_resort_01.jpeg',
      '/assets/images/destinations/international/asia/maldives/maldives_beach_02.jpeg'
    ]
  },
  'bali': {
    main: '/assets/images/destinations/international/asia/bali/bali_rice_terraces_01.jpeg',
    gallery: [
      '/assets/images/destinations/international/asia/bali/bali_rice_terraces_01.jpeg',
      '/assets/images/destinations/international/asia/bali/bali_temple_02.jpeg'
    ]
  },
  'singapore': {
    main: '/assets/images/destinations/international/asia/singapore/singapore_marina_bay_01.jpeg',
    gallery: [
      '/assets/images/destinations/international/asia/singapore/singapore_marina_bay_01.jpeg',
      '/assets/images/destinations/international/asia/singapore/singapore_sunset_02.jpeg'
    ]
  },
  'vietnam': {
    main: '/assets/images/destinations/international/asia/thailand/thailand_temple_01.jpeg',
    gallery: [
      '/assets/images/destinations/international/asia/thailand/thailand_temple_01.jpeg'
    ]
  },
  'japan': {
    main: '/assets/images/destinations/international/asia/tokyo/tokyo_cityscape_01.jpeg',
    gallery: [
      '/assets/images/destinations/international/asia/tokyo/tokyo_cityscape_01.jpeg'
    ]
  },
  'srilanka': {
    main: '/assets/images/destinations/international/asia/srilanka/srilanka_landscape_01.jpeg',
    gallery: [
      '/assets/images/destinations/international/asia/srilanka/srilanka_landscape_01.jpeg'
    ]
  },
  'sri lanka': {
    main: '/assets/images/destinations/international/asia/srilanka/srilanka_landscape_01.jpeg',
    gallery: [
      '/assets/images/destinations/international/asia/srilanka/srilanka_landscape_01.jpeg'
    ]
  },
  // International - Other
  'egypt': {
    main: '/assets/images/destinations/international/africa/mauritius/mauritius_island_01.jpeg',
    gallery: [
      '/assets/images/destinations/international/africa/mauritius/mauritius_island_01.jpeg'
    ]
  },
  'turkey': {
    main: '/assets/images/destinations/international/europe/barcelona/barcelona_city_01.jpeg',
    gallery: [
      '/assets/images/destinations/international/europe/barcelona/barcelona_city_01.jpeg'
    ]
  },
  'australia': {
    main: '/assets/images/destinations/international/oceania/sydney/sydney_opera_house_01.jpeg',
    gallery: [
      '/assets/images/destinations/international/oceania/sydney/sydney_opera_house_01.jpeg'
    ]
  },
  'greece': {
    main: '/assets/images/destinations/international/europe/barcelona/barcelona_city_01.jpeg',
    gallery: [
      '/assets/images/destinations/international/europe/barcelona/barcelona_city_01.jpeg'
    ]
  },
  // Default
  'default': {
    main: '/assets/images/destinations/domestic/north-india/kashmir/kashmir_new_01.jpg',
    gallery: [
      '/assets/images/destinations/domestic/north-india/kashmir/kashmir_new_01.jpg'
    ]
  }
};

// Destination info mapping
const destinationInfo = {
  'kashmir': { destination: 'Srinagar', state: 'Jammu & Kashmir', country: 'India', category: 'Hill Station' },
  'kerala': { destination: 'Kochi', state: 'Kerala', country: 'India', category: 'Backwaters' },
  'goa': { destination: 'Goa', state: 'Goa', country: 'India', category: 'Beach' },
  'jaipur': { destination: 'Jaipur', state: 'Rajasthan', country: 'India', category: 'Heritage' },
  'rajasthan': { destination: 'Udaipur', state: 'Rajasthan', country: 'India', category: 'Heritage' },
  'manali': { destination: 'Manali', state: 'Himachal Pradesh', country: 'India', category: 'Hill Station' },
  'ladakh': { destination: 'Leh', state: 'Ladakh', country: 'India', category: 'Adventure' },
  'andaman': { destination: 'Port Blair', state: 'Andaman & Nicobar', country: 'India', category: 'Island' },
  'varanasi': { destination: 'Varanasi', state: 'Uttar Pradesh', country: 'India', category: 'Spiritual' },
  'agra': { destination: 'Agra', state: 'Uttar Pradesh', country: 'India', category: 'Heritage' },
  'darjeeling': { destination: 'Darjeeling', state: 'West Bengal', country: 'India', category: 'Hill Station' },
  'shimla': { destination: 'Shimla', state: 'Himachal Pradesh', country: 'India', category: 'Hill Station' },
  'ooty': { destination: 'Ooty', state: 'Tamil Nadu', country: 'India', category: 'Hill Station' },
  'rishikesh': { destination: 'Rishikesh', state: 'Uttarakhand', country: 'India', category: 'Adventure' },
  'meghalaya': { destination: 'Shillong', state: 'Meghalaya', country: 'India', category: 'Nature' },
  'dubai': { destination: 'Dubai', state: '', country: 'UAE', category: 'City' },
  'thailand': { destination: 'Bangkok', state: '', country: 'Thailand', category: 'Beach' },
  'maldives': { destination: 'Male', state: '', country: 'Maldives', category: 'Island' },
  'bali': { destination: 'Bali', state: '', country: 'Indonesia', category: 'Island' },
  'singapore': { destination: 'Singapore', state: '', country: 'Singapore', category: 'City' },
  'egypt': { destination: 'Cairo', state: '', country: 'Egypt', category: 'Heritage' },
  'turkey': { destination: 'Istanbul', state: '', country: 'Turkey', category: 'Heritage' },
  'vietnam': { destination: 'Hanoi', state: '', country: 'Vietnam', category: 'Cultural' },
  'japan': { destination: 'Tokyo', state: '', country: 'Japan', category: 'Cultural' },
  'australia': { destination: 'Sydney', state: '', country: 'Australia', category: 'City' },
  'srilanka': { destination: 'Colombo', state: '', country: 'Sri Lanka', category: 'Cultural' },
  'sri lanka': { destination: 'Colombo', state: '', country: 'Sri Lanka', category: 'Cultural' },
  'greece': { destination: 'Athens', state: '', country: 'Greece', category: 'Island' }
};

// Countries that are visa-free for Indian passport holders
const visaFreeCountries = [
  'Thailand', 'Nepal', 'Maldives', 'Sri Lanka', 'Bhutan',
  'Mauritius', 'Seychelles', 'Indonesia'
];

// Map countries to continents (for international packages)
const countryToContinentMap = {
  'India': null, // Domestic, no continent
  'UAE': 'Middle East',
  'Thailand': 'Asia',
  'Maldives': 'Asia',
  'Indonesia': 'Asia',
  'Singapore': 'Asia',
  'Japan': 'Asia',
  'Vietnam': 'Asia',
  'Sri Lanka': 'Asia',
  'Nepal': 'Asia',
  'Bhutan': 'Asia',
  'Malaysia': 'Asia',
  'France': 'Europe',
  'Switzerland': 'Europe',
  'Italy': 'Europe',
  'Spain': 'Europe',
  'Germany': 'Europe',
  'Greece': 'Europe',
  'Turkey': 'Europe',
  'Egypt': 'Africa',
  'Mauritius': 'Africa',
  'Seychelles': 'Africa',
  'South Africa': 'Africa',
  'Australia': 'Oceania',
  'New Zealand': 'Oceania',
  'USA': 'Americas',
  'Canada': 'Americas'
};

// Determine if visa is required for a country
function isVisaRequired(country) {
  if (country === 'India') return false; // Domestic
  return !visaFreeCountries.includes(country);
}

// Get continent for a country
function getContinent(country) {
  return countryToContinentMap[country] || null;
}

// Generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Find best matching image set for a package name
function getImages(packageName) {
  const nameLower = packageName.toLowerCase();
  for (const [keyword, images] of Object.entries(imageMap)) {
    if (keyword !== 'default' && nameLower.includes(keyword)) {
      return images;
    }
  }
  return imageMap.default;
}

// Get destination info for a package name
function getDestinationInfo(packageName) {
  const nameLower = packageName.toLowerCase();
  for (const [keyword, info] of Object.entries(destinationInfo)) {
    if (nameLower.includes(keyword)) {
      return info;
    }
  }
  return { destination: 'India', state: '', country: 'India', category: 'Domestic' };
}

// Parse duration string to days and nights
function parseDuration(durationStr) {
  if (!durationStr) return { days: 5, nights: 4, formatted: '4 Nights 5 Days' };

  const nightsMatch = durationStr.match(/(\d+)\s*Night/i);
  const daysMatch = durationStr.match(/(\d+)\s*Day/i);

  const nights = nightsMatch ? parseInt(nightsMatch[1]) : 4;
  const days = daysMatch ? parseInt(daysMatch[1]) : nights + 1;

  return {
    days,
    nights,
    formatted: `${nights} Nights ${days} Days`
  };
}

// Parse Night Stay Flow into itinerary
function parseItinerary(nightStayFlow, packageName, duration) {
  if (!nightStayFlow) {
    return generateDefaultItinerary(packageName, duration);
  }

  const itinerary = [];

  // Parse patterns like "1 Nights Srinagar 1 Night Gulmarg 2 Nights Pahalgam"
  const pattern = /(\d+)\s*Nights?\s+([A-Za-z\s]+?)(?=\d+\s*Night|$)/gi;
  let match;
  let dayCounter = 1;

  while ((match = pattern.exec(nightStayFlow)) !== null) {
    const nights = parseInt(match[1]);
    const place = match[2].trim();

    for (let i = 0; i < nights; i++) {
      itinerary.push({
        day: dayCounter,
        title: dayCounter === 1 ? `Arrival in ${place}` : `Explore ${place}`,
        activities: generateActivitiesForPlace(place, dayCounter, i === 0)
      });
      dayCounter++;
    }
  }

  // Add departure day
  if (itinerary.length > 0) {
    const lastPlace = itinerary[itinerary.length - 1].title.includes('Explore')
      ? itinerary[itinerary.length - 1].title.replace('Explore ', '')
      : 'destination';
    itinerary.push({
      day: dayCounter,
      title: 'Departure',
      activities: [
        'Breakfast at hotel',
        `Transfer to ${lastPlace} airport/station`,
        'End of tour with wonderful memories'
      ]
    });
  }

  return itinerary.length > 0 ? itinerary : generateDefaultItinerary(packageName, duration);
}

// Generate activities for a place
function generateActivitiesForPlace(place, day, isArrival) {
  const placeLower = place.toLowerCase();

  if (isArrival) {
    return [
      `Arrival at ${place}`,
      'Transfer to hotel and check-in',
      `Evening at leisure to explore ${place}`,
      'Overnight stay at hotel'
    ];
  }

  // Place-specific activities
  const placeActivities = {
    'srinagar': ['Shikara ride on Dal Lake', 'Visit Mughal Gardens', 'Local market exploration'],
    'gulmarg': ['Gondola cable car ride', 'Snow activities (seasonal)', 'Visit Gulmarg meadows'],
    'pahalgam': ['Visit Betaab Valley', 'Aru Valley excursion', 'Horse riding'],
    'sonmarg': ['Visit Thajiwas Glacier', 'Photography at scenic points', 'Nature walks'],
    'munnar': ['Tea garden visit', 'Eravikulam National Park', 'Mattupetty Dam'],
    'thekkady': ['Periyar Wildlife Sanctuary', 'Spice plantation tour', 'Bamboo rafting'],
    'alleppey': ['Houseboat cruise', 'Backwater exploration', 'Village walk'],
    'goa': ['Beach hopping', 'Water sports', 'Old Goa churches visit'],
    'jaipur': ['Amber Fort visit', 'City Palace tour', 'Hawa Mahal'],
    'udaipur': ['Lake Pichola boat ride', 'City Palace visit', 'Jagdish Temple'],
    'dubai': ['Burj Khalifa visit', 'Desert safari', 'Dubai Mall shopping'],
    'bangkok': ['Grand Palace visit', 'Temple tours', 'Floating market'],
    'bali': ['Temple visits', 'Rice terrace tour', 'Beach activities'],
  };

  for (const [key, activities] of Object.entries(placeActivities)) {
    if (placeLower.includes(key)) {
      return [...activities, 'Return to hotel', 'Overnight stay'];
    }
  }

  return [
    `Sightseeing in ${place}`,
    'Visit local attractions',
    'Lunch at local restaurant',
    'Evening leisure time',
    'Overnight stay at hotel'
  ];
}

// Generate default itinerary
function generateDefaultItinerary(packageName, duration) {
  const { days } = duration;
  const itinerary = [];

  for (let i = 1; i <= days; i++) {
    if (i === 1) {
      itinerary.push({
        day: 1,
        title: 'Arrival Day',
        activities: ['Arrival at destination', 'Transfer to hotel', 'Check-in and rest', 'Evening at leisure']
      });
    } else if (i === days) {
      itinerary.push({
        day: i,
        title: 'Departure Day',
        activities: ['Breakfast at hotel', 'Check-out', 'Transfer to airport/station', 'End of tour']
      });
    } else {
      itinerary.push({
        day: i,
        title: `Day ${i} - Sightseeing`,
        activities: ['Breakfast at hotel', 'Full day sightseeing', 'Lunch included', 'Evening return to hotel']
      });
    }
  }

  return itinerary;
}

// Parse inclusions from Excel
function parseInclusions(inclusionStr) {
  if (!inclusionStr) {
    return [
      'Accommodation on twin sharing basis',
      'Daily breakfast',
      'All transfers and sightseeing by private vehicle',
      'All applicable taxes'
    ];
  }

  // Split by common delimiters
  return inclusionStr
    .split(/[,\n•·]/)
    .map(s => s.trim())
    .filter(s => s.length > 3);
}

// Parse exclusions from Excel
function parseExclusions(exclusionStr) {
  if (!exclusionStr) {
    return [
      'Airfare/train fare',
      'Personal expenses',
      'Travel insurance',
      'Anything not mentioned in inclusions'
    ];
  }

  return exclusionStr
    .split(/[,\n•·]/)
    .map(s => s.trim())
    .filter(s => s.length > 3);
}

// Generate highlights from package name and type
function generateHighlights(packageName, type, nightStayFlow) {
  const highlights = [];
  const nameLower = packageName.toLowerCase();

  // Extract places from night stay flow
  if (nightStayFlow) {
    const places = nightStayFlow.match(/[A-Za-z]+(?=\s|$)/g) || [];
    const uniquePlaces = [...new Set(places.filter(p => p.length > 2 && !['Night', 'Nights'].includes(p)))];
    uniquePlaces.slice(0, 3).forEach(place => {
      highlights.push(`Visit ${place}`);
    });
  }

  // Add based on keywords
  if (nameLower.includes('beach') || nameLower.includes('goa') || nameLower.includes('andaman')) {
    highlights.push('Beach activities and water sports');
  }
  if (nameLower.includes('heritage') || nameLower.includes('royal')) {
    highlights.push('Explore historical monuments');
  }
  if (nameLower.includes('spiritual') || nameLower.includes('varanasi')) {
    highlights.push('Experience spiritual ceremonies');
  }
  if (nameLower.includes('adventure') || nameLower.includes('expedition')) {
    highlights.push('Adventure activities included');
  }
  if (nameLower.includes('backwater') || nameLower.includes('kerala')) {
    highlights.push('Houseboat experience');
  }

  // Add generic highlights
  highlights.push('Professional tour guide');
  highlights.push('Comfortable accommodation');

  return highlights.slice(0, 6);
}

// Generate tagline
function generateTagline(packageName, type) {
  const nameLower = packageName.toLowerCase();

  if (nameLower.includes('paradise')) return 'Experience paradise on earth';
  if (nameLower.includes('retreat')) return 'A perfect escape from routine';
  if (nameLower.includes('adventure')) return 'Thrilling adventures await';
  if (nameLower.includes('romantic')) return 'Romance in paradise';
  if (nameLower.includes('heritage')) return 'Journey through history';
  if (nameLower.includes('spiritual')) return 'A spiritual awakening';
  if (nameLower.includes('carnival')) return 'Fun, sun, and celebration';
  if (nameLower.includes('expedition')) return 'The ultimate adventure';
  if (nameLower.includes('explorer')) return 'Discover hidden gems';
  if (nameLower.includes('delight')) return 'A delightful experience';
  if (nameLower.includes('bliss')) return 'Pure bliss awaits';
  if (nameLower.includes('highlights')) return 'Best of the destination';
  if (nameLower.includes('trail')) return 'A journey to remember';

  return type === 'International'
    ? 'Explore the world with us'
    : 'Discover the beauty of India';
}

// Generate short description
function generateShortDescription(packageName, duration, type, nightStayFlow) {
  const destInfo = getDestinationInfo(packageName);
  const places = nightStayFlow ? nightStayFlow.match(/[A-Za-z]+(?=\s|$)/g)?.filter(p => !['Night', 'Nights'].includes(p)) || [] : [];
  const uniquePlaces = [...new Set(places)].slice(0, 3).join(', ');

  return `Experience the magic of ${destInfo.destination} with our ${duration.formatted} tour package. ${uniquePlaces ? `Explore ${uniquePlaces} and create unforgettable memories.` : 'Create unforgettable memories with us.'}`;
}

// Generate long description
function generateLongDescription(packageName, duration, type, nightStayFlow, inclusions) {
  const destInfo = getDestinationInfo(packageName);

  return `Embark on an unforgettable journey with our ${packageName}. This carefully curated ${duration.formatted} package takes you through the best of ${destInfo.destination}${destInfo.state ? `, ${destInfo.state}` : ''}.

Our expert team has designed this tour to give you the perfect blend of sightseeing, relaxation, and cultural experiences. From comfortable accommodations to hassle-free transfers, we take care of every detail so you can focus on creating beautiful memories.

Whether you're traveling with family, friends, or your significant other, this package offers something special for everyone. Book now and let us take you on a journey of a lifetime!`;
}

// Main function to read Excel and generate seed data
async function generateSeedData() {
  console.log('\n========================================');
  console.log('Generating Tour Packages Seed Data');
  console.log('========================================\n');

  // Read Excel file
  const workbook = XLSX.readFile(EXCEL_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // Find header row
  let headerRowIndex = -1;
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (row && row.some(cell => cell && String(cell).includes('Package Name'))) {
      headerRowIndex = i;
      break;
    }
  }

  const headers = rawData[headerRowIndex];
  const dataRows = rawData.slice(headerRowIndex + 1).filter(row => {
    if (!row || row.length === 0) return false;
    return row.some((cell, idx) => idx > 0 && cell && String(cell).trim() !== '');
  });

  console.log(`Found ${dataRows.length} packages in Excel\n`);

  // Generate packages
  const packages = dataRows.map((row, index) => {
    const packageName = row[1] || '';
    const type = row[2] || 'Domestic';
    const price = row[3] || 0;
    const durationStr = row[4] || '';
    const nightStayFlow = row[5] || '';
    const inclusions = row[6] || '';
    const exclusions = row[7] || '';
    const tnc = row[8] || '';

    const duration = parseDuration(durationStr);
    const images = getImages(packageName);
    const destInfo = getDestinationInfo(packageName);
    const isInternational = type.toLowerCase() === 'international';

    const country = isInternational ? destInfo.country : 'India';

    const pkg = {
      packageId: `PKG${String(index + 1).padStart(3, '0')}`,
      slug: generateSlug(packageName),
      name: packageName,
      destination: destInfo.destination,
      state: destInfo.state,
      country: country,
      category: destInfo.category,
      tagline: generateTagline(packageName, type),
      shortDescription: generateShortDescription(packageName, duration, type, nightStayFlow),
      longDescription: generateLongDescription(packageName, duration, type, nightStayFlow, inclusions),
      duration: duration.formatted,
      startingPrice: typeof price === 'number' ? price : parseInt(String(price).replace(/[^0-9]/g, '')) || 0,
      priceType: 'Per Person',
      bestSeason: getBestSeason(packageName),
      difficulty: getDifficulty(packageName),
      maxGroupSize: 20,
      tags: getTags(packageName, type),
      highlights: generateHighlights(packageName, type, nightStayFlow),
      inclusions: parseInclusions(inclusions),
      exclusions: parseExclusions(exclusions),
      itinerary: parseItinerary(nightStayFlow, packageName, duration),
      faqs: getDefaultFaqs(packageName),
      rating: 4.5,
      reviewCount: Math.floor(Math.random() * 100) + 20,
      trending: index < 5,
      popular: index < 10,
      isActive: true,
      imageUrl: images.main,
      galleryImages: images.gallery,
      sortOrder: index,
      // New fields for simplified database
      visaRequired: isVisaRequired(country),
      continent: isInternational ? getContinent(country) : null
    };

    console.log(`  ${index + 1}. ${packageName} -> ${pkg.slug}`);
    return pkg;
  });

  // Generate the seed file content
  const seedContent = `/**
 * Tour Packages Seed Data
 * Generated from Website Product.xlsx
 * Total: ${packages.length} packages
 */

const tourPackages = ${JSON.stringify(packages, null, 2)};

module.exports = { tourPackages };
`;

  // Ensure data directory exists
  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write seed file
  fs.writeFileSync(OUTPUT_FILE, seedContent, 'utf-8');
  console.log(`\n✅ Generated seed file: ${OUTPUT_FILE}`);
  console.log(`   Total packages: ${packages.length}`);

  return packages;
}

// Helper functions
function getBestSeason(packageName) {
  const nameLower = packageName.toLowerCase();
  if (nameLower.includes('kashmir') || nameLower.includes('ladakh')) return 'April to September';
  if (nameLower.includes('kerala') || nameLower.includes('goa')) return 'October to March';
  if (nameLower.includes('rajasthan')) return 'October to March';
  if (nameLower.includes('manali') || nameLower.includes('shimla')) return 'March to June, December to February';
  if (nameLower.includes('dubai')) return 'November to March';
  if (nameLower.includes('thailand') || nameLower.includes('bali')) return 'November to April';
  if (nameLower.includes('maldives')) return 'November to April';
  return 'All Year';
}

function getDifficulty(packageName) {
  const nameLower = packageName.toLowerCase();
  if (nameLower.includes('expedition') || nameLower.includes('ladakh')) return 'Moderate';
  if (nameLower.includes('adventure') || nameLower.includes('rishikesh')) return 'Moderate';
  if (nameLower.includes('meghalaya')) return 'Moderate';
  return 'Easy';
}

function getTags(packageName, type) {
  const tags = [];
  const nameLower = packageName.toLowerCase();

  tags.push(type);

  if (nameLower.includes('beach') || nameLower.includes('goa') || nameLower.includes('maldives')) tags.push('Beach');
  if (nameLower.includes('heritage') || nameLower.includes('royal') || nameLower.includes('agra')) tags.push('Heritage');
  if (nameLower.includes('spiritual') || nameLower.includes('varanasi')) tags.push('Spiritual');
  if (nameLower.includes('adventure') || nameLower.includes('expedition')) tags.push('Adventure');
  if (nameLower.includes('backwater') || nameLower.includes('kerala')) tags.push('Nature');
  if (nameLower.includes('hill') || nameLower.includes('mountain') || nameLower.includes('manali')) tags.push('Hill Station');
  if (nameLower.includes('romantic') || nameLower.includes('honeymoon')) tags.push('Honeymoon');
  if (nameLower.includes('family')) tags.push('Family');
  if (nameLower.includes('island') || nameLower.includes('andaman')) tags.push('Island');

  return [...new Set(tags)];
}

function getDefaultFaqs(packageName) {
  return [
    {
      question: 'What is included in this package?',
      answer: 'The package includes accommodation, breakfast, transfers, and sightseeing as per the itinerary. Please check the inclusions section for complete details.'
    },
    {
      question: 'Can I customize this package?',
      answer: 'Yes, we offer customization options. Please contact us with your requirements and we will be happy to tailor the package to your needs.'
    },
    {
      question: 'What is the cancellation policy?',
      answer: 'Cancellation charges apply based on how close to the departure date you cancel. Please refer to our cancellation policy for detailed information.'
    },
    {
      question: 'Is travel insurance included?',
      answer: 'Travel insurance is not included in the package price but we highly recommend purchasing it. We can assist you in getting travel insurance.'
    }
  ];
}

// Run if called directly
if (require.main === module) {
  generateSeedData().catch(console.error);
}

module.exports = { generateSeedData };
