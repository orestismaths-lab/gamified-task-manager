// Script to run Prisma migrations manually
// Usage: node scripts/run-migration.js

const { execSync } = require('child_process');

console.log('🔄 Running Prisma migrations...');

try {
  // Generate Prisma Client
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Run migrations
  console.log('🚀 Deploying migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  console.log('✅ Migrations completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

