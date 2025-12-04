# 🚀 START HERE - Quick Setup (χωρίς Firebase)

Η εφαρμογή Task Manager χρησιμοποιεί **δικό της backend με Prisma + SQLite** και **email/password auth**. Δεν χρειάζεται Firebase, API keys ή Firestore rules.

---

## 🎯 Step 1: Check Setup (Optional)

Double‑click: **`CHECK_SETUP.bat`**

Αυτό θα ελέγξει:
- ✅ Node.js installed
- ✅ Dependencies installed

---

## 🚀 Step 2: Start Application

### Option A: Full Automated (Recommended)
Double‑click: **`SETUP_AND_TEST.bat`**

Αυτό θα:
- ✅ Τρέξει `npm install` (αν χρειάζεται)
- ✅ Ξεκινήσει τον development server
- ✅ Ανοίξει το `http://localhost:3000` στον browser

### Option B: Quick Start (If Already Setup)
Double‑click: **`QUICK_START.bat`**

Αυτό θα:
- ✅ Start development server
- ✅ Open `http://localhost:3000`

### Option C: Manual

```bash
cd task_manager
npm install
npm run dev
```
και άνοιξε `http://localhost:3000`.

---

## ✅ Step 3: Test the App

1. Άνοιξε `http://localhost:3000`
2. Κάνε **Register** με email/password
3. Κάνε **Login** με τα ίδια στοιχεία
4. Δοκίμασε:
   - Δημιουργία / επεξεργασία / διαγραφή tasks
   - Ανάθεση σε μέλη
   - Gamification (XP, levels, confetti)

Όλα τα δεδομένα αποθηκεύονται στη **δική σου SQLite βάση** μέσω Prisma.

---

## 📚 Documentation

- `README.md` – Γενική περιγραφή project
- `PROJECT_SUMMARY.md` – Τι έχει υλοποιηθεί
- `NEXT_STEPS.md` – Προτεινόμενα επόμενα βήματα (testing, deploy)
- `TESTING_GUIDE.md` – Αναλυτικός οδηγός testing
- `README_SETUP.md` – Extra οδηγίες setup για Windows

> Σημείωση: Ό,τι αρχείο αναφέρει Firebase είναι legacy και δεν χρειάζεται.

---

## 🆘 If Something Doesn't Work

- Έλεγξε ότι:
  - Έχεις **Node.js 18+**
  - Το `npm install` ολοκληρώθηκε χωρίς errors
  - Τρέχεις τις εντολές μέσα από τον φάκελο `task_manager`
- Αν δεις error στο terminal ή στον browser, κράτα το μήνυμα και στείλ’ το για βοήθεια.

---

**Προτεινόμενο:** τρέξε `SETUP_AND_TEST.bat` για να ξεκινήσεις γρήγορα. 🚀


