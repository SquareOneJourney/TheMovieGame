#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')
const { createClient } = require('@supabase/supabase-js')

const prisma = new PrismaClient()

// Test database connection
async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...')
    const userCount = await prisma.user.count()
    console.log(`✅ Database connected! Found ${userCount} users.`)
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
}

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    const { data, error } = await supabase.from('User').select('count').limit(1)
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return false
    }
    console.log('✅ Supabase connected!')
    return true
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message)
    return false
  }
}

// Test user creation flow
async function testUserCreation() {
  try {
    console.log('🔍 Testing user creation flow...')
    
    // Test creating a user with a UUID (like Supabase would)
    const testUserId = 'test-user-' + Date.now()
    const testUser = await prisma.user.create({
      data: {
        id: testUserId,
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: ''
      }
    })
    
    console.log('✅ User creation successful:', testUser.id)
    
    // Clean up
    await prisma.user.delete({
      where: { id: testUserId }
    })
    
    console.log('✅ User cleanup successful')
    return true
  } catch (error) {
    console.error('❌ User creation failed:', error.message)
    return false
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting authentication chain tests...\n')
  
  const dbTest = await testDatabaseConnection()
  const supabaseTest = await testSupabaseConnection()
  const userTest = await testUserCreation()
  
  console.log('\n📊 Test Results:')
  console.log(`Database: ${dbTest ? '✅' : '❌'}`)
  console.log(`Supabase: ${supabaseTest ? '✅' : '❌'}`)
  console.log(`User Creation: ${userTest ? '✅' : '❌'}`)
  
  if (dbTest && supabaseTest && userTest) {
    console.log('\n🎉 All tests passed! Authentication chain should work.')
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.')
  }
  
  await prisma.$disconnect()
}

runTests().catch(console.error)
