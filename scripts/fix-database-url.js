/**
 * Script to fix DATABASE_URL in .env.local
 * Changes postgres:// to postgresql:// if needed
 * Run: node scripts/fix-database-url.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

console.log('🔧 Fixing DATABASE_URL in .env.local...\n');

// Check if .env.local exists
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  console.log('\n📝 Creating .env.local file...');
  console.log('   Please add your DATABASE_URL from Vercel Dashboard');
  console.log('   Format: DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"');
  process.exit(1);
}

// Read .env.local
let envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
let changed = false;

// Find and fix DATABASE_URL
const updatedLines = lines.map((line, index) => {
  if (line.trim().startsWith('DATABASE_URL=')) {
    const match = line.match(/DATABASE_URL=(.+)/);
    if (match) {
      let url = match[1].trim();
      
      // Remove quotes if present
      if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
        url = url.slice(1, -1);
      }
      
      // Check if it needs fixing
      if (url.startsWith('postgres://') && !url.startsWith('postgresql://')) {
        console.log(`📝 Found DATABASE_URL with "postgres://" protocol`);
        console.log(`   Changing to "postgresql://"...`);
        url = url.replace(/^postgres:\/\//, 'postgresql://');
        changed = true;
      }
      
      // Validate format
      if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
        console.error(`❌ Invalid DATABASE_URL format on line ${index + 1}`);
        console.error(`   Current: ${line.substring(0, 50)}...`);
        console.error(`   Must start with "postgresql://" or "postgres://"`);
        return line; // Don't change invalid URLs
      }
      
      // Return fixed line (with quotes)
      return `DATABASE_URL="${url}"`;
    }
  }
  return line;
});

if (changed) {
  // Write back to file
  fs.writeFileSync(envPath, updatedLines.join('\n'), 'utf8');
  console.log('✅ Fixed DATABASE_URL in .env.local');
  console.log('\n📝 Next steps:');
  console.log('   1. Regenerate Prisma Client: npx prisma generate');
  console.log('   2. Run Prisma Studio: npx prisma studio');
} else {
  console.log('✅ DATABASE_URL is already correct (starts with postgresql://)');
  console.log('\n📝 If you still get errors, try:');
  console.log('   1. npx prisma generate');
  console.log('   2. npx prisma studio');
}

// Show current DATABASE_URL (first 30 chars only for security)
const currentUrl = updatedLines.find(line => line.trim().startsWith('DATABASE_URL='));
if (currentUrl) {
  const urlMatch = currentUrl.match(/DATABASE_URL="(.+)"/);
  if (urlMatch) {
    const url = urlMatch[1];
    console.log(`\n📊 Current DATABASE_URL: ${url.substring(0, 30)}...`);
    console.log(`   Protocol: ${url.startsWith('postgresql://') ? 'postgresql:// ✅' : 'postgres:// ⚠️'}`);
  }
}

