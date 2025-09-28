#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate a secure random secret
const generateSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('🔧 Creating .env.local file...');
  
  if (fs.existsSync(envExamplePath)) {
    // Copy from env.example
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    const envContent = envExample.replace(
      'NEXTAUTH_SECRET="your-secret-key-here"',
      `NEXTAUTH_SECRET="${generateSecret()}"`
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local created with secure NEXTAUTH_SECRET');
  } else {
    // Create basic .env.local
    const basicEnv = `# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${generateSecret()}"

# Add your other environment variables here
# Copy from env.example for reference
`;
    fs.writeFileSync(envPath, basicEnv);
    console.log('✅ .env.local created with basic configuration');
  }
} else {
  console.log('📝 .env.local already exists');
  
  // Check if NEXTAUTH_SECRET is set
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('NEXTAUTH_SECRET="your-secret-key-here"') || !envContent.includes('NEXTAUTH_SECRET=')) {
    console.log('⚠️  NEXTAUTH_SECRET needs to be set in .env.local');
    console.log('   Please update your .env.local file with a secure secret');
  } else {
    console.log('✅ NEXTAUTH_SECRET is configured');
  }
}

console.log('\n🚀 Environment setup complete!');
console.log('   Make sure to add your Supabase and other API keys to .env.local');
