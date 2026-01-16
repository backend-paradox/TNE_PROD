const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testReviewAPI() {
  try {
    console.log('\n🧪 Testing Review API Endpoints\n');
    console.log('═'.repeat(70));

    // Test 1: Get CineTrip packages
    const cineTripPackages = await prisma.cineTripPackage.findMany({
      where: { isActive: true },
      take: 3
    });
    console.log(`\n1️⃣  CineTrip Packages: ${cineTripPackages.length} found`);
    cineTripPackages.forEach(p => console.log(`   - ${p.name} (slug: ${p.slug})`));

    // Test 2: Get CineTrip reviews for first package
    if (cineTripPackages.length > 0) {
      const firstPkg = cineTripPackages[0];
      const reviews = await prisma.cineTripReview.findMany({
        where: { packageId: firstPkg.id },
        orderBy: { createdAt: 'desc' },
        take: 3
      });

      console.log(`\n2️⃣  Reviews for "${firstPkg.name}": ${reviews.length} found`);
      reviews.forEach(r => {
        console.log(`   ⭐ ${r.rating}/5 by ${r.userName}`);
        console.log(`      "${r.comment.substring(0, 60)}..."`);
      });
    }

    // Test 3: Get Tour packages
    const tourPackages = await prisma.tourPackage.findMany({
      where: { isActive: true },
      take: 3
    });
    console.log(`\n3️⃣  Tour Packages: ${tourPackages.length} found`);
    tourPackages.forEach(p => console.log(`   - ${p.name} (slug: ${p.slug})`));

    // Test 4: Get Tour reviews for first package
    if (tourPackages.length > 0) {
      const firstTour = tourPackages[0];
      const tourReviews = await prisma.$queryRaw`
        SELECT * FROM tour_package_reviews
        WHERE package_id = ${firstTour.id}
        ORDER BY created_at DESC
        LIMIT 3
      `;

      console.log(`\n4️⃣  Reviews for "${firstTour.name}": ${tourReviews.length} found`);
      tourReviews.forEach(r => {
        console.log(`   ⭐ ${r.rating}/5 by ${r.user_name}`);
        console.log(`      "${r.comment.substring(0, 60)}..."`);
      });
    }

    console.log('\n═'.repeat(70));
    console.log('\n✅ API Test Complete!\n');
    console.log('📍 Backend API should be accessible at: http://localhost:5000/api/v1');
    console.log('\n🔗 Test these endpoints in your browser or Postman:');
    console.log(`   - GET http://localhost:5000/api/v1/cinetrip-packages`);
    console.log(`   - GET http://localhost:5000/api/v1/cinetrip-packages/${cineTripPackages[0]?.slug}/reviews`);
    console.log(`   - GET http://localhost:5000/api/v1/tour-packages`);
    console.log(`   - GET http://localhost:5000/api/v1/tour-packages/${tourPackages[0]?.slug}/reviews`);
    console.log('');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
  }
}

testReviewAPI();
