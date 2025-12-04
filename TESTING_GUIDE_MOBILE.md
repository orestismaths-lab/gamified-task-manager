# 📱 Testing Guide - Mobile & Multi-Device

## 🚀 Quick Start

1. **Start the application:**
   ```bash
   cd task_manager
   npm run dev
   ```

2. **Open on mobile:**
   - Find your computer's IP address (e.g., `192.168.1.100`)
   - On mobile, open: `http://YOUR_IP:3000`
   - Or use Vercel URL if deployed

## ✅ Testing Checklist

### 1. Sign Up & Member Selection

- [ ] **Sign Up Flow:**
  - Open app on mobile
  - Click "Sign Up"
  - Enter email, password, display name
  - After registration, you should see "Select Your Member Profile" step
  - Select existing member OR create new member
  - Should redirect to dashboard

- [ ] **Member Correlation:**
  - After selecting member, check Profile tab
  - Should show your email, name, and member info
  - Should show "✅ Logged In" status

### 2. Tasks Sync Across Devices

- [ ] **Create Task on Desktop:**
  - Create a task on desktop browser
  - Assign it to yourself (your member)
  - Task should save to database

- [ ] **View on Mobile:**
  - Open app on mobile (same user account)
  - Should see the task you created on desktop
  - Task should appear in list/kanban view

- [ ] **Update Task on Mobile:**
  - Edit task on mobile
  - Change status, priority, etc.
  - Should save to database

- [ ] **Verify on Desktop:**
  - Refresh desktop browser
  - Should see updated task

### 3. Responsive Design

- [ ] **Profile Tab:**
  - Open Profile tab on mobile
  - Should see:
    - Responsive header (smaller on mobile)
    - User info in cards (1 column on mobile, 2-3 on tablet/desktop)
    - Sign Out button (full width on mobile)
    - All text readable without zooming

- [ ] **Dashboard:**
  - Header should stack vertically on mobile
  - Search bar should be full width on mobile
  - Filters should be accessible
  - Task cards should be readable

- [ ] **Task Input:**
  - Form should be usable on mobile
  - Dropdowns should work (member selection)
  - Date picker should work

- [ ] **Sidebar Menu:**
  - Burger menu should work on mobile
  - Should be accessible and not overlap content

### 4. Profile Information

- [ ] **Check Profile Tab:**
  - Should show:
    - ✅ "Logged In" status (green badge)
    - Your email address
    - Your display name
    - Your user ID
    - Member profile info (if linked)
    - Gamification stats (XP, Level, Completed Tasks)
    - Task statistics

- [ ] **Verify Data:**
  - All information should match your account
  - No "N/A" or missing data (except optional fields)

## 🐛 Common Issues & Solutions

### Issue: Tasks not showing on mobile
**Solution:**
- Make sure you selected a member during sign up
- Check that tasks are assigned to your member
- Verify you're logged in with the same account

### Issue: Profile shows "Not Logged In"
**Solution:**
- Clear browser cache/cookies
- Log out and log back in
- Check that session cookie is set

### Issue: Responsive design broken
**Solution:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors

### Issue: Member selection not working
**Solution:**
- Make sure you completed sign up first
- Check network connection
- Try refreshing the page

## 📊 Expected Behavior

### Desktop (1920x1080+)
- Full sidebar visible
- 3-column grid for stats
- Large text and spacing

### Tablet (768px - 1024px)
- Collapsible sidebar
- 2-column grid for stats
- Medium text and spacing

### Mobile (< 768px)
- Burger menu only
- 1-column layout
- Compact spacing
- Touch-friendly buttons (min 44x44px)

## 🔍 Debugging

### Check Network Tab:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Check API calls:
   - `/api/auth/me` - Should return user data
   - `/api/tasks` - Should return tasks
   - `/api/members` - Should return all members

### Check Console:
- No red errors
- Check for CORS issues
- Verify API responses

### Check Application Tab:
- LocalStorage should have minimal data (tasks now in DB)
- Session cookie should be set

## ✨ Success Criteria

✅ Tasks sync between desktop and mobile  
✅ Profile shows correct user information  
✅ Responsive design works on all screen sizes  
✅ Member selection works during sign up  
✅ All features accessible on mobile  

## 📝 Notes

- Tasks are now stored in PostgreSQL database (not localStorage)
- Members are loaded from `/api/members` endpoint
- Session is managed via HTTP-only cookies
- Mobile testing requires same network or public URL

