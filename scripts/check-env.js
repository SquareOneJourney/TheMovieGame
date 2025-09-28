#!/usr/bin/env node

console.log('🔍 Checking environment variables...\n')

// Check required environment variables
const requiredVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'DATABASE_URL',
  'NEXT_PUBLIC_TMDB_BEARER_TOKEN'
]

const missingVars = []
const presentVars = []

requiredVars.forEach(varName => {
  if (process.env[varName]) {
    presentVars.push(varName)
    // Don't log sensitive values
    if (varName.includes('SECRET') || varName.includes('KEY') || varName.includes('URL')) {
      console.log(`✅ ${varName}: Set`)
    } else {
      console.log(`✅ ${varName}: ${process.env[varName]}`)
    }
  } else {
    missingVars.push(varName)
    console.log(`❌ ${varName}: Missing`)
  }
})

console.log('\n📊 Summary:')
console.log(`✅ Present: ${presentVars.length}/${requiredVars.length}`)
console.log(`❌ Missing: ${missingVars.length}/${requiredVars.length}`)

if (missingVars.length > 0) {
  console.log('\n⚠️  Missing environment variables:')
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`)
  })
  
  console.log('\n🔧 To fix this:')
  console.log('1. For local development: Add missing variables to .env.local')
  console.log('2. For Vercel deployment: Add missing variables in Vercel dashboard')
  console.log('   - Go to your Vercel project settings')
  console.log('   - Navigate to Environment Variables')
  console.log('   - Add the missing variables')
  
  if (missingVars.includes('NEXTAUTH_URL')) {
    console.log('\n🌐 NEXTAUTH_URL should be set to:')
    console.log('   - Local: http://localhost:3000')
    console.log('   - Production: https://your-app-name.vercel.app')
  }
}

console.log('\n🚀 Environment check complete!')
