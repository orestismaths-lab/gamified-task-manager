# Installation Guide

## Quick Start

1. **Install Node.js** (if not already installed)
   - Download from [nodejs.org](https://nodejs.org/)
   - Version 18 or higher required

2. **Install Dependencies**
   ```bash
   cd task_manager
   npm install
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### Issue: `npx` command not found
- **Solution**: Install Node.js which includes npm/npx

### Issue: Port 3000 already in use
- **Solution**: Kill the process using port 3000 or run:
  ```bash
  npm run dev -- -p 3001
  ```

### Issue: Module not found errors
- **Solution**: Delete `node_modules` and `package-lock.json`, then:
  ```bash
  npm install
  ```

### Issue: TypeScript errors
- **Solution**: Make sure you're using Node.js 18+ and run:
  ```bash
  npm install --save-dev typescript @types/node @types/react @types/react-dom
  ```

## Production Build

To build for production:

```bash
npm run build
npm start
```

The production build will be in the `.next` folder.

