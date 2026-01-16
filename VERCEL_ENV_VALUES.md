# Vercel Environment Variables Setup

## ✅ Prisma Schema Updated

The `prisma/schema.prisma` file has been updated to use PostgreSQL:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 🔑 Required Environment Variables for Vercel

Set these in: **Vercel Dashboard → Your Project → Settings → Environment Variables**

### 1. **DATABASE_URL** (Required)
Use the **non-pooling URL** for Prisma migrations and the app:

```
postgres://postgres.pipfgovvnmhtzvemdvze:V0JkUxEPK27PIUTD@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

**OR** use the direct connection (if the pooler port doesn't work for migrations):

```
postgres://postgres.pipfgovvnmhtzvemdvze:V0JkUxEPK27PIUTD@db.pipfgovvnmhtzvemdvze.supabase.co:5432/postgres?sslmode=require
```

**Note:** The URL you provided has port 6543 (pooler), but Prisma migrations typically need port 5432 (direct connection). Use the `POSTGRES_URL_NON_POOLING` format but with port 5432, or construct it as:
```
postgres://postgres.pipfgovvnmhtzvemdvze:V0JkUxEPK27PIUTD@db.pipfgovvnmhtzvemdvze.supabase.co:5432/postgres?sslmode=require
```

### 2. **NEXTAUTH_URL** (Required)
Your Vercel deployment URL:
```
https://your-app-name.vercel.app
```
Update this after first deployment with your actual Vercel domain.

### 3. **NEXTAUTH_SECRET** (Required)
Generate a new secret for production:
```bash
openssl rand -base64 32
```

Example output:
```
z/bvhw6R62oQcY+GWR98BzDiCTtbHC6cK+m1d4gN36g=
```

---

## 📝 All Your Supabase Connection Details

**Database:** postgres  
**Host:** db.pipfgovvnmhtzvemdvze.supabase.co  
**User:** postgres  
**Password:** V0JkUxEPK27PIUTD

**Connection Strings:**
- **Direct (port 5432):** `postgres://postgres.pipfgovvnmhtzvemdvze:V0JkUxEPK27PIUTD@db.pipfgovvnmhtzvemdvze.supabase.co:5432/postgres?sslmode=require`
- **Pooler (port 6543):** `postgres://postgres.pipfgovvnmhtzvemdvze:V0JkUxEPK27PIUTD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true`

---

## 🚀 Setup Steps

1. **Set Environment Variables in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `DATABASE_URL` = direct connection string (port 5432)
   - Add `NEXTAUTH_URL` = your Vercel URL
   - Add `NEXTAUTH_SECRET` = generated secret

2. **Deploy or Redeploy:**
   - If already deployed, click "Redeploy" in Vercel
   - Or push a new commit to trigger auto-deploy

3. **Run Migrations (After Deployment):**
   ```bash
   # Via Vercel CLI (recommended)
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

   OR use Vercel's post-deployment hooks, or manually run via Vercel dashboard functions.

---

## ⚠️ Important Notes

- **Use port 5432** for `DATABASE_URL` in Vercel (direct connection, not pooler)
- **Prisma migrations** require direct connections (not pooled)
- The **app runtime** can use pooled connections, but for simplicity, use direct for both
- Make sure **SSL mode is required** (`?sslmode=require`)

---

## ✅ Verification

After deployment:
1. Check Vercel build logs - should complete successfully
2. Check Vercel function logs - no database connection errors
3. Try signing up - creates user in database
4. Check Supabase dashboard - tables should exist

Your Prisma schema is ready for PostgreSQL! 🎉

