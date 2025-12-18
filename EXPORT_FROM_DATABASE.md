# Export από Database → Import σε LocalStorage

## Οδηγίες για Export & Import

### Βήμα 1: Ενεργοποίηση Database Mode

1. Άνοιξε το αρχείο: `lib/constants/index.ts`
2. Άλλαξε τη γραμμή 58:
   ```typescript
   export const USE_API = true;  // Αλλάξε από false σε true
   ```
3. Αποθήκευσε το αρχείο

### Βήμα 2: Export από Database

1. Τρέξε την εφαρμογή:
   ```bash
   npm run dev
   ```
   ή
   ```bash
   start_with_browser.bat
   ```

2. Άνοιξε το browser στο `http://localhost:3000`

3. Κάνε **Login** με το account σου

4. Πήγαινε στο **Data Management** (από το sidebar menu)

5. Πατήσε το button **"Export from Database"** (μοβ χρώμα)

6. Θα κατεβάσει ένα JSON file με όνομα: `task-manager-database-export-YYYY-MM-DD.json`

### Βήμα 3: Επιστροφή σε Local Mode

1. Άνοιξε το αρχείο: `lib/constants/index.ts`
2. Άλλαξε τη γραμμή 58:
   ```typescript
   export const USE_API = false;  // Επιστροφή σε false
   ```
3. Αποθήκευσε το αρχείο

### Βήμα 4: Import στο LocalStorage

1. **Κάνε refresh** την εφαρμογή (F5) - τώρα είναι σε local mode

2. Πήγαινε στο **Data Management**

3. Πατήσε **"Upload Backup File"**

4. Επίλεξε το JSON file που κατέβασες στο Βήμα 2

5. Περίμενε το success message και το automatic reload

6. **Έτοιμο!** Τα data σου είναι τώρα στο localStorage του browser

---

## Troubleshooting

### Αν το export δεν δουλεύει:
- Βεβαιώσου ότι είσαι logged in
- Άνοιξε το browser console (F12) και δες αν υπάρχουν errors
- Ελέγξε ότι το `USE_API = true` είναι σωστά set

### Αν το import δεν δουλεύει:
- Ελέγξε ότι το JSON file έχει το σωστό format (πρέπει να έχει `tasks` και `members` arrays)
- Άνοιξε το browser console (F12) και δες τα logs που ξεκινούν με `[Import]`
- Βεβαιώσου ότι το `USE_API = false` είναι set πριν το import

### Αν τα data δεν φαίνονται μετά το import:
- Κάνε hard refresh (Ctrl+Shift+R ή Ctrl+F5)
- Ελέγξε στο browser DevTools → Application → Local Storage → `gamified-task-manager-tasks`

---

## Σημειώσεις

- Το export από database παίρνει **μόνο τα tasks που έχεις δημιουργήσει ή έχουν assign σε εσένα**
- Όλοι οι users (members) εξάγονται για να μην χάσεις assignments
- Μετά το import, τα data είναι **local στον browser** - δεν χρειάζεται database
- Κάνε regular backups για να μην χάσεις data!

