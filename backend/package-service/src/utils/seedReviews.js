require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Generic user names for reviews
const reviewers = [
  { name: 'Priya Sharma', email: 'priya.sharma@example.com' },
  { name: 'Rajesh Kumar', email: 'rajesh.kumar@example.com' },
  { name: 'Ananya Patel', email: 'ananya.patel@example.com' },
  { name: 'Arjun Reddy', email: 'arjun.reddy@example.com' },
  { name: 'Sneha Gupta', email: 'sneha.gupta@example.com' },
  { name: 'Vikram Singh', email: 'vikram.singh@example.com' },
  { name: 'Meera Iyer', email: 'meera.iyer@example.com' },
  { name: 'Karan Malhotra', email: 'karan.malhotra@example.com' },
  { name: 'Divya Nair', email: 'divya.nair@example.com' },
  { name: 'Aditya Joshi', email: 'aditya.joshi@example.com' },
  { name: 'Neha Chopra', email: 'neha.chopra@example.com' },
  { name: 'Rohan Verma', email: 'rohan.verma@example.com' },
  { name: 'Ishita Desai', email: 'ishita.desai@example.com' },
  { name: 'Siddharth Mehta', email: 'siddharth.mehta@example.com' },
  { name: 'Kavya Rao', email: 'kavya.rao@example.com' },
  { name: 'Nikhil Agarwal', email: 'nikhil.agarwal@example.com' },
  { name: 'Pooja Bhatt', email: 'pooja.bhatt@example.com' },
  { name: 'Abhishek Pandey', email: 'abhishek.pandey@example.com' },
  { name: 'Ritika Saxena', email: 'ritika.saxena@example.com' },
  { name: 'Varun Kapoor', email: 'varun.kapoor@example.com' },
];

// Review templates by package category and rating
const reviewTemplates = {
  // CinemaTrip Experience reviews (CT001)
  cinematrip: {
    5: [
      'The CinemaTrip experience exceeded all our expectations! The crew was professional, equipment was top-notch, and the final video brought tears to our eyes. Worth every penny!',
      'Absolutely amazing! They captured our trip so beautifully. The 4K quality and drone shots made everything look like a Hollywood movie. Highly recommend!',
      'Best decision we made for our trip! The team was unobtrusive yet captured every special moment. The color grading was stunning.',
      'Professional from start to finish. The final film was delivered on time and looked absolutely cinematic. Will definitely book again!',
      'Our trip became a lifetime treasure thanks to Trip & Event. The cinematography was breathtaking and the editing was perfect.',
    ],
    4: [
      'Great experience overall! The video quality was excellent. Only minor delay in delivery but the final product was worth the wait.',
      'Very professional service. The crew was friendly and captured beautiful moments. Would have loved more aerial shots though.',
      'Really good cinematography! The 4K quality was impressive. Just felt the color grading could have been a bit warmer.',
    ],
  },

  // Pre-Wedding Shoot reviews (CT002)
  'pre-wedding-shoot': {
    5: [
      'Our pre-wedding shoot was magical! The team made us feel so comfortable and captured our love story perfectly. Every frame is frame-worthy!',
      'Absolutely stunning work! The locations, lighting, and poses were all perfect. These photos will be cherished forever.',
      'They made our pre-wedding shoot an unforgettable experience. Professional photography with a creative touch. Highly recommended!',
      'Best pre-wedding shoot ever! The team coordinated everything including makeup and locations. The results were breathtaking.',
      'Exceeded our expectations in every way! The photos and videos look like they\'re straight out of a magazine.',
    ],
    4: [
      'Beautiful pre-wedding shoot! The team was creative and professional. Would have loved a few more candid shots.',
      'Great experience! The photography was excellent and makeup coordination was smooth. Just needed slightly better communication.',
      'Very happy with the output! The team captured our chemistry well. Delivery was slightly delayed but quality made up for it.',
    ],
  },

  // Honeymoon Movie reviews (CT003)
  'honeymoon-movie': {
    5: [
      'Our honeymoon film is absolutely beautiful! They captured the romance and magic of our trip perfectly. It\'s like reliving those moments.',
      'Incredible work! The romantic shots against those stunning destinations made our honeymoon even more special. Thank you!',
      'The team was so professional and discreet. They captured intimate moments without being intrusive. The 4K film is a treasure.',
      'Best honeymoon package! The destination coverage was comprehensive and the final film brought back all those emotions.',
      'Worth every rupee! Our honeymoon movie is something we\'ll watch for years. The cinematography was world-class.',
    ],
    4: [
      'Beautiful honeymoon film! The romantic shots were lovely. Just wished they had captured a few more candid moments.',
      'Great service! The team was professional and the 4K quality was excellent. Delivery took slightly longer than expected.',
      'Very happy with our honeymoon movie! The destination coverage was good. Would have loved more sunset shots.',
    ],
  },

  // Family Trip Movie reviews (CT004)
  'family-trip': {
    5: [
      'Perfect way to preserve family memories! The team captured everyone beautifully and the candid shots were priceless.',
      'Our family trip film is now our most treasured possession! They captured the joy, laughter, and special moments perfectly.',
      'Highly professional! The crew made everyone comfortable, especially the kids. The professional editing was top-notch.',
      'Amazing experience! Every family member loved how they were captured. The film truly reflects our family bond.',
      'Best family trip documentation ever! They captured three generations beautifully. The editing was seamless.',
    ],
    4: [
      'Great family trip coverage! Everyone looked good in the film. Just felt it could have been slightly longer.',
      'Professional service! The candid shots were lovely. Delivery was good but would have appreciated more family group shots.',
      'Very satisfied with the family movie! The crew was patient with kids. Just minor audio issues in a couple of scenes.',
    ],
  },

  // Anniversary Celebration reviews (CT005)
  'anniversary-celebration': {
    5: [
      'They made our anniversary so special! The celebration coverage was beautiful and the highlight reel was perfect.',
      'Professional event filming at its best! Every special moment was captured. The video quality was excellent.',
      'Our anniversary film exceeded expectations! The team was unobtrusive yet captured all the emotions beautifully.',
      'Fantastic service! The highlight reel brought tears to our eyes. They truly understand how to capture celebrations.',
      'Best anniversary gift to ourselves! The event filming was professional and the final video was stunning.',
    ],
    4: [
      'Good anniversary coverage! The event filming was professional. Would have loved more close-up shots.',
      'Happy with the service! The highlight reel was nice. Just felt the delivery could have been faster.',
      'Professional work! They captured the celebration well. Audio quality could have been slightly better.',
    ],
  },

  // Birthday Celebration reviews (CT006)
  'birthday-celebration': {
    5: [
      'Amazing birthday coverage! They captured the energy and fun perfectly. The guest interviews were a brilliant touch!',
      'Quick delivery and excellent quality! The party coverage was comprehensive and everyone loved the final video.',
      'Professional from start to finish! The one-day shoot was well managed and the quick turnaround was impressive.',
      'Perfect birthday memories! The team was energetic and captured every fun moment. Highly recommend!',
      'Best birthday documentation! The guest highlights added a personal touch. Quality was top-notch.',
    ],
    4: [
      'Great birthday coverage! The party shots were good. Would have loved more footage of the cake cutting ceremony.',
      'Good service! Quick delivery as promised. Just felt some guest interviews could have been longer.',
      'Happy with the birthday video! The team was professional. Lighting in some indoor shots could have been better.',
    ],
  },

  // Yacht Experiences reviews (CT007)
  'yacht-experiences': {
    5: [
      'Ultimate luxury experience! The yacht coverage with aerial shots was absolutely stunning. Premium quality throughout.',
      'Breathtaking cinematography! They captured the luxury and beauty of the yacht experience perfectly. Worth the investment!',
      'Professional yacht filming at its finest! The aerial shots and premium editing made it look like a luxury commercial.',
      'Exceeded all expectations! The team handled the yacht environment expertly. The final film is museum-quality.',
      'World-class service! The yacht experience coverage was comprehensive and the quality was unmatched.',
    ],
    4: [
      'Excellent yacht coverage! The aerial shots were beautiful. Just wished there were more sunset sequences.',
      'Great luxury experience! Premium editing was evident. Delivery time was slightly longer than expected.',
      'Very professional! The yacht filming was excellent. Would have loved more underwater shots.',
    ],
  },

  // Corporate Film Trip reviews (CT008)
  'corporate-film-trip': {
    5: [
      'Perfect for our corporate event! The team building coverage was comprehensive and the branded content fit our image.',
      'Professional corporate documentation! They understood our brand guidelines perfectly. The team was impressed.',
      'Excellent corporate event filming! The coverage was thorough and the final video works perfectly for our presentations.',
      'Top-notch professional service! They captured our team outing brilliantly. Great for company culture showcasing.',
      'Best corporate film vendor! The team building moments were captured beautifully. Highly professional throughout.',
    ],
    4: [
      'Good corporate event coverage! Professional approach. Just needed more close-ups of individual team members.',
      'Solid work! The corporate events were well documented. Would have appreciated faster delivery.',
      'Professional service! Team building coverage was good. Audio during speeches could have been clearer.',
    ],
  },

  // Proposal & Engagement reviews (CT009)
  'proposal-engagement': {
    5: [
      'They captured the most magical moment of our lives! The surprise setup was flawless and the hidden cameras worked perfectly.',
      'Absolutely perfect! The proposal was beautifully documented. Quick turnaround meant we could share it immediately!',
      'Professional surprise coordination! They captured every emotion and the video quality was excellent. Highly recommend!',
      'Best decision ever! The hidden camera setup was brilliant. Our proposal video is something we\'ll treasure forever.',
      'Magical experience! They made our proposal even more special by documenting it so beautifully. Quick delivery was a bonus!',
    ],
    4: [
      'Great proposal coverage! The surprise setup worked well. Just wished they had captured a few more angles.',
      'Very happy with the service! Quick turnaround as promised. Lighting in some scenes could have been better.',
      'Good proposal documentation! Hidden cameras worked well. Would have loved more shots of the reactions.',
    ],
  },

  // Memory Lane Trip reviews (CT010)
  'memory-lane-trip': {
    5: [
      'Incredibly emotional and beautiful! They helped us revisit our special places and created a nostalgic masterpiece.',
      'The storytelling approach was brilliant! Our memory lane film brought back so many emotions. Truly special.',
      'Professional and sensitive to our story! They captured the essence of our journey perfectly. The emotional narrative was touching.',
      'Best way to preserve memories! The location revisits were beautifully shot and the story telling was perfect.',
      'Exceeded expectations! They understood our emotional journey and captured it with such sensitivity and artistry.',
    ],
    4: [
      'Beautiful memory lane film! The locations looked great. Just felt it could have included a few more old photographs.',
      'Good nostalgic coverage! The storytelling was nice. Delivery time was longer than expected though.',
      'Happy with the film! They captured our emotional journey well. Audio narration could have been slightly better.',
    ],
  },

  // Babymoon Trip reviews (CT011)
  'babymoon-trip': {
    5: [
      'Perfect babymoon documentation! The maternity shots were beautiful and they were so gentle and patient with us.',
      'Beautiful memories before our baby arrives! The couple moments were captured so tenderly. Highly recommend!',
      'Professional and understanding! They adjusted to our pace and captured our special babymoon perfectly.',
      'Precious memories captured! The maternity shots against those beautiful locations were stunning. Thank you!',
      'Best babymoon experience! The team was patient and professional. The gentle pacing made it stress-free.',
    ],
    4: [
      'Lovely babymoon film! The maternity shots were beautiful. Just wished they had more golden hour footage.',
      'Good experience! The team was patient and professional. Delivery could have been slightly faster.',
      'Happy with the babymoon video! Couple moments were well captured. Would have loved more close-up shots.',
    ],
  },

  // Personal Events reviews (CT012)
  'personal-events': {
    5: [
      'Excellent personal event coverage! They documented our milestone beautifully. The guest highlights were perfect.',
      'Professional event filming! The same day edit option was a lifesaver. Everyone loved the video!',
      'Perfect documentation of our celebration! The event coverage was comprehensive and quality was excellent.',
      'Highly professional service! They captured our personal milestone with care and creativity. Loved the guest highlights!',
      'Best event coverage! The team was efficient and the final video exceeded our expectations. Highly recommend!',
    ],
    4: [
      'Good event coverage! Professional team. Just felt the guest highlights could have been more extensive.',
      'Solid service! Event filming was good. Would have liked more candid moments captured.',
      'Happy with the personal event video! Quality was good. Delivery time was acceptable but could be faster.',
    ],
  },
};

// Function to get contextual reviews based on package slug
function getReviewsForPackage(packageSlug, packageName) {
  const templateKey = packageSlug.toLowerCase();
  const templates = reviewTemplates[templateKey] || reviewTemplates.cinematrip;

  return {
    fiveStarReviews: templates[5] || reviewTemplates.cinematrip[5],
    fourStarReviews: templates[4] || reviewTemplates.cinematrip[4],
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

// Seed reviews for all CineTrip packages
async function seedCineTripReviews() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         SEEDING CINETRIP PACKAGE REVIEWS                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Get all CineTrip packages
    const packages = await prisma.cineTripPackage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    if (packages.length === 0) {
      console.log('⚠️  No CineTrip packages found. Please seed packages first.');
      return 0;
    }

    console.log(`📦 Found ${packages.length} CineTrip packages\n`);

    // Clear existing reviews
    await prisma.cineTripReview.deleteMany({});
    console.log('✓ Cleared existing reviews\n');

    let totalReviewsCreated = 0;
    const shuffledReviewers = shuffleArray(reviewers);

    // For each package, create 5-10 reviews
    for (const pkg of packages) {
      console.log(`🎬 Processing: ${pkg.name}`);

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

      const expectedRating = shouldBePerfect ? '5.0' : '4.9';

      console.log(`  • Creating ${numReviews} reviews (${fiveStarCount}x 5-star, ${fourStarCount}x 4-star) | Target: ${expectedRating}`);

      const { fiveStarReviews, fourStarReviews } = getReviewsForPackage(pkg.slug, pkg.name);

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

        await prisma.cineTripReview.create({
          data: {
            ...review,
            createdAt,
            updatedAt: createdAt,
          },
        });
      }

      // Update package rating
      const avgRating = (fiveStarCount * 5 + fourStarCount * 4) / numReviews;
      await prisma.cineTripPackage.update({
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
  seedCineTripReviews()
    .then(() => {
      console.log('✅ Review seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Review seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedCineTripReviews };
