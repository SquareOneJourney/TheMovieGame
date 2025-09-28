#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')
const { createClient } = require('@supabase/supabase-js')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...\n')
    
    // Get users from Prisma database
    const prismaUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })
    
    console.log(`📊 Found ${prismaUsers.length} users in Prisma database:`)
    prismaUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`)
      console.log(`   Name: ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Created: ${user.createdAt}`)
      console.log(`   ID Type: ${user.id.length === 36 ? 'UUID (Supabase)' : 'CUID (Prisma)'}`)
      console.log('')
    })
    
    // Check if any users have CUID instead of UUID
    const cuidUsers = prismaUsers.filter(user => user.id.length !== 36)
    if (cuidUsers.length > 0) {
      console.log('⚠️  WARNING: Found users with CUID IDs instead of UUIDs:')
      cuidUsers.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`)
      })
      console.log('\nThese users will not be able to authenticate properly!')
    } else {
      console.log('✅ All users have proper UUID IDs from Supabase')
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
