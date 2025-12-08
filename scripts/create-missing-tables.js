/**
 * Standalone script to create missing tables (Subtask, TaskAssignment)
 * Can be run locally or via Node.js
 * 
 * Usage:
 *   node scripts/create-missing-tables.js
 * 
 * Requires DATABASE_URL environment variable
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createMissingTables() {
  try {
    console.log('🔍 Checking for missing tables...');

    // Check which tables exist
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename IN ('Subtask', 'TaskAssignment')
      ORDER BY tablename
    `;

    const existingTables = tables.map(t => t.tablename);
    console.log(`📊 Found tables: ${existingTables.join(', ') || 'none'}`);

    const missing = ['Subtask', 'TaskAssignment'].filter(t => !existingTables.includes(t));
    
    if (missing.length === 0) {
      console.log('✅ All tables exist!');
      return;
    }

    console.log(`⚠️  Missing tables: ${missing.join(', ')}`);
    console.log('🔧 Creating missing tables...');

    // Create Subtask table if missing
    if (missing.includes('Subtask')) {
      try {
        console.log('  Creating Subtask table...');
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Subtask" (
            "id" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "completed" BOOLEAN NOT NULL DEFAULT false,
            "taskId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Subtask_pkey" PRIMARY KEY ("id")
          )
        `;
        await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS "Subtask_taskId_idx" ON "Subtask"("taskId")
        `;
        await prisma.$executeRaw`
          ALTER TABLE "Subtask" 
          DROP CONSTRAINT IF EXISTS "Subtask_taskId_fkey",
          ADD CONSTRAINT "Subtask_taskId_fkey" 
          FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `;
        console.log('  ✅ Created Subtask table');
      } catch (error) {
        console.error('  ❌ Error creating Subtask table:', error.message);
      }
    }

    // Create TaskAssignment table if missing
    if (missing.includes('TaskAssignment')) {
      try {
        console.log('  Creating TaskAssignment table...');
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "TaskAssignment" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "taskId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
          )
        `;
        await prisma.$executeRaw`
          CREATE UNIQUE INDEX IF NOT EXISTS "TaskAssignment_userId_taskId_key" 
          ON "TaskAssignment"("userId", "taskId")
        `;
        await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS "TaskAssignment_userId_idx" ON "TaskAssignment"("userId")
        `;
        await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS "TaskAssignment_taskId_idx" ON "TaskAssignment"("taskId")
        `;
        await prisma.$executeRaw`
          ALTER TABLE "TaskAssignment" 
          DROP CONSTRAINT IF EXISTS "TaskAssignment_userId_fkey",
          ADD CONSTRAINT "TaskAssignment_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `;
        await prisma.$executeRaw`
          ALTER TABLE "TaskAssignment" 
          DROP CONSTRAINT IF EXISTS "TaskAssignment_taskId_fkey",
          ADD CONSTRAINT "TaskAssignment_taskId_fkey" 
          FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `;
        console.log('  ✅ Created TaskAssignment table');
      } catch (error) {
        console.error('  ❌ Error creating TaskAssignment table:', error.message);
      }
    }

    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingTables();

