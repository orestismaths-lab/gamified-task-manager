# GitHub Push - Οδηγίες

## ✅ Έχω προετοιμάσει όλα τα scripts!

**Repository URL:** https://github.com/orestismaths-lab/gamified-task-manager

## 🚀 Γρήγορη Εκτέλεση

### Επιλογή 1: Batch File (Πιο Απλό)
Double-click στο: `DO_PUSH.bat`

### Επιλογή 2: PowerShell Script
```powershell
cd task_manager
powershell -ExecutionPolicy Bypass -File push.ps1
```

### Επιλογή 3: Execute Script (με logging)
```powershell
cd task_manager
powershell -ExecutionPolicy Bypass -File execute_push.ps1
```

## 📋 Manual Commands (αν τα scripts δεν δουλεύουν)

```bash
cd task_manager

# 1. Initialize git
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit: Gamified Task Manager"

# 4. Add remote
git remote add origin https://github.com/orestismaths-lab/gamified-task-manager.git

# 5. Set branch
git branch -M main

# 6. Push
git push -u origin main
```

## 🔐 Authentication

Αν ζητηθεί authentication:
- **Username:** `orestismaths-lab`
- **Password:** Χρησιμοποίησε **Personal Access Token** (όχι password)

### Δημιουργία Personal Access Token:
1. Πήγαινε στο: https://github.com/settings/tokens
2. Κάνε "Generate new token (classic)"
3. Δώσε όνομα (π.χ. "Task Manager Push")
4. Επίλεξε scope: `repo` (full control)
5. Κάνε "Generate token"
6. Αντιγράψε το token (θα το δεις μόνο μια φορά!)
7. Χρησιμοποίησε το token ως password

## ✅ Έλεγχος

Μετά το push, ελέγξε στο:
https://github.com/orestismaths-lab/gamified-task-manager

## 📝 Files που δημιουργήθηκαν:

- `DO_PUSH.bat` - Batch script για push
- `push.ps1` - PowerShell script με detailed output
- `push_to_github.bat` - Alternative batch script
- `execute_push.ps1` - Script με logging σε file
- `PUSH_INSTRUCTIONS.md` - Αυτό το αρχείο

## ❓ Troubleshooting

**"Repository not found"**
- Βεβαιώσου ότι το repository υπάρχει στο GitHub
- Ελέγξε το URL: https://github.com/orestismaths-lab/gamified-task-manager

**"Authentication failed"**
- Χρησιμοποίησε Personal Access Token αντί για password
- Βεβαιώσου ότι το token έχει `repo` scope

**"Permission denied"**
- Ελέγξε ότι έχεις write access στο repository
- Ελέγξε ότι είσαι logged in με το σωστό GitHub account

