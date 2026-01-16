const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const destinations = [
  {
    name: 'Goa',
    slug: 'goa',
    country: 'India',
    state: 'Goa',
    description: 'Goa is a state on the southwestern coast of India, known for its stunning beaches, vibrant nightlife, Portuguese heritage, and delicious seafood. It is one of India\'s most popular tourist destinations.',
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
    highlights: ['Beaches', 'Nightlife', 'Water Sports', 'Portuguese Architecture', 'Seafood'],
    bestTime: 'October to March',
    sortOrder: 1
  },
  {
    name: 'Manali',
    slug: 'manali',
    country: 'India',
    state: 'Himachal Pradesh',
    description: 'Manali is a high-altitude Himalayan resort town in Himachal Pradesh, known for its stunning mountain views, adventure activities, and the famous Rohtang Pass.',
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
    highlights: ['Mountains', 'Adventure Sports', 'Trekking', 'Snow', 'Temples'],
    bestTime: 'March to June, October to February',
    sortOrder: 2
  },
  {
    name: 'Kerala',
    slug: 'kerala',
    country: 'India',
    state: 'Kerala',
    description: 'Kerala, known as "God\'s Own Country", is famous for its backwaters, Ayurvedic treatments, tea plantations, and rich cultural heritage.',
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
    highlights: ['Backwaters', 'Ayurveda', 'Tea Gardens', 'Houseboats', 'Wildlife'],
    bestTime: 'September to March',
    sortOrder: 3
  },
  {
    name: 'Rajasthan',
    slug: 'rajasthan',
    country: 'India',
    state: 'Rajasthan',
    description: 'Rajasthan is the land of kings, featuring magnificent forts, palaces, vibrant culture, desert safaris, and rich history.',
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800',
    highlights: ['Forts', 'Palaces', 'Desert Safari', 'Culture', 'Heritage'],
    bestTime: 'October to March',
    sortOrder: 4
  },
  {
    name: 'Andaman Islands',
    slug: 'andaman',
    country: 'India',
    state: 'Andaman and Nicobar Islands',
    description: 'The Andaman Islands offer pristine beaches, crystal-clear waters, coral reefs, and a chance to experience untouched natural beauty.',
    imageUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800',
    highlights: ['Beaches', 'Scuba Diving', 'Snorkeling', 'Water Sports', 'Islands'],
    bestTime: 'October to May',
    sortOrder: 5
  },
  {
    name: 'Shimla',
    slug: 'shimla',
    country: 'India',
    state: 'Himachal Pradesh',
    description: 'Shimla, the former summer capital of British India, is known for its colonial architecture, scenic beauty, and pleasant climate.',
    imageUrl: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800',
    highlights: ['Hill Station', 'Colonial Architecture', 'Mall Road', 'Toy Train', 'Snow'],
    bestTime: 'March to June, December to February',
    sortOrder: 6
  }
];

const packages = [
  // Goa Packages
  {
    packageId: 'PKG_GOA_001',
    destinationSlug: 'goa',
    title: 'Goa Beach Bliss - 4N/5D',
    description: 'Experience the best of Goa with this comprehensive beach package. Explore North and South Goa beaches, enjoy water sports, cruise along the Mandovi River, and indulge in delicious Goan cuisine.',
    duration: '4N/5D',
    durationNights: 4,
    durationDays: 5,
    tripType: 'leisure',
    price: 18999,
    discountPrice: 16499,
    highlights: ['Beach Hopping', 'Water Sports', 'Sunset Cruise', 'Church Visits', 'Nightlife'],
    inclusions: ['4 Nights Accommodation', 'Daily Breakfast', 'Airport Transfers', 'North & South Goa Tour', 'Sunset Cruise'],
    exclusions: ['Flights', 'Lunch & Dinner', 'Personal Expenses', 'Water Sports (optional)'],
    itinerary: [
      { day: 1, title: 'Arrival & North Goa', activities: ['Airport pickup', 'Check-in at hotel', 'Calangute & Baga Beach visit', 'Evening at leisure'] },
      { day: 2, title: 'North Goa Exploration', activities: ['Fort Aguada', 'Anjuna Beach', 'Chapora Fort', 'Flea Market (if Wednesday)'] },
      { day: 3, title: 'South Goa Tour', activities: ['Colva Beach', 'Benaulim Beach', 'Church of Our Lady of Mercy', 'Sunset at Palolem'] },
      { day: 4, title: 'Water Sports & Cruise', activities: ['Water sports at Calangute', 'Old Goa Churches', 'Evening Mandovi Cruise'] },
      { day: 5, title: 'Departure', activities: ['Breakfast', 'Check-out', 'Airport drop'] }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
    rating: 4.5,
    reviewCount: 234,
    featured: true,
    sortOrder: 1
  },
  {
    packageId: 'PKG_GOA_002',
    destinationSlug: 'goa',
    title: 'Goa Honeymoon Special - 5N/6D',
    description: 'A romantic getaway designed for couples. Enjoy private beach dinners, couple spa treatments, candlelit experiences, and create unforgettable memories.',
    duration: '5N/6D',
    durationNights: 5,
    durationDays: 6,
    tripType: 'honeymoon',
    price: 35999,
    discountPrice: 31999,
    highlights: ['Candlelit Dinner', 'Couple Spa', 'Private Beach', 'Sunset Cruise', 'Photography Session'],
    inclusions: ['5 Nights Premium Resort', 'All Meals', 'Couple Spa Session', 'Private Beach Dinner', 'Sunset Cruise', 'Airport Transfers'],
    exclusions: ['Flights', 'Personal Expenses', 'Tips'],
    itinerary: [
      { day: 1, title: 'Romantic Arrival', activities: ['Airport pickup with flowers', 'Check-in at resort', 'Welcome drink', 'Candlelit dinner'] },
      { day: 2, title: 'Beach Romance', activities: ['Private breakfast', 'Couple photoshoot', 'Beach time', 'Spa session'] },
      { day: 3, title: 'Exploration', activities: ['North Goa tour', 'Shopping', 'Evening at Tito\'s Lane'] },
      { day: 4, title: 'Adventure Day', activities: ['Water sports', 'Dolphin watching', 'Sunset cruise'] },
      { day: 5, title: 'Leisure Day', activities: ['Pool time', 'In-room dining', 'Private beach dinner'] },
      { day: 6, title: 'Departure', activities: ['Breakfast', 'Check-out', 'Airport drop'] }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=800',
    rating: 4.8,
    reviewCount: 156,
    featured: true,
    sortOrder: 2
  },
  {
    packageId: 'PKG_GOA_003',
    destinationSlug: 'goa',
    title: 'Goa Family Fun - 3N/4D',
    description: 'Perfect family vacation with activities for all ages. Visit beaches, water parks, spice plantations, and enjoy quality family time.',
    duration: '3N/4D',
    durationNights: 3,
    durationDays: 4,
    tripType: 'family',
    price: 24999,
    discountPrice: 21999,
    highlights: ['Family-Friendly Beaches', 'Water Park', 'Spice Plantation', 'Dolphin Trip', 'Shopping'],
    inclusions: ['3 Nights Family Room', 'Daily Breakfast', 'Transfers', 'Sightseeing Tours'],
    exclusions: ['Flights', 'Lunch & Dinner', 'Water Park Entry', 'Personal Expenses'],
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    rating: 4.3,
    reviewCount: 189,
    featured: false,
    sortOrder: 3
  },

  // Manali Packages
  {
    packageId: 'PKG_MANALI_001',
    destinationSlug: 'manali',
    title: 'Manali Adventure - 5N/6D',
    description: 'Thrilling adventure package with river rafting, paragliding, trekking, and visits to Rohtang Pass and Solang Valley.',
    duration: '5N/6D',
    durationNights: 5,
    durationDays: 6,
    tripType: 'adventure',
    price: 22999,
    discountPrice: 19999,
    highlights: ['River Rafting', 'Paragliding', 'Rohtang Pass', 'Solang Valley', 'Trekking'],
    inclusions: ['5 Nights Hotel', 'All Meals', 'River Rafting', 'Paragliding', 'All Transfers'],
    exclusions: ['Flights/Train', 'Personal Expenses', 'Rohtang Permit (subject to availability)'],
    itinerary: [
      { day: 1, title: 'Arrival in Manali', activities: ['Pickup from Bhuntar/Bus Stand', 'Check-in', 'Mall Road walk'] },
      { day: 2, title: 'Solang Valley', activities: ['Paragliding', 'Zorbing', 'ATV ride', 'Snow activities'] },
      { day: 3, title: 'Rohtang Pass', activities: ['Full day Rohtang excursion', 'Snow point', 'Photo stops'] },
      { day: 4, title: 'River Rafting', activities: ['Rafting at Kullu', 'Temple visits', 'Local sightseeing'] },
      { day: 5, title: 'Trekking', activities: ['Trek to Jogini Waterfall', 'Vashisht Hot Springs', 'Shopping'] },
      { day: 6, title: 'Departure', activities: ['Breakfast', 'Check-out', 'Drop to Bus Stand'] }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
    rating: 4.6,
    reviewCount: 312,
    featured: true,
    sortOrder: 1
  },
  {
    packageId: 'PKG_MANALI_002',
    destinationSlug: 'manali',
    title: 'Manali Honeymoon Escape - 4N/5D',
    description: 'Romantic retreat in the mountains with cozy stays, scenic views, and intimate experiences.',
    duration: '4N/5D',
    durationNights: 4,
    durationDays: 5,
    tripType: 'honeymoon',
    price: 28999,
    discountPrice: 25499,
    highlights: ['Mountain Views', 'Private Cottage', 'Bonfire Night', 'Scenic Drives', 'Couple Activities'],
    inclusions: ['4 Nights Cottage Stay', 'All Meals', 'Bonfire with Snacks', 'All Sightseeing', 'Private Transfers'],
    exclusions: ['Flights/Train', 'Personal Expenses', 'Adventure Activities'],
    imageUrl: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800',
    rating: 4.7,
    reviewCount: 198,
    featured: true,
    sortOrder: 2
  },

  // Kerala Packages
  {
    packageId: 'PKG_KERALA_001',
    destinationSlug: 'kerala',
    title: 'Kerala Backwaters & Beyond - 6N/7D',
    description: 'Complete Kerala experience covering Cochin, Munnar, Thekkady, Alleppey, and Kovalam. Houseboat stay included.',
    duration: '6N/7D',
    durationNights: 6,
    durationDays: 7,
    tripType: 'leisure',
    price: 32999,
    discountPrice: 28999,
    highlights: ['Houseboat Stay', 'Tea Gardens', 'Spice Plantation', 'Kathakali Show', 'Beach'],
    inclusions: ['6 Nights Accommodation', 'Houseboat with All Meals', 'Daily Breakfast', 'All Transfers', 'Sightseeing'],
    exclusions: ['Flights', 'Lunch & Dinner (except houseboat)', 'Personal Expenses'],
    itinerary: [
      { day: 1, title: 'Arrival Cochin', activities: ['Airport pickup', 'Fort Kochi tour', 'Chinese Fishing Nets'] },
      { day: 2, title: 'Cochin to Munnar', activities: ['Scenic drive', 'Cheeyappara Waterfalls', 'Tea gardens'] },
      { day: 3, title: 'Munnar Sightseeing', activities: ['Eravikulam National Park', 'Tea Museum', 'Mattupetty Dam'] },
      { day: 4, title: 'Munnar to Thekkady', activities: ['Spice plantation', 'Periyar Lake boating', 'Kathakali show'] },
      { day: 5, title: 'Thekkady to Alleppey', activities: ['Houseboat check-in', 'Backwater cruise', 'Kerala cuisine'] },
      { day: 6, title: 'Alleppey to Kovalam', activities: ['Drive to Kovalam', 'Beach time', 'Sunset view'] },
      { day: 7, title: 'Departure', activities: ['Breakfast', 'Trivandrum airport drop'] }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
    rating: 4.8,
    reviewCount: 456,
    featured: true,
    sortOrder: 1
  },
  {
    packageId: 'PKG_KERALA_002',
    destinationSlug: 'kerala',
    title: 'Kerala Ayurveda Retreat - 5N/6D',
    description: 'Rejuvenate your body and mind with authentic Ayurvedic treatments, yoga sessions, and healthy Kerala cuisine.',
    duration: '5N/6D',
    durationNights: 5,
    durationDays: 6,
    tripType: 'leisure',
    price: 45999,
    discountPrice: 39999,
    highlights: ['Ayurveda Treatments', 'Yoga Sessions', 'Meditation', 'Organic Meals', 'Nature Walks'],
    inclusions: ['5 Nights Ayurveda Resort', 'All Meals', 'Daily Treatments', 'Yoga Classes', 'Transfers'],
    exclusions: ['Flights', 'Special Treatments', 'Personal Expenses'],
    imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    rating: 4.9,
    reviewCount: 123,
    featured: false,
    sortOrder: 2
  },

  // Rajasthan Packages
  {
    packageId: 'PKG_RAJ_001',
    destinationSlug: 'rajasthan',
    title: 'Royal Rajasthan - 7N/8D',
    description: 'Experience the royal heritage of Rajasthan covering Jaipur, Jodhpur, Jaisalmer, and Udaipur. Desert safari included.',
    duration: '7N/8D',
    durationNights: 7,
    durationDays: 8,
    tripType: 'leisure',
    price: 38999,
    discountPrice: 34999,
    highlights: ['Forts & Palaces', 'Desert Safari', 'Lake Pichola', 'Camel Ride', 'Cultural Shows'],
    inclusions: ['7 Nights Heritage Hotels', 'Daily Breakfast', 'All Transfers', 'Sightseeing', 'Desert Safari'],
    exclusions: ['Flights', 'Lunch & Dinner', 'Entry Fees', 'Personal Expenses'],
    itinerary: [
      { day: 1, title: 'Arrive Jaipur', activities: ['Airport pickup', 'Check-in', 'Evening at leisure'] },
      { day: 2, title: 'Jaipur Sightseeing', activities: ['Amber Fort', 'City Palace', 'Hawa Mahal', 'Jantar Mantar'] },
      { day: 3, title: 'Jaipur to Jodhpur', activities: ['Drive to Jodhpur', 'Mehrangarh Fort', 'Old City walk'] },
      { day: 4, title: 'Jodhpur to Jaisalmer', activities: ['Drive to Jaisalmer', 'Jaisalmer Fort', 'Patwon Ki Haveli'] },
      { day: 5, title: 'Desert Safari', activities: ['Sam Sand Dunes', 'Camel Safari', 'Desert Camp', 'Cultural show'] },
      { day: 6, title: 'Jaisalmer to Udaipur', activities: ['Long drive', 'Ranakpur Jain Temple', 'Arrive Udaipur'] },
      { day: 7, title: 'Udaipur', activities: ['City Palace', 'Lake Pichola boat ride', 'Bagore Ki Haveli'] },
      { day: 8, title: 'Departure', activities: ['Breakfast', 'Airport drop'] }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800',
    rating: 4.7,
    reviewCount: 534,
    featured: true,
    sortOrder: 1
  },
  {
    packageId: 'PKG_RAJ_002',
    destinationSlug: 'rajasthan',
    title: 'Jaipur Weekend Getaway - 2N/3D',
    description: 'Quick escape to the Pink City. Visit iconic forts, shop for handicrafts, and enjoy Rajasthani cuisine.',
    duration: '2N/3D',
    durationNights: 2,
    durationDays: 3,
    tripType: 'leisure',
    price: 12999,
    discountPrice: 10999,
    highlights: ['Amber Fort', 'City Palace', 'Shopping', 'Local Cuisine', 'Hawa Mahal'],
    inclusions: ['2 Nights Hotel', 'Daily Breakfast', 'Airport Transfers', 'Full Day Sightseeing'],
    exclusions: ['Flights', 'Lunch & Dinner', 'Entry Fees', 'Personal Expenses'],
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800',
    rating: 4.4,
    reviewCount: 289,
    featured: false,
    sortOrder: 2
  },

  // Andaman Packages
  {
    packageId: 'PKG_AND_001',
    destinationSlug: 'andaman',
    title: 'Andaman Island Hopping - 5N/6D',
    description: 'Explore the pristine islands of Andaman. Snorkeling, scuba diving, and beach camping included.',
    duration: '5N/6D',
    durationNights: 5,
    durationDays: 6,
    tripType: 'adventure',
    price: 42999,
    discountPrice: 37999,
    highlights: ['Scuba Diving', 'Snorkeling', 'Island Hopping', 'Beach Camping', 'Water Sports'],
    inclusions: ['5 Nights Accommodation', 'All Meals', 'Ferry Tickets', 'Scuba Diving', 'All Transfers'],
    exclusions: ['Flights', 'Optional Activities', 'Personal Expenses'],
    itinerary: [
      { day: 1, title: 'Arrive Port Blair', activities: ['Airport pickup', 'Cellular Jail', 'Light & Sound Show'] },
      { day: 2, title: 'Havelock Island', activities: ['Ferry to Havelock', 'Radhanagar Beach', 'Beach leisure'] },
      { day: 3, title: 'Water Activities', activities: ['Scuba Diving', 'Snorkeling', 'Elephant Beach'] },
      { day: 4, title: 'Neil Island', activities: ['Ferry to Neil', 'Natural Bridge', 'Bharatpur Beach'] },
      { day: 5, title: 'Return to Port Blair', activities: ['Ferry back', 'Ross Island', 'North Bay'] },
      { day: 6, title: 'Departure', activities: ['Breakfast', 'Airport drop'] }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800',
    rating: 4.8,
    reviewCount: 267,
    featured: true,
    sortOrder: 1
  },
  {
    packageId: 'PKG_AND_002',
    destinationSlug: 'andaman',
    title: 'Andaman Honeymoon Paradise - 6N/7D',
    description: 'Romantic beach getaway with private beach dinners, couple activities, and luxury resort stay.',
    duration: '6N/7D',
    durationNights: 6,
    durationDays: 7,
    tripType: 'honeymoon',
    price: 55999,
    discountPrice: 49999,
    highlights: ['Private Beach Dinner', 'Couple Spa', 'Glass Bottom Boat', 'Sunset Cruise', 'Photography'],
    inclusions: ['6 Nights Beach Resort', 'All Meals', 'Couple Spa', 'Private Dinner', 'All Transfers'],
    exclusions: ['Flights', 'Optional Activities', 'Personal Expenses'],
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    rating: 4.9,
    reviewCount: 145,
    featured: true,
    sortOrder: 2
  },

  // Shimla Packages
  {
    packageId: 'PKG_SHIMLA_001',
    destinationSlug: 'shimla',
    title: 'Shimla Manali Combo - 6N/7D',
    description: 'Best of both hill stations. Toy train ride, snow activities, and scenic mountain drives.',
    duration: '6N/7D',
    durationNights: 6,
    durationDays: 7,
    tripType: 'family',
    price: 26999,
    discountPrice: 23499,
    highlights: ['Toy Train', 'Mall Road', 'Kufri', 'Solang Valley', 'Rohtang Pass'],
    inclusions: ['6 Nights Hotels', 'Daily Breakfast', 'All Transfers', 'Sightseeing', 'Toy Train Ticket'],
    exclusions: ['Flights/Train', 'Lunch & Dinner', 'Adventure Activities', 'Personal Expenses'],
    imageUrl: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800',
    rating: 4.5,
    reviewCount: 378,
    featured: true,
    sortOrder: 1
  },
  {
    packageId: 'PKG_SHIMLA_002',
    destinationSlug: 'shimla',
    title: 'Shimla Winter Special - 3N/4D',
    description: 'Experience Shimla in winter with snow activities, cozy stays, and hot chocolate by the fireplace.',
    duration: '3N/4D',
    durationNights: 3,
    durationDays: 4,
    tripType: 'leisure',
    price: 15999,
    discountPrice: 13999,
    highlights: ['Snow Activities', 'Mall Road', 'Christ Church', 'Jakhu Temple', 'Kufri'],
    inclusions: ['3 Nights Hotel', 'Daily Breakfast', 'All Transfers', 'Sightseeing'],
    exclusions: ['Flights/Train', 'Lunch & Dinner', 'Snow Activities', 'Personal Expenses'],
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
    rating: 4.3,
    reviewCount: 201,
    featured: false,
    sortOrder: 2
  }
];

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  console.log('Clearing existing packages and destinations...');
  await prisma.package.deleteMany({});
  await prisma.destination.deleteMany({});

  // Create destinations
  console.log('Creating destinations...');
  for (const dest of destinations) {
    await prisma.destination.create({
      data: dest
    });
  }
  console.log(`Created ${destinations.length} destinations`);

  // Create packages
  console.log('Creating packages...');
  for (const pkg of packages) {
    const { destinationSlug, ...packageData } = pkg;

    // Find destination
    const destination = await prisma.destination.findUnique({
      where: { slug: destinationSlug }
    });

    if (!destination) {
      console.warn(`Destination not found for slug: ${destinationSlug}`);
      continue;
    }

    await prisma.package.create({
      data: {
        ...packageData,
        destinationId: destination.id
      }
    });
  }
  console.log(`Created ${packages.length} packages`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
