# 🗄️ PostgreSQL Setup για Vercel

Η εφαρμογή χρησιμοποιεί **PostgreSQL** αντί για SQLite για να λειτουργεί σωστά στο Vercel.

## 📋 Βήματα Setup

### 1. Δημιουργία PostgreSQL Database

Έχεις 2 επιλογές:

#### Επιλογή A: Vercel Postgres (Συνιστάται) ⭐

1. **Πήγαινε στο Vercel Dashboard** → Project → **Storage** tab
2. Κάνε κλικ **Create Database** → Επίλεξε **Postgres**
3. Επίλεξε **Hobby** (δωρεάν tier)
4. Κάνε κλικ **Create**
5. Το Vercel θα δημιουργήσει αυτόματα το `DATABASE_URL` environment variable

#### Επιλογή B: Neon (Εξωτερικό PostgreSQL)

1. **Πήγαινε στο:** https://neon.tech
2. Κάνε **Sign Up** (δωρεάν)
3. **Create Project**
4. **Copy το Connection String** (θα είναι κάτι σαν: `postgresql://user:pass@host/db?sslmode=require`)
5. **Πήγαινε στο Vercel Dashboard** → Project → **Settings** → **Environment Variables**
6. Πρόσθεσε:
   - **Name:** `DATABASE_URL`
   - **Value:** το connection string που έκανες copy
   - **Environment:** Production, Preview, Development (επίλεξε όλα)

### 2. Εκτέλεση Migrations

Μετά το deployment, το Vercel θα εκτελέσει αυτόματα:
```bash
prisma generate && prisma migrate deploy && next build
```

Αν χρειαστεί να τρέξεις migrations manually:
```bash
cd task_manager
npx prisma migrate deploy
```

### 3. Verify Setup

1. **Redeploy** το project στο Vercel
2. **Test** το login/register
3. Αν δεις errors, δες τα **Vercel Logs** → Functions → `api/auth/login`

## 🔍 Troubleshooting

### "DATABASE_URL is not set"
- Βεβαιώσου ότι έχεις προσθέσει το `DATABASE_URL` στο Vercel Environment Variables
- Κάνε **Redeploy** μετά την προσθήκη

### "Connection refused" ή "Connection timeout"
- Βεβαιώσου ότι το connection string είναι σωστό
- Αν χρησιμοποιείς Neon, βεβαιώσου ότι το **IP Allowlist** επιτρέπει connections από Vercel

### "Relation does not exist"
- Τρέξε migrations: `npx prisma migrate deploy`
- Ή κάνε **Redeploy** στο Vercel (θα τρέξει migrations αυτόματα)

## 📚 Πηγές

- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Neon Docs](https://neon.tech/docs)
- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)

