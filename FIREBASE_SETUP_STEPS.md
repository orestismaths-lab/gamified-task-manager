# 🔥 Firebase Setup - Step by Step Guide

## 📋 Βήμα 1: Δημιουργία Firebase Project

1. **Πήγαινε στο:** https://console.firebase.google.com
2. **Κάνε Sign in** με Google account σου
3. **Κάνε "Add project"** (ή "Create a project")
4. **Project name:** `gamified-task-manager` (ή ό,τι θέλεις)
5. **Google Analytics:** Μπορείς να το αφήσεις enabled ή disabled (optional)
6. **Κάνε "Create project"**
7. **Περίμενε** να ολοκληρωθεί η δημιουργία (~30 δευτερόλεπτα)
8. **Κάνε "Continue"**

---

## 📋 Βήμα 2: Enable Authentication

1. **Στο Firebase Console**, στο αριστερό menu:
   - Κάνε click στο **"Authentication"**
2. **Κάνε "Get started"**
3. **Στο tab "Sign-in method":**
   - **Email/Password:**
     - Κάνε click
     - Enable το **"Email/Password"** (toggle ON)
     - Κάνε "Save"
   - **Google:**
     - Κάνε click
     - Enable το **"Google"** (toggle ON)
     - Επίλεξε Support email (το email σου)
     - Κάνε "Save"

---

## 📋 Βήμα 3: Enable Firestore Database

1. **Στο Firebase Console**, στο αριστερό menu:
   - Κάνε click στο **"Firestore Database"**
2. **Κάνε "Create database"**
3. **Security rules:**
   - Επίλεξε **"Start in test mode"** (για development)
   - ⚠️ **ΣΗΜΑΝΤΙΚΟ:** Θα το αλλάξουμε αργότερα!
4. **Location:**
   - Επίλεξε location (π.χ. `europe-west` ή `europe-west1`)
   - Κάνε "Enable"

---

## 📋 Βήμα 4: Get API Keys (Web App)

1. **Στο Firebase Console:**
   - Κάνε click στο **⚙️ (Settings)** → **"Project settings"**
2. **Scroll down** στο "Your apps" section
3. **Κάνε click στο Web icon** `</>` (ή "Add app" → Web)
4. **Register app:**
   - **App nickname:** `gamified-task-manager-web`
   - **Firebase Hosting:** Μπορείς να το skip (optional)
   - Κάνε **"Register app"**
5. **Copy το config object:**
   - Θα δεις κάτι σαν:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "gamified-task-manager.firebaseapp.com",
     projectId: "gamified-task-manager",
     storageBucket: "gamified-task-manager.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
   - **Copy όλο αυτό το object!**

---

## 📋 Βήμα 5: Update Project Files

**Στείλε μου το config object** και θα:
1. Update το `lib/firebase.ts` με τα σωστά credentials
2. Complete την υλοποίηση
3. Test ότι όλα δουλεύουν

---

## 📋 Βήμα 6: Security Rules (Μετά το Setup)

Αφού τελειώσουμε, θα ορίσουμε Firestore security rules για ασφάλεια.

---

## ✅ Checklist:

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password + Google)
- [ ] Firestore Database created (test mode)
- [ ] Web app registered
- [ ] Config object copied
- [ ] Config object sent to me για update

---

## 🎯 Next Steps (Μετά το Setup):

1. Θα update το `lib/firebase.ts`
2. Θα ενσωματώσω authentication στο app
3. Θα αντικαταστήσω localStorage με Firestore
4. Θα προσθέσω real-time sync
5. Θα test ότι όλα δουλεύουν

---

**Έτοιμος?** Ξεκίνα από το Βήμα 1 και στείλε μου το config object! 🚀

