# Migration Guide - Πώς να τρέξεις migrations

## Προαπαιτούμενα

1. **MIGRATE_SECRET** environment variable στο Vercel:
   - Πήγαινε στο Vercel Dashboard → Project → Settings → Environment Variables
   - Πρόσθεσε `MIGRATE_SECRET` με μια τυχαία ασφαλή τιμή (π.χ. `openssl rand -hex 32`)

## Τρόποι να τρέξεις migrations

### Μέθοδος 1: Μέσω API Endpoint (Συνιστάται)

Μετά το deploy, κάνε POST request στο `/api/migrate` endpoint:

#### Με curl:
```bash
curl -X POST https://your-app.vercel.app/api/migrate \
  -H "Authorization: Bearer YOUR_MIGRATE_SECRET" \
  -H "Content-Type: application/json"
```

#### Με Postman ή Browser:
1. Άνοιξε το Postman ή browser developer tools
2. Κάνε POST request στο: `https://your-app.vercel.app/api/migrate`
3. Στο Headers, πρόσθεσε:
   - `Authorization: Bearer YOUR_MIGRATE_SECRET`
4. Ή στο Body (JSON):
   ```json
   {
     "secret": "YOUR_MIGRATE_SECRET"
   }
   ```

#### Με PowerShell:
```powershell
$secret = "YOUR_MIGRATE_SECRET"
$url = "https://your-app.vercel.app/api/migrate"
Invoke-RestMethod -Uri $url -Method Post -Headers @{"Authorization"="Bearer $secret"}
```

### Μέθοδος 2: Resolve Failed Migration (αν χρειάζεται)

Αν υπάρχει failed migration (π.χ. `20251203154938_init`), πρέπει πρώτα να το resolve:

1. **Mark as rolled back** (αν δεν θέλεις να το κρατήσεις):
   ```bash
   # Local (αν έχεις πρόσβαση)
   npx prisma migrate resolve --rolled-back 20251203154938_init
   ```

2. **Mark as applied** (αν ήδη υπάρχει στη βάση):
   ```bash
   npx prisma migrate resolve --applied 20251203154938_init
   ```

Στο Vercel, αυτό γίνεται αυτόματα μέσω του `/api/migrate` endpoint που προσπαθεί να resolve failed migrations πριν τρέξει νέα.

## Τι κάνει το `/api/migrate` endpoint

1. Ελέγχει το `MIGRATE_SECRET` για ασφάλεια
2. Προσπαθεί να resolve failed migrations (αν υπάρχουν)
3. Τρέχει `prisma migrate deploy` για να εφαρμόσει όλα τα pending migrations
4. Επιστρέφει success/error message

## Τρέχοντα Migrations

- `20251204000000_init_postgres` - Αρχικό PostgreSQL schema (User, Task, Subtask, TaskAssignment)
- `20251205000000_add_member_profile` - Προσθήκη MemberProfile table για XP/level

## Troubleshooting

### Error: "migrate found failed migrations"
Το `/api/migrate` endpoint προσπαθεί αυτόματα να resolve failed migrations. Αν δεν δουλεύει:
1. Έλεγξε τα logs στο Vercel
2. Μπορεί να χρειαστεί manual resolve μέσω Prisma Studio ή direct database access

### Error: "Unauthorized"
- Έλεγξε ότι το `MIGRATE_SECRET` στο Vercel matches με αυτό που στέλνεις
- Βεβαιώσου ότι το Authorization header είναι: `Bearer YOUR_SECRET`

### Error: "Table already exists"
Αν το table ήδη υπάρχει, το migration θα fail. Μπορείς να:
1. Skip το migration: `npx prisma migrate resolve --applied MIGRATION_NAME`
2. Ή να διαγράψεις το table και να τρέξεις το migration ξανά

## Σημείωση

Το `/api/migrate` endpoint είναι **protected** για ασφάλεια. Μην το κάνεις public - χρησιμοποίησε πάντα το `MIGRATE_SECRET`.

