/**
 * Script to export all data from database to JSON file
 * This script connects directly to the database and exports all tasks and members
 * 
 * Usage: node scripts/export-from-database.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportFromDatabase() {
  try {
    console.log('🔄 Starting database export...\n');

    // Get all tasks
    console.log('📋 Fetching tasks...');
    const tasks = await prisma.task.findMany({
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        subtasks: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`   Found ${tasks.length} tasks`);

    // Get all users (members)
    console.log('👥 Fetching members...');
    const users = await prisma.user.findMany({
      orderBy: { email: 'asc' },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        memberProfile: {
          select: {
            xp: true,
            level: true,
          },
        },
      },
    });

    console.log(`   Found ${users.length} members\n`);

    // Transform tasks to frontend format
    console.log('🔄 Transforming tasks...');
    const transformedTasks = tasks.flatMap((task) => {
      try {
        if (!task.id || !task.title) {
          return [];
        }

        return [{
          id: task.id,
          title: task.title,
          description: task.description || undefined,
          ownerId: task.createdById,
          priority: task.priority || 'medium',
          status: task.status || 'todo',
          dueDate: task.dueDate ? task.dueDate.toISOString() : new Date().toISOString(),
          tags: (() => {
            try {
              return task.tags ? JSON.parse(task.tags) : [];
            } catch {
              return [];
            }
          })(),
          subtasks: (task.subtasks || []).map((st) => ({
            id: st.id,
            title: st.title || '',
            completed: st.completed || false,
            createdAt: st.createdAt.toISOString(),
            updatedAt: st.updatedAt.toISOString(),
          })),
          completed: task.completed || false,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
          assignedTo: (task.assignments || []).map((a) => a.userId).filter((id) => !!id),
          createdBy: task.createdById,
        }];
      } catch (mapError) {
        console.error(`   ⚠️  Error transforming task ${task.id}:`, mapError.message);
        return [];
      }
    });

    console.log(`   Transformed ${transformedTasks.length} tasks`);

    // Transform users to members format
    console.log('🔄 Transforming members...');
    const transformedMembers = users.flatMap((user) => {
      try {
        if (!user.id || !user.email) {
          return [];
        }

        return [{
          id: user.id,
          name: user.name || user.email.split('@')[0] || 'User',
          email: user.email,
          userId: user.id,
          avatar: user.avatar || undefined,
          xp: user.memberProfile?.xp ?? 0,
          level: user.memberProfile?.level ?? 1,
        }];
      } catch (mapError) {
        console.error(`   ⚠️  Error transforming user ${user.id}:`, mapError.message);
        return [];
      }
    });

    console.log(`   Transformed ${transformedMembers.length} members\n`);

    // Create export data
    const exportData = {
      tasks: transformedTasks,
      members: transformedMembers,
      selectedMemberId: null,
      exportDate: new Date().toISOString(),
      version: '1.0',
      exportedFrom: 'database',
      exportedBy: 'script',
    };

    // Save to file
    const filename = `task-manager-database-export-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(process.cwd(), filename);
    
    console.log(`💾 Saving to file: ${filename}`);
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2), 'utf8');

    console.log('\n✅ Export completed successfully!');
    console.log(`📁 File saved at: ${filepath}`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Tasks: ${transformedTasks.length}`);
    console.log(`   - Members: ${transformedMembers.length}`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Switch to local mode (USE_API = false)`);
    console.log(`   2. Import this file using the Data Management page`);
    console.log(`\n`);

  } catch (error) {
    console.error('\n❌ Export failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run export
exportFromDatabase();

