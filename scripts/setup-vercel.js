#!/usr/bin/env node

/**
 * Vercel Environment Variables Setup Script
 * 
 * This script helps you set up environment variables in Vercel
 * Run: node scripts/setup-vercel.js
 */

const { execSync } = require('child_process');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function execCommand(command) {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
}

async function main() {
  console.log('🚀 YearZero - Vercel Environment Setup\n');
  console.log('========================================\n');

  // Check if Vercel CLI is installed
  try {
    execCommand('vercel --version');
  } catch (error) {
    console.error('❌ Vercel CLI is not installed.');
    console.error('   Install it with: npm i -g vercel\n');
    process.exit(1);
  }

  // Check if logged in
  try {
    execCommand('vercel whoami');
  } catch (error) {
    console.error('❌ Not logged in to Vercel.');
    console.error('   Run: vercel login\n');
    process.exit(1);
  }

  console.log('✅ Vercel CLI is installed and you\'re logged in\n');

  // Get environment variables
  const databaseUrl = await question('Enter your Supabase DATABASE_URL (non-pooling, port 5432): ');
  
  let nextAuthSecret = await question('Enter NEXTAUTH_SECRET (or press Enter to generate one): ');
  if (!nextAuthSecret) {
    nextAuthSecret = crypto.randomBytes(32).toString('base64');
    console.log(`✅ Generated NEXTAUTH_SECRET: ${nextAuthSecret}\n`);
  }

  const nextAuthUrl = await question('Enter your Vercel app URL (e.g., https://yearzero.vercel.app): ');

  console.log('\n📝 Setting environment variables in Vercel...\n');

  const environments = ['production', 'preview', 'development'];

  for (const env of environments) {
    console.log(`Setting variables for ${env}...`);
    
    try {
      // Note: This is a simplified version. In practice, you'd use Vercel API or CLI
      // For now, we'll output the commands
      console.log(`\nFor ${env}, run these commands:`);
      console.log(`  vercel env add DATABASE_URL ${env}`);
      console.log(`  vercel env add NEXTAUTH_SECRET ${env}`);
      console.log(`  vercel env add NEXTAUTH_URL ${env}`);
    } catch (error) {
      console.error(`Error setting ${env} variables:`, error.message);
    }
  }

  console.log('\n✅ Setup complete!\n');
  console.log('📋 Your values:');
  console.log(`   DATABASE_URL: ${databaseUrl.substring(0, 50)}...`);
  console.log(`   NEXTAUTH_SECRET: ${nextAuthSecret}`);
  console.log(`   NEXTAUTH_URL: ${nextAuthUrl}\n`);

  console.log('🔄 Next steps:');
  console.log('   1. Run the vercel env add commands shown above');
  console.log('   2. Deploy your app: vercel --prod');
  console.log('   3. Run migrations: npx prisma migrate deploy\n');

  rl.close();
}

main().catch(console.error);

