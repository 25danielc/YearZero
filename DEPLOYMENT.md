# Deployment Guide: GitHub → Vercel

## Step 1: Push to GitHub

### 1.1 Initialize Git Repository

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: YearZero resolution tracking app"
```

### 1.2 Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in:
   - **Repository name**: `newyearsballs` (or your preferred name)
   - **Description**: "Resolution tracking app with gamification"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

### 1.3 Connect and Push to GitHub

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/newyearsballs.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/newyearsballs.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### 2.1 Prerequisites

- GitHub account (already done)
- Vercel account (sign up at [vercel.com](https://vercel.com) if needed)

### 2.2 Deploy via Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project**
   - Click **"Add New..."** → **"Project"**
   - Select your GitHub repository (`newyearsballs`)
   - Click **"Import"**

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Environment Variables**
   Add these in the Vercel dashboard:
   
   ```
   NEXTAUTH_URL=https://your-app-name.vercel.app
   NEXTAUTH_SECRET=your-secret-key-here
   DATABASE_URL=file:./prisma/dev.db
   ```
   
   **⚠️ Important**: For production, you need a **PostgreSQL database**, not SQLite!
   
   **Option A: Use Vercel Postgres (Recommended)**
   - In Vercel dashboard, go to **Storage** → **Create Database** → **Postgres**
   - Copy the connection string
   - Set `DATABASE_URL` to the PostgreSQL connection string
   
   **Option B: Use External Database (Supabase, Neon, etc.)**
   - Create a PostgreSQL database on your preferred provider
   - Copy the connection string
   - Set `DATABASE_URL` to that connection string
   
   **Update Prisma Schema for Production:**
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

5. **Optional: Email Configuration**
   If you want daily notifications:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   CRON_SECRET=your-cron-secret-here
   ```

6. **Deploy**
   - Click **"Deploy"**
   - Wait for build to complete (usually 2-3 minutes)

### 2.3 Post-Deployment Setup

After deployment:

1. **Run Database Migrations**
   ```bash
   # Via Vercel CLI (install: npm i -g vercel)
   vercel env pull .env.local
   npx prisma migrate deploy
   
   # Or use Vercel's deployment hooks
   ```

2. **Update NEXTAUTH_URL**
   - Go to Vercel project settings → Environment Variables
   - Update `NEXTAUTH_URL` to your actual Vercel domain:
     ```
     NEXTAUTH_URL=https://your-actual-domain.vercel.app
     ```
   - Redeploy the project

3. **Verify Cron Job**
   - The cron job is automatically configured via `vercel.json`
   - It runs daily at midnight UTC
   - Check Vercel dashboard → **Cron Jobs** to verify

---

## Step 3: Alternative - Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd /Users/danielchen/projects/newyearsballs
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? newyearsballs
# - Directory? ./
# - Override settings? No

# For production deployment:
vercel --prod
```

---

## Step 4: Database Setup for Production

### Using Vercel Postgres (Easiest)

1. In Vercel dashboard → **Storage** → **Create Database** → **Postgres**
2. Copy the connection string (looks like: `postgres://...`)
3. Add as `DATABASE_URL` environment variable
4. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. Push schema changes:
   ```bash
   npx prisma db push
   ```
6. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Using External PostgreSQL (Supabase, Neon, etc.)

1. Create database on your provider
2. Get connection string
3. Add as `DATABASE_URL` in Vercel
4. Follow steps 4-6 above

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify `package.json` scripts are correct

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if database allows connections from Vercel IPs
- For Supabase/Neon, ensure connection pooling is configured

### Authentication Not Working
- Verify `NEXTAUTH_URL` matches your Vercel domain exactly
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again

### Cron Job Not Running
- Check Vercel dashboard → Cron Jobs
- Verify `vercel.json` is at project root
- Check cron job logs in Vercel dashboard

---

## Quick Reference Commands

```bash
# Git
git add .
git commit -m "Your message"
git push origin main

# Vercel CLI
vercel                    # Deploy to preview
vercel --prod            # Deploy to production
vercel env pull          # Pull env vars locally
vercel logs              # View logs

# Database
npx prisma migrate deploy    # Run migrations in production
npx prisma db push          # Push schema changes
npx prisma studio           # Open database GUI
```

---

## Next Steps After Deployment

1. ✅ Test the deployed app
2. ✅ Create a test user account
3. ✅ Verify email notifications (if configured)
4. ✅ Check cron job execution
5. ✅ Set up custom domain (optional)
6. ✅ Configure analytics (optional)

