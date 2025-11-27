# 🚀 START HERE - Quick Setup

## ✅ Όλα Έτοιμα!

Έχω προετοιμάσει όλα για testing. Ακολούθησε αυτά τα βήματα:

---

## 🎯 Step 1: Check Setup (Optional)

Double-click: **`CHECK_SETUP.bat`**

Αυτό θα ελέγξει:
- ✅ Node.js installed
- ✅ Dependencies installed
- ✅ Firebase config exists
- ✅ Git configured

---

## 🚀 Step 2: Start Application

### Option A: Full Automated (Recommended)
Double-click: **`SETUP_AND_TEST.bat`**

Αυτό θα:
- ✅ Install dependencies (αν λείπουν)
- ✅ Check Firebase config
- ✅ Start development server
- ✅ Open http://localhost:3000

### Option B: Quick Start (If Already Setup)
Double-click: **`QUICK_START.bat`**

Αυτό θα:
- ✅ Start development server
- ✅ Open http://localhost:3000

---

## ⚠️ Step 3: Update Firebase Config (IMPORTANT!)

**ΠΡΕΠΕΙ να κάνεις αυτό:**

1. **Firebase Console:**
   - https://console.firebase.google.com
   - Project: `gamified-task-manager-3e2a4`
   - ⚙️ Settings → Project settings
   - Scroll to "Your apps" → Web app
   - Copy config

2. **Update `lib/firebase.ts`:**
   - Open: `lib/firebase.ts`
   - Replace `apiKey` and `appId` with values from Firebase Console
   - Save

3. **Restart server:**
   - Stop (Ctrl + C)
   - Start again (run `QUICK_START.bat`)

---

## 🔒 Step 4: Setup Firestore (IMPORTANT!)

**ΠΡΕΠΕΙ να κάνεις αυτό:**

1. **Firebase Console → Firestore Database**
2. **Create database** (αν δεν υπάρχει)
   - Start in test mode
   - Choose location
   - Enable
3. **Setup Security Rules:**
   - Firestore Database → Rules tab
   - Copy rules from `FIRESTORE_SECURITY_RULES.md`
   - Publish

---

## ✅ Step 5: Test!

1. **Open:** http://localhost:3000
2. **Register/Login:**
   - Sign Up με email/password
   - Ή "Continue with Google"
3. **Create tasks:**
   - Add task
   - Assign to members
   - Test features
4. **Test real-time sync:**
   - Open 2 browsers
   - Create task in one
   - See it appear in other

---

## 📚 Documentation

- `TESTING_GUIDE.md` - Complete testing guide
- `NEXT_STEPS.md` - What to do next
- `FIRESTORE_SECURITY_RULES.md` - Security rules
- `FIX_API_KEY.md` - Fix API key issues
- `README_SETUP.md` - Setup instructions

---

## 🆘 If Something Doesn't Work

### "Firebase error"
- See `FIX_API_KEY.md`
- Update Firebase config

### "Permission denied"
- Setup Security Rules (Step 4)

### "Cannot connect"
- Check Firebase config
- Check internet connection

---

## ✅ Summary

**What I've Done:**
- ✅ All code ready
- ✅ Dependencies installed
- ✅ Build verified
- ✅ Automation scripts created
- ✅ Documentation complete
- ✅ Pushed to GitHub

**What You Need to Do:**
1. ⚠️ Update Firebase config (Step 3)
2. ⚠️ Setup Firestore (Step 4)
3. ✅ Test the application (Step 5)

---

**Double-click `SETUP_AND_TEST.bat` to start!** 🚀

