/**
 * Script to reset Prisma Client and fix common issues
 * Run: node scripts/reset-prisma.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Resetting Prisma Client...\n');

const prismaClientPath = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');

try {
  // Step 1: Check if Prisma Studio is running
  console.log('📋 Step 1: Checking for running Prisma processes...');
  try {
    const result = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', { encoding: 'utf8' });
    const nodeProcesses = result.split('\n').filter(line => line.includes('node.exe')).length - 1;
    if (nodeProcesses > 0) {
      console.log(`   ⚠️  Found ${nodeProcesses} Node.js process(es) running`);
      console.log('   💡 To kill them, run:');
      console.log('      Windows: scripts\\kill-prisma-processes.bat');
      console.log('      PowerShell: .\\scripts\\kill-prisma-processes.ps1');
      console.log('   Or manually close Prisma Studio and any other Node.js processes');
    }
  } catch (e) {
    // Ignore
  }

  // Step 2: Remove .prisma/client if it exists
  console.log('📋 Step 2: Cleaning Prisma Client cache...');
  if (fs.existsSync(prismaClientPath)) {
    try {
      fs.rmSync(prismaClientPath, { recursive: true, force: true });
      console.log('   ✅ Removed old Prisma Client');
    } catch (e) {
      console.log('   ⚠️  Could not remove Prisma Client (may be in use)');
      console.log('   💡 Please close Prisma Studio and try again');
    }
  } else {
    console.log('   ℹ️  No Prisma Client cache found');
  }

  // Step 3: Regenerate Prisma Client
  console.log('\n📋 Step 3: Regenerating Prisma Client...');
  try {
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('\n✅ Prisma Client regenerated successfully!');
  } catch (e) {
    console.error('\n❌ Failed to regenerate Prisma Client');
    console.error('   Error:', e.message);
    console.log('\n💡 Try:');
    console.log('   1. Close Prisma Studio if it\'s running');
    console.log('   2. Close any other processes using Prisma');
    console.log('   3. Run: npx prisma generate');
    process.exit(1);
  }

  // Step 4: Validate DATABASE_URL
  console.log('\n📋 Step 4: Validating DATABASE_URL...');
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('   ❌ DATABASE_URL is not set!');
    process.exit(1);
  }
  
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.error('   ❌ DATABASE_URL has invalid format!');
    console.error('   Must start with "postgresql://" or "postgres://"');
    process.exit(1);
  }
  
  console.log('   ✅ DATABASE_URL is valid');

  console.log('\n✅ All done! You can now run:');
  console.log('   npx prisma studio');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}

