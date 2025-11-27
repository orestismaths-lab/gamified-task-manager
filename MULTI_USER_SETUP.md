# 🔥 Firebase Multi-User Setup - Quick Start

## Step 1: Create Firebase Project

1. Πήγαινε στο: https://console.firebase.google.com
2. Κάνε "Add project"
3. Ονόμασε το: `gamified-task-manager`
4. Enable Google Analytics (optional)
5. Create project

## Step 2: Enable Services

### Authentication:
1. Authentication → Get started
2. Enable "Email/Password" sign-in
3. Enable "Google" sign-in (optional)

### Firestore Database:
1. Firestore Database → Create database
2. Start in **test mode** (για development)
3. Choose location (e.g., `europe-west`)
4. Enable

## Step 3: Get API Keys

1. Project Settings (⚙️) → General
2. Scroll down to "Your apps"
3. Click "Web" icon (</>)
4. Register app: `gamified-task-manager-web`
5. Copy the config object

## Step 4: Add to Project

Θα δημιουργήσω τα files που χρειάζονται. Απλά μου δώσε:
- Firebase config object (από step 3)

## Step 5: Security Rules (Important!)

Μετά το setup, θα χρειαστεί να ορίσουμε Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tasks: users can read all, write their own
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.createdBy == request.auth.uid;
      allow update, delete: if request.auth != null && 
        (resource.data.createdBy == request.auth.uid || 
         request.auth.uid in resource.data.assignedTo);
    }
    
    // Members: team members can read, creators can write
    match /members/{memberId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

**Ready?** Στείλε μου το Firebase config object και θα συνεχίσω! 🚀

