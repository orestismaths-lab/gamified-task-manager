# 🔧 Fix Google Authentication Issues

## 🐛 Common Google Auth Problems

### Problem 1: "Popup blocked" or "Popup closed"
### Problem 2: "OAuth consent screen" error
### Problem 3: "Invalid client" error
### Problem 4: Nothing happens when clicking "Continue with Google"

---

## ✅ Solution: Configure Google OAuth in Firebase

### Step 1: Enable Google Sign-In in Firebase Console

1. **Firebase Console:**
   - https://console.firebase.google.com
   - Project: `gamified-task-manager-3e2a4`

2. **Authentication → Sign-in method**

3. **Google provider:**
   - Κάνε click στο **"Google"**
   - **Enable** (toggle ON)
   - **Project support email:** Επίλεξε το email σου
   - **Save**

---

### Step 2: Configure OAuth Consent Screen (Google Cloud Console)

1. **Google Cloud Console:**
   - https://console.cloud.google.com
   - Επίλεξε project: `gamified-task-manager-3e2a4`

2. **APIs & Services → OAuth consent screen**

3. **User Type:**
   - Επίλεξε **"External"** (για development)
   - Κάνε "Create"

4. **App information:**
   - **App name:** `Gamified Task Manager`
   - **User support email:** Το email σου
   - **Developer contact:** Το email σου
   - Κάνε "Save and Continue"

5. **Scopes:**
   - Κάνε "Save and Continue" (default scopes are OK)

6. **Test users:**
   - **Add users:** Πρόσθεσε το email σου
   - Κάνε "Save and Continue"

7. **Summary:**
   - Κάνε "Back to Dashboard"

---

### Step 3: Add Authorized Domains

1. **OAuth consent screen → Authorized domains**

2. **Add domains:**
   - `localhost` (για local development)
   - `firebaseapp.com` (για Firebase hosting)
   - Αν deploy, πρόσθεσε το domain σου

---

### Step 4: Enable Google+ API (if needed)

1. **Google Cloud Console → APIs & Services → Library**

2. **Search:** "Google+ API"

3. **Enable** (αν δεν είναι enabled)

---

### Step 5: Check API Credentials

1. **APIs & Services → Credentials**

2. **OAuth 2.0 Client IDs:**
   - Βεβαιώσου ότι υπάρχει Web client
   - Αν λείπει, δημιούργησε:
     - Application type: **Web application**
     - Name: `gamified-task-manager-web`
     - Authorized JavaScript origins:
       - `http://localhost:3000`
       - `http://localhost:3003` (αν χρησιμοποιείς αυτό)
     - Authorized redirect URIs:
       - `http://localhost:3000` (για local)
       - Firebase auth domain (αυτόματα)

---

## 🔍 Troubleshooting

### Issue: "Popup blocked"
**Solution:**
- Allow popups για localhost
- Try different browser
- Check browser console για errors

### Issue: "OAuth consent screen" error
**Solution:**
- Complete OAuth consent screen setup (Step 2)
- Add test users
- Wait a few minutes for changes to propagate

### Issue: "Invalid client" error
**Solution:**
- Check OAuth client ID στο Firebase Console
- Verify authorized domains include `localhost`
- Check redirect URIs

### Issue: Nothing happens
**Solution:**
1. Check browser console (F12) για errors
2. Verify Google provider is enabled στο Firebase
3. Check network tab για failed requests
4. Try clearing browser cache

---

## ✅ Quick Checklist

- [ ] Google Sign-in enabled στο Firebase Console
- [ ] OAuth consent screen configured
- [ ] Test users added
- [ ] Authorized domains include `localhost`
- [ ] OAuth client ID exists
- [ ] Browser allows popups

---

## 🎯 Most Common Fix

**90% των cases:** OAuth consent screen not configured

**Steps:**
1. Google Cloud Console → OAuth consent screen
2. Complete setup (User Type, App info, Test users)
3. Add test users
4. Wait 5-10 minutes
5. Try again

---

## 🆘 Still Not Working?

**Check:**
1. Browser console errors (F12)
2. Network tab για failed requests
3. Firebase Console → Authentication → Sign-in method → Google (enabled?)
4. Google Cloud Console → OAuth consent screen (configured?)

**Send me:**
- Browser console errors
- Screenshot από OAuth consent screen
- Firebase Console → Authentication → Sign-in method screenshot

---

**Follow Steps 1-5 and Google auth will work!** ✅

