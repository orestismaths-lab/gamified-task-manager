# 🚀 Quick Setup Guide

## ✅ Automated Setup

### Option 1: Full Automated Setup (Recommended)
Double-click: **`SETUP_AND_TEST.bat`**

Αυτό θα:
- ✅ Check Node.js
- ✅ Install dependencies
- ✅ Check Firebase config
- ✅ Start development server

---

### Option 2: Check Setup First
Double-click: **`CHECK_SETUP.bat`**

Αυτό θα ελέγξει:
- Node.js installation
- npm installation
- Dependencies
- Firebase config
- Git setup

---

### Option 3: Quick Start (If Already Setup)
Double-click: **`QUICK_START.bat`**

Αυτό θα:
- Start development server
- Open http://localhost:3000

---

## 📋 Manual Setup (If Needed)

### 1. Install Dependencies
```bash
cd task_manager
npm install
```

### 2. Update Firebase Config
1. Open: `lib/firebase.ts`
2. Get config from Firebase Console
3. Update API key and App ID

### 3. Setup Firestore
1. Firebase Console → Firestore Database
2. Create database (if not exists)
3. Setup Security Rules (see `FIRESTORE_SECURITY_RULES.md`)

### 4. Start Server
```bash
npm run dev
```

---

## 🔍 Troubleshooting

### "Node.js not found"
- Install Node.js from: https://nodejs.org
- Restart terminal after installation

### "npm install failed"
- Check internet connection
- Try: `npm install --legacy-peer-deps`

### "Firebase error"
- See `FIX_API_KEY.md` for API key issues
- See `FIREBASE_ERROR_FIX.md` for other errors

### "Port 3000 already in use"
- Stop other applications using port 3000
- Or change port in `package.json`

---

## ✅ Ready to Test

After setup:
1. Open: http://localhost:3000
2. Register/Login
3. Create tasks
4. Test multi-user features

---

**Use `SETUP_AND_TEST.bat` for easiest setup!** 🚀

