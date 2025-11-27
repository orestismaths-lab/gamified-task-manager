# 🔑 How to Get Firebase Config - Step by Step

## 📋 Detailed Instructions

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com
2. Make sure you're logged in
3. Select project: **gamified-task-manager-3e2a4**

### Step 2: Open Project Settings
1. Click the **⚙️ (gear icon)** at the top left (next to "Project Overview")
2. Click **"Project settings"**

### Step 3: Find "Your apps" Section
1. Scroll down the page
2. Look for section: **"Your apps"**
3. You'll see a list of apps (iOS, Android, Web, etc.)

### Step 4: Check if Web App Exists
**Option A: Web App Already Exists**
- You'll see a Web app with icon `</>`
- Click on it
- You'll see the config code

**Option B: No Web App (Need to Create)**
1. Click the **Web icon** `</>` (or "Add app" → Web)
2. **App nickname:** `gamified-task-manager-web`
3. **Firebase Hosting:** (optional, can skip)
4. Click **"Register app"**
5. You'll see the config code

### Step 5: Copy the Config
You'll see something like this:

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

**Copy the ENTIRE config object!**

### Step 6: Update firebase.ts
1. Open: `task_manager/lib/firebase.ts`
2. Replace lines 9-17 with your new config:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSy...", // ← Paste your API key here
  authDomain: "gamified-task-manager-3e2a4.firebaseapp.com",
  projectId: "gamified-task-manager-3e2a4",
  storageBucket: "gamified-task-manager-3e2a4.firebasestorage.app",
  messagingSenderId: "597365672090",
  appId: "1:597365672090:web:...", // ← Paste your App ID here
  measurementId: "G-..." // ← Optional
};
```

3. **Save the file** (Ctrl + S)

### Step 7: Restart Server
1. **Stop the server:**
   - Go to terminal where `npm run dev` is running
   - Press **Ctrl + C**

2. **Start again:**
   ```bash
   cd task_manager
   npm run dev
   ```

3. **Refresh browser:**
   - Press **F5** or **Ctrl + R**
   - Or go to: http://localhost:3000 (or 3003 if that's what you're using)

---

## 🔍 Verify Config is Correct

### Check API Key:
- ✅ Starts with `AIzaSy`
- ✅ About 39 characters long
- ❌ If different → Wrong key

### Check Project ID:
- ✅ Should be: `gamified-task-manager-3e2a4`
- ❌ If different → Wrong project

### Check App ID:
- ✅ Should start with: `1:597365672090:web:`
- ❌ If different → Wrong app

---

## 🆘 Troubleshooting

### "I don't see 'Your apps' section"
- Make sure you're in **Project settings** (not General settings)
- Scroll down more
- Try refreshing the page

### "I see multiple Web apps"
- Use the one that matches your project
- Or create a new one if unsure

### "Config looks the same"
- The API key might be different even if other values are same
- Make sure you copy the **exact** values from Firebase Console

### "Still getting error after update"
1. **Clear browser cache:**
   - Ctrl + Shift + Delete
   - Clear "Cached images and files"
   - Refresh (F5)

2. **Hard refresh:**
   - Ctrl + Shift + R

3. **Check terminal:**
   - Make sure server restarted
   - No errors in terminal

---

## ✅ Quick Checklist

- [ ] Opened Firebase Console
- [ ] Went to Project Settings
- [ ] Found/Created Web app
- [ ] Copied config
- [ ] Updated `lib/firebase.ts`
- [ ] Saved file
- [ ] Restarted server
- [ ] Cleared browser cache
- [ ] Refreshed browser

---

## 📝 Important Notes

1. **API Key is unique** - Each Web app has its own API key
2. **Don't share API keys** - Keep them private
3. **Restart required** - Changes need server restart
4. **Cache matters** - Clear browser cache if still not working

---

**Get the config from Firebase Console and update `lib/firebase.ts`!** 🔑

