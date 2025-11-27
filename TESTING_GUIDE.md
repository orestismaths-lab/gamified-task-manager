# 🧪 Testing Guide - Οδηγίες Testing

## 🚀 Quick Start

### 1. Ξεκίνα την Εφαρμογή

```bash
cd task_manager
npm run dev
```

Θα ανοίξει στο: **http://localhost:3000**

---

## ✅ Testing Checklist

### 🔐 1. Authentication Testing

#### Test 1: Register με Email/Password
- [ ] Κάνε click στο "Sign Up"
- [ ] Συμπλήρωσε:
  - Display Name: "Test User"
  - Email: "test@example.com"
  - Password: "test123" (min 6 characters)
- [ ] Κάνε "Sign Up"
- [ ] **Expected:** Modal κλείνει, βλέπεις το Dashboard

#### Test 2: Login με Email/Password
- [ ] Sign Out (αν είσαι logged in)
- [ ] Κάνε "Sign In"
- [ ] Βάλε τα credentials που έκανες register
- [ ] **Expected:** Login successful, Dashboard visible

#### Test 3: Google Sign-In
- [ ] Sign Out
- [ ] Κάνε "Continue with Google"
- [ ] Επίλεξε Google account
- [ ] **Expected:** Login successful

#### Test 4: Error Handling
- [ ] Δοκίμασε login με λάθος password
- [ ] **Expected:** Error message appears
- [ ] Δοκίμασε register με email που υπάρχει ήδη
- [ ] **Expected:** Error message appears

---

### 📝 2. Task Management Testing

#### Test 5: Create Task
- [ ] Βεβαιώσου ότι είσαι logged in
- [ ] Στο Task Input, γράψε: "Test Task 1"
- [ ] Κάνε "More options"
- [ ] Συμπλήρωσε:
  - Description: "This is a test task"
  - Priority: High
  - Status: Todo
  - Due Date: Tomorrow
  - Tags: "test, important"
- [ ] Assign σε έναν member
- [ ] Κάνε "Add Task"
- [ ] **Expected:** Task εμφανίζεται στο list/Kanban

#### Test 6: Edit Task
- [ ] Κάνε click στο "Edit" button σε ένα task
- [ ] Άλλαξε:
  - Title: "Updated Test Task"
  - Priority: Medium
  - Status: In Progress
- [ ] Κάνε "Save"
- [ ] **Expected:** Changes saved, task updated

#### Test 7: Delete Task
- [ ] Κάνε click στο "Delete" button (trash icon)
- [ ] Confirm deletion
- [ ] **Expected:** Task removed

#### Test 8: Complete Task
- [ ] Κάνε click στο checkbox ενός task
- [ ] **Expected:** 
  - Task marked as completed
  - Confetti animation 🎉
  - XP added to member

---

### 📋 3. Subtasks Testing

#### Test 9: Add Subtask
- [ ] Άνοιξε ένα task (Edit)
- [ ] Στο "Subtasks" section, γράψε: "Subtask 1"
- [ ] Κάνε "Add"
- [ ] **Expected:** Subtask added

#### Test 10: Complete Subtask
- [ ] Κάνε click στο checkbox ενός subtask
- [ ] **Expected:** Subtask marked as completed, XP added

#### Test 11: Delete Subtask
- [ ] Κάνε click στο X button ενός subtask
- [ ] **Expected:** Subtask removed

---

### 👥 4. Multi-User Assignment Testing

#### Test 12: Assign to Multiple Members
- [ ] Create/Edit task
- [ ] Στο "Assign To" dropdown:
  - Select multiple members (click on them)
  - **Expected:** Multiple members selected, shown as tags
- [ ] Save task
- [ ] **Expected:** Task assigned to all selected members

#### Test 13: Remove Assignment
- [ ] Edit task
- [ ] Κάνε click στο X σε ένα assigned member tag
- [ ] **Expected:** Member removed from assignment

---

### 🔄 5. Real-Time Sync Testing

#### Test 14: Multi-Browser Sync
1. **Browser 1:**
   - Login as User A
   - Create task: "Shared Task 1"

2. **Browser 2:**
   - Login as User B (ή same user)
   - **Expected:** "Shared Task 1" appears automatically (real-time)

3. **Browser 1:**
   - Edit "Shared Task 1" → Change status to "In Progress"

4. **Browser 2:**
   - **Expected:** Status change appears automatically

5. **Browser 2:**
   - Delete "Shared Task 1"

6. **Browser 1:**
   - **Expected:** Task disappears automatically

---

### 🎮 6. Gamification Testing

#### Test 15: XP System
- [ ] Complete a task
- [ ] **Expected:** +50 XP added to member
- [ ] Complete a subtask
- [ ] **Expected:** +10 XP added to member
- [ ] Check member's XP in Member Bar
- [ ] **Expected:** XP updated

#### Test 16: Level Up
- [ ] Complete multiple tasks until XP reaches level threshold
- [ ] **Expected:** Level increases, celebration animation

---

### 🔍 7. Filtering & Search Testing

#### Test 17: Filter by Owner
- [ ] Στο Dashboard, επιλέξτε "Owner" filter
- [ ] Επιλέξτε ένα member
- [ ] **Expected:** Only tasks assigned to that member shown

#### Test 18: Filter by Status
- [ ] Επιλέξτε "Status" filter → "In Progress"
- [ ] **Expected:** Only "In Progress" tasks shown

#### Test 19: Filter by Priority
- [ ] Επιλέξτε "Priority" filter → "High"
- [ ] **Expected:** Only "High" priority tasks shown

#### Test 20: Search
- [ ] Type στο search bar: "test"
- [ ] **Expected:** Only tasks with "test" in title/description shown

---

### 📊 8. View Modes Testing

#### Test 21: List View
- [ ] Κάνε click στο "List" button
- [ ] **Expected:** Tasks shown in list format

#### Test 22: Kanban View
- [ ] Κάνε click στο "Kanban" button
- [ ] **Expected:** Tasks shown in Kanban board

#### Test 23: Drag & Drop (Kanban)
- [ ] Drag ένα task από "Todo" → "In Progress"
- [ ] **Expected:** Task moves, status updates

---

### 🎨 9. UI/UX Testing

#### Test 24: Dark Mode
- [ ] Κάνε click στο theme toggle
- [ ] **Expected:** Dark mode activates, colors change

#### Test 25: Responsive Design
- [ ] Resize browser window
- [ ] **Expected:** Layout adapts (mobile/tablet/desktop)

---

## 🐛 Common Issues & Solutions

### Issue 1: "Permission denied" Error
**Cause:** Security Rules not set up
**Solution:** 
1. Go to Firebase Console
2. Set up Security Rules (see `FIRESTORE_SECURITY_RULES.md`)

### Issue 2: Tasks not syncing between browsers
**Cause:** Not logged in, or Security Rules issue
**Solution:**
1. Make sure both browsers are logged in
2. Check Security Rules allow read/write

### Issue 3: "Cannot read property of undefined"
**Cause:** Missing data in Firestore
**Solution:**
1. Check browser console for errors
2. Make sure all required fields are present

### Issue 4: Login modal keeps appearing
**Cause:** Auth state not loading
**Solution:**
1. Check browser console
2. Make sure Firebase config is correct
3. Check network tab for Firebase requests

---

## 📝 Testing Report Template

```markdown
## Testing Report - [Date]

### Environment:
- Browser: [Chrome/Firefox/Safari]
- OS: [Windows/Mac/Linux]
- Firebase Project: gamified-task-manager-3e2a4

### Tests Passed: X/25
### Tests Failed: Y/25

### Issues Found:
1. [Issue description]
2. [Issue description]

### Notes:
[Any additional notes]
```

---

## 🎯 Priority Testing Order

### Must Test (Critical):
1. ✅ Authentication (Login/Register)
2. ✅ Create Task
3. ✅ Edit Task
4. ✅ Delete Task
5. ✅ Real-time Sync

### Should Test (Important):
6. ✅ Multi-user Assignment
7. ✅ Subtasks
8. ✅ Filtering
9. ✅ XP System

### Nice to Test (Optional):
10. ✅ Dark Mode
11. ✅ Responsive Design
12. ✅ All View Modes

---

## ✅ Quick Test Script

Γρήγορο 5-λεπτο test:

```bash
# 1. Start app
npm run dev

# 2. Open browser → http://localhost:3000

# 3. Quick tests:
- [ ] Register/Login
- [ ] Create 1 task
- [ ] Edit task
- [ ] Complete task
- [ ] Delete task

# 4. If all pass → ✅ Basic functionality works!
```

---

**Happy Testing! 🚀**

