import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearDatabase() {
  console.log('🗑️  Clearing all data from database...')
  
  try {
    // Delete in order to respect foreign key constraints
    // Note: Comments are stored as Posts with parentId, so deleting posts will delete all comments
    await prisma.like.deleteMany()
    await prisma.repost.deleteMany()
    await prisma.follow.deleteMany()
    await prisma.draft.deleteMany()
    await prisma.post.deleteMany() // This deletes all posts and comments (replies)
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

