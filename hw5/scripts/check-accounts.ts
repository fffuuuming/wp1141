import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Script to check account linking and show all users with their accounts
 */
async function checkAccounts() {
  try {
    console.log('🔍 Checking all users and their accounts...\n')

    const users = await prisma.user.findMany({
      include: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`📋 Found ${users.length} users:\n`)

    for (const user of users) {
      console.log(`User: ${user.userID} (${user.name || 'No name'})`)
      console.log(`  Email: ${user.email || 'No email'}`)
      console.log(`  Provider: ${user.provider || 'Not set'}`)
      console.log(`  ProviderId: ${user.providerId || 'Not set'}`)
      console.log(`  Accounts (${user.accounts.length}):`)
      for (const account of user.accounts) {
        console.log(`    - ${account.provider} (${account.providerAccountId})`)
      }
      console.log('')
    }

    // Check for users with multiple accounts (linked accounts)
    const usersWithMultipleAccounts = users.filter(u => u.accounts.length > 1)
    if (usersWithMultipleAccounts.length > 0) {
      console.log(`⚠️  Found ${usersWithMultipleAccounts.length} users with multiple accounts (linked):`)
      for (const user of usersWithMultipleAccounts) {
        console.log(`  - ${user.userID}: ${user.accounts.map(a => a.provider).join(', ')}`)
      }
    } else {
      console.log('✅ No linked accounts found - each provider has separate accounts')
    }
  } catch (error) {
    console.error('❌ Error checking accounts:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkAccounts()

