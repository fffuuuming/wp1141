import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Script to fix users with missing provider information
 * This syncs provider info from Account model to User model
 */
async function fixUserProviders() {
  try {
    console.log('🔍 Finding users with missing provider information...')

    // Find all users with empty provider
    const usersWithMissingProvider = await prisma.user.findMany({
      where: {
        provider: '',
      },
      select: {
        id: true,
        userID: true,
        name: true,
        provider: true,
      },
    })

    console.log(`📋 Found ${usersWithMissingProvider.length} users with missing provider`)

    if (usersWithMissingProvider.length === 0) {
      console.log('✅ All users have provider information!')
      return
    }

    // Fix each user
    for (const user of usersWithMissingProvider) {
      // Get the account for this user
      const account = await prisma.account.findFirst({
        where: { userId: user.id },
        select: {
          provider: true,
          providerAccountId: true,
        },
      })

      if (account) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            provider: account.provider,
            providerId: account.providerAccountId,
          },
        })
        console.log(`✅ Fixed user ${user.userID} (${user.name || 'No name'}) - Provider: ${account.provider}`)
      } else {
        console.warn(`⚠️  User ${user.userID} (${user.name || 'No name'}) has no account record`)
      }
    }

    console.log('\n✅ All users have been processed!')
  } catch (error) {
    console.error('❌ Error fixing user providers:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

fixUserProviders()

