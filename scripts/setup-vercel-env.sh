#!/bin/bash

# Setup script for Vercel environment variables
# This script helps you set up your Vercel environment variables

echo "🚀 YearZero - Vercel Environment Setup"
echo "========================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "   Install it with: npm i -g vercel"
    exit 1
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel."
    echo "   Run: vercel login"
    exit 1
fi

echo "✅ Vercel CLI is installed and you're logged in"
echo ""

# Get Supabase connection string
read -p "Enter your Supabase DATABASE_URL (non-pooling, port 5432): " DATABASE_URL

# Generate NEXTAUTH_SECRET if not provided
read -p "Enter NEXTAUTH_SECRET (or press Enter to generate one): " NEXTAUTH_SECRET
if [ -z "$NEXTAUTH_SECRET" ]; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo "✅ Generated NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
fi

# Get Vercel URL
read -p "Enter your Vercel app URL (e.g., https://yearzero.vercel.app): " NEXTAUTH_URL

echo ""
echo "📝 Setting environment variables in Vercel..."
echo ""

# Set environment variables for Production
vercel env add DATABASE_URL production <<< "$DATABASE_URL"
vercel env add NEXTAUTH_SECRET production <<< "$NEXTAUTH_SECRET"
vercel env add NEXTAUTH_URL production <<< "$NEXTAUTH_URL"

# Set for Preview
vercel env add DATABASE_URL preview <<< "$DATABASE_URL"
vercel env add NEXTAUTH_SECRET preview <<< "$NEXTAUTH_SECRET"
vercel env add NEXTAUTH_URL preview <<< "$NEXTAUTH_URL"

# Set for Development
vercel env add DATABASE_URL development <<< "$DATABASE_URL"
vercel env add NEXTAUTH_SECRET development <<< "$NEXTAUTH_SECRET"
vercel env add NEXTAUTH_URL development <<< "$NEXTAUTH_URL"

echo ""
echo "✅ Environment variables set!"
echo ""
echo "📋 Summary:"
echo "   DATABASE_URL: Set (hidden)"
echo "   NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo "   NEXTAUTH_URL: $NEXTAUTH_URL"
echo ""
echo "🔄 Next steps:"
echo "   1. Deploy your app: vercel --prod"
echo "   2. Run migrations: npx prisma migrate deploy"
echo ""

