# 🚀 Deployment Guide - Πώς να δώσεις την εφαρμογή σε άλλους

Αυτός ο οδηγός περιγράφει όλες τις επιλογές για να κάνεις deploy την εφαρμογή σου ώστε να είναι προσβάσιμη από άλλους χρήστες.

## 📋 Περιεχόμενα

1. [Vercel (Συνιστάται)](#1-vercel-συνιστάται)
2. [Netlify](#2-netlify)
3. [GitHub Pages](#3-github-pages)
4. [Railway](#4-railway)
5. [Render](#5-render)
6. [Self-Hosting (VPS)](#6-self-hosting-vps)

---

## 1. Vercel (Συνιστάται) ⭐

**Γιατί Vercel:**
- ✅ Δημιουργήθηκε από τους creators του Next.js
- ✅ Εξαιρετικά εύκολο setup (2-3 clicks)
- ✅ Δωρεάν tier με πολλά features
- ✅ Automatic deployments από GitHub
- ✅ Custom domain support
- ✅ SSL certificate αυτόματα

### Βήματα:

#### Επιλογή Α: Με GitHub (Συνιστάται)

1. **Push το code στο GitHub** (αν δεν το έχεις κάνει ήδη):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Πήγαινε στο:** https://vercel.com

3. **Sign up/Login** με το GitHub account σου

4. **Κάνε "Add New Project"**

5. **Import το repository:**
   - Επίλεξε το `gamified-task-manager` repository
   - Vercel θα detect αυτόματα ότι είναι Next.js app

6. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `task_manager` (αν το repo είναι στο root)
   - **Build Command:** `npm run build` (auto)
   - **Output Directory:** `.next` (auto)
   - **Install Command:** `npm install` (auto)

7. **Environment Variables:** (Δεν χρειάζονται για αυτή την εφαρμογή)

8. **Κάνε "Deploy"**

9. **Έτοιμο!** Θα πάρεις ένα URL τύπου: `https://gamified-task-manager.vercel.app`

#### Επιλογή Β: Με Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd task_manager
vercel

# Follow the prompts
```

### Custom Domain:

1. Πήγαινε στο project settings στο Vercel
2. Κάνε "Add Domain"
3. Πρόσθεσε το domain σου
4. Follow τις οδηγίες για DNS configuration

---

## 2. Netlify

**Γιατί Netlify:**
- ✅ Εύκολο setup
- ✅ Δωρεάν tier
- ✅ Continuous deployment
- ✅ Form handling (αν χρειαστεί στο μέλλον)

### Βήματα:

1. **Push το code στο GitHub**

2. **Πήγαινε στο:** https://app.netlify.com

3. **Sign up/Login** με GitHub

4. **"Add new site" → "Import an existing project"**

5. **Επίλεξε το repository**

6. **Build settings:**
   - **Base directory:** `task_manager`
   - **Build command:** `npm run build`
   - **Publish directory:** `task_manager/.next`

7. **Κάνε "Deploy site"**

8. **Έτοιμο!** URL: `https://random-name.netlify.app`

### ⚠️ Σημείωση για Netlify:

Για Next.js με App Router, μπορεί να χρειαστεί `netlify.toml`:

```toml
[build]
  command = "cd task_manager && npm install && npm run build"
  publish = "task_manager/.next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## 3. GitHub Pages

**Γιατί GitHub Pages:**
- ✅ Δωρεάν
- ✅ Ενσωματωμένο με GitHub
- ⚠️ Χρειάζεται static export (όχι SSR)

### Βήματα:

1. **Configure Next.js για static export:**

   Επεξεργάσου `next.config.js`:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     images: {
       unoptimized: true,
     },
   };
   
   module.exports = nextConfig;
   ```

2. **Build για static:**
   ```bash
   cd task_manager
   npm run build
   ```

3. **Setup GitHub Actions:**

   Δημιούργησε `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: cd task_manager && npm install
         - run: cd task_manager && npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./task_manager/out
   ```

4. **Enable GitHub Pages:**
   - Repository → Settings → Pages
   - Source: GitHub Actions

---

## 4. Railway

**Γιατί Railway:**
- ✅ Εύκολο setup
- ✅ Δωρεάν tier ($5 credit/month)
- ✅ Database support (αν χρειαστεί)

### Βήματα:

1. **Πήγαινε στο:** https://railway.app

2. **Sign up** με GitHub

3. **"New Project" → "Deploy from GitHub repo"**

4. **Επίλεξε το repository**

5. **Railway θα auto-detect Next.js:**
   - Build command: `npm run build`
   - Start command: `npm start`

6. **Deploy!**

7. **Έτοιμο!** URL: `https://gamified-task-manager.up.railway.app`

---

## 5. Render

**Γιατί Render:**
- ✅ Δωρεάν tier
- ✅ Auto-deploy από GitHub
- ✅ SSL certificates

### Βήματα:

1. **Πήγαινε στο:** https://render.com

2. **Sign up** με GitHub

3. **"New" → "Web Service"**

4. **Connect repository**

5. **Configure:**
   - **Name:** gamified-task-manager
   - **Environment:** Node
   - **Build Command:** `cd task_manager && npm install && npm run build`
   - **Start Command:** `cd task_manager && npm start`
   - **Root Directory:** `task_manager`

6. **Deploy!**

7. **Έτοιμο!** URL: `https://gamified-task-manager.onrender.com`

---

## 6. Self-Hosting (VPS)

**Γιατί Self-Hosting:**
- ✅ Πλήρης έλεγχος
- ✅ Custom server configuration
- ⚠️ Χρειάζεται server management knowledge

### Βήματα:

#### Με PM2 (Process Manager):

1. **Setup server (Ubuntu/Debian):**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Clone repository
   git clone https://github.com/orestismaths-lab/gamified-task-manager.git
   cd gamified-task-manager/task_manager
   
   # Install dependencies
   npm install
   
   # Build
   npm run build
   
   # Start with PM2
   pm2 start npm --name "task-manager" -- start
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

2. **Setup Nginx (Reverse Proxy):**
   ```bash
   sudo apt install nginx
   
   # Create config
   sudo nano /etc/nginx/sites-available/task-manager
   ```
   
   Config:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   # Enable site
   sudo ln -s /etc/nginx/sites-available/task-manager /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

3. **Setup SSL με Let's Encrypt:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## 📊 Σύγκριση Επιλογών

| Platform | Δυσκολία | Κόστος | Custom Domain | Auto Deploy | Best For |
|----------|----------|--------|---------------|-------------|----------|
| **Vercel** | ⭐ Εύκολο | Δωρεάν | ✅ | ✅ | Next.js apps |
| **Netlify** | ⭐ Εύκολο | Δωρεάν | ✅ | ✅ | Static sites |
| **GitHub Pages** | ⭐⭐ Μέτριο | Δωρεάν | ✅ | ✅ | Open source |
| **Railway** | ⭐ Εύκολο | $5/mo credit | ✅ | ✅ | Full-stack |
| **Render** | ⭐ Εύκολο | Δωρεάν | ✅ | ✅ | General purpose |
| **VPS** | ⭐⭐⭐ Δύσκολο | $5-20/mo | ✅ | ⚠️ Manual | Full control |

---

## 🎯 Σύσταση

**Για αυτή την εφαρμογή, συνιστώ Vercel** γιατί:
1. Είναι Next.js app
2. Εξαιρετικά εύκολο setup
3. Δωρεάν tier είναι αρκετό
4. Automatic deployments
5. Built-in analytics

---

## 🔒 Security & Privacy Notes

⚠️ **Σημαντικό:** Η εφαρμογή χρησιμοποιεί **LocalStorage** για data storage. Αυτό σημαίνει:
- ✅ Κάθε χρήστης έχει τα δικά του data στο browser του
- ✅ Δεν υπάρχει server-side storage
- ✅ Data δεν μοιράζονται μεταξύ χρηστών
- ⚠️ Αν κάποιος clear το browser cache, χάνει τα data

**Για shared data μεταξύ χρηστών**, θα χρειαστεί:
- Backend API
- Database (PostgreSQL, MongoDB, κτλ)
- Authentication system

---

## 📝 Next Steps

1. **Επίλεξε deployment platform**
2. **Follow τα βήματα παραπάνω**
3. **Test την deployed εφαρμογή**
4. **Share το URL με τους χρήστες!**

---

## ❓ Troubleshooting

### Build Errors

**"Module not found"**
```bash
cd task_manager
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables

Αν χρειαστεί να προσθέσεις environment variables:
- **Vercel:** Project Settings → Environment Variables
- **Netlify:** Site Settings → Environment Variables
- **Railway:** Variables tab

### Port Issues

Αν χρειάζεται να αλλάξεις port:
```bash
# In package.json, modify start script:
"start": "next start -p 3001"
```

---

## 🎉 Έτοιμο!

Μόλις ολοκληρώσεις το deployment, θα έχεις ένα public URL που μπορείς να μοιραστείς με οποιονδήποτε!

**Questions?** Check τα documentation:
- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com
- Next.js Deployment: https://nextjs.org/docs/deployment

