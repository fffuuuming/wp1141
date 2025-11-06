import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Script to delete a test user by email or userID
 * Usage: tsx scripts/delete-test-user.ts <email|userID>
 * Example: tsx scripts/delete-test-user.ts test@example.com
 * Example: tsx scripts/delete-test-user.ts testuser123
 */
async function deleteTestUser() {
  const identifier = process.argv[2]

  if (!identifier) {
    console.error('❌ Please provide an email or userID to delete')
    console.log('Usage: tsx scripts/delete-test-user.ts <email|userID>')
    process.exit(1)
  }

  try {
    console.log(`🔍 Searching for user: ${identifier}...`)

    // Try to find by email first, then by userID
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { userID: identifier },
        ],
      },
      select: {
        id: true,
        userID: true,
        email: true,
        name: true,
        provider: true,
      },
    })

    if (!user) {
      console.error(`❌ User not found: ${identifier}`)
      process.exit(1)
    }

    console.log(`📋 Found user:`)
    console.log(`   ID: ${user.id}`)
    console.log(`   UserID: ${user.userID}`)
    console.log(`   Email: ${user.email || 'N/A'}`)
    console.log(`   Name: ${user.name || 'N/A'}`)
    console.log(`   Provider: ${user.provider}`)
    console.log(`\n🗑️  Deleting user and all associated data...`)

    // Delete the user - this will cascade delete all related data
    await prisma.user.delete({
      where: { id: user.id },
    })

    console.log(`✅ User deleted successfully!`)
    console.log(`\n💡 You can now re-register with the same OAuth account.`)
  } catch (error) {
    console.error('❌ Error deleting user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

deleteTestUser()

