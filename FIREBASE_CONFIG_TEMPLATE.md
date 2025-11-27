# 🔥 Firebase Config - Template

## 📝 Πώς να βρεις το Config Object:

1. Firebase Console → ⚙️ Settings → Project settings
2. Scroll down → "Your apps" → Web app
3. Copy το config object

## 📋 Template (αν δεν το βρεις):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## ⚠️ ΣΗΜΑΝΤΙΚΟ:

**ΜΗΝ** commit-άρεις το config object στο GitHub με real credentials!
Θα δημιουργήσω `.env.local` file για security.

---

**Στείλε μου το config object και θα το setup σωστά!** 🔒

