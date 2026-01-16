# Build Error Fix: NextAuth Configuration

## ✅ Fixes Applied

1. **Added `dynamic = 'force-dynamic'`** to `/api/auth/[...nextauth]/route.ts`
   - Prevents NextAuth from trying to pre-render during build
   - Forces the route to be server-rendered at runtime

2. **Added `secret` to `authOptions`** in `/lib/auth.ts`
   - Explicitly sets the NextAuth secret from environment variables
   - Required for NextAuth to work properly

## 🔑 Required Environment Variables in Vercel

**Make sure these are set BEFORE deploying:**

### 1. **NEXTAUTH_SECRET** (REQUIRED)
```
Generate with: openssl rand -base64 32
```
- **This MUST be set in Vercel** before building
- NextAuth requires this to sign JWT tokens

### 2. **NEXTAUTH_URL** (REQUIRED)
```
Example: https://your-app.vercel.app
```
- Your Vercel deployment URL
- Can be updated after first deploy

### 3. **DATABASE_URL** (REQUIRED)
```
PostgreSQL connection string
```
- Your Supabase PostgreSQL connection string

## 🚀 Steps to Fix Deployment

1. **Go to Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. **Add/Verify these 3 variables:**
   - `NEXTAUTH_SECRET` = [generate with `openssl rand -base64 32`]
   - `NEXTAUTH_URL` = `https://your-app.vercel.app` (your actual Vercel URL)
   - `DATABASE_URL` = `postgres://...` (your Supabase connection string)

3. **Important:** Make sure `NEXTAUTH_SECRET` is set for **ALL environments** (Production, Preview, Development)

4. **Redeploy:**
   - Go to **Deployments** tab
   - Click **"Redeploy"** on the latest deployment
   - Or push a new commit to trigger auto-deploy

## ⚠️ Common Issues

### "NEXTAUTH_SECRET is not set"
- **Solution:** Add `NEXTAUTH_SECRET` environment variable in Vercel
- Make sure it's set for the environment you're deploying to

### "Failed to collect page data for /api/auth/[...nextauth]"
- **Solution:** The `dynamic = 'force-dynamic'` export should fix this
- Also ensure `NEXTAUTH_SECRET` is set

### Build succeeds but app doesn't work
- **Check:** Verify all 3 required environment variables are set
- **Check:** Make sure `NEXTAUTH_URL` matches your actual Vercel domain

## ✅ Verification

After deployment:
1. Build should complete successfully ✓
2. Visit your Vercel URL
3. Try signing up - should work ✓
4. Try logging in - should work ✓

The fixes have been committed and pushed to GitHub. Redeploy in Vercel after setting environment variables.

