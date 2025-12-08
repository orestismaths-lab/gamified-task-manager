# 📊 Database Queries Guide

This guide shows you how to query the database to see what data you have stored.

## 🔗 Accessing Your Database

### Option 1: Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** → **Postgres** → **Query Editor**
4. Run the SQL queries below

### Option 2: Local Connection
If you have `DATABASE_URL` in your `.env.local`, you can use:
- **pgAdmin** (GUI)
- **DBeaver** (GUI)
- **psql** (Command line)
- **Prisma Studio** (GUI for Prisma): `npx prisma studio`

---

## 📋 Useful Queries

### 1. View All Users
```sql
SELECT 
  id,
  email,
  name,
  "createdAt",
  "updatedAt"
FROM "User"
ORDER BY "createdAt" DESC;
```

### 2. View All Tasks
```sql
SELECT 
  t.id,
  t.title,
  t.description,
  t.priority,
  t.status,
  t."dueDate",
  t.completed,
  t."createdAt",
  u.email as "createdByEmail",
  u.name as "createdByName"
FROM "Task" t
LEFT JOIN "User" u ON t."createdById" = u.id
ORDER BY t."createdAt" DESC;
```

### 3. View Tasks for a Specific User (by email)
```sql
-- Replace 'your-email@example.com' with your email
SELECT 
  t.id,
  t.title,
  t.description,
  t.priority,
  t.status,
  t."dueDate",
  t.completed,
  t."createdAt"
FROM "Task" t
WHERE t."createdById" = (
  SELECT id FROM "User" WHERE email = 'your-email@example.com'
)
ORDER BY t."createdAt" DESC;
```

### 4. Count Tasks per User
```sql
SELECT 
  u.email,
  u.name,
  COUNT(t.id) as "taskCount"
FROM "User" u
LEFT JOIN "Task" t ON t."createdById" = u.id
GROUP BY u.id, u.email, u.name
ORDER BY "taskCount" DESC;
```

### 5. View Task Assignments
```sql
SELECT 
  ta.id,
  t.title as "taskTitle",
  u.email as "assignedToEmail",
  u.name as "assignedToName",
  ta."createdAt"
FROM "TaskAssignment" ta
JOIN "Task" t ON ta."taskId" = t.id
JOIN "User" u ON ta."userId" = u.id
ORDER BY ta."createdAt" DESC;
```

### 6. View Member Profiles (XP & Level)
```sql
SELECT 
  mp.id,
  u.email,
  u.name,
  mp.xp,
  mp.level,
  mp."createdAt",
  mp."updatedAt"
FROM "MemberProfile" mp
JOIN "User" u ON mp."userId" = u.id
ORDER BY mp.level DESC, mp.xp DESC;
```

### 7. View Subtasks
```sql
SELECT 
  st.id,
  st.title,
  st.completed,
  t.title as "taskTitle",
  st."createdAt"
FROM "Subtask" st
JOIN "Task" t ON st."taskId" = t.id
ORDER BY st."createdAt" DESC;
```

### 8. Check if Migration Has Been Done
```sql
-- Check if a specific user has tasks (migration completed)
-- Replace 'your-email@example.com' with your email
SELECT 
  u.email,
  COUNT(t.id) as "taskCount",
  CASE 
    WHEN COUNT(t.id) > 0 THEN 'Migration Completed ✅'
    ELSE 'No Migration Yet ❌'
  END as "migrationStatus"
FROM "User" u
LEFT JOIN "Task" t ON t."createdById" = u.id
WHERE u.email = 'your-email@example.com'
GROUP BY u.id, u.email;
```

### 9. View All Tables and Row Counts
```sql
SELECT 
  schemaname,
  tablename,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = tablename) as "columnCount"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 10. Get Detailed Task Information (with assignments and subtasks)
```sql
SELECT 
  t.id,
  t.title,
  t.description,
  t.priority,
  t.status,
  t.completed,
  t."dueDate",
  t."createdAt",
  u.email as "creatorEmail",
  u.name as "creatorName",
  (
    SELECT COUNT(*) 
    FROM "Subtask" st 
    WHERE st."taskId" = t.id
  ) as "subtaskCount",
  (
    SELECT COUNT(*) 
    FROM "TaskAssignment" ta 
    WHERE ta."taskId" = t.id
  ) as "assignmentCount"
FROM "Task" t
JOIN "User" u ON t."createdById" = u.id
ORDER BY t."createdAt" DESC;
```

---

## 🔍 Advanced Queries

### Find Tasks by Status
```sql
SELECT 
  status,
  COUNT(*) as "count"
FROM "Task"
GROUP BY status
ORDER BY "count" DESC;
```

### Find Tasks by Priority
```sql
SELECT 
  priority,
  COUNT(*) as "count"
FROM "Task"
GROUP BY priority
ORDER BY 
  CASE priority
    WHEN 'high' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'low' THEN 3
  END;
```

### Find Overdue Tasks
```sql
SELECT 
  t.id,
  t.title,
  t."dueDate",
  u.email as "creatorEmail"
FROM "Task" t
JOIN "User" u ON t."createdById" = u.id
WHERE t."dueDate" < NOW()
  AND t.completed = false
ORDER BY t."dueDate" ASC;
```

### Find Tasks Created in Last 7 Days
```sql
SELECT 
  t.id,
  t.title,
  t."createdAt",
  u.email as "creatorEmail"
FROM "Task" t
JOIN "User" u ON t."createdById" = u.id
WHERE t."createdAt" >= NOW() - INTERVAL '7 days'
ORDER BY t."createdAt" DESC;
```

---

## 🛠️ Maintenance Queries

### Delete All Tasks (⚠️ DANGEROUS - Use with caution!)
```sql
-- First, delete subtasks and assignments (due to foreign keys)
DELETE FROM "Subtask";
DELETE FROM "TaskAssignment";
DELETE FROM "Task";
```

### Delete All Data for a Specific User (⚠️ DANGEROUS)
```sql
-- Replace 'user-email@example.com' with the email
-- This will delete all tasks, assignments, and member profile for that user
DELETE FROM "Subtask" 
WHERE "taskId" IN (
  SELECT id FROM "Task" WHERE "createdById" = (
    SELECT id FROM "User" WHERE email = 'user-email@example.com'
  )
);

DELETE FROM "TaskAssignment" 
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'user-email@example.com')
   OR "taskId" IN (
     SELECT id FROM "Task" WHERE "createdById" = (
       SELECT id FROM "User" WHERE email = 'user-email@example.com'
     )
   );

DELETE FROM "Task" 
WHERE "createdById" = (SELECT id FROM "User" WHERE email = 'user-email@example.com');

DELETE FROM "MemberProfile" 
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'user-email@example.com');
```

---

## 📝 Notes

- All table names are case-sensitive in PostgreSQL, so use double quotes: `"User"`, `"Task"`, etc.
- Date columns use `TIMESTAMP(3)` format
- The `tags` column in `Task` table stores JSON as a string (use `JSON.parse()` in code)
- Foreign key relationships:
  - `Task.createdById` → `User.id`
  - `Subtask.taskId` → `Task.id`
  - `TaskAssignment.userId` → `User.id`
  - `TaskAssignment.taskId` → `Task.id`
  - `MemberProfile.userId` → `User.id`

---

## 🚀 Quick Check: Is My Data in the Database?

Run this query to see a summary:

```sql
SELECT 
  (SELECT COUNT(*) FROM "User") as "totalUsers",
  (SELECT COUNT(*) FROM "Task") as "totalTasks",
  (SELECT COUNT(*) FROM "Subtask") as "totalSubtasks",
  (SELECT COUNT(*) FROM "TaskAssignment") as "totalAssignments",
  (SELECT COUNT(*) FROM "MemberProfile") as "totalMemberProfiles";
```

If you see numbers > 0, your data is in the database! ✅

