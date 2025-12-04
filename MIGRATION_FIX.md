# 🔧 Fix: MemberProfile Table Missing

## Problem
The error shows: **"The table `public.MemberProfile` does not exist in the current database."**

This means the migration `20251205000000_add_member_profile` hasn't run on Vercel.

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

If the above don't work, you can run the SQL directly in your database:

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

-- CreateIndex
CREATE INDEX "MemberProfile_userId_idx" ON "MemberProfile"("userId");

-- AddForeignKey
ALTER TABLE "MemberProfile" ADD CONSTRAINT "MemberProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

Then mark the migration as applied:
```bash
npx prisma migrate resolve --applied 20251205000000_add_member_profile
```

## Verify Fix

After running the migration, check:
1. `/api/health` - should still show healthy
2. `/api/members` - should return members without errors
3. `/api/tasks` - should return tasks without errors

## Prevention

The build script has been updated to run migrations during build. Future deployments should automatically run migrations.

