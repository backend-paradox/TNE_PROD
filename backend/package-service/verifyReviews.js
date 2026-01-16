const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyReviews() {
  try {
    // Count total reviews
    const totalCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM tour_package_reviews`;
    console.log(`\n✅ Total tour reviews: ${totalCount[0].count}\n`);

    // Get top packages by review count
    const topPackages = await prisma.$queryRaw`
      SELECT
        tp.name,
        COUNT(tpr.id) as reviews,
        ROUND(AVG(tpr.rating)::numeric, 1) as avg_rating
      FROM tour_packages tp
      LEFT JOIN tour_package_reviews tpr ON tp.id = tpr.package_id
      GROUP BY tp.name
      ORDER BY reviews DESC
      LIMIT 10
    `;

    console.log('Top 10 packages by review count:');
    console.log('═'.repeat(70));
    topPackages.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name.padEnd(40)} ${p.reviews} reviews, ${p.avg_rating}⭐`);
    });
    console.log('═'.repeat(70));

    // Rating distribution
    const ratingDist = await prisma.$queryRaw`
      SELECT rating, COUNT(*) as count
      FROM tour_package_reviews
      GROUP BY rating
      ORDER BY rating DESC
    `;

    console.log('\nRating Distribution:');
    ratingDist.forEach(r => {
      const count = Number(r.count);
      const bar = '█'.repeat(Math.floor(count / 5));
      console.log(`  ${'⭐'.repeat(r.rating)}: ${count} reviews ${bar}`);
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

verifyReviews();
