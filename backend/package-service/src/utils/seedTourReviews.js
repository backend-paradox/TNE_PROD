require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Generic user names for reviews
const reviewers = [
  { name: 'Amit Kumar', email: 'amit.kumar@example.com' },
  { name: 'Priya Singh', email: 'priya.singh@example.com' },
  { name: 'Rahul Sharma', email: 'rahul.sharma@example.com' },
  { name: 'Sneha Gupta', email: 'sneha.gupta@example.com' },
  { name: 'Vikram Patel', email: 'vikram.patel@example.com' },
  { name: 'Anjali Reddy', email: 'anjali.reddy@example.com' },
  { name: 'Karthik Iyer', email: 'karthik.iyer@example.com' },
  { name: 'Neha Desai', email: 'neha.desai@example.com' },
  { name: 'Rohan Malhotra', email: 'rohan.malhotra@example.com' },
  { name: 'Pooja Nair', email: 'pooja.nair@example.com' },
  { name: 'Sanjay Verma', email: 'sanjay.verma@example.com' },
  { name: 'Deepika Chopra', email: 'deepika.chopra@example.com' },
  { name: 'Arjun Mehta', email: 'arjun.mehta@example.com' },
  { name: 'Kavita Rao', email: 'kavita.rao@example.com' },
  { name: 'Nikhil Joshi', email: 'nikhil.joshi@example.com' },
  { name: 'Ritika Saxena', email: 'ritika.saxena@example.com' },
  { name: 'Varun Kapoor', email: 'varun.kapoor@example.com' },
  { name: 'Divya Bhatt', email: 'divya.bhatt@example.com' },
  { name: 'Aditya Pandey', email: 'aditya.pandey@example.com' },
  { name: 'Ishita Agarwal', email: 'ishita.agarwal@example.com' },
];

// Review templates by destination category
const reviewTemplates = {
  // Hill Station reviews (Kashmir, Manali, Shimla, Darjeeling, etc.)
  hillStation: {
    5: [
      'Absolutely breathtaking experience! The hill station was stunning with perfect weather. Our guide was knowledgeable and the accommodations exceeded expectations. Every moment was magical!',
      'Perfect getaway from city life! The mountains, fresh air, and scenic beauty were beyond words. Trip & Event handled everything professionally. Highly recommend!',
      'One of the best trips we\'ve ever taken! The hill views were spectacular and the itinerary was well-planned. Great value for money!',
      'Amazing experience! The mountain scenery was breathtaking and the local culture added a special touch. Will definitely book with Trip & Event again!',
      'Outstanding tour package! From comfortable hotels to scenic routes, everything was perfect. The coordinator was always available to help.',
      'Incredible mountain experience! The snow-capped peaks and valleys were mesmerizing. Professional service throughout the trip.',
      'Best hill station tour! The weather was perfect, accommodations were comfortable, and the sightseeing spots were well-chosen. Loved it!',
    ],
    4: [
      'Great hill station experience! The views were amazing. Just wished the hotel was a bit closer to the main attractions.',
      'Wonderful trip overall! The scenery was beautiful and guide was helpful. Transportation could have been slightly better.',
      'Very good package! Enjoyed the mountain views and local food. Would have preferred one more day in the itinerary.',
    ],
  },

  // Beach/Coastal reviews (Goa, Maldives, Phuket, Krabi, etc.)
  beach: {
    5: [
      'Paradise found! The beaches were pristine and the resort was luxurious. Perfect blend of relaxation and adventure. Unforgettable experience!',
      'Best beach vacation ever! Crystal clear waters, white sand beaches, and amazing water sports. Trip & Event made it seamless!',
      'Absolutely stunning! The coastal views, seafood, and beach activities were incredible. Professional service from start to finish.',
      'Perfect beach getaway! The sunsets were mesmerizing and the beach resorts were top-notch. Exceeded all expectations!',
      'Dream beach vacation! From water sports to beach parties, everything was amazing. Will definitely return!',
      'Incredible coastal experience! The beaches were clean, weather was perfect, and local cuisine was delicious. Highly recommend!',
      'Best beach package! The combination of relaxation and activities was perfect. Accommodations were beachfront and beautiful.',
    ],
    4: [
      'Great beach vacation! The water activities were fun and beaches were beautiful. Just felt it could have been a day longer.',
      'Lovely coastal experience! Beach resorts were good. Transportation to some beaches took a bit longer than expected.',
      'Very enjoyable beach trip! Good mix of activities. Would have loved more time for water sports.',
    ],
  },

  // Heritage/Cultural reviews (Rajasthan, Agra, Varanasi, etc.)
  heritage: {
    5: [
      'Incredible cultural journey! The historical sites were magnificent and our guide brought history to life. Every palace and fort was stunning!',
      'Best heritage tour! The rich history, stunning architecture, and local culture made this trip unforgettable. Perfectly organized!',
      'Amazing cultural experience! From ancient monuments to traditional cuisine, everything was authentic and well-planned. Highly impressed!',
      'Outstanding heritage package! The forts and palaces were breathtaking. Knowledgeable guide shared fascinating historical insights.',
      'Perfect cultural immersion! The architecture, traditions, and local hospitality were incredible. Trip & Event did an excellent job!',
      'Spectacular heritage tour! Each monument told a story and the local experiences were enriching. Professional service throughout!',
      'Unforgettable cultural journey! The historical significance of each site was well-explained. Accommodations near heritage sites were convenient.',
    ],
    4: [
      'Great heritage experience! The monuments were impressive and guide was informative. Just needed more time at some locations.',
      'Wonderful cultural tour! Learned so much about history. Would have preferred slightly better hotel locations.',
      'Very good heritage package! The sites were well-chosen. Some locations were crowded but overall enjoyable.',
    ],
  },

  // International/Exotic reviews (Dubai, Singapore, Bali, Europe, etc.)
  international: {
    5: [
      'Dream international trip! Everything from flights to hotels was seamlessly coordinated. The destination was spectacular!',
      'Best international package! Trip & Event handled visa, flights, and hotels perfectly. The experience was world-class!',
      'Absolutely amazing! The international destination exceeded expectations. Professional coordination made everything stress-free!',
      'Perfect global experience! Modern amenities, diverse culture, and amazing attractions. Worth every penny!',
      'Outstanding international tour! From airport transfers to city tours, everything was professionally managed. Loved it!',
      'Incredible overseas trip! The destination was beautiful and the planning was flawless. Will definitely book international tours with them again!',
      'Best vacation abroad! Comfortable flights, luxury hotels, and amazing sightseeing. Trip & Event made international travel easy!',
    ],
    4: [
      'Great international experience! The destination was beautiful. Flight timings could have been better.',
      'Wonderful overseas trip! Enjoyed every moment. Would have appreciated more local cuisine experiences.',
      'Very good international package! Professional service. Just felt the itinerary was a bit packed.',
    ],
  },

  // Adventure/Trekking reviews
  adventure: {
    5: [
      'Thrilling adventure! The trekking routes were challenging but rewarding. Safety measures were excellent throughout!',
      'Best adventure tour! From rafting to trekking, every activity was well-organized and safe. Adrenaline-pumping experience!',
      'Amazing adventure package! Professional guides, quality equipment, and breathtaking trails. Unforgettable experience!',
      'Perfect adventure getaway! The activities were exciting and safety was prioritized. Trip & Event knows adventure tourism!',
      'Outstanding adventure tour! Every activity from paragliding to camping was expertly managed. Highly recommend for thrill-seekers!',
    ],
    4: [
      'Great adventure experience! The activities were thrilling. Just wished there were more adventure options.',
      'Very good adventure package! Professional guides and safety equipment. Weather could have been better.',
      'Enjoyable adventure tour! Good mix of activities. Some activities were scheduled too early.',
    ],
  },

  // Family/General tourism
  family: {
    5: [
      'Perfect family vacation! Activities were suitable for all age groups. Kids had an amazing time and so did we!',
      'Best family trip! From grandparents to kids, everyone enjoyed. Well-planned itinerary considering family needs.',
      'Wonderful family experience! Safe, comfortable, and entertaining for all family members. Highly recommend for families!',
      'Amazing family package! The hotels were family-friendly and activities were engaging for everyone. Great memories created!',
      'Perfect for families! Kid-friendly activities, comfortable accommodations, and patient coordinators. Exceeded expectations!',
    ],
    4: [
      'Great family trip! Everyone enjoyed. Would have appreciated more kid-specific activities.',
      'Good family package! Comfortable for all age groups. Just needed more rest time between activities.',
      'Enjoyable family vacation! Well-organized. Some locations had too much walking for elderly members.',
    ],
  },

  // Romantic/Honeymoon
  romantic: {
    5: [
      'Perfect honeymoon! Romantic settings, beautiful views, and special arrangements made it magical. Best start to our married life!',
      'Dream romantic getaway! Privacy, luxury, and stunning locations. Trip & Event made our honeymoon unforgettable!',
      'Incredible honeymoon package! Every detail was romantic from candlelight dinners to sunset views. Highly recommend for couples!',
      'Best romantic trip! The destination was beautiful and the special touches made it extra special. Perfect for couples!',
      'Amazing honeymoon experience! Romantic ambiance, beautiful resorts, and memorable moments. Trip & Event understood what we needed!',
    ],
    4: [
      'Lovely romantic trip! Beautiful destinations and good service. Would have loved more couple-exclusive activities.',
      'Great honeymoon package! Romantic settings and comfortable hotels. Just wished for better weather.',
      'Good romantic getaway! Special arrangements were nice. Some crowded tourist spots affected the intimacy.',
    ],
  },

  // Pilgrimage/Spiritual
  pilgrimage: {
    5: [
      'Deeply spiritual experience! The pilgrimage sites were serene and well-organized. Felt blessed throughout the journey!',
      'Perfect spiritual tour! Accommodations near temples and timely darshan arrangements made it hassle-free. Peaceful experience!',
      'Amazing pilgrimage package! From transportation to temple visits, everything was smoothly coordinated. Spiritual and fulfilling!',
      'Best pilgrimage tour! The spiritual atmosphere, clean accommodations, and knowledgeable guide enhanced the experience!',
      'Wonderful spiritual journey! Every religious site was accessible and the respect for traditions was evident. Highly recommend!',
    ],
    4: [
      'Good pilgrimage experience! Temple visits were well-timed. Just needed better crowd management at some places.',
      'Spiritual and peaceful trip! Accommodations were clean. Would have preferred vegetarian food options.',
      'Nice pilgrimage package! Temples were beautiful. Some waiting times at popular shrines were long.',
    ],
  },
};

// Function to determine category based on package name, destination, and tags
function getCategoryForPackage(pkg) {
  const name = pkg.name.toLowerCase();
  const destination = pkg.destination.toLowerCase();
  const category = pkg.category.toLowerCase();
  const tags = pkg.tags ? pkg.tags.join(' ').toLowerCase() : '';
  const combined = `${name} ${destination} ${category} ${tags}`;

  // Detect honeymoon/romantic
  if (combined.includes('honeymoon') || combined.includes('romantic') || combined.includes('couple')) {
    return 'romantic';
  }

  // Detect pilgrimage
  if (combined.includes('temple') || combined.includes('pilgrimage') || combined.includes('spiritual') ||
      combined.includes('varanasi') || combined.includes('tirupati') || combined.includes('haridwar')) {
    return 'pilgrimage';
  }

  // Detect adventure
  if (combined.includes('adventure') || combined.includes('trek') || combined.includes('rafting') ||
      combined.includes('camping') || combined.includes('paragliding')) {
    return 'adventure';
  }

  // Detect beach/coastal
  if (combined.includes('beach') || combined.includes('goa') || combined.includes('maldives') ||
      combined.includes('phuket') || combined.includes('krabi') || combined.includes('coastal') ||
      combined.includes('island') || destination.includes('goa')) {
    return 'beach';
  }

  // Detect heritage/cultural
  if (combined.includes('heritage') || combined.includes('fort') || combined.includes('palace') ||
      combined.includes('rajasthan') || combined.includes('agra') || combined.includes('jaipur') ||
      combined.includes('udaipur') || destination.includes('rajasthan')) {
    return 'heritage';
  }

  // Detect international
  if (pkg.country !== 'India' || combined.includes('international') || combined.includes('dubai') ||
      combined.includes('singapore') || combined.includes('bali') || combined.includes('europe') ||
      combined.includes('thailand') || combined.includes('malaysia')) {
    return 'international';
  }

  // Detect hill station
  if (combined.includes('hill') || combined.includes('mountain') || combined.includes('kashmir') ||
      combined.includes('manali') || combined.includes('shimla') || combined.includes('darjeeling') ||
      combined.includes('ooty') || combined.includes('nainital') || category.includes('hill')) {
    return 'hillStation';
  }

  // Default to family
  return 'family';
}

// Get contextual reviews based on package
function getReviewsForPackage(pkg) {
  const category = getCategoryForPackage(pkg);
  const templates = reviewTemplates[category] || reviewTemplates.family;

  return {
    fiveStarReviews: templates[5],
    fourStarReviews: templates[4],
    category: category,
  };
}

// Generate random user IDs (mock - in production these would be real user IDs)
function generateUserId() {
  return `user_${Math.random().toString(36).substring(2, 15)}`;
}

// Shuffle array utility
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Seed reviews for all Tour packages
async function seedTourReviews() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║           SEEDING TOUR PACKAGE REVIEWS                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Get all Tour packages
    const packages = await prisma.tourPackage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    if (packages.length === 0) {
      console.log('⚠️  No Tour packages found. Please seed packages first.');
      return 0;
    }

    console.log(`📦 Found ${packages.length} Tour packages\n`);

    // Clear existing reviews
    await prisma.tourPackageReview.deleteMany({});
    console.log('✓ Cleared existing reviews\n');

    let totalReviewsCreated = 0;
    const shuffledReviewers = shuffleArray(reviewers);

    // For each package, create 5-10 reviews
    for (const pkg of packages) {
      console.log(`🗺️  Processing: ${pkg.name} (${pkg.destination})`);

      // Calculate rating distribution for 5.0 or 4.9 ratings
      // 50% chance for perfect 5.0 rating, 50% for 4.9 rating
      const shouldBePerfect = Math.random() < 0.5;
      let numReviews, fiveStarCount, fourStarCount;

      if (shouldBePerfect) {
        // 5.0 rating: all 5-star reviews (can be 5-10 reviews)
        numReviews = Math.floor(Math.random() * 6) + 5; // 5 to 10
        fiveStarCount = numReviews;
        fourStarCount = 0;
      } else {
        // 4.9 rating: Must have exactly 10 reviews for exact 4.9 (9x5-star + 1x4-star)
        numReviews = 10;
        fiveStarCount = 9;
        fourStarCount = 1;
      }

      const { fiveStarReviews, fourStarReviews, category } = getReviewsForPackage(pkg);
      const expectedRating = shouldBePerfect ? '5.0' : '4.9';

      console.log(`  • Category: ${category} | Creating ${numReviews} reviews (${fiveStarCount}x 5-star, ${fourStarCount}x 4-star) | Target: ${expectedRating}`);

      const reviewsToCreate = [];

      // Create 5-star reviews
      for (let i = 0; i < fiveStarCount; i++) {
        const reviewer = shuffledReviewers[(totalReviewsCreated + i) % shuffledReviewers.length];
        const comment = fiveStarReviews[i % fiveStarReviews.length];

        reviewsToCreate.push({
          packageId: pkg.id,
          userId: generateUserId(),
          userName: reviewer.name,
          userEmail: reviewer.email,
          rating: 5,
          comment,
          helpful: Math.floor(Math.random() * 15) + 5, // 5-19 helpful votes
          verified: Math.random() > 0.3, // 70% verified
        });
      }

      // Create 4-star reviews
      for (let i = 0; i < fourStarCount; i++) {
        const reviewer = shuffledReviewers[(totalReviewsCreated + fiveStarCount + i) % shuffledReviewers.length];
        const comment = fourStarReviews[i % fourStarReviews.length];

        reviewsToCreate.push({
          packageId: pkg.id,
          userId: generateUserId(),
          userName: reviewer.name,
          userEmail: reviewer.email,
          rating: 4,
          comment,
          helpful: Math.floor(Math.random() * 10) + 2, // 2-11 helpful votes
          verified: Math.random() > 0.4, // 60% verified
        });
      }

      // Shuffle reviews to mix 5-star and 4-star
      const shuffledReviews = shuffleArray(reviewsToCreate);

      // Insert reviews with slightly different timestamps
      for (let i = 0; i < shuffledReviews.length; i++) {
        const review = shuffledReviews[i];
        const daysAgo = Math.floor(Math.random() * 90) + 1; // 1-90 days ago
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);

        await prisma.tourPackageReview.create({
          data: {
            ...review,
            createdAt,
            updatedAt: createdAt,
          },
        });
      }

      // Update package rating
      const avgRating = (fiveStarCount * 5 + fourStarCount * 4) / numReviews;
      await prisma.tourPackage.update({
        where: { id: pkg.id },
        data: {
          rating: parseFloat(avgRating.toFixed(1)),
          reviewCount: numReviews,
        },
      });

      console.log(`  ✓ Created ${numReviews} reviews | Avg Rating: ${avgRating.toFixed(1)}\n`);
      totalReviewsCreated += numReviews;
    }

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║              REVIEW SEEDING COMPLETE                       ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  Total Reviews Created: ${String(totalReviewsCreated).padEnd(38)}║`);
    console.log(`║  Packages Updated: ${String(packages.length).padEnd(43)}║`);
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    return totalReviewsCreated;
  } catch (error) {
    console.error('\n❌ Error seeding reviews:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedTourReviews()
    .then(() => {
      console.log('✅ Review seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Review seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedTourReviews };
