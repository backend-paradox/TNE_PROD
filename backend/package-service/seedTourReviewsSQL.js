const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Reviewer pool
const reviewers = [
  { name: 'Priya Sharma', email: 'priya.sharma@example.com' },
  { name: 'Rajesh Kumar', email: 'rajesh.kumar@example.com' },
  { name: 'Anjali Verma', email: 'anjali.verma@example.com' },
  { name: 'Arjun Patel', email: 'arjun.patel@example.com' },
  { name: 'Sneha Reddy', email: 'sneha.reddy@example.com' },
  { name: 'Vikram Singh', email: 'vikram.singh@example.com' },
  { name: 'Pooja Nair', email: 'pooja.nair@example.com' },
  { name: 'Amit Gupta', email: 'amit.gupta@example.com' },
  { name: 'Neha Joshi', email: 'neha.joshi@example.com' },
  { name: 'Karthik Menon', email: 'karthik.menon@example.com' },
  { name: 'Divya Iyer', email: 'divya.iyer@example.com' },
  { name: 'Rahul Mehta', email: 'rahul.mehta@example.com' },
  { name: 'Kavita Desai', email: 'kavita.desai@example.com' },
  { name: 'Sanjay Rao', email: 'sanjay.rao@example.com' },
  { name: 'Meera Kapoor', email: 'meera.kapoor@example.com' },
  { name: 'Aditya Bhatt', email: 'aditya.bhatt@example.com' },
  { name: 'Ritu Malhotra', email: 'ritu.malhotra@example.com' },
  { name: 'Suresh Pillai', email: 'suresh.pillai@example.com' },
  { name: 'Lakshmi Krishnan', email: 'lakshmi.krishnan@example.com' },
  { name: 'Manish Agarwal', email: 'manish.agarwal@example.com' },
];

// Review templates by category
const reviewTemplates = {
  hillStation: {
    5: [
      'The mountains took our breath away! Perfect escape from city life. The scenic views and cool climate made it unforgettable.',
      'Absolutely stunning hill station experience! The tour was well-organized and the landscapes were mesmerizing.',
      'One of the best mountain trips we\'ve ever taken. The fresh air, beautiful valleys, and amazing hospitality made it perfect.',
      'Incredible hill station adventure! Every moment was picture-perfect. Highly recommend for nature lovers.',
      'The mountain views were spectacular! Great itinerary, comfortable stays, and breathtaking scenery throughout.',
    ],
    4: [
      'Great hill station trip! Would have loved a bit more time at scenic spots. Otherwise, excellent experience.',
      'Beautiful mountains and good organization. The weather was perfect for sightseeing.',
      'Lovely hill station getaway! Minor hiccups with transportation but the destination made up for it.',
    ],
  },
  beach: {
    5: [
      'Paradise on earth! The pristine beaches and crystal clear waters were exactly what we needed. Perfect beach vacation!',
      'The beaches were absolutely stunning! Great water sports, delicious seafood, and amazing sunsets every evening.',
      'Best beach holiday ever! The sand, sea, and sunshine combination was perfect. Highly recommended!',
      'Incredible beach experience! The coastal beauty and water activities exceeded all our expectations.',
      'Dream beach destination! From sunrise walks to sunset parties, everything was magical.',
    ],
    4: [
      'Beautiful beaches and good facilities. Would have preferred less crowded areas but overall enjoyed it.',
      'Great beach vacation! The water sports were amazing. Minor issues with accommodation but nothing major.',
      'Lovely coastal experience! The beaches were clean and the food was excellent.',
    ],
  },
  heritage: {
    5: [
      'A journey through time! The historical monuments and cultural richness were absolutely fascinating.',
      'Incredible heritage experience! Every fort and palace told a story. The guides were knowledgeable and passionate.',
      'The architectural marvels left us speechless! Rich history, beautiful monuments, and great cultural insights.',
      'Amazing heritage tour! The historical sites were well-preserved and the stories behind them were captivating.',
      'Perfect blend of history and culture! The monuments, museums, and local experiences were outstanding.',
    ],
    4: [
      'Great historical tour! Learned so much about the rich heritage. Would have appreciated more time at each site.',
      'Fascinating heritage sites! The architecture was stunning. Could use better crowd management.',
      'Wonderful cultural experience! The monuments were impressive and the local cuisine was delicious.',
    ],
  },
  international: {
    5: [
      'An international adventure of a lifetime! Everything from visa to hotel was perfectly arranged. Loved every moment!',
      'The best international trip! The destination exceeded expectations with its culture, food, and attractions.',
      'Flawless international tour! Great planning, comfortable stays, and amazing experiences throughout.',
      'Incredible overseas experience! The local sights, shopping, and cuisine made it unforgettable.',
      'Perfect international getaway! From airport transfers to guided tours, everything was seamless.',
    ],
    4: [
      'Great international trip! Minor language barriers but the tour company handled everything well.',
      'Wonderful overseas experience! The destinations were amazing. Flight timings could have been better.',
      'Excellent international package! Everything was well-organized. Would love longer stays at each location.',
    ],
  },
  adventure: {
    5: [
      'Adrenaline rush at its best! The adventure activities were thrilling and safety measures were top-notch.',
      'Incredible adventure package! From trekking to rafting, every activity was expertly managed and super exciting.',
      'Best adventure tour ever! The activities pushed our limits while ensuring complete safety. Unforgettable experience!',
      'Thrilling adventure trip! Professional guides, quality equipment, and breathtaking locations made it perfect.',
      'Amazing outdoor adventure! The combination of activities and natural beauty was simply outstanding.',
    ],
    4: [
      'Great adventure experience! All activities were fun and challenging. Weather could have been better.',
      'Exciting adventure package! The activities were well-planned. Minor equipment issues but quickly resolved.',
      'Wonderful adventure trip! Loved the trekking and camping. Food could be improved.',
    ],
  },
  family: {
    5: [
      'Perfect family vacation! Activities for all ages, safe environment, and great entertainment throughout.',
      'Wonderful family trip! The kids had a blast and we adults enjoyed every moment too. Highly recommend!',
      'Best family getaway! Something for everyone - kids, adults, and grandparents all had an amazing time.',
      'Excellent family package! Child-friendly activities, comfortable stays, and memorable experiences for all.',
      'Fantastic family holiday! Well-paced itinerary that kept everyone engaged and happy.',
    ],
    4: [
      'Great family trip! Kids loved it. Would suggest more kid-friendly food options.',
      'Good family vacation! Most activities were suitable for all ages. Some days felt a bit rushed.',
      'Nice family package! Everyone enjoyed the trip. More leisure time would have been appreciated.',
    ],
  },
  romantic: {
    5: [
      'The perfect romantic escape! Candle-light dinners, beautiful views, and privacy made it unforgettable.',
      'Dreamy honeymoon experience! Every detail was crafted for romance. The memories will last forever.',
      'Incredibly romantic getaway! Stunning locations, intimate settings, and special touches made it magical.',
      'Perfect for couples! The romantic ambiance, beautiful sunsets, and private experiences were amazing.',
      'The ultimate romantic package! From couple spa to private dinners, everything was perfectly romantic.',
    ],
    4: [
      'Lovely romantic trip! Great ambiance and beautiful locations. Some activities could be more couple-focused.',
      'Good romantic getaway! The settings were beautiful. Would have loved more privacy in certain areas.',
      'Nice romantic experience! The destinations were perfect for couples. Minor service delays.',
    ],
  },
  pilgrimage: {
    5: [
      'Spiritually uplifting journey! The temples were divine and the arrangements were perfect for a peaceful pilgrimage.',
      'Blessed experience! The spiritual atmosphere and well-organized temple visits made it truly special.',
      'Perfect pilgrimage tour! Visited all important temples with proper rituals. Very peaceful and divine.',
      'Wonderful spiritual journey! The guides were respectful and knowledgeable about all religious aspects.',
      'Divine pilgrimage experience! Clean accommodations near temples and well-timed darshans made it perfect.',
    ],
    4: [
      'Good pilgrimage tour! Visited all major temples. Crowd management during peak times could be better.',
      'Peaceful spiritual journey! The temple visits were well-planned. Accommodation was basic but clean.',
      'Nice pilgrimage package! All religious sites were covered. Long waiting times at popular temples.',
    ],
  },
};

function getCategoryForPackage(pkg) {
  const combined = `${pkg.name} ${pkg.destination} ${pkg.category}`.toLowerCase();

  if (combined.includes('honeymoon') || combined.includes('romantic') || combined.includes('couple')) return 'romantic';
  if (combined.includes('pilgrimage') || combined.includes('temple') || combined.includes('spiritual') || combined.includes('varanasi') || combined.includes('haridwar')) return 'pilgrimage';
  if (combined.includes('beach') || combined.includes('goa') || combined.includes('maldives') || combined.includes('phuket') || combined.includes('bali') || combined.includes('coastal')) return 'beach';
  if (combined.includes('heritage') || combined.includes('rajasthan') || combined.includes('agra') || combined.includes('fort') || combined.includes('palace')) return 'heritage';
  if (combined.includes('international') || combined.includes('dubai') || combined.includes('singapore') || combined.includes('thailand') || combined.includes('bali') || combined.includes('maldives') || !combined.includes('india')) return 'international';
  if (combined.includes('trek') || combined.includes('adventure') || combined.includes('rafting') || combined.includes('camping')) return 'adventure';
  if (combined.includes('kashmir') || combined.includes('manali') || combined.includes('shimla') || combined.includes('ooty') || combined.includes('darjeeling') || combined.includes('hills') || combined.includes('mountain')) return 'hillStation';

  return 'family';
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function seedTourReviewsSQL() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║           SEEDING TOUR PACKAGE REVIEWS (SQL)              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Fetch all tour packages
    const packages = await prisma.tourPackage.findMany({
      where: { isActive: true },
    });

    console.log(`📦 Found ${packages.length} Tour packages\n`);

    // Clear existing reviews
    await prisma.$executeRaw`DELETE FROM tour_package_reviews`;
    console.log('✓ Cleared existing reviews\n');

    let totalReviewsCreated = 0;
    const shuffledReviewers = shuffleArray(reviewers);

    // For each package, create 5-10 reviews
    for (const pkg of packages) {
      console.log(`🗺️  Processing: ${pkg.name} (${pkg.destination})`);

      const category = getCategoryForPackage(pkg);
      const templates = reviewTemplates[category];

      const numReviews = Math.floor(Math.random() * 6) + 5; // 5 to 10
      const fiveStarCount = Math.ceil(numReviews * (0.7 + Math.random() * 0.1)); // 70-80%
      const fourStarCount = numReviews - fiveStarCount;

      const packageReviews = [];

      // Create 5-star reviews
      for (let i = 0; i < fiveStarCount; i++) {
        const reviewer = shuffledReviewers[Math.floor(Math.random() * shuffledReviewers.length)];
        const comment = templates[5][Math.floor(Math.random() * templates[5].length)];
        const helpful = Math.floor(Math.random() * 15) + 5; // 5-19
        const verified = Math.random() < 0.7; // 70% verified
        const daysAgo = Math.floor(Math.random() * 90) + 1; // 1-90 days ago
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        packageReviews.push({
          packageId: pkg.id,
          userId: `user_${Math.random().toString(36).substr(2, 9)}`,
          userName: reviewer.name,
          userEmail: reviewer.email,
          rating: 5,
          comment,
          helpful,
          verified,
          createdAt,
        });
      }

      // Create 4-star reviews
      for (let i = 0; i < fourStarCount; i++) {
        const reviewer = shuffledReviewers[Math.floor(Math.random() * shuffledReviewers.length)];
        const comment = templates[4][Math.floor(Math.random() * templates[4].length)];
        const helpful = Math.floor(Math.random() * 10) + 2; // 2-11
        const verified = Math.random() < 0.6; // 60% verified
        const daysAgo = Math.floor(Math.random() * 90) + 1;
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        packageReviews.push({
          packageId: pkg.id,
          userId: `user_${Math.random().toString(36).substr(2, 9)}`,
          userName: reviewer.name,
          userEmail: reviewer.email,
          rating: 4,
          comment,
          helpful,
          verified,
          createdAt,
        });
      }

      // Insert reviews using raw SQL
      for (const review of packageReviews) {
        await prisma.$executeRaw`
          INSERT INTO tour_package_reviews (
            id, package_id, user_id, user_name, user_email, rating, comment, helpful, verified, created_at, updated_at
          ) VALUES (
            ${`review_${Math.random().toString(36).substr(2, 9)}`},
            ${review.packageId},
            ${review.userId},
            ${review.userName},
            ${review.userEmail},
            ${review.rating},
            ${review.comment},
            ${review.helpful},
            ${review.verified},
            ${review.createdAt},
            ${review.createdAt}
          )
        `;
      }

      // Update package rating and review count
      const avgRating = packageReviews.reduce((sum, r) => sum + r.rating, 0) / packageReviews.length;
      await prisma.tourPackage.update({
        where: { id: pkg.id },
        data: {
          rating: avgRating,
          reviewCount: packageReviews.length,
        },
      });

      totalReviewsCreated += packageReviews.length;
      console.log(`   ✓ Created ${packageReviews.length} reviews (${fiveStarCount}x⭐⭐⭐⭐⭐, ${fourStarCount}x⭐⭐⭐⭐) - Avg: ${avgRating.toFixed(1)}⭐\n`);
    }

    console.log('═'.repeat(60));
    console.log(`✅ Successfully seeded ${totalReviewsCreated} Tour package reviews!`);
    console.log('═'.repeat(60));

    return totalReviewsCreated;
  } catch (error) {
    console.error('❌ Error seeding reviews:', error);
    throw error;
  }
}

// Run the seed function
seedTourReviewsSQL()
  .then(() => {
    console.log('\n🎉 Tour review system is fully operational!\n');
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    prisma.$disconnect();
    process.exit(1);
  });
