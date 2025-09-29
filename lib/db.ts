// Temporary mock for build process
let PrismaClient: any
try {
  const prismaModule = require('@prisma/client')
  PrismaClient = prismaModule.PrismaClient
} catch (error) {
  // Mock PrismaClient for build process when @prisma/client is not available
  PrismaClient = class MockPrismaClient {
    constructor() {}
    // Add mock methods as needed
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
