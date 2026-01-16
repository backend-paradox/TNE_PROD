/**
 * Mock Data for PDF Preview
 * Sample booking, package, and user data for testing PDF generation
 */

module.exports = {
  // Mock booking data
  mockBooking: {
    id: 12345,
    bookingNumber: 'TNE-PKG-20260107ABCD',
    userId: 1,
    type: 'PACKAGE',
    packageId: 'PKG101',
    status: 'CONFIRMED',

    // Dates
    createdAt: new Date('2026-01-05T10:30:00Z'),
    travelDate: new Date('2026-02-15T00:00:00Z'),
    returnDate: new Date('2026-02-22T00:00:00Z'),

    // Pricing
    basePrice: 45000,
    totalAmount: 53100,
    paidAmount: 20000,

    pricing: {
      subtotal: 45000,
      taxAmount: 8100,
      taxPercentage: 18,
      serviceFee: 0,
      discount: 0,
      addonCost: 0,
    },

    // Contact info
    contactInfo: {
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@example.com',
      phone: '+91 98765 43210',
      address: 'Mumbai, Maharashtra, India',
    },

    // Travelers
    travelers: [
      {
        id: 1,
        title: 'Mr.',
        firstName: 'Rajesh',
        lastName: 'Kumar',
        age: 35,
        gender: 'Male',
        idType: 'Passport',
        idNumber: 'M1234567',
      },
      {
        id: 2,
        title: 'Mrs.',
        firstName: 'Priya',
        lastName: 'Kumar',
        age: 32,
        gender: 'Female',
        idType: 'Passport',
        idNumber: 'M1234568',
      },
      {
        id: 3,
        title: 'Master',
        firstName: 'Aarav',
        lastName: 'Kumar',
        age: 8,
        gender: 'Male',
        idType: 'Birth Certificate',
        idNumber: 'BC-2018-001234',
      },
    ],

    // Payments
    payments: [
      {
        id: 1,
        amount: 20000,
        method: 'UPI',
        status: 'SUCCESS',
        transactionId: 'TXN20260105103045',
        paidAt: new Date('2026-01-05T10:30:45Z'),
      },
    ],

    numTravelers: 3,
  },

  // Mock package data
  mockPackage: {
    id: 101,
    title: 'Magical Kashmir - Valley of Paradise',
    description: 'Experience the breathtaking beauty of Kashmir with snow-capped mountains, serene lakes, and lush valleys. This curated package takes you through Srinagar, Gulmarg, Pahalgam, and Sonmarg.',
    destination: 'Kashmir',
    country: 'India',

    duration: 7,
    startDate: new Date('2026-02-15T00:00:00Z'),
    endDate: new Date('2026-02-22T00:00:00Z'),

    images: [
      'https://images.unsplash.com/photo-1569967593032-973e0e2f2d1b?w=800',
      'https://images.unsplash.com/photo-1620766165294-21c1e0bfc8d5?w=800',
    ],

    // Highlights
    highlights: [
      'Shikara ride on the iconic Dal Lake',
      'Visit to the stunning Mughal Gardens',
      'Gondola cable car ride in Gulmarg',
      'Experience snow activities in Gulmarg',
      'Visit to Betaab Valley in Pahalgam',
      'Scenic drive through Sonmarg meadows',
      'Stay in premium houseboats and hotels',
      'Traditional Kashmiri Wazwan dinner',
      'Professional tour guide throughout',
      'All transfers in private AC vehicle',
    ],

    // Day-by-day itinerary
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Srinagar - Dal Lake',
        description: 'Arrive at Srinagar Airport where our representative will greet you. Transfer to your hotel/houseboat on Dal Lake. After check-in and lunch, enjoy a relaxing Shikara ride on the famous Dal Lake, visiting the floating gardens and local markets. Evening at leisure to explore the local area.',
        activities: [
          'Airport pick-up and hotel check-in',
          'Welcome lunch with Kashmiri Kahwa',
          'Shikara ride on Dal Lake',
          'Visit floating vegetable gardens',
          'Evening walk at Boulevard Road',
        ],
        meals: {
          breakfast: false,
          lunch: true,
          dinner: true,
        },
        accommodation: 'Premium Houseboat on Dal Lake',
      },
      {
        day: 2,
        title: 'Srinagar - Mughal Gardens Tour',
        description: 'After breakfast, embark on a full-day tour of Srinagar\'s famous Mughal Gardens. Visit Nishat Bagh (Garden of Pleasure), Shalimar Bagh (Garden of Love), and Chashme Shahi. Explore the Shankaracharya Temple for panoramic city views. Visit a local handicraft center to see traditional Kashmiri crafts.',
        activities: [
          'Visit Nishat Bagh Mughal Garden',
          'Explore Shalimar Bagh with fountains',
          'Visit Chashme Shahi natural spring',
          'Trek to Shankaracharya Temple',
          'Shopping at local handicraft center',
          'Evening cultural show (optional)',
        ],
        meals: {
          breakfast: true,
          lunch: true,
          dinner: true,
        },
        accommodation: 'Premium Houseboat on Dal Lake',
      },
      {
        day: 3,
        title: 'Srinagar to Gulmarg - Meadow of Flowers',
        description: 'Check out after breakfast and drive to Gulmarg (51 km, 2 hours). Known as the "Meadow of Flowers," Gulmarg is one of Asia\'s premier skiing destinations. Take the Gondola cable car to Kongdori and Apharwat Peak. Enjoy snow activities like skiing, snowboarding, or sledging (in season).',
        activities: [
          'Scenic drive through apple orchards',
          'Gondola cable car ride (Phase 1 & 2)',
          'Visit Apharwat Peak',
          'Snow activities - skiing/snowboarding',
          'Visit St. Mary\'s Church',
          'Evening bonfire at hotel',
        ],
        meals: {
          breakfast: true,
          lunch: true,
          dinner: true,
        },
        accommodation: '4-Star Resort in Gulmarg',
      },
      {
        day: 4,
        title: 'Gulmarg to Pahalgam - Valley of Shepherds',
        description: 'After breakfast, drive to Pahalgam (140 km, 4 hours) via the scenic Srinagar route. En route, visit the saffron fields of Pampore and the ancient Awantipora ruins. On arrival in Pahalgam, check in to your hotel. Evening free to explore the local market and Lidder River.',
        activities: [
          'Visit saffron fields in Pampore',
          'Explore Awantipora temple ruins',
          'Scenic drive along Lidder River',
          'Check-in at riverside resort',
          'Evening walk at Pahalgam market',
          'Optional pony ride to Baisaran',
        ],
        meals: {
          breakfast: true,
          lunch: true,
          dinner: true,
        },
        accommodation: '4-Star Riverside Resort in Pahalgam',
      },
      {
        day: 5,
        title: 'Pahalgam - Betaab Valley & Aru Valley',
        description: 'Full day to explore the beautiful valleys around Pahalgam. Visit Betaab Valley, named after the Bollywood film. Explore Aru Valley with its pristine meadows and pine forests. Optional activities include horse riding, trekking, or river rafting on Lidder River.',
        activities: [
          'Visit stunning Betaab Valley',
          'Explore Aru Valley meadows',
          'Horse riding through pine forests',
          'Photography at Lidder River',
          'Optional river rafting',
          'Picnic lunch in the valley',
        ],
        meals: {
          breakfast: true,
          lunch: true,
          dinner: true,
        },
        accommodation: '4-Star Riverside Resort in Pahalgam',
      },
      {
        day: 6,
        title: 'Pahalgam to Srinagar via Sonmarg',
        description: 'Check out after breakfast and drive to Sonmarg (100 km, 3 hours), the "Meadow of Gold." Visit the Thajiwas Glacier (by pony or on foot). Enjoy the stunning views of snow-capped peaks. Later, drive back to Srinagar and check in to your hotel.',
        activities: [
          'Scenic drive to Sonmarg',
          'Pony ride to Thajiwas Glacier',
          'Photography at Sonamarg meadows',
          'Lunch at local restaurant',
          'Drive back to Srinagar',
          'Check-in at Srinagar hotel',
        ],
        meals: {
          breakfast: true,
          lunch: true,
          dinner: true,
        },
        accommodation: '5-Star Hotel in Srinagar',
      },
      {
        day: 7,
        title: 'Departure from Srinagar',
        description: 'After breakfast, check out from the hotel. Based on your flight timing, our representative will transfer you to Srinagar Airport. End of your memorable Kashmir tour with beautiful memories to cherish forever.',
        activities: [
          'Leisure breakfast at hotel',
          'Last-minute shopping (if time permits)',
          'Hotel check-out',
          'Transfer to Srinagar Airport',
          'Departure with beautiful memories',
        ],
        meals: {
          breakfast: true,
          lunch: false,
          dinner: false,
        },
        accommodation: null,
      },
    ],

    // Inclusions
    inclusions: [
      '6 Nights accommodation in premium hotels/houseboats',
      'Daily breakfast, lunch, and dinner',
      'All transfers and sightseeing in private AC vehicle',
      'Shikara ride on Dal Lake',
      'Gondola cable car ride in Gulmarg (Phase 1)',
      'All toll taxes, parking charges, and driver allowance',
      'Professional English-speaking tour guide',
      'Airport pick-up and drop-off',
      'Complimentary Kashmiri Kahwa tea',
      'Traditional Kashmiri Wazwan dinner',
    ],

    // Exclusions
    exclusions: [
      'Airfare/train fare to and from Srinagar',
      'Travel insurance',
      'Gondola cable car Phase 2 tickets (₹1,200 per person)',
      'Adventure activities (skiing, rafting, paragliding)',
      'Monument entrance fees',
      'Personal expenses (laundry, phone calls, tips)',
      'Any meals not mentioned in inclusions',
      'Camera fees at monuments',
      'Items of personal nature',
      'Any other services not mentioned in inclusions',
    ],

    pricing: {
      basePrice: 45000,
      currency: 'INR',
      perPerson: 15000,
    },
  },

  // Mock user data
  mockUser: {
    id: 1,
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '+91 98765 43210',
    role: 'USER',
    avatar: null,
  },
};
