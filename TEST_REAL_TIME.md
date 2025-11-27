# 🔄 Real-Time Sync Testing Guide

## 🎯 Goal
Test ότι τα tasks sync real-time μεταξύ multiple users/browsers.

---

## 📋 Setup

### Option 1: Two Browsers (Same User)
1. Open **Chrome** → http://localhost:3000
2. Open **Firefox** (or Edge) → http://localhost:3000
3. Login με **same account** και στα δύο

### Option 2: Two Browsers (Different Users)
1. Open **Chrome** → Login as User A
2. Open **Firefox** → Login as User B
3. Both should see shared tasks

### Option 3: Incognito + Normal
1. Open **Normal window** → Login
2. Open **Incognito window** → Login (same or different user)

---

## ✅ Test Scenarios

### Test 1: Create Task (Real-Time)
**Browser 1:**
1. Create task: "Real-Time Test 1"
2. Assign to yourself

**Browser 2:**
- ✅ **Expected:** Task appears automatically (within 1-2 seconds)

---

### Test 2: Update Task (Real-Time)
**Browser 1:**
1. Edit "Real-Time Test 1"
2. Change status: Todo → In Progress
3. Save

**Browser 2:**
- ✅ **Expected:** Status changes automatically

---

### Test 3: Delete Task (Real-Time)
**Browser 1:**
1. Delete "Real-Time Test 1"

**Browser 2:**
- ✅ **Expected:** Task disappears automatically

---

### Test 4: Complete Task (Real-Time)
**Browser 1:**
1. Check the checkbox on a task

**Browser 2:**
- ✅ **Expected:** Task marked as completed automatically

---

### Test 5: Add Subtask (Real-Time)
**Browser 1:**
1. Edit a task
2. Add subtask: "Real-time subtask"
3. Save

**Browser 2:**
- ✅ **Expected:** Subtask appears in the task

---

### Test 6: Multi-User Assignment
**Browser 1 (User A):**
1. Create task: "Shared Task"
2. Assign to: User A + User B

**Browser 2 (User B):**
- ✅ **Expected:** Task appears (because assigned to User B)

**Browser 1:**
1. Edit task → Change priority to High

**Browser 2:**
- ✅ **Expected:** Priority change appears

---

## 🔍 How to Verify Real-Time

### Visual Indicators:
1. **No page refresh needed** - Changes appear automatically
2. **Instant updates** - Within 1-2 seconds
3. **No manual sync** - No need to click "Refresh"

### Console Check:
Open browser DevTools (F12) → Console
- Look for Firestore connection messages
- No errors about permissions

---

## 🐛 Troubleshooting

### Issue: Changes not syncing
**Check:**
1. ✅ Both browsers logged in?
2. ✅ Security Rules published?
3. ✅ Same Firebase project?
4. ✅ Network connection OK?

**Solution:**
- Check browser console for errors
- Verify Security Rules allow read/write
- Try refreshing one browser

### Issue: "Permission denied"
**Solution:**
- Make sure Security Rules are set up
- Check that user is authenticated
- Verify `assignedTo` array includes user ID

---

## 📊 Expected Behavior

### ✅ Working Correctly:
- Changes appear within 1-2 seconds
- No page refresh needed
- All users see same data
- No console errors

### ❌ Not Working:
- Changes don't appear
- Need to refresh manually
- "Permission denied" errors
- Console shows Firestore errors

---

## 🎯 Success Criteria

Real-time sync works if:
- ✅ Task created in Browser 1 → Appears in Browser 2
- ✅ Task updated in Browser 1 → Updates in Browser 2
- ✅ Task deleted in Browser 1 → Disappears in Browser 2
- ✅ All within 1-2 seconds, no refresh needed

---

**Test this after setting up Security Rules!** 🔒

