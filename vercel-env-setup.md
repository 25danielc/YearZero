# Quick Vercel Environment Setup

## Option 1: Using Vercel Dashboard (Easiest)

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on your project → **Settings** → **Environment Variables**
3. Add these three variables for **Production**, **Preview**, and **Development**:

### Required Variables:

```
DATABASE_URL
```
Value: Your Supabase non-pooling connection string
```
postgres://postgres.pipfgovvnmhtzvemdvze:YOUR_PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

```
NEXTAUTH_SECRET
```
Value: Generate with `openssl rand -base64 32` or use:
```
YmsWrqDd0SRO6SoUEIm3nnOgiovJgXh/0E4qNMhTeMQ=
```

```
NEXTAUTH_URL
```
Value: Your Vercel app URL (update after first deploy if needed)
```
https://your-app-name.vercel.app
```

---

## Option 2: Using Vercel CLI

### Step 1: Install Vercel CLI (if not installed)
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Link your project (if not already linked)
```bash
cd /Users/danielchen/projects/newyearsballs
vercel link
```

### Step 4: Set environment variables

**For Production:**
```bash
vercel env add DATABASE_URL production
# Paste your Supabase connection string when prompted

vercel env add NEXTAUTH_SECRET production
# Paste your secret (generate with: openssl rand -base64 32)

vercel env add NEXTAUTH_URL production
# Paste your Vercel URL (e.g., https://yearzero.vercel.app)
```

**For Preview:**
```bash
vercel env add DATABASE_URL preview
vercel env add NEXTAUTH_SECRET preview
vercel env add NEXTAUTH_URL preview
```

**For Development:**
```bash
vercel env add DATABASE_URL development
vercel env add NEXTAUTH_SECRET development
vercel env add NEXTAUTH_URL development
```

---

## Option 3: Quick Copy-Paste Commands

Run these commands (replace values as needed):

```bash
# Generate NEXTAUTH_SECRET
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "Your NEXTAUTH_SECRET: $NEXTAUTH_SECRET"

# Set for all environments (replace YOUR_VALUES)
vercel env add DATABASE_URL production <<< "postgres://postgres.pipfgovvnmhtzvemdvze:YOUR_PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
vercel env add NEXTAUTH_SECRET production <<< "$NEXTAUTH_SECRET"
vercel env add NEXTAUTH_URL production <<< "https://your-app.vercel.app"

# Repeat for preview and development
vercel env add DATABASE_URL preview <<< "postgres://postgres.pipfgovvnmhtzvemdvze:YOUR_PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
vercel env add NEXTAUTH_SECRET preview <<< "$NEXTAUTH_SECRET"
vercel env add NEXTAUTH_URL preview <<< "https://your-app.vercel.app"

vercel env add DATABASE_URL development <<< "postgres://postgres.pipfgovvnmhtzvemdvze:YOUR_PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
vercel env add NEXTAUTH_SECRET development <<< "$NEXTAUTH_SECRET"
vercel env add NEXTAUTH_URL development <<< "https://your-app.vercel.app"
```

---

## After Setting Environment Variables

### 1. Deploy to Vercel
```bash
vercel --prod
```

### 2. Run Database Migrations

After deployment, you need to run migrations. You have a few options:

**Option A: Using Vercel CLI with env vars**
```bash
# Pull env vars locally
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy
```

**Option B: Run migrations directly with connection string**
```bash
DATABASE_URL="your-connection-string" npx prisma migrate deploy
```

**Option C: Use Supabase SQL Editor**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `prisma/migrations/20260115225358_init/migration.sql`
3. Paste and run in SQL Editor

---

## Verify Setup

1. ✅ Check Vercel build succeeds
2. ✅ Visit your deployed app
3. ✅ Try signing up a new user
4. ✅ Check Supabase dashboard - tables should be created

---

## Troubleshooting

### Build fails with database error
- Verify `DATABASE_URL` is correct
- Check you're using port **5432** (non-pooling)
- Ensure password is correct

### "Schema is out of sync"
- Run `npx prisma migrate deploy`
- Or use Supabase SQL Editor to run migration manually

### NextAuth errors
- Verify `NEXTAUTH_URL` matches your domain exactly
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies

