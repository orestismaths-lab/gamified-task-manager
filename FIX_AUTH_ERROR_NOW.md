# 🔧 Fix auth/internal-error - Step by Step

## 🐛 Το Πρόβλημα

Βλέπεις: `Firebase: Error (auth/internal-error).`

Αυτό συνήθως σημαίνει:
1. ❌ Firebase API key not valid
2. ❌ Firestore Database not created
3. ❌ Security Rules not setup

---

## ✅ Solution: 3 Steps to Fix

### Step 1: Get Correct Firebase Config (2 minutes)

1. **Open:** https://console.firebase.google.com
2. **Select project:** `gamified-task-manager-3e2a4`
3. **Click:** ⚙️ (Settings) → **"Project settings"**
4. **Scroll down** to **"Your apps"** section
5. **If Web app exists:**
   - Click on it
   - Copy the config code
6. **If no Web app:**
   - Click **Web icon** `</>` (or "Add app" → Web)
   - App nickname: `gamified-task-manager-web`
   - Click "Register app"
   - Copy the config code

**You'll see something like:**
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

---

### Step 2: Update firebase.ts (1 minute)

1. **Open:** `task_manager/lib/firebase.ts`
2. **Find lines 9-17** (the `firebaseConfig` object)
3. **Replace `apiKey` and `appId`** with values from Step 1:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSy...", // ← PASTE YOUR API KEY HERE
  authDomain: "gamified-task-manager-3e2a4.firebaseapp.com",
  projectId: "gamified-task-manager-3e2a4",
  storageBucket: "gamified-task-manager-3e2a4.firebasestorage.app",
  messagingSenderId: "597365672090",
  appId: "1:597365672090:web:...", // ← PASTE YOUR APP ID HERE
  measurementId: "G-..." // ← Optional
};
```

4. **Save** (Ctrl + S)

---

### Step 3: Create Firestore Database (2 minutes)

1. **Firebase Console → Firestore Database** (left menu)
2. **If you see "Create database":**
   - Click "Create database"
   - Select **"Start in test mode"**
   - Choose location (e.g., `europe-west`)
   - Click "Enable"
3. **If database exists:**
   - Go to **Rules** tab
   - Copy rules from `FIRESTORE_SECURITY_RULES.md`
   - Click "Publish"

---

### Step 4: Restart Server (30 seconds)

1. **Stop server:** Press Ctrl + C in terminal
2. **Start again:**
   ```bash
   npm run dev
   ```
   Or double-click: `QUICK_START.bat`
3. **Refresh browser:** Press F5

---

## ✅ Verify It Works

After these steps:
1. **Refresh browser** (F5)
2. **Try to Register:**
   - Click "Sign Up"
   - Enter email, password, display name
   - Click "Sign Up"
3. **Expected:** No error, login successful!

---

## 🆘 Still Not Working?

### Check Browser Console:
1. Press **F12** (DevTools)
2. **Console tab**
3. Look for errors:
   - `auth/api-key-not-valid` → API key wrong (redo Step 2)
   - `Permission denied` → Firestore Rules issue (redo Step 3)
   - `Failed to fetch` → Firestore not created (redo Step 3)

### Common Issues:

**"API key not valid"**
- Make sure you copied the EXACT key from Firebase Console
- Check it starts with `AIzaSy`
- Restart server after update

**"Permission denied"**
- Firestore Database must be created
- Security Rules must be published
- Check `FIRESTORE_SECURITY_RULES.md`

**"Cannot connect"**
- Check internet connection
- Check Firebase Console → Project is active
- Clear browser cache (Ctrl + Shift + Delete)

---

## 📝 Quick Checklist

- [ ] Got config from Firebase Console (Step 1)
- [ ] Updated `lib/firebase.ts` (Step 2)
- [ ] Created Firestore Database (Step 3)
- [ ] Restarted server (Step 4)
- [ ] Refreshed browser
- [ ] Tried to register/login

---

## 🎯 Most Important

**The API key MUST be from Firebase Console → Project Settings → Your apps → Web app**

**Don't use the old key in the code!**

---

**Follow Steps 1-4 and the error will be fixed!** ✅

