# 🔧 Fix: Missing Database Tables

## Problem
The errors show that multiple tables are missing:
- **"The table `public.MemberProfile` does not exist"**
- **"The table `public.TaskAssignment` does not exist"**

This means **both migrations haven't run** on Vercel:
1. `20251204000000_init_postgres` - Creates User, Task, Subtask, TaskAssignment tables
2. `20251205000000_add_member_profile` - Creates MemberProfile table

## Solution

### Option 1: Run Migration via API Endpoint (Recommended)

1. **Set MIGRATE_SECRET in Vercel:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add: `MIGRATE_SECRET` = (any secure random string, e.g., use a password generator)
   - Save

2. **Call the migration endpoint:**
   ```bash
   curl -X POST https://gamified-task-manager-omega.vercel.app/api/migrate \
     -H "Authorization: Bearer YOUR_MIGRATE_SECRET" \
     -H "Content-Type: application/json"
   ```

   Or use Postman/Insomnia:
   - Method: POST
   - URL: `https://gamified-task-manager-omega.vercel.app/api/migrate`
   - Headers: `Authorization: Bearer YOUR_MIGRATE_SECRET`

3. **Check the response** - should show:
   ```json
   {
     "success": true,
     "message": "Migrations deployed successfully"
   }
   ```

### Option 2: Run Migration via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Link project
cd task_manager
vercel link

# Run migration
npx prisma migrate deploy
```

### Option 3: Manual SQL (Last Resort)

If the above don't work, you can run the SQL directly in your database. **Run them in order:**

#### Step 1: Initial Migration (Creates User, Task, Subtask, TaskAssignment)

```sql
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'todo',
    "dueDate" TIMESTAMP(3),
    "tags" TEXT NOT NULL DEFAULT '[]',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subtask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "taskId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Subtask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "TaskAssignment_userId_taskId_key" ON "TaskAssignment"("userId", "taskId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Subtask" ADD CONSTRAINT "Subtask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

#### Step 2: MemberProfile Migration

```sql
-- CreateTable
CREATE TABLE "MemberProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MemberProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemberProfile_userId_key" ON "MemberProfile"("userId");
CREATE INDEX "MemberProfile_userId_idx" ON "MemberProfile"("userId");

-- AddForeignKey
ALTER TABLE "MemberProfile" ADD CONSTRAINT "MemberProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

#### Step 3: Mark Migrations as Applied

After running the SQL, mark both migrations as applied:
```bash
npx prisma migrate resolve --applied 20251204000000_init_postgres
npx prisma migrate resolve --applied 20251205000000_add_member_profile
```

## Verify Fix

After running the migration, check:
1. `/api/health` - should still show healthy
2. `/api/members` - should return members without errors
3. `/api/tasks` - should return tasks without errors

## Prevention

The build script has been updated to run migrations during build. Future deployments should automatically run migrations.

