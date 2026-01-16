# Environment Variables Setup for Vercel Deployment

## 🔑 Required Environment Variables

You **MUST** set these in your Vercel project settings:

### 1. **NEXTAUTH_URL** (Required)
```
Format: https://your-app-name.vercel.app
Example: https://yearzero.vercel.app
```
- This is your Vercel deployment URL
- Update this after first deployment with your actual domain
- Find it in: Vercel Dashboard → Your Project → Settings → Domains

### 2. **NEXTAUTH_SECRET** (Required)
```
Generate with: openssl rand -base64 32
```
- Used to encrypt JWT tokens
- **Generate a new one** for production (never use your local dev secret!)
- Keep this secret - don't commit it to Git

### 3. **DATABASE_URL** (Required)
```
For PostgreSQL (Production):
Format: postgresql://user:password@host:port/database?sslmode=require
Example: postgresql://user:pass@db.xxx.us-east-1.rds.amazonaws.com:5432/yearzero?sslmode=require
```

**How to get this:**
- **Option A: Vercel Postgres** (Easiest)
  1. Vercel Dashboard → Your Project → Storage → Create Database → Postgres
  2. Copy the connection string from the database page
  3. It will auto-populate as `POSTGRES_URL` - copy that value

- **Option B: External Provider** (Supabase, Neon, etc.)
  1. Create a PostgreSQL database
  2. Copy the connection string
  3. Use it as `DATABASE_URL`

**⚠️ Important:** After setting `DATABASE_URL`, update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

Then commit and push:
```bash
git add prisma/schema.prisma
git commit -m "Update Prisma schema for PostgreSQL"
git push
```

---

## 📧 Optional: Email Configuration

Only set these if you want daily email notifications:

### 4. **EMAIL_HOST** (Optional)
```
Default: smtp.gmail.com
Example: smtp.gmail.com
```

### 5. **EMAIL_PORT** (Optional)
```
Default: 587
Example: 587
```

### 6. **EMAIL_USER** (Optional)
```
Example: your-email@gmail.com
```
- Your email address for sending notifications

### 7. **EMAIL_PASSWORD** (Optional)
```
Example: your-app-password
```
- **NOT your regular password!**
- For Gmail: Generate an App Password at https://myaccount.google.com/apppasswords
- Enable 2FA on your Google account first

### 8. **CRON_SECRET** (Optional - Recommended for Production)
```
Generate with: openssl rand -base64 32
```
- Protects your cron endpoint from unauthorized access
- If set, uncomment the auth check in `src/app/api/cron/daily-notifications/route.ts`

---

## 🚀 Quick Setup Steps

### Step 1: Set Required Variables in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add these 3 variables:
   - `NEXTAUTH_URL` = `https://your-app-name.vercel.app` (update after first deploy)
   - `NEXTAUTH_SECRET` = `[generate with: openssl rand -base64 32]`
   - `DATABASE_URL` = `[from Vercel Postgres or external provider]`

3. Click **Save** for each variable

### Step 2: Create PostgreSQL Database

**Using Vercel Postgres (Recommended):**
1. Vercel Dashboard → Your Project → **Storage** → **Create Database**
2. Choose **Postgres**
3. Select a region (closest to your users)
4. Copy the connection string (shown as `POSTGRES_URL`)

### Step 3: Update Prisma Schema

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

Commit and push:
```bash
git add prisma/schema.prisma
git commit -m "Update for PostgreSQL production"
git push origin main
```

### Step 4: Run Migrations

After deployment, run migrations:
```bash
# Via Vercel CLI (if installed)
vercel env pull .env.local
npx prisma migrate deploy

# Or via Vercel dashboard (use a deployment hook or API)
```

### Step 5: Redeploy

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click **"Redeploy"** on the latest deployment
3. Or push another commit to trigger auto-deploy

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] App loads at your Vercel URL
- [ ] Can create an account (signup works)
- [ ] Can login
- [ ] Dashboard loads
- [ ] Can create resolutions
- [ ] Database is connected (no errors in logs)

---

## 🔍 Finding Your Vercel URL

1. Go to Vercel Dashboard → Your Project
2. Look at the **Domains** section
3. Your default URL is: `https://your-project-name.vercel.app`
4. Update `NEXTAUTH_URL` to match this exactly (with `https://`)

---

## 🆘 Troubleshooting

### "Invalid NEXTAUTH_URL"
- Make sure it starts with `https://`
- Match it exactly to your Vercel domain (check Domains section)

### "Database connection failed"
- Verify `DATABASE_URL` is correct
- Check if database allows connections from Vercel IPs
- For external providers, enable connection pooling if available

### "Missing NEXTAUTH_SECRET"
- Generate one: `openssl rand -base64 32`
- Add it in Vercel Environment Variables
- Redeploy

---

## 📝 Summary

**Minimum Required (3 variables):**
1. `NEXTAUTH_URL` - Your Vercel app URL
2. `NEXTAUTH_SECRET` - Random secret (generate with openssl)
3. `DATABASE_URL` - PostgreSQL connection string

**Optional (4 variables for email):**
4. `EMAIL_HOST` - SMTP server
5. `EMAIL_PORT` - SMTP port
6. `EMAIL_USER` - Your email
7. `EMAIL_PASSWORD` - App password (not regular password)

That's it! Your app should deploy successfully.

