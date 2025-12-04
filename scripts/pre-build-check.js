/**
 * Pre-build Migration Check Script
 * Checks if tables exist and marks migrations as applied if they do
 * This prevents "table already exists" errors during build
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndMarkMigrations() {
  try {
    console.log('🔍 Checking if tables exist...');

    // Check which tables exist
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename IN ('User', 'Task', 'Subtask', 'TaskAssignment', 'MemberProfile', '_prisma_migrations')
      ORDER BY tablename
    `;

    const existingTables = tables.map(t => t.tablename);
    console.log(`📊 Found tables: ${existingTables.join(', ')}`);

    const requiredTables = ['User', 'Task', 'Subtask', 'TaskAssignment'];
    const allRequiredExist = requiredTables.every(table => existingTables.includes(table));
    const memberProfileExists = existingTables.includes('MemberProfile');

    if (!allRequiredExist) {
      console.log('⚠️  Not all required tables exist. Migrations will run normally.');
      return;
    }

    console.log('✅ All required tables exist. Checking migration status...');

    // Mark init_postgres as applied if all base tables exist
    if (allRequiredExist) {
      const initMigration = await prisma.$queryRaw`
        SELECT migration_name, finished_at 
        FROM "_prisma_migrations" 
        WHERE migration_name = '20251204000000_init_postgres'
      `;
      
      if (initMigration.length === 0 || !initMigration[0].finished_at) {
        await prisma.$executeRaw`
          INSERT INTO "_prisma_migrations" (migration_name, checksum, finished_at, started_at, applied_steps_count)
          VALUES ('20251204000000_init_postgres', '', NOW(), NOW(), 1)
          ON CONFLICT (migration_name) 
          DO UPDATE SET finished_at = NOW(), applied_steps_count = 1
        `;
        console.log('✅ Marked 20251204000000_init_postgres as applied');
      } else {
        console.log('ℹ️  20251204000000_init_postgres already marked as applied');
      }
    }

    // Mark member_profile as applied if MemberProfile table exists
    if (memberProfileExists) {
      const memberMigration = await prisma.$queryRaw`
        SELECT migration_name, finished_at 
        FROM "_prisma_migrations" 
        WHERE migration_name = '20251205000000_add_member_profile'
      `;
      
      if (memberMigration.length === 0 || !memberMigration[0].finished_at) {
        await prisma.$executeRaw`
          INSERT INTO "_prisma_migrations" (migration_name, checksum, finished_at, started_at, applied_steps_count)
          VALUES ('20251205000000_add_member_profile', '', NOW(), NOW(), 1)
          ON CONFLICT (migration_name) 
          DO UPDATE SET finished_at = NOW(), applied_steps_count = 1
        `;
        console.log('✅ Marked 20251205000000_add_member_profile as applied');
      } else {
        console.log('ℹ️  20251205000000_add_member_profile already marked as applied');
      }
    }

    console.log('✅ Migration check completed successfully');
  } catch (error) {
    console.error('❌ Error checking migrations:', error);
    // Don't fail the build - let migrations run normally
    console.log('⚠️  Continuing with normal migration process...');
  } finally {
    await prisma.$disconnect();
  }
}

checkAndMarkMigrations();

