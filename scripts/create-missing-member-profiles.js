/**
 * Script to create MemberProfile for users that don't have one
 * Run: node scripts/create-missing-member-profiles.js
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createMissingMemberProfiles() {
  try {
    console.log('🔍 Finding users without MemberProfile...\n');

    // Find all users
    const allUsers = await prisma.user.findMany({
      include: {
        memberProfile: true,
      },
    });

    console.log(`📊 Total users: ${allUsers.length}`);

    // Find users without MemberProfile
    const usersWithoutProfile = allUsers.filter(user => !user.memberProfile);

    if (usersWithoutProfile.length === 0) {
      console.log('✅ All users have MemberProfile!');
      return;
    }

    console.log(`⚠️  Found ${usersWithoutProfile.length} user(s) without MemberProfile:\n`);

    for (const user of usersWithoutProfile) {
      console.log(`   - ${user.email} (${user.name || 'No name'})`);
    }

    console.log('\n🔧 Creating MemberProfiles...\n');

    let created = 0;
    for (const user of usersWithoutProfile) {
      try {
        await prisma.memberProfile.create({
          data: {
            userId: user.id,
            xp: 0,
            level: 1,
          },
        });
        console.log(`   ✅ Created MemberProfile for ${user.email}`);
        created++;
      } catch (error) {
        console.error(`   ❌ Failed to create MemberProfile for ${user.email}:`, error.message);
      }
    }

    console.log(`\n✅ Created ${created} MemberProfile(s) out of ${usersWithoutProfile.length}`);

    // Verify
    const remaining = await prisma.user.findMany({
      where: {
        memberProfile: null,
      },
      select: {
        email: true,
      },
    });

    if (remaining.length > 0) {
      console.log(`\n⚠️  ${remaining.length} user(s) still without MemberProfile:`);
      remaining.forEach(u => console.log(`   - ${u.email}`));
    } else {
      console.log('\n✅ All users now have MemberProfile!');
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingMemberProfiles();

