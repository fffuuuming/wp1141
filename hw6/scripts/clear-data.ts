/**
 * Clear All Data Script (Except Embeddings)
 * Clears all User, Conversation, and Message data
 * Preserves KnowledgeBase documents (which contain embeddings)
 * 
 * Usage:
 *   npm run clear:data
 *   npm run clear:data -- --confirm  (skip confirmation prompt)
 */

// IMPORTANT: Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Explicitly load .env.local file (Next.js convention)
const envLocalPath = resolve(process.cwd(), '.env.local');
const envPath = resolve(process.cwd(), '.env');

if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
} else if (existsSync(envPath)) {
  dotenv.config({ path: envPath, override: true });
}

// Now import modules (but use dynamic imports for modules that depend on config)
import mongoose from 'mongoose';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    confirm: args.includes('--confirm'),
  };
}

async function getCounts(
  User: typeof import('../lib/models').User,
  Conversation: typeof import('../lib/models').Conversation,
  Message: typeof import('../lib/models').Message,
  KnowledgeBase: typeof import('../lib/models').KnowledgeBase
) {
  const [userCount, conversationCount, messageCount, knowledgeBaseCount] = await Promise.all([
    User.countDocuments(),
    Conversation.countDocuments(),
    Message.countDocuments(),
    KnowledgeBase.countDocuments(),
  ]);

  return {
    userCount,
    conversationCount,
    messageCount,
    knowledgeBaseCount,
  };
}

async function clearData() {
  try {
    // Dynamically import modules that depend on config AFTER env vars are loaded
    const { config } = await import('../lib/config');
    const { User, Conversation, Message, KnowledgeBase } = await import('../lib/models');

    // Connect to database
    log('Connecting to database...', 'cyan');
    await mongoose.connect(config.MONGODB_URI, {
      bufferCommands: false,
    });
    log('✅ Connected to database', 'green');

    // Get current counts
    log('\n📊 Current data counts:', 'blue');
    const beforeCounts = await getCounts(User, Conversation, Message, KnowledgeBase);
    log(`  Users: ${beforeCounts.userCount}`, 'reset');
    log(`  Conversations: ${beforeCounts.conversationCount}`, 'reset');
    log(`  Messages: ${beforeCounts.messageCount}`, 'reset');
    log(`  Knowledge Base items: ${beforeCounts.knowledgeBaseCount} (will be preserved)`, 'yellow');

    // Check if there's any data to clear
    const totalToClear = beforeCounts.userCount + beforeCounts.conversationCount + beforeCounts.messageCount;
    if (totalToClear === 0) {
      log('\n✅ No data to clear. Database is already empty.', 'green');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Confirmation prompt
    const args = parseArgs();
    if (!args.confirm) {
      log('\n⚠️  WARNING: This will delete ALL user, conversation, and message data!', 'red');
      log('   Knowledge Base items (with embeddings) will be preserved.', 'yellow');
      log('\n   To proceed, run with --confirm flag:', 'reset');
      log('   npm run clear:data -- --confirm', 'cyan');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Clear data
    log('\n🗑️  Clearing data...', 'yellow');
    
    const [userResult, conversationResult, messageResult] = await Promise.all([
      User.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
    ]);

    log(`  ✅ Deleted ${userResult.deletedCount} users`, 'green');
    log(`  ✅ Deleted ${conversationResult.deletedCount} conversations`, 'green');
    log(`  ✅ Deleted ${messageResult.deletedCount} messages`, 'green');
    log(`  ✅ Preserved ${beforeCounts.knowledgeBaseCount} Knowledge Base items`, 'green');

    // Verify counts
    log('\n📊 Final data counts:', 'blue');
    const afterCounts = await getCounts(User, Conversation, Message, KnowledgeBase);
    log(`  Users: ${afterCounts.userCount}`, 'reset');
    log(`  Conversations: ${afterCounts.conversationCount}`, 'reset');
    log(`  Messages: ${afterCounts.messageCount}`, 'reset');
    log(`  Knowledge Base items: ${afterCounts.knowledgeBaseCount}`, 'green');

    log('\n✅ Data cleared successfully!', 'green');
    log('   Knowledge Base embeddings are preserved.', 'yellow');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    log('\n❌ Error clearing data:', 'red');
    console.error(error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

// Run the script
clearData();

