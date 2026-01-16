#!/bin/bash

# Automatic Vercel Environment Setup Script
# This script sets up all required environment variables in Vercel

set -e

echo "🚀 YearZero - Automatic Vercel Environment Setup"
echo "=================================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "   Installing Vercel CLI..."
    npm i -g vercel
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel."
    echo "   Please run: vercel login"
    echo "   Then run this script again."
    exit 1
fi

echo "✅ Vercel CLI is ready"
echo ""

# Values from your Supabase setup
DATABASE_URL="postgres://postgres.pipfgovvnmhtzvemdvze:V0JkUxEPK27PIUTD@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
NEXTAUTH_SECRET="1DpYt0wo34s4oVS3ZChIn66wjr1CwRpZ9Zcghs0RFMg="

# Get Vercel URL
echo "Enter your Vercel app URL (or press Enter to set placeholder - update after deployment):"
read -p "NEXTAUTH_URL: " NEXTAUTH_URL

if [ -z "$NEXTAUTH_URL" ]; then
    NEXTAUTH_URL="https://your-app-name.vercel.app"
    echo "⚠️  Using placeholder URL. Remember to update after deployment!"
fi

echo ""
echo "📝 Setting environment variables..."
echo ""

# Function to set env var
set_env_var() {
    local var_name=$1
    local var_value=$2
    local env=$3
    
    echo "Setting $var_name for $env..."
    echo "$var_value" | vercel env add "$var_name" "$env" 2>&1 | grep -v "Enter" || true
}

# Set for all environments
for env in production preview development; do
    echo ""
    echo "📦 Setting up $env environment..."
    set_env_var "DATABASE_URL" "$DATABASE_URL" "$env"
    set_env_var "NEXTAUTH_SECRET" "$NEXTAUTH_SECRET" "$env"
    set_env_var "NEXTAUTH_URL" "$NEXTAUTH_URL" "$env"
done

echo ""
echo "✅ Environment variables set successfully!"
echo ""
echo "📋 Summary:"
echo "   DATABASE_URL: ✅ Set (Supabase PostgreSQL)"
echo "   NEXTAUTH_SECRET: ✅ Set"
echo "   NEXTAUTH_URL: $NEXTAUTH_URL"
echo ""
echo "🔄 Next steps:"
echo "   1. Deploy your app: vercel --prod"
echo "   2. If NEXTAUTH_URL was a placeholder, update it with your actual URL"
echo "   3. Run database migrations: npx prisma migrate deploy"
echo ""

