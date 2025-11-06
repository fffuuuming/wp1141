import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Script to unlink accounts and create separate users for each provider
 * This fixes the issue where accounts from different providers were linked together
 */
async function unlinkAndSeparateAccounts() {
  try {
    console.log('🔍 Finding users with multiple accounts (linked accounts)...\n')

    const users = await prisma.user.findMany({
      include: {
        accounts: true,
      },
    })

    const usersWithMultipleAccounts = users.filter(u => u.accounts.length > 1)

    if (usersWithMultipleAccounts.length === 0) {
      console.log('✅ No linked accounts found - all accounts are already separate!')
      return
    }

    console.log(`📋 Found ${usersWithMultipleAccounts.length} users with linked accounts:\n`)

    for (const user of usersWithMultipleAccounts) {
      console.log(`\n🔧 Processing user: ${user.userID} (${user.name || 'No name'})`)
      console.log(`   Has ${user.accounts.length} accounts: ${user.accounts.map(a => a.provider).join(', ')}`)

      // Keep the first account with the original user
      const primaryAccount = user.accounts[0]
      const otherAccounts = user.accounts.slice(1)

      console.log(`   Keeping ${primaryAccount.provider} account with original user`)
      console.log(`   Separating ${otherAccounts.length} other account(s)...`)

      // Update the original user's provider info to match the primary account
      await prisma.user.update({
        where: { id: user.id },
        data: {
          provider: primaryAccount.provider,
          providerId: primaryAccount.providerAccountId,
        },
      })

      // Create separate users for each other account
      for (const account of otherAccounts) {
        // Generate a unique temporary userID
        let tempUserID = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`
        let exists = await prisma.user.findUnique({ where: { userID: tempUserID } })
        while (exists) {
          tempUserID = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`
          exists = await prisma.user.findUnique({ where: { userID: tempUserID } })
        }

        // Create new user for this provider
        const newUser = await prisma.user.create({
          data: {
            userID: tempUserID,
            email: user.email, // Same email, but different account
            name: user.name,
            image: user.image,
            provider: account.provider,
            providerId: account.providerAccountId,
          },
        })

        // Update the account to point to the new user
        await prisma.account.update({
          where: { id: account.id },
          data: {
            userId: newUser.id,
          },
        })

        console.log(`   ✅ Created separate user for ${account.provider} account`)
      }
    }

    console.log('\n✅ All accounts have been separated!')
    console.log('\n💡 Users with temporary userIDs will need to set their permanent userID on next login.')
  } catch (error) {
    console.error('❌ Error unlinking accounts:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

unlinkAndSeparateAccounts()

