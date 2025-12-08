/**
 * Script to check and validate DATABASE_URL format
 * Run: node scripts/check-database-url.js
 */

require('dotenv').config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

console.log('🔍 Checking DATABASE_URL...\n');

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not set in .env.local');
  console.log('\n📝 To fix this:');
  console.log('1. Go to Vercel Dashboard → Project → Settings → Environment Variables');
  console.log('2. Copy the DATABASE_URL value');
  console.log('3. Add it to your .env.local file:');
  console.log('   DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"');
  process.exit(1);
}

console.log('✅ DATABASE_URL is set');
console.log(`   Value: ${databaseUrl.substring(0, 20)}...`);

// Check format
const isValidFormat = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://');

if (!isValidFormat) {
  console.error('\n❌ DATABASE_URL has invalid format!');
  console.error('   It must start with "postgresql://" or "postgres://"');
  console.log('\n📝 Current format:', databaseUrl.substring(0, 30) + '...');
  console.log('\n✅ Correct format examples:');
  console.log('   postgresql://user:password@host:5432/database?sslmode=require');
  console.log('   postgres://user:password@host:5432/database?sslmode=require');
  console.log('\n💡 To fix:');
  console.log('1. Get your DATABASE_URL from Vercel Dashboard');
  console.log('2. Make sure it starts with "postgresql://" or "postgres://"');
  console.log('3. Update .env.local file');
  process.exit(1);
}

// Warn if using postgres:// instead of postgresql://
if (databaseUrl.startsWith('postgres://')) {
  console.log('\n⚠️  WARNING: Using "postgres://" protocol');
  console.log('   Prisma Studio may prefer "postgresql://"');
  console.log('   If you get errors, try changing "postgres://" to "postgresql://" in .env.local');
}

console.log('✅ DATABASE_URL format is valid!');
console.log('\n📊 Connection details:');
try {
  const url = new URL(databaseUrl);
  console.log(`   Protocol: ${url.protocol}`);
  console.log(`   Host: ${url.hostname}`);
  console.log(`   Port: ${url.port || '5432 (default)'}`);
  console.log(`   Database: ${url.pathname.substring(1)}`);
  console.log(`   User: ${url.username || 'not specified'}`);
} catch (e) {
  console.log('   (Could not parse URL details)');
}

console.log('\n✅ All checks passed! You can now run:');
console.log('   npx prisma studio');

