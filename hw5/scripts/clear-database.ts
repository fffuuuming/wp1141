import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearDatabase() {
  console.log('🗑️  Clearing all data from database...')
  
  try {
    // Delete in order to respect foreign key constraints
    await prisma.like.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.repost.deleteMany()
    await prisma.follow.deleteMany()
    await prisma.draft.deleteMany()
    await prisma.post.deleteMany()
    await prisma.user.deleteMany()
    
    console.log('✅ All data cleared successfully!')
  } catch (error) {
    console.error('❌ Error clearing database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearDatabase()

