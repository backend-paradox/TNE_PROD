const { execSync } = require('child_process');
const path = require('path');

console.log('Starting Prisma migration...');
console.log('Current directory:', __dirname);

try {
  // Run the migration
  execSync('npx prisma migrate dev --name add_cinetrip_reviews', {
    cwd: __dirname,
    stdio: 'inherit'
  });

  console.log('\n✅ Migration completed successfully!');
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
}
