const { execSync } = require('child_process');

console.log('Generating Prisma Client...');
console.log('Working directory:', __dirname);

try {
  execSync('npx prisma generate', {
    cwd: __dirname,
    stdio: 'inherit'
  });

  console.log('\n✅ Prisma Client generated successfully!');
} catch (error) {
  console.error('\n❌ Failed to generate Prisma Client:', error.message);
  process.exit(1);
}
