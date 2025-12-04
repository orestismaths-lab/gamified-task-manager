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

    // Check which tables exist first (needed for migration resolution)
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename IN ('User', 'Task', 'Subtask', 'TaskAssignment', 'MemberProfile', '_prisma_migrations')
      ORDER BY tablename
    `;

    const existingTables = tables.map(t => t.tablename);
    console.log(`📊 Found tables: ${existingTables.join(', ')}`);

    // First, resolve any failed migrations
    console.log('🔧 Checking for failed migrations...');
    try {
      const failedMigrations = await prisma.$queryRaw`
        SELECT migration_name, started_at 
        FROM "_prisma_migrations" 
        WHERE finished_at IS NULL AND rolled_back_at IS NULL
      `;

      if (failedMigrations.length > 0) {
        console.log(`⚠️  Found ${failedMigrations.length} failed migration(s), resolving...`);
        for (const migration of failedMigrations) {
          // Check if tables from this migration exist
          let shouldMarkAsApplied = false;
          
          if (migration.migration_name === '20251204000000_init_postgres') {
            // Check if User and Task tables exist (main tables from this migration)
            const userExists = existingTables.includes('User');
            const taskExists = existingTables.includes('Task');
            shouldMarkAsApplied = userExists && taskExists;
          } else if (migration.migration_name === '20251205000000_add_member_profile') {
            // Check if MemberProfile table exists
            shouldMarkAsApplied = existingTables.includes('MemberProfile');
          }
          
          if (shouldMarkAsApplied) {
            // Mark as applied if tables exist
            try {
              await prisma.$executeRaw`
                UPDATE "_prisma_migrations" 
                SET finished_at = NOW(), applied_steps_count = 1, rolled_back_at = NULL
                WHERE migration_name = ${migration.migration_name} 
                  AND finished_at IS NULL
              `;
              console.log(`✅ Marked ${migration.migration_name} as applied (tables exist)`);
            } catch (error) {
              console.log(`⚠️  Could not mark ${migration.migration_name} as applied:`, error.message);
              // Fallback: mark as rolled-back
              try {
                await prisma.$executeRaw`
                  UPDATE "_prisma_migrations" 
                  SET rolled_back_at = NOW() 
                  WHERE migration_name = ${migration.migration_name} 
                    AND finished_at IS NULL 
                    AND rolled_back_at IS NULL
                `;
                console.log(`✅ Marked ${migration.migration_name} as rolled-back`);
              } catch (e) {
                console.log(`⚠️  Could not resolve ${migration.migration_name}`);
              }
            }
          } else {
            // Mark as rolled-back if tables don't exist
            try {
              await prisma.$executeRaw`
                UPDATE "_prisma_migrations" 
                SET rolled_back_at = NOW() 
                WHERE migration_name = ${migration.migration_name} 
                  AND finished_at IS NULL 
                  AND rolled_back_at IS NULL
              `;
              console.log(`✅ Marked ${migration.migration_name} as rolled-back (tables missing)`);
            } catch (error) {
              console.log(`⚠️  Could not resolve ${migration.migration_name}:`, error.message);
            }
          }
        }
      }
    } catch (error) {
      console.log('⚠️  Could not check for failed migrations:', error.message);
    }

    // Check which tables exist (do this first to use in failed migration resolution)
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
      const missing = requiredTables.filter(t => !existingTables.includes(t));
      console.log(`⚠️  Missing tables: ${missing.join(', ')}`);
      
      // If we have User and Task but missing Subtask/TaskAssignment, 
      // the migration partially ran - mark it as applied and let it continue
      if (existingTables.includes('User') && existingTables.includes('Task')) {
        console.log('⚠️  Some tables exist but not all. This might be a partial migration.');
        console.log('⚠️  Will try to resolve failed migration and let Prisma handle the rest.');
        
        // Try to resolve the failed migration
        try {
          await prisma.$executeRaw`
            UPDATE "_prisma_migrations" 
            SET rolled_back_at = NOW() 
            WHERE migration_name = '20251204000000_init_postgres' 
              AND finished_at IS NULL 
              AND rolled_back_at IS NULL
          `;
          console.log('✅ Resolved failed migration 20251204000000_init_postgres');
        } catch (error) {
          console.log('⚠️  Could not resolve migration:', error.message);
        }
      }
      
      console.log('⚠️  Migrations will run normally to create missing tables.');
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

