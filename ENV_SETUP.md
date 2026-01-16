# Environment Variables Setup for Vercel + Supabase

## Required Environment Variables for Vercel

Add these in your Vercel dashboard (Project Settings → Environment Variables):

### 1. Database Connection (Supabase PostgreSQL)
```
DATABASE_URL=postgres://postgres.pipfgovvnmhtzvemdvze:V0JkXxEPK27PIUTD@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

**Important Notes:**
- Use the **NON-POOLING** connection string for Prisma (port 5432)
- This is what you have as `POSTGRES_URL_NON_POOLING` in your Supabase dashboard
- Use the **pooled connection** (port 6543) for runtime if you prefer, but Prisma migrations need non-pooling

### 2. NextAuth Configuration
```
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=YmsWrqDd0SRO6SoUEIm3nnOgiovJgXh/0E4qNMhTeMQ=
```

**Important Notes:**
- `NEXTAUTH_URL` should be your actual Vercel deployment URL
- Generate a new secret with: `openssl rand -base64 32`
- The secret above is just an example - use a unique one

### 3. Optional: Email Configuration (for daily notifications)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 4. Optional: Cron Security
```
CRON_SECRET=your-cron-secret-here
```

---

## Quick Setup Steps

### Step 1: Update Prisma Schema (Already Done ✅)
The schema has been updated to use PostgreSQL:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 2: Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable for **Production**, **Preview**, and **Development** environments:

   - `DATABASE_URL` = Your Supabase non-pooling connection string
   - `NEXTAUTH_URL` = Your Vercel app URL (e.g., `https://yearzero.vercel.app`)
   - `NEXTAUTH_SECRET` = Generate with `openssl rand -base64 32`

### Step 3: Deploy and Run Migrations

After deploying to Vercel, you need to run database migrations:

**Option A: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy
```

**Option B: Run migrations manually after deployment**
```bash
# Connect to your database directly
DATABASE_URL="your-connection-string" npx prisma migrate deploy
```

**Option C: Use Supabase SQL Editor**
- Copy the SQL from `prisma/migrations/20260115225358_init/migration.sql`
- Paste and run in Supabase SQL Editor

### Step 4: Generate Prisma Client

The build process should automatically run `prisma generate`, but if needed:
```bash
npx prisma generate
```

---

## Supabase Connection String Format

From your Supabase dashboard, you should use:

**For Prisma (Migrations & Schema Pushes):**
```
postgres://postgres.pipfgovvnmhtzvemdvze:YOUR_PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

**For Runtime (Optional - can use pooled):**
```
postgres://postgres.pipfgovvnmhtzvemdvze:YOUR_PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

---

## Verify Your Setup

After deployment, check:
1. ✅ Build succeeds on Vercel
2. ✅ App loads without database errors
3. ✅ Can sign up and login
4. ✅ Can create resolutions
5. ✅ Database tables exist in Supabase

---

## Local Development Setup

For local development, you can:

**Option 1: Use Supabase for local too**
```env
DATABASE_URL="your-supabase-connection-string"
```

**Option 2: Use local SQLite (switch schema provider back)**
```env
DATABASE_URL="file:./prisma/dev.db"
```

Then update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"  // Change back for local
  url      = env("DATABASE_URL")
}
```

---

## Troubleshooting

### "Failed to connect to database"
- Check `DATABASE_URL` is correct
- Ensure you're using port **5432** (non-pooling) for migrations
- Verify password is correct
- Check Supabase database is running

### "Schema is out of sync"
- Run `npx prisma db push` or `npx prisma migrate deploy`
- Check migration files are correct

### "NextAuth errors"
- Verify `NEXTAUTH_URL` matches your actual domain exactly
- Check `NEXTAUTH_SECRET` is set
- Clear cookies and try again

