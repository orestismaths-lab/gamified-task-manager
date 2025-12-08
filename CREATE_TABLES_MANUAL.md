# 🔧 Create Missing Tables - Manual Solution

Αφού έχεις ξεπεράσει το όριο redeploys, εδώ είναι λύσεις που **ΔΕΝ** χρειάζονται deployment:

## Solution 1: Run Script Locally (Recommended)

1. **Get DATABASE_URL from Vercel:**
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Copy το `DATABASE_URL` value

2. **Create `.env.local` file** (αν δεν υπάρχει):
   ```
   DATABASE_URL=your_database_url_here
   ```

3. **Run the script:**
   ```powershell
   cd task_manager
   node scripts/create-missing-tables.js
   ```

Αυτό θα δημιουργήσει τα missing tables απευθείας στη βάση.

## Solution 2: Direct SQL (If you have database access)

Αν έχεις access στη βάση (μέσω Vercel Postgres dashboard ή external tool), τρέξε αυτό το SQL:

```sql
-- Create Subtask table
CREATE TABLE IF NOT EXISTS "Subtask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "taskId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Subtask_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Subtask_taskId_idx" ON "Subtask"("taskId");

ALTER TABLE "Subtask" 
DROP CONSTRAINT IF EXISTS "Subtask_taskId_fkey",
ADD CONSTRAINT "Subtask_taskId_fkey" 
FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create TaskAssignment table
CREATE TABLE IF NOT EXISTS "TaskAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TaskAssignment_userId_taskId_key" 
ON "TaskAssignment"("userId", "taskId");

CREATE INDEX IF NOT EXISTS "TaskAssignment_userId_idx" ON "TaskAssignment"("userId");
CREATE INDEX IF NOT EXISTS "TaskAssignment_taskId_idx" ON "TaskAssignment"("taskId");

ALTER TABLE "TaskAssignment" 
DROP CONSTRAINT IF EXISTS "TaskAssignment_userId_fkey",
ADD CONSTRAINT "TaskAssignment_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TaskAssignment" 
DROP CONSTRAINT IF EXISTS "TaskAssignment_taskId_fkey",
ADD CONSTRAINT "TaskAssignment_taskId_fkey" 
FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## Solution 3: Wait for Next Deployment

Το pre-build script έχει βελτιωθεί ώστε να δημιουργεί αυτόματα τα missing tables. Στο επόμενο deployment (όταν το όριο reset), θα τα δημιουργήσει αυτόματα.

## Verify

Μετά τη δημιουργία των tables, έλεγξε:

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('Subtask', 'TaskAssignment')
ORDER BY tablename;
```

Θα πρέπει να δεις και τα δύο tables.

## After Tables Are Created

Μετά τη δημιουργία των tables, μπορείς να:
1. Κάνεις migration των tasks από localStorage
2. Τα tasks θα import επιτυχώς

