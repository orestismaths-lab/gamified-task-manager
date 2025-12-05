# 🔧 Fix Migration Issues

## Problem 1: Missing Tables

Το migration endpoint αποτυγχάνει με error:
```
The table `public.TaskAssignment` does not exist in the current database.
```

**Solution:** Δημιούργησε τα missing tables πρώτα.

### Option 1: Via API Endpoint (Recommended)

```powershell
Invoke-WebRequest -Uri "https://gamified-task-manager-omega.vercel.app/api/create-missing-tables" -Method POST -Headers @{"Authorization"="Bearer migration-secret-2025"; "Content-Type"="application/json"}
```

### Option 2: Manual SQL

Τρέξε αυτό το SQL στη βάση:

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

## Problem 2: No Matching Member

Το migration λέει:
```
No matching member found for user orestismaths@gmail.com. Checked 13 members.
```

**Solution:** Το member matching πρέπει να είναι πιο flexible. Έλεγξε:
- Αν το email του user matches με το email του member
- Αν το userId matches
- Αν το name matches

Αν δεν βρει match, μπορείς να δημιουργήσεις ένα default member profile για τον user.

## Steps to Fix

1. **Create missing tables:**
   - Call `/api/create-missing-tables` endpoint
   - Ή run το SQL manual

2. **Retry migration:**
   - Call `/api/migrate-data` endpoint ξανά
   - Τα tasks θα πρέπει να import

3. **Fix member matching:**
   - Έλεγξε αν το email του user matches με κάποιο member
   - Αν όχι, δημιούργησε ένα default member profile

