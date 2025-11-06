import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Script to find and fix users without Account records
 * These are orphaned users that were created but never got an Account
 */
async function fixOrphanedUsers() {
  try {
    console.log('🔍 Finding users without Account records...\n')

    // Find all users
    const allUsers = await prisma.user.findMany({
      include: {
        accounts: true,
      },
    })

    const orphanedUsers = allUsers.filter(u => u.accounts.length === 0)

    if (orphanedUsers.length === 0) {
      console.log('✅ No orphaned users found!')
      return
    }

    console.log(`📋 Found ${orphanedUsers.length} orphaned user(s):\n`)

    for (const user of orphanedUsers) {
      console.log(`User: ${user.userID} (${user.name || 'No name'})`)
      console.log(`  Email: ${user.email || 'No email'}`)
      console.log(`  Provider: ${user.provider || 'Not set'}`)
      console.log(`  ProviderId: ${user.providerId || 'Not set'}`)
      console.log(`  Created: ${user.createdAt}`)
      console.log('')

      // Ask if we should delete this user
      // For now, we'll just log them - you can manually delete if needed
      console.log(`  ⚠️  This user has no Account record and cannot be used for authentication.`)
      console.log(`  💡 You can delete this user manually or they will be cleaned up automatically.\n`)
    }

    console.log('\n💡 To delete orphaned users, you can use:')
    console.log('   npm run db:clear  (clears all data)')
    console.log('   Or manually delete via Prisma Studio: npm run db:studio')
  } catch (error) {
    console.error('❌ Error fixing orphaned users:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

fixOrphanedUsers()

