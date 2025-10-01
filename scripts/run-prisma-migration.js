#!/usr/bin/env node

/**
 * Script to run Prisma migration for the 5 actors update
 * This will update the database schema to include the new actor fields
 */

const { execSync } = require('child_process');
const path = require('path');

async function runPrismaMigration() {
  try {
    console.log('🔄 Running Prisma migration...');
    
    // Change to project directory
    const projectRoot = path.join(__dirname, '..');
    process.chdir(projectRoot);

    // Generate Prisma client
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Push schema changes to database
    console.log('🚀 Pushing schema changes to database...');
    execSync('npx prisma db push', { stdio: 'inherit' });

    console.log('✅ Prisma migration completed successfully!');
    console.log('📊 Database schema updated with 5 actor fields');

  } catch (error) {
    console.error('❌ Prisma migration failed:', error.message);
    console.error('💡 Make sure your DATABASE_URL is configured correctly');
    process.exit(1);
  }
}

// Run migration
runPrismaMigration();
