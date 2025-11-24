/**
 * Knowledge Base Seeding Script
 * Seeds the database with initial DeFi knowledge base content
 * 
 * Usage:
 *   npm run seed:knowledge-base
 *   npm run seed:knowledge-base -- --regenerate  (regenerate embeddings for all items)
 *   npm run seed:knowledge-base -- --id <id>     (regenerate embedding for specific item)
 */

// IMPORTANT: Load environment variables FIRST before any other imports
// This must happen synchronously before any module that imports config
import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Explicitly load .env.local file (Next.js convention) - this overrides .env
const envLocalPath = resolve(process.cwd(), '.env.local');
const envPath = resolve(process.cwd(), '.env');

if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
} else if (existsSync(envPath)) {
  dotenv.config({ path: envPath, override: true });
}

// Now import modules - but we need to use dynamic imports for modules that depend on config
import mongoose from 'mongoose';
import { INITIAL_KNOWLEDGE_BASE } from '../lib/data/defi-knowledge-base';
import type { KnowledgeBaseItem } from '../lib/data/defi-knowledge-base';

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
    regenerate: args.includes('--regenerate'),
    id: args.find((arg) => arg.startsWith('--id='))?.split('=')[1],
  };
}

async function seedKnowledgeBase(regenerate: boolean = false) {
  try {
    // Dynamically import modules that depend on config AFTER env vars are loaded
    const { default: connectDB } = await import('../lib/utils/mongodb');
    const { knowledgeBaseRepository } = await import('../lib/repositories/mongoose');
    const { embeddingService } = await import('../lib/services/embeddingService');

    log('\n🌱 Starting Knowledge Base Seeding...\n', 'blue');

    // Connect to database
    log('📡 Connecting to MongoDB...', 'cyan');
    await connectDB();
    log('✅ Connected to MongoDB\n', 'green');

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Process each knowledge base item
    for (let i = 0; i < INITIAL_KNOWLEDGE_BASE.length; i++) {
      const item = INITIAL_KNOWLEDGE_BASE[i];
      const progress = `[${i + 1}/${INITIAL_KNOWLEDGE_BASE.length}]`;

      try {
        // Check if item already exists (by question)
        const existing = await knowledgeBaseRepository.findAll();
        const existingItem = existing.find((kb) => kb.question === item.question);

        // Generate embedding for the question (used for search)
        log(
          `${progress} Generating embedding: ${item.question.substring(0, 50)}...`,
          'cyan'
        );
        const embedding = await embeddingService.generateEmbedding(item.question);

        if (existingItem) {
          if (regenerate || !existingItem.embedding || existingItem.embedding.length === 0) {
            // Update existing item with embedding
            log(
              `${progress} Updating: ${item.question.substring(0, 50)}...`,
              'yellow'
            );
            await knowledgeBaseRepository.update(existingItem._id, {
              answer: item.answer,
              category: item.category,
              metadata: item.metadata as Record<string, unknown>,
              embedding: embedding,
            });
            updated++;
          } else {
            log(
              `${progress} Skipped (exists with embedding): ${item.question.substring(0, 50)}...`,
              'yellow'
            );
            skipped++;
          }
        } else {
          // Create new item with embedding
          log(
            `${progress} Creating: ${item.question.substring(0, 50)}...`,
            'cyan'
          );
          await knowledgeBaseRepository.create({
            question: item.question,
            answer: item.answer,
            category: item.category,
            metadata: item.metadata as Record<string, unknown>,
            embedding: embedding,
          });
          created++;
        }

        // Add small delay to avoid rate limits
        if (i < INITIAL_KNOWLEDGE_BASE.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 200)); // 200ms delay
        }
      } catch (error) {
        log(
          `${progress} ❌ Error processing: ${item.question.substring(0, 50)}...`,
          'red'
        );
        log(`   Error: ${error instanceof Error ? error.message : String(error)}`, 'red');
        errors++;
      }
    }

    // Summary
    log('\n' + '='.repeat(60), 'blue');
    log('\n📊 Seeding Summary:', 'blue');
    log(`  ✅ Created: ${created}`, 'green');
    log(`  🔄 Updated: ${updated}`, 'yellow');
    log(`  ⏭️  Skipped: ${skipped}`, 'yellow');
    if (errors > 0) {
      log(`  ❌ Errors: ${errors}`, 'red');
    }
    log('='.repeat(60) + '\n', 'blue');

    process.exit(0);
  } catch (error) {
    log('\n❌ Fatal error during seeding:', 'red');
    log(`   ${error instanceof Error ? error.message : String(error)}`, 'red');
    if (error instanceof Error && error.stack) {
      log(`\n${error.stack}`, 'red');
    }
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    log('🔌 Database connection closed', 'cyan');
  }
}

async function regenerateEmbedding(id: string) {
  try {
    // Dynamically import modules that depend on config AFTER env vars are loaded
    const { default: connectDB } = await import('../lib/utils/mongodb');
    const { knowledgeBaseRepository } = await import('../lib/repositories/mongoose');
    const { embeddingService } = await import('../lib/services/embeddingService');

    log(`\n🔄 Regenerating embedding for item: ${id}\n`, 'blue');

    await connectDB();
    log('✅ Connected to MongoDB\n', 'green');

    const item = await knowledgeBaseRepository.findById(id);
    if (!item) {
      log(`❌ Knowledge base item not found: ${id}`, 'red');
      process.exit(1);
    }

    log(`📝 Item: ${item.question}`, 'cyan');
    log('🔄 Generating new embedding...', 'cyan');

    const embedding = await embeddingService.generateEmbedding(item.question);
    await knowledgeBaseRepository.update(item._id, {
      embedding: embedding,
    });

    log('✅ Embedding regenerated successfully', 'green');
    log(`   Dimensions: ${embedding.length}`, 'cyan');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    log('\n❌ Error:', 'red');
    log(`   ${error instanceof Error ? error.message : String(error)}`, 'red');
    if (error instanceof Error && error.stack) {
      log(`\n${error.stack}`, 'red');
    }
    process.exit(1);
  }
}

async function main() {
  const args = parseArgs();

  if (args.id) {
    await regenerateEmbedding(args.id);
  } else {
    await seedKnowledgeBase(args.regenerate);
  }
}

// Run if executed directly
main().catch((error) => {
  log(`\n❌ Unhandled error: ${error}`, 'red');
  process.exit(1);
});

