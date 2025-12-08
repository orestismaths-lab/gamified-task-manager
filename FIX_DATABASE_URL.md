# 🔧 Fix DATABASE_URL Error in Prisma Studio

## ❌ Error Message
```
Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`.
```

## 🔍 Problem
Το `DATABASE_URL` στο `.env.local` δεν έχει το σωστό format. Πρέπει να ξεκινάει με `postgresql://` ή `postgres://`.

## ✅ Solution

### Quick Fix (Recommended)

Τρέξε αυτό το script που θα διορθώσει τα πάντα:
```bash
cd task_manager
node scripts/reset-prisma.js
```

Αυτό θα:
1. Κλείσει το Prisma Studio αν είναι ανοιχτό
2. Καθαρίσει το Prisma Client cache
3. Regenerate το Prisma Client
4. Επαληθεύσει το DATABASE_URL

### Manual Fix

### Step 1: Ελέγξε το DATABASE_URL

Τρέξε το script:
```bash
cd task_manager
node scripts/check-database-url.js
```

Αυτό θα σου πει αν το `DATABASE_URL` είναι σωστό.

### Step 2: Πάρε το DATABASE_URL από το Vercel

1. **Πήγαινε στο [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Επίλεξε το project σου**
3. **Πήγαινε στο:** Settings → **Environment Variables**
4. **Βρες το `DATABASE_URL`** (ή Storage → Postgres → Connection String)
5. **Copy το value**

### Step 3: Ενημέρωσε το `.env.local`

Άνοιξε το `task_manager/.env.local` και βεβαιώσου ότι το `DATABASE_URL` έχει αυτό το format:

```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

**Παράδειγμα:**
```env
DATABASE_URL="postgresql://default:password@ep-xxx-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
```

### Step 4: Επαλήθευση

Τρέξε ξανά:
```bash
node scripts/check-database-url.js
```

Θα πρέπει να δεις:
```
✅ DATABASE_URL is set
✅ DATABASE_URL format is valid!
```

### Step 5: Τρέξε το Prisma Studio

```bash
npx prisma studio
```

---

## 🚨 Common Issues

### Issue 1: DATABASE_URL is missing
**Solution:** Πρόσθεσε το `DATABASE_URL` στο `.env.local` από το Vercel Dashboard.

### Issue 2: Wrong format (starts with `http://` or `https://`)
**Solution:** Το `DATABASE_URL` πρέπει να ξεκινάει με `postgresql://` ή `postgres://`, όχι `http://`.

### Issue 3: Missing `?sslmode=require`
**Solution:** Πρόσθεσε `?sslmode=require` στο τέλος του connection string (για Vercel Postgres).

---

## 📝 Example `.env.local` File

```env
# Database
DATABASE_URL="postgresql://default:password@ep-xxx-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"

# Migration Secret (optional, for /api/migrate endpoint)
MIGRATE_SECRET="your-secret-key-here"
```

---

## ✅ After Fixing

Μετά τη διόρθωση, μπορείς να:
- ✅ Τρέξεις `npx prisma studio`
- ✅ Τρέξεις `npx prisma migrate dev`
- ✅ Χρησιμοποιήσεις το Prisma Client

---

## 🔗 Useful Links

- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Connection Strings](https://www.prisma.io/docs/concepts/database-connectors/postgresql#connection-details)

