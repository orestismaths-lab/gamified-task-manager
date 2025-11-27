# Gamified Colorful Task Manager 🎮

A fun, gamified, and fully-featured Task Manager web application built with Next.js 14, React, TypeScript, and Tailwind CSS.

## Features

### 🎯 Core Features
- **Task Management**: Create, update, delete, and complete tasks
- **Subtasks**: Break down tasks into smaller subtasks
- **Priorities**: Set task priorities (High, Medium, Low)
- **Due Dates**: Track task deadlines
- **Tags**: Organize tasks with custom tags
- **Multiple Owners**: Create profiles for different users (e.g., "Dad", "Maria")

### 🎮 Gamification
- **XP System**: Earn experience points for completing tasks
  - Complete a task: +50 XP
  - Complete a subtask: +10 XP
- **Leveling**: Level up as you complete more tasks
- **Progress Bars**: Visual progress indicators for levels and subtasks
- **Celebrations**: Confetti animations when completing tasks! 🎉

### 🎨 Visual Features
- **Colorful Design**: Pastel color schemes based on priority
- **Smooth Animations**: Powered by Framer Motion
- **Responsive Layout**: Works on all screen sizes
- **Modern UI**: Clean, playful, and intuitive interface

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Celebrations**: canvas-confetti
- **Storage**: LocalStorage (client-side persistence)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Quick Start (Windows)

**Easiest way:**
1. Double-click `start_with_browser.bat`
   - This will automatically install dependencies (if needed) and start the app
   - Your browser will open automatically!

**Alternative:**
1. Double-click `start.bat` to start the server
2. Manually open [http://localhost:3000](http://localhost:3000) in your browser

### Manual Installation

1. Navigate to the project directory:
```bash
cd task_manager
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

**See `QUICK_START.md` for detailed instructions and troubleshooting.**

## Project Structure

```
task_manager/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with provider
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── Dashboard.tsx      # Main dashboard component
│   ├── MemberBar.tsx      # Member/XP bar at top
│   ├── TaskInput.tsx      # Task creation form
│   └── TaskCard.tsx       # Individual task card
├── context/               # React Context
│   └── TaskManagerContext.tsx  # Main state management
├── hooks/                 # Custom React hooks
│   └── useGamification.ts # XP and level calculations
├── lib/                   # Utilities
│   ├── storage.ts         # LocalStorage helpers
│   └── confetti.ts        # Confetti celebrations
├── types/                 # TypeScript types
│   └── index.ts           # All type definitions
└── public/                # Static assets
```

## Usage

### Creating Tasks
1. Enter a task title in the input field
2. Click "More options" to add description, priority, due date, and tags
3. Select an owner from the dropdown
4. Click "Add Task"

### Managing Tasks
- **Complete**: Click the checkbox to mark a task as complete (triggers confetti! 🎉)
- **Expand**: Click a task card to view/edit subtasks
- **Delete**: Click the trash icon to delete a task
- **Add Subtasks**: Expand a task and use the "Add subtask" form

### Managing Members
- **Add Member**: Use the "+" button in the member bar or the "Add Member" input at the top
- **Select Member**: Click on a member card in the member bar to filter tasks
- **View Progress**: See XP, level, and progress bar for each member

### Filtering
Click the "Filters" button to filter tasks by:
- Owner
- Status (All, Active, Completed)
- Priority (All, High, Medium, Low)

## XP & Level System

- **Base XP per Level**: 100 XP
- **Task Completion**: +50 XP
- **Subtask Completion**: +10 XP
- **Level Calculation**: `level = floor(xp / 100) + 1`

## Data Persistence

All data is stored in the browser's LocalStorage:
- Tasks persist across page refreshes
- Member profiles and XP are saved
- Selected member preference is remembered

## Building for Production

```bash
npm run build
npm start
```

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!
