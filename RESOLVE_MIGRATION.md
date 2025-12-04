# 🔧 Resolve Failed Migration

## Problem
Το build αποτυγχάνει με error:
```
Error: P3009
migrate found failed migrations in the target database
The `20251203154938_init` migration started at 2025-12-04 17:01:06.138699 UTC failed
```

## Solution

### Option 1: Resolve via API Endpoint (Recommended)

1. **Set MIGRATE_SECRET in Vercel** (αν δεν το έχεις ήδη):
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Add: `MIGRATE_SECRET` = (τυχαίο string)
   - Save

2. **Resolve failed migrations:**
   ```powershell
   Invoke-WebRequest -Uri "https://gamified-task-manager-omega.vercel.app/api/migrate-resolve" -Method POST -Headers @{"Authorization"="Bearer YOUR_MIGRATE_SECRET"; "Content-Type"="application/json"}
   ```

3. **Run migrations:**
   ```powershell
   Invoke-WebRequest -Uri "https://gamified-task-manager-omega.vercel.app/api/migrate" -Method POST -Headers @{"Authorization"="Bearer YOUR_MIGRATE_SECRET"; "Content-Type"="application/json"}
   ```

### Option 2: Manual SQL (Direct Fix)

Αν το API endpoint δεν δουλεύει, τρέξε αυτό το SQL απευθείας στη βάση:

```sql
-- Mark failed migration as rolled-back
UPDATE "_prisma_migrations" 
SET rolled_back_at = NOW() 
WHERE migration_name = '20251203154938_init' 
  AND finished_at IS NULL 
  AND rolled_back_at IS NULL;
```

Μετά, το build θα πρέπει να περάσει.

### Option 3: Delete Failed Migration (Last Resort)

Αν τίποτα δεν δουλεύει, μπορείς να διαγράψεις το failed migration:

```sql
-- Delete failed migration record
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20251203154938_init' 
  AND finished_at IS NULL;
```

**⚠️ Warning:** Αυτό θα διαγράψει το migration record. Χρησιμοποίησε το μόνο αν είσαι σίγουρος ότι το migration δεν έχει δημιουργήσει tables.

## Verify

Μετά το resolve, το build θα πρέπει να περάσει. Έλεγξε:
- Build logs στο Vercel
- `/api/health` endpoint
- `/api/members` και `/api/tasks` endpoints

