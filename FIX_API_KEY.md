# 🔑 Fix: Invalid API Key Error

## 🐛 Το Πρόβλημα

**Error:** `Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)`

Αυτό σημαίνει ότι το API key στο `lib/firebase.ts` δεν είναι valid ή έχει αλλάξει.

---

## ✅ Solution: Get Correct API Key from Firebase Console

### Step 1: Firebase Console

1. **Πήγαινε στο:** https://console.firebase.google.com
2. **Επίλεξε project:** `gamified-task-manager-3e2a4`

### Step 2: Get Web App Config

1. **Κάνε click στο ⚙️ (Settings)** → **"Project settings"**
2. **Scroll down** στο section **"Your apps"**
3. **Αν δεν υπάρχει Web app:**
   - Κάνε click στο **Web icon** `</>` (ή "Add app" → Web)
   - **App nickname:** `gamified-task-manager-web`
   - Κάνε "Register app"
4. **Αν υπάρχει Web app:**
   - Κάνε click πάνω του

### Step 3: Copy Config

Θα δεις ένα config object που μοιάζει με αυτό:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "gamified-task-manager-3e2a4.firebaseapp.com",
  projectId: "gamified-task-manager-3e2a4",
  storageBucket: "gamified-task-manager-3e2a4.firebasestorage.app",
  messagingSenderId: "597365672090",
  appId: "1:597365672090:web:XXXXXXXXXXXXXXXXX",
  measurementId: "G-XXXXXXXXXX"
};
```

**Copy όλο το config object!**

---

### Step 4: Update firebase.ts

1. **Άνοιξε:** `task_manager/lib/firebase.ts`

2. **Replace το `firebaseConfig` με το config που πήρες:**

```typescript
const firebaseConfig = {
  apiKey: "AIzaSy...", // ← Νέο API key από Firebase Console
  authDomain: "gamified-task-manager-3e2a4.firebaseapp.com",
  projectId: "gamified-task-manager-3e2a4",
  storageBucket: "gamified-task-manager-3e2a4.firebasestorage.app",
  messagingSenderId: "597365672090",
  appId: "1:597365672090:web:...", // ← Νέο App ID
  measurementId: "G-..." // ← Optional
};
```

3. **Save το file**

---

### Step 5: Restart Development Server

1. **Stop το server** (Ctrl + C στο terminal)
2. **Start ξανά:**
   ```bash
   npm run dev
   ```
3. **Refresh το browser** (F5)

---

## 🔍 Verify API Key is Correct

### Check 1: API Key Format
- ✅ Should start with `AIzaSy`
- ✅ Should be ~39 characters long
- ❌ If different → Wrong key

### Check 2: Project ID Match
- ✅ `projectId` should match: `gamified-task-manager-3e2a4`
- ❌ If different → Wrong project

### Check 3: App ID Format
- ✅ Should start with `1:597365672090:web:`
- ❌ If different → Wrong app

---

## 🆘 Common Issues

### Issue 1: "Cannot find Web app"
**Solution:**
- Create new Web app από Firebase Console
- Copy the config

### Issue 2: "API key still not working"
**Solution:**
1. Verify API key restrictions στο Firebase Console:
   - Project Settings → General
   - Scroll to "API keys"
   - Check if restrictions are set
   - If yes, remove restrictions (for development)

### Issue 3: "Config looks correct but still error"
**Solution:**
1. Clear browser cache (Ctrl + Shift + Delete)
2. Hard refresh (Ctrl + Shift + R)
3. Restart dev server

---

## 📝 Quick Checklist

- [ ] Got config from Firebase Console
- [ ] Updated `lib/firebase.ts` with new config
- [ ] Saved the file
- [ ] Restarted dev server
- [ ] Cleared browser cache
- [ ] Refreshed browser

---

## 🎯 Most Important

**Το API key ΠΡΕΠΕΙ να είναι από το Firebase Console → Project Settings → Your apps → Web app**

**ΔΕΝ** χρησιμοποιείς το παλιό key που μπορεί να έχουμε στο code!

---

**Get the config from Firebase Console and update `lib/firebase.ts`!** 🔑

