import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Script to fix users with missing provider/providerId by syncing from Account table
 * This fixes the issue where provider/providerId weren't set during user creation
 */
async function fixProviderInfo() {
  try {
    console.log('🔧 Fixing provider/providerId for users...\n')

    // Find all users with missing provider or providerId
    const usersWithMissingInfo = await prisma.user.findMany({
      where: {
        OR: [
          { provider: '' },
          { providerId: '' },
        ],
      },
      include: {
        accounts: true,
      },
    })

    console.log(`📋 Found ${usersWithMissingInfo.length} users with missing provider info:\n`)

    let fixedCount = 0
    let skippedCount = 0

    for (const user of usersWithMissingInfo) {
      // Find the first account for this user (should only be one per user in our system)
      const account = user.accounts[0]

      if (!account) {
        console.log(`⚠️  User ${user.userID} (${user.name || 'No name'}) has no accounts - skipping`)
        skippedCount++
        continue
      }

      // Update user with provider info from account
      await prisma.user.update({
        where: { id: user.id },
        data: {
          provider: account.provider,
          providerId: account.providerAccountId,
        },
      })

      console.log(`✅ Fixed user ${user.userID} (${user.name || 'No name'}): ${account.provider} (${account.providerAccountId})`)
      fixedCount++
    }

    console.log(`\n📊 Summary:`)
    console.log(`  ✅ Fixed: ${fixedCount} users`)
    console.log(`  ⚠️  Skipped: ${skippedCount} users`)
    console.log(`\n✅ Done!`)
  } catch (error) {
    console.error('❌ Error fixing provider info:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

fixProviderInfo()

