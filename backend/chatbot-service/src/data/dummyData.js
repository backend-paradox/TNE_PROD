/**
 * Dummy Data Provider for Chatbot
 * Used when CRM APIs are not available
 *
 * NOTE: This data is for demonstration purposes only.
 * All prices, availability, and details are mock data.
 * Once CRM APIs are live, this will be replaced with real-time data.
 */

// Destinations with mock data
const DESTINATIONS = [
  {
    id: 1,
    name: 'Goa',
    slug: 'goa',
    country: 'India',
    state: 'Goa',
    description: 'Sun-kissed beaches, vibrant nightlife, and Portuguese heritage make Goa a perfect getaway.',
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
    highlights: ['Beaches', 'Nightlife', 'Water Sports', 'Seafood', 'Churches'],
    bestTime: 'October to March',
    packageCount: 8
  },
  {
    id: 2,
    name: 'Kerala',
    slug: 'kerala',
    country: 'India',
    state: 'Kerala',
    description: 'God\'s Own Country - backwaters, houseboats, tea gardens, and Ayurveda retreats.',
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
    highlights: ['Backwaters', 'Houseboats', 'Hill Stations', 'Ayurveda', 'Wildlife'],
    bestTime: 'September to March',
    packageCount: 6
  },
  {
    id: 3,
    name: 'Manali',
    slug: 'manali',
    country: 'India',
    state: 'Himachal Pradesh',
    description: 'Snow-capped mountains, adventure sports, and serene valleys await in Manali.',
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
    highlights: ['Snow', 'Trekking', 'Paragliding', 'Rohtang Pass', 'Solang Valley'],
    bestTime: 'March to June, October to February',
    packageCount: 5
  },
  {
    id: 4,
    name: 'Rajasthan',
    slug: 'rajasthan',
    country: 'India',
    state: 'Rajasthan',
    description: 'Royal palaces, majestic forts, colorful culture, and desert safaris.',
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800',
    highlights: ['Forts', 'Palaces', 'Desert Safari', 'Culture', 'Heritage'],
    bestTime: 'October to March',
    packageCount: 7
  },
  {
    id: 5,
    name: 'Andaman',
    slug: 'andaman',
    country: 'India',
    state: 'Andaman & Nicobar Islands',
    description: 'Crystal clear waters, pristine beaches, and world-class diving destinations.',
    imageUrl: 'https://images.unsplash.com/photo-1589995186011-a7b485edc4bf?w=800',
    highlights: ['Beaches', 'Scuba Diving', 'Snorkeling', 'Water Sports', 'Islands'],
    bestTime: 'October to May',
    packageCount: 4
  },
  {
    id: 6,
    name: 'Ladakh',
    slug: 'ladakh',
    country: 'India',
    state: 'Ladakh',
    description: 'High altitude desert, Buddhist monasteries, and breathtaking landscapes.',
    imageUrl: 'https://images.unsplash.com/photo-1545043059-5b1a5b2a7d7d?w=800',
    highlights: ['Monasteries', 'Pangong Lake', 'Nubra Valley', 'Khardung La', 'Biking'],
    bestTime: 'June to September',
    packageCount: 5
  },
  {
    id: 7,
    name: 'Shimla',
    slug: 'shimla',
    country: 'India',
    state: 'Himachal Pradesh',
    description: 'Colonial charm, scenic toy train rides, and pleasant hill station vibes.',
    imageUrl: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800',
    highlights: ['Mall Road', 'Toy Train', 'Ridge', 'Kufri', 'Jakhu Temple'],
    bestTime: 'March to June, September to December',
    packageCount: 4
  },
  {
    id: 8,
    name: 'Jaipur',
    slug: 'jaipur',
    country: 'India',
    state: 'Rajasthan',
    description: 'The Pink City - magnificent forts, royal palaces, and vibrant bazaars.',
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800',
    highlights: ['Amber Fort', 'Hawa Mahal', 'City Palace', 'Jantar Mantar', 'Shopping'],
    bestTime: 'October to March',
    packageCount: 5
  }
];

// Packages with mock data
const PACKAGES = [
  // Goa Packages
  {
    packageId: 'PKG_GOA_001',
    title: 'Goa Beach Bliss',
    destination: { name: 'Goa', slug: 'goa' },
    duration: '4 Days / 3 Nights',
    price: 15999,
    discountPrice: 12999,
    highlights: ['North Goa Beaches', 'Water Sports', 'Cruise Dinner', 'Spice Plantation'],
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
    rating: 4.5,
    reviewCount: 234,
    tripType: 'leisure',
    featured: true,
    description: 'Experience the best of Goa with this exciting package covering beaches, water sports, and local culture.',
    inclusions: ['3 Nights Accommodation', 'Daily Breakfast', 'Airport Transfers', 'North Goa Sightseeing', 'Water Sports (1 session)'],
    exclusions: ['Flights', 'Lunch & Dinner', 'Personal Expenses', 'Travel Insurance'],
    itinerary: [
      { day: 1, title: 'Arrival & Beach Time', activities: ['Airport pickup', 'Hotel check-in', 'Calangute Beach visit', 'Evening at leisure'] },
      { day: 2, title: 'North Goa Tour', activities: ['Aguada Fort', 'Chapora Fort', 'Anjuna Beach', 'Baga Beach nightlife'] },
      { day: 3, title: 'Water Sports & Cruise', activities: ['Water sports at Baga', 'Spice plantation visit', 'Sunset cruise dinner'] },
      { day: 4, title: 'Departure', activities: ['Leisure time', 'Shopping', 'Airport drop'] }
    ],
    minTravelers: 2,
    maxTravelers: 8,
    availability: 15
  },
  {
    packageId: 'PKG_GOA_002',
    title: 'Goa Honeymoon Special',
    destination: { name: 'Goa', slug: 'goa' },
    duration: '5 Days / 4 Nights',
    price: 25999,
    discountPrice: 21999,
    highlights: ['Private Beach Resort', 'Candlelight Dinner', 'Couples Spa', 'Sunset Cruise'],
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
    rating: 4.8,
    reviewCount: 156,
    tripType: 'honeymoon',
    featured: true,
    description: 'A romantic escape designed for couples with private experiences and luxury stays.',
    inclusions: ['4 Nights Beach Resort', 'Daily Breakfast & Dinner', 'Candlelight Dinner', 'Couples Spa Session', 'Private Sunset Cruise'],
    exclusions: ['Flights', 'Lunch', 'Personal Expenses'],
    itinerary: [
      { day: 1, title: 'Romantic Welcome', activities: ['Airport pickup', 'Resort check-in with welcome drink', 'Private beach time', 'Candlelight dinner'] },
      { day: 2, title: 'Beach Romance', activities: ['Breakfast in bed', 'Couples spa', 'South Goa beaches', 'Sunset drinks'] },
      { day: 3, title: 'Adventure Together', activities: ['Dolphin spotting', 'Water sports', 'Old Goa churches', 'Casino evening'] },
      { day: 4, title: 'Cruise & Chill', activities: ['Leisurely morning', 'Pool time', 'Private sunset cruise'] },
      { day: 5, title: 'Farewell', activities: ['Late checkout', 'Shopping', 'Airport drop'] }
    ],
    minTravelers: 2,
    maxTravelers: 2,
    availability: 8
  },

  // Kerala Packages
  {
    packageId: 'PKG_KER_001',
    title: 'Kerala Backwater Magic',
    destination: { name: 'Kerala', slug: 'kerala' },
    duration: '5 Days / 4 Nights',
    price: 22999,
    discountPrice: 18999,
    highlights: ['Houseboat Stay', 'Munnar Hills', 'Tea Gardens', 'Kathakali Show'],
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
    rating: 4.7,
    reviewCount: 312,
    tripType: 'family',
    featured: true,
    description: 'Explore God\'s Own Country with backwaters, hills, and authentic Kerala experiences.',
    inclusions: ['4 Nights Accommodation', '1 Night Houseboat', 'All Meals on Houseboat', 'Daily Breakfast', 'Sightseeing'],
    exclusions: ['Flights', 'Lunch & Dinner (except houseboat)', 'Personal Expenses'],
    itinerary: [
      { day: 1, title: 'Arrive Cochin', activities: ['Airport pickup', 'Fort Kochi walk', 'Chinese fishing nets', 'Kathakali show'] },
      { day: 2, title: 'Munnar Journey', activities: ['Drive to Munnar', 'Tea gardens', 'Tea museum', 'Scenic viewpoints'] },
      { day: 3, title: 'Munnar Exploration', activities: ['Eravikulam National Park', 'Mattupetty Dam', 'Echo Point', 'Local market'] },
      { day: 4, title: 'Alleppey Houseboat', activities: ['Drive to Alleppey', 'Houseboat cruise', 'Backwater views', 'Kerala cuisine'] },
      { day: 5, title: 'Departure', activities: ['Houseboat disembark', 'Cochin airport drop'] }
    ],
    minTravelers: 2,
    maxTravelers: 6,
    availability: 12
  },

  // Manali Packages
  {
    packageId: 'PKG_MAN_001',
    title: 'Manali Adventure Escape',
    destination: { name: 'Manali', slug: 'manali' },
    duration: '5 Days / 4 Nights',
    price: 18999,
    discountPrice: 15999,
    highlights: ['Rohtang Pass', 'Solang Valley', 'River Rafting', 'Hadimba Temple'],
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
    rating: 4.6,
    reviewCount: 289,
    tripType: 'adventure',
    featured: true,
    description: 'An action-packed adventure in the Himalayas with snow, sports, and stunning views.',
    inclusions: ['4 Nights Hotel Stay', 'Daily Breakfast', 'Rohtang Pass Permit', 'Solang Valley Activities', 'River Rafting'],
    exclusions: ['Flights/Volvo', 'Lunch & Dinner', 'Personal Gear', 'Travel Insurance'],
    itinerary: [
      { day: 1, title: 'Arrival in Manali', activities: ['Arrive Manali', 'Hotel check-in', 'Mall Road walk', 'Local exploration'] },
      { day: 2, title: 'Rohtang Pass Excursion', activities: ['Early morning start', 'Rohtang Pass (snow point)', 'Snow activities', 'Return evening'] },
      { day: 3, title: 'Solang Valley Adventure', activities: ['Paragliding', 'Zorbing', 'Ropeway ride', 'Adventure activities'] },
      { day: 4, title: 'Temples & Rafting', activities: ['Hadimba Temple', 'Vashisht Hot Springs', 'River rafting in Beas', 'Old Manali'] },
      { day: 5, title: 'Departure', activities: ['Leisurely breakfast', 'Shopping', 'Departure'] }
    ],
    minTravelers: 2,
    maxTravelers: 10,
    availability: 20
  },

  // Rajasthan Packages
  {
    packageId: 'PKG_RAJ_001',
    title: 'Royal Rajasthan Heritage',
    destination: { name: 'Rajasthan', slug: 'rajasthan' },
    duration: '7 Days / 6 Nights',
    price: 35999,
    discountPrice: 29999,
    highlights: ['Jaipur Forts', 'Udaipur Lakes', 'Jodhpur Blue City', 'Desert Safari'],
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800',
    rating: 4.8,
    reviewCount: 445,
    tripType: 'family',
    featured: true,
    description: 'Experience royal Rajasthan - forts, palaces, lakes, and desert adventures.',
    inclusions: ['6 Nights Heritage Hotels', 'Daily Breakfast', 'AC Vehicle', 'All Sightseeing', 'Desert Safari with Dinner'],
    exclusions: ['Flights', 'Lunch & Dinner', 'Camera Fees', 'Personal Expenses'],
    itinerary: [
      { day: 1, title: 'Jaipur Arrival', activities: ['Airport pickup', 'Hawa Mahal', 'City Palace', 'Jantar Mantar'] },
      { day: 2, title: 'Jaipur Forts', activities: ['Amber Fort', 'Nahargarh Fort', 'Jal Mahal', 'Shopping bazaars'] },
      { day: 3, title: 'Jodhpur - Blue City', activities: ['Drive to Jodhpur', 'Mehrangarh Fort', 'Jaswant Thada', 'Blue City walk'] },
      { day: 4, title: 'Jaisalmer Desert', activities: ['Drive to Jaisalmer', 'Sonar Quila', 'Patwon Ki Haveli'] },
      { day: 5, title: 'Desert Experience', activities: ['Sam Sand Dunes', 'Camel safari', 'Desert camp dinner', 'Folk performances'] },
      { day: 6, title: 'Udaipur - City of Lakes', activities: ['Drive to Udaipur', 'Lake Pichola', 'City Palace', 'Boat ride'] },
      { day: 7, title: 'Departure', activities: ['Saheliyon ki Bari', 'Airport drop'] }
    ],
    minTravelers: 2,
    maxTravelers: 8,
    availability: 10
  },

  // Andaman Packages
  {
    packageId: 'PKG_AND_001',
    title: 'Andaman Island Hopping',
    destination: { name: 'Andaman', slug: 'andaman' },
    duration: '6 Days / 5 Nights',
    price: 32999,
    discountPrice: 27999,
    highlights: ['Havelock Island', 'Radhanagar Beach', 'Scuba Diving', 'Ross Island'],
    imageUrl: 'https://images.unsplash.com/photo-1589995186011-a7b485edc4bf?w=800',
    rating: 4.7,
    reviewCount: 178,
    tripType: 'adventure',
    featured: false,
    description: 'Explore the pristine islands of Andaman with beaches, diving, and marine life.',
    inclusions: ['5 Nights Island Resorts', 'Daily Breakfast', 'Ferry Tickets', 'Scuba Diving (1 session)', 'Sightseeing'],
    exclusions: ['Flights', 'Lunch & Dinner', 'Water Sports (extra)', 'Personal Expenses'],
    itinerary: [
      { day: 1, title: 'Port Blair Arrival', activities: ['Airport pickup', 'Cellular Jail', 'Light & Sound Show'] },
      { day: 2, title: 'Ross & North Bay', activities: ['Ross Island tour', 'North Bay snorkeling', 'Coral viewing'] },
      { day: 3, title: 'Havelock Island', activities: ['Ferry to Havelock', 'Radhanagar Beach (Asia\'s best)', 'Sunset views'] },
      { day: 4, title: 'Underwater Adventure', activities: ['Scuba diving', 'Elephant Beach', 'Water sports'] },
      { day: 5, title: 'Neil Island', activities: ['Ferry to Neil', 'Natural bridge', 'Bharatpur Beach', 'Return Port Blair'] },
      { day: 6, title: 'Departure', activities: ['Morning at leisure', 'Airport drop'] }
    ],
    minTravelers: 2,
    maxTravelers: 6,
    availability: 8
  },

  // Ladakh Packages
  {
    packageId: 'PKG_LAD_001',
    title: 'Ladakh - Land of High Passes',
    destination: { name: 'Ladakh', slug: 'ladakh' },
    duration: '7 Days / 6 Nights',
    price: 38999,
    discountPrice: 32999,
    highlights: ['Pangong Lake', 'Nubra Valley', 'Khardung La', 'Monasteries'],
    imageUrl: 'https://images.unsplash.com/photo-1545043059-5b1a5b2a7d7d?w=800',
    rating: 4.9,
    reviewCount: 267,
    tripType: 'adventure',
    featured: true,
    description: 'An epic journey through high-altitude deserts, pristine lakes, and ancient monasteries.',
    inclusions: ['6 Nights Stay', 'Daily Meals', 'Innova/Xylo Vehicle', 'All Permits', 'Oxygen Cylinder'],
    exclusions: ['Flights to Leh', 'Personal Gear', 'Travel Insurance (Mandatory)', 'Tips'],
    itinerary: [
      { day: 1, title: 'Leh Arrival & Acclimatization', activities: ['Airport pickup', 'Rest & acclimatize', 'Leh market walk'] },
      { day: 2, title: 'Leh Local Sightseeing', activities: ['Shanti Stupa', 'Leh Palace', 'Hall of Fame', 'Sangam Point'] },
      { day: 3, title: 'Nubra Valley', activities: ['Khardung La Pass', 'Diskit Monastery', 'Hunder Sand Dunes', 'Double hump camel ride'] },
      { day: 4, title: 'Nubra to Pangong', activities: ['Scenic drive', 'Pangong Lake arrival', 'Stargazing', 'Lakeside stay'] },
      { day: 5, title: 'Pangong to Leh', activities: ['Sunrise at Pangong', 'Chang La Pass', 'Thiksey Monastery', 'Return to Leh'] },
      { day: 6, title: 'Monastery Tour', activities: ['Hemis Monastery', 'Shey Palace', 'Rancho School', 'Shopping'] },
      { day: 7, title: 'Departure', activities: ['Early morning flight', 'Airport drop'] }
    ],
    minTravelers: 4,
    maxTravelers: 12,
    availability: 6
  },

  // Shimla Package
  {
    packageId: 'PKG_SHM_001',
    title: 'Shimla Kufri Delight',
    destination: { name: 'Shimla', slug: 'shimla' },
    duration: '4 Days / 3 Nights',
    price: 14999,
    discountPrice: 11999,
    highlights: ['Mall Road', 'Kufri', 'Toy Train', 'Ridge'],
    imageUrl: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800',
    rating: 4.4,
    reviewCount: 198,
    tripType: 'family',
    featured: false,
    description: 'A classic hill station experience with colonial charm and mountain views.',
    inclusions: ['3 Nights Hotel', 'Daily Breakfast', 'Sightseeing by Cab', 'Toy Train Tickets'],
    exclusions: ['Travel to Shimla', 'Lunch & Dinner', 'Personal Expenses', 'Activity Charges'],
    itinerary: [
      { day: 1, title: 'Shimla Arrival', activities: ['Arrive Shimla', 'Hotel check-in', 'Mall Road walk', 'Ridge exploration'] },
      { day: 2, title: 'Kufri Excursion', activities: ['Kufri trip', 'Pony ride', 'Himalayan views', 'Apple orchards'] },
      { day: 3, title: 'Local Tour', activities: ['Jakhu Temple', 'Christ Church', 'Scandal Point', 'Shopping'] },
      { day: 4, title: 'Departure', activities: ['Toy train ride (optional)', 'Departure'] }
    ],
    minTravelers: 2,
    maxTravelers: 6,
    availability: 25
  },

  // Jaipur Package
  {
    packageId: 'PKG_JAI_001',
    title: 'Jaipur Royal Experience',
    destination: { name: 'Jaipur', slug: 'jaipur' },
    duration: '3 Days / 2 Nights',
    price: 12999,
    discountPrice: 9999,
    highlights: ['Amber Fort', 'Hawa Mahal', 'City Palace', 'Elephant Ride'],
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800',
    rating: 4.6,
    reviewCount: 321,
    tripType: 'family',
    featured: true,
    description: 'Experience the royal heritage of the Pink City with forts, palaces, and cultural treasures.',
    inclusions: ['2 Nights Heritage Hotel', 'Daily Breakfast', 'AC Vehicle', 'All Sightseeing', 'Elephant Ride'],
    exclusions: ['Flights/Train', 'Lunch & Dinner', 'Camera Fees', 'Personal Expenses'],
    itinerary: [
      { day: 1, title: 'Jaipur Arrival', activities: ['Airport/Station pickup', 'Hawa Mahal', 'City Palace', 'Jantar Mantar', 'Local market'] },
      { day: 2, title: 'Forts & Heritage', activities: ['Amber Fort', 'Elephant ride', 'Nahargarh Fort', 'Jal Mahal', 'Light & Sound show'] },
      { day: 3, title: 'Departure', activities: ['Albert Hall Museum', 'Shopping at Johari Bazaar', 'Departure'] }
    ],
    minTravelers: 2,
    maxTravelers: 8,
    availability: 30
  },

  // Additional Goa Budget Package
  {
    packageId: 'PKG_GOA_003',
    title: 'Goa Budget Getaway',
    destination: { name: 'Goa', slug: 'goa' },
    duration: '3 Days / 2 Nights',
    price: 8999,
    discountPrice: 6999,
    highlights: ['Beach Hopping', 'Shacks', 'Nightlife', 'Old Goa'],
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    rating: 4.2,
    reviewCount: 456,
    tripType: 'leisure',
    featured: false,
    description: 'Perfect budget-friendly trip to explore the best of Goa without burning a hole in your pocket.',
    inclusions: ['2 Nights Budget Hotel', 'Daily Breakfast', 'Airport Transfers', 'Beach Tour'],
    exclusions: ['Flights', 'All Meals except Breakfast', 'Water Sports', 'Personal Expenses'],
    itinerary: [
      { day: 1, title: 'Beach Day', activities: ['Airport pickup', 'Calangute Beach', 'Beach shacks', 'Baga nightlife'] },
      { day: 2, title: 'Explore Goa', activities: ['Old Goa churches', 'Panjim city', 'Dona Paula', 'Miramar Beach'] },
      { day: 3, title: 'Departure', activities: ['Morning beach time', 'Local shopping', 'Airport drop'] }
    ],
    minTravelers: 1,
    maxTravelers: 10,
    availability: 50
  },

  // Kerala Honeymoon Package
  {
    packageId: 'PKG_KER_002',
    title: 'Kerala Romantic Retreat',
    destination: { name: 'Kerala', slug: 'kerala' },
    duration: '6 Days / 5 Nights',
    price: 35999,
    discountPrice: 29999,
    highlights: ['Treehouse Stay', 'Private Houseboat', 'Couples Spa', 'Sunset Cruise'],
    imageUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800',
    rating: 4.9,
    reviewCount: 189,
    tripType: 'honeymoon',
    featured: true,
    description: 'A romantic journey through Kerala with luxury stays, private experiences, and unforgettable moments.',
    inclusions: ['5 Nights Luxury Stay', 'All Meals', 'Private Houseboat', 'Couples Spa', 'All Transfers'],
    exclusions: ['Flights', 'Personal Expenses', 'Extra Activities'],
    itinerary: [
      { day: 1, title: 'Romantic Welcome', activities: ['Cochin arrival', 'Flower-decorated room', 'Welcome dinner'] },
      { day: 2, title: 'Munnar Romance', activities: ['Scenic drive to Munnar', 'Tea garden walk', 'Treehouse stay'] },
      { day: 3, title: 'Nature & Spa', activities: ['Waterfall visit', 'Couples Ayurvedic spa', 'Candlelight dinner'] },
      { day: 4, title: 'Houseboat Bliss', activities: ['Drive to Alleppey', 'Private houseboat cruise', 'Backwater dining'] },
      { day: 5, title: 'Beach Romance', activities: ['Marari Beach', 'Beach bonfire', 'Sunset walk'] },
      { day: 6, title: 'Farewell', activities: ['Leisurely breakfast', 'Cochin departure'] }
    ],
    minTravelers: 2,
    maxTravelers: 2,
    availability: 6
  },

  // Manali Winter Package
  {
    packageId: 'PKG_MAN_002',
    title: 'Manali Winter Wonderland',
    destination: { name: 'Manali', slug: 'manali' },
    duration: '4 Days / 3 Nights',
    price: 15999,
    discountPrice: 12999,
    highlights: ['Snowfall', 'Skiing', 'Bonfire', 'Hot Springs'],
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
    rating: 4.5,
    reviewCount: 234,
    tripType: 'adventure',
    featured: false,
    description: 'Experience magical snowfall and winter activities in the heart of Himalayas.',
    inclusions: ['3 Nights Hotel', 'Daily Meals', 'Skiing Session', 'Snow Gear Rental', 'Bonfire Night'],
    exclusions: ['Travel to Manali', 'Extra Activities', 'Personal Expenses'],
    itinerary: [
      { day: 1, title: 'Snowy Welcome', activities: ['Arrive Manali', 'Snow exploration', 'Mall Road', 'Evening bonfire'] },
      { day: 2, title: 'Solang Snow', activities: ['Solang Valley', 'Skiing', 'Snow sports', 'Hot chocolate'] },
      { day: 3, title: 'Local Charm', activities: ['Hadimba Temple', 'Vashisht hot springs', 'Old Manali cafe hopping'] },
      { day: 4, title: 'Departure', activities: ['Leisurely morning', 'Shopping', 'Departure'] }
    ],
    minTravelers: 2,
    maxTravelers: 8,
    availability: 15
  }
];

// Trip types
const TRIP_TYPES = [
  { id: 'honeymoon', name: 'Honeymoon', description: 'Romantic escapes for couples' },
  { id: 'family', name: 'Family', description: 'Fun-filled trips for all ages' },
  { id: 'adventure', name: 'Adventure', description: 'Thrilling experiences for adrenaline junkies' },
  { id: 'leisure', name: 'Leisure', description: 'Relaxing getaways to unwind' },
  { id: 'pilgrimage', name: 'Pilgrimage', description: 'Spiritual journeys to sacred places' }
];

// Quick suggestions based on context
const QUICK_SUGGESTIONS = {
  greeting: ['Show me beach destinations', 'I want a family trip', 'Honeymoon packages', 'Adventure trips'],
  destination_selected: ['Show packages', 'What\'s the best time to visit?', 'Budget options', 'Luxury stays'],
  packages_shown: ['Tell me more about the first one', 'Any cheaper options?', 'Book package 1', 'Show more packages'],
  package_selected: ['Check availability', 'Book now', 'Show other options', 'What\'s included?'],
  booking_flow: ['Yes, proceed', 'Change date', 'Add more travelers', 'Cancel booking']
};

/**
 * Get all destinations
 */
function getDestinations() {
  return [...DESTINATIONS];
}

/**
 * Get destination by slug or name
 */
function getDestinationBySlug(slug) {
  const normalizedSlug = slug.toLowerCase().trim();
  return DESTINATIONS.find(d =>
    d.slug === normalizedSlug ||
    d.name.toLowerCase() === normalizedSlug
  );
}

/**
 * Search packages with filters
 */
function searchPackages(filters = {}) {
  let results = [...PACKAGES];

  // Filter by destination
  if (filters.destination) {
    const dest = filters.destination.toLowerCase();
    results = results.filter(p =>
      p.destination.name.toLowerCase().includes(dest) ||
      p.destination.slug.includes(dest)
    );
  }

  // Filter by trip type
  if (filters.tripType) {
    results = results.filter(p => p.tripType === filters.tripType.toLowerCase());
  }

  // Filter by budget
  if (filters.maxBudget) {
    results = results.filter(p => (p.discountPrice || p.price) <= filters.maxBudget);
  }
  if (filters.minBudget) {
    results = results.filter(p => (p.discountPrice || p.price) >= filters.minBudget);
  }

  // Filter by travelers
  if (filters.travelers) {
    results = results.filter(p =>
      p.minTravelers <= filters.travelers &&
      p.maxTravelers >= filters.travelers
    );
  }

  // Filter featured only
  if (filters.featured) {
    results = results.filter(p => p.featured);
  }

  // Apply limit
  if (filters.limit) {
    results = results.slice(0, filters.limit);
  }

  return results;
}

/**
 * Get package by ID
 */
function getPackageById(packageId) {
  return PACKAGES.find(p => p.packageId === packageId);
}

/**
 * Get featured packages
 */
function getFeaturedPackages(limit = 5) {
  return PACKAGES.filter(p => p.featured).slice(0, limit);
}

/**
 * Check package availability (mock)
 */
function checkAvailability(packageId, travelers = 2, date = null) {
  const pkg = getPackageById(packageId);
  if (!pkg) {
    return { available: false, reason: 'Package not found' };
  }

  // Mock availability check
  const available = pkg.availability > 0 &&
    travelers >= pkg.minTravelers &&
    travelers <= pkg.maxTravelers;

  const price = pkg.discountPrice || pkg.price;

  return {
    available,
    packageId,
    slotsAvailable: pkg.availability,
    pricePerPerson: price,
    totalPrice: price * travelers,
    reason: !available ?
      (travelers > pkg.maxTravelers ? 'Exceeds maximum travelers' :
       travelers < pkg.minTravelers ? 'Below minimum travelers' :
       'No availability') : null
  };
}

/**
 * Get trip types
 */
function getTripTypes() {
  return [...TRIP_TYPES];
}

/**
 * Search destinations by query
 */
function searchDestinations(query) {
  const normalizedQuery = query.toLowerCase().trim();
  return DESTINATIONS.filter(d =>
    d.name.toLowerCase().includes(normalizedQuery) ||
    d.state?.toLowerCase().includes(normalizedQuery) ||
    d.highlights.some(h => h.toLowerCase().includes(normalizedQuery))
  );
}

/**
 * Get quick suggestions based on context step
 */
function getQuickSuggestions(step) {
  const stepMap = {
    'GREETING': 'greeting',
    'AWAITING_DESTINATION': 'greeting',
    'SHOWING_PACKAGES': 'packages_shown',
    'AWAITING_PACKAGE_SELECTION': 'packages_shown',
    'AWAITING_DATE': 'booking_flow',
    'AWAITING_TRAVELERS': 'booking_flow',
    'AWAITING_CONTACT': 'booking_flow',
    'CONFIRMING_BOOKING': 'booking_flow'
  };

  const key = stepMap[step] || 'greeting';
  return QUICK_SUGGESTIONS[key] || QUICK_SUGGESTIONS.greeting;
}

module.exports = {
  getDestinations,
  getDestinationBySlug,
  searchPackages,
  getPackageById,
  getFeaturedPackages,
  checkAvailability,
  getTripTypes,
  searchDestinations,
  getQuickSuggestions,
  // Export raw data for testing
  DESTINATIONS,
  PACKAGES,
  TRIP_TYPES
};
