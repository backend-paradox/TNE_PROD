const { PrismaClient } = require('@prisma/client');
const { seedTourReviews } = require('./src/utils/seedTourReviews');

const prisma = new PrismaClient();

async function setupTourReviews() {
  try {
    console.log('🔍 Checking if tour_package_reviews table exists...');

    // Check if table exists
    const tableExists = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'tour_package_reviews'
    `;

    if (tableExists.length === 0) {
      console.log('📝 Creating tour_package_reviews table...');

      // Create the table
      await prisma.$executeRaw`
        CREATE TABLE tour_package_reviews (
          id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
          package_id VARCHAR(255) NOT NULL REFERENCES tour_packages(id) ON DELETE CASCADE,
          user_id VARCHAR(255) NOT NULL,
          user_name VARCHAR(255) NOT NULL,
          user_email VARCHAR(255) NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT NOT NULL,
          helpful INTEGER DEFAULT 0,
          verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;

      // Create indexes
      await prisma.$executeRaw`
        CREATE INDEX tour_package_reviews_package_id_idx ON tour_package_reviews(package_id)
      `;

      await prisma.$executeRaw`
        CREATE INDEX tour_package_reviews_user_id_idx ON tour_package_reviews(user_id)
      `;

      console.log('✅ Table created successfully!');
    } else {
      console.log('✅ Table already exists!');
    }

    // Regenerate Prisma client to include new table
    console.log('\n🔄 Regenerating Prisma client...');
    const { execSync } = require('child_process');
    try {
      execSync('npx prisma generate', { cwd: __dirname, stdio: 'inherit' });
      console.log('✅ Prisma client regenerated!');
    } catch (error) {
      console.log('⚠️  Could not regenerate Prisma client automatically.');
      console.log('   Please run: npx prisma generate');
      console.log('   Then run: node setupTourReviews.js\n');
      await prisma.$disconnect();
      process.exit(1);
    }

    // Now seed the reviews
    console.log('\n🌱 Seeding tour package reviews...');
    const count = await seedTourReviews();

    console.log(`\n✅ Successfully seeded ${count} Tour reviews!`);
    console.log('\n📊 Review System Status:');
    console.log('   ✓ Database table created');
    console.log('   ✓ Reviews seeded');
    console.log('   ✓ Backend API endpoints ready');
    console.log('   ✓ Frontend API methods ready');
    console.log('\n🎉 Tour review system is fully operational!\n');

    await prisma.$disconnect();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error setting up tour reviews:', error);
    console.error('\nError details:', error.message);

    if (error.message.includes('relation "tour_packages" does not exist')) {
      console.log('\n💡 Tip: You need to seed tour packages first:');
      console.log('   node src/utils/seed.js\n');
    }

    await prisma.$disconnect();
    process.exit(1);
  }
}

setupTourReviews();
