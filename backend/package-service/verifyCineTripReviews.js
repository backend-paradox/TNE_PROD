const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyCineTripReviews() {
  try {
    // Count CineTrip reviews
    const cineTripCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM cinetrip_reviews`;
    console.log(`\n📊 CineTrip Reviews: ${cineTripCount[0].count}`);

    // Count Tour reviews
    const tourCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM tour_package_reviews`;
    console.log(`📊 Tour Reviews: ${tourCount[0].count}`);

    console.log(`📊 Total Reviews: ${Number(cineTripCount[0].count) + Number(tourCount[0].count)}\n`);

    // Get CineTrip packages with review counts
    const cineTripPackages = await prisma.$queryRaw`
      SELECT
        cp.name,
        COUNT(cr.id) as reviews,
        ROUND(AVG(cr.rating)::numeric, 1) as avg_rating
      FROM cinetrip_packages cp
      LEFT JOIN cinetrip_reviews cr ON cp.id = cr.package_id
      GROUP BY cp.name
      ORDER BY reviews DESC
    `;

    console.log('CineTrip Packages with Reviews:');
    console.log('═'.repeat(70));
    cineTripPackages.forEach((p, i) => {
      const reviewCount = Number(p.reviews);
      const avgRating = p.avg_rating || '0.0';
      console.log(`${(i + 1).toString().padStart(2)}. ${p.name.padEnd(35)} ${reviewCount} reviews, ${avgRating}⭐`);
    });
    console.log('═'.repeat(70));

    // Get 5-star reviews for testimonials
    const fiveStarReviews = await prisma.$queryRaw`
      SELECT cr.*, cp.name as package_name
      FROM cinetrip_reviews cr
      JOIN cinetrip_packages cp ON cr.package_id = cp.id
      WHERE cr.rating = 5
      ORDER BY cr.created_at DESC
      LIMIT 5
    `;

    console.log('\nSample 5-Star Reviews (for testimonials):');
    console.log('═'.repeat(70));
    fiveStarReviews.forEach((r, i) => {
      console.log(`${i + 1}. ${r.user_name} - ${r.package_name}`);
      console.log(`   "${r.comment.substring(0, 80)}..."`);
      console.log(`   Rating: ${'⭐'.repeat(r.rating)} | Verified: ${r.verified ? '✓' : '✗'}\n`);
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

verifyCineTripReviews();
