# 🔒 Firestore Security Rules

## 📋 Setup Security Rules

1. **Πήγαινε στο Firebase Console:**
   - https://console.firebase.google.com
   - Επίλεξε το project: `gamified-task-manager-3e2a4`

2. **Firestore Database → Rules tab**

3. **Replace τα rules με αυτά:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function: check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function: check if user is the creator
    function isCreator(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Helper function: check if user is assigned to task
    function isAssigned(taskData) {
      return isAuthenticated() && 
             request.auth.uid != null &&
             taskData.assignedTo != null &&
             request.auth.uid in taskData.assignedTo;
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      // Anyone authenticated can read tasks
      allow read: if isAuthenticated();
      
      // Create: must be authenticated, and creator must be in assignedTo
      allow create: if isAuthenticated() && 
                       request.resource.data.createdBy == request.auth.uid &&
                       request.auth.uid in request.resource.data.assignedTo;
      
      // Update: must be creator or assigned to task
      allow update: if isAuthenticated() && 
                       (resource.data.createdBy == request.auth.uid ||
                        request.auth.uid in resource.data.assignedTo ||
                        request.auth.uid in request.resource.data.assignedTo);
      
      // Delete: only creator can delete
      allow delete: if isAuthenticated() && 
                       resource.data.createdBy == request.auth.uid;
    }
    
    // Members collection
    match /members/{memberId} {
      // Anyone authenticated can read members
      allow read: if isAuthenticated();
      
      // Create: must be authenticated
      allow create: if isAuthenticated();
      
      // Update: must be authenticated (can update own or others for now)
      // TODO: Add more restrictions if needed
      allow update: if isAuthenticated();
      
      // Delete: must be authenticated
      allow delete: if isAuthenticated();
    }
  }
}
```

4. **Κάνε "Publish"**

---

## ⚠️ ΣΗΜΑΝΤΙΚΟ:

Αυτά τα rules είναι **permissive** για development. Για production, μπορείς να προσθέσεις:
- Role-based permissions
- Team/organization checks
- More strict member update rules

---

## ✅ Μετά το Setup:

1. Test authentication
2. Test task creation
3. Test real-time sync
4. Test multi-user assignment

---

**Ready to test!** 🚀

