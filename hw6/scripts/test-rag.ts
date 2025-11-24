/**
 * RAG Workflow Test Script
 * Tests the RAG system with various question types and edge cases
 * 
 * Usage:
 *   npm run test:rag
 *   npm run test:rag -- --verbose  (show detailed output)
 */

// IMPORTANT: Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

const envLocalPath = resolve(process.cwd(), '.env.local');
const envPath = resolve(process.cwd(), '.env');

if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
} else if (existsSync(envPath)) {
  dotenv.config({ path: envPath, override: true });
}

// Dynamic imports after env vars are loaded
import mongoose from 'mongoose';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

interface TestCase {
  question: string;
  category: string;
  expectedCategory?: string;
  description: string;
  shouldHaveResults: boolean;
}

// Test cases covering various scenarios
const testCases: TestCase[] = [
  // Basic DeFi questions
  {
    question: '什麼是 DeFi？',
    category: 'basic',
    expectedCategory: 'defi-basics',
    description: 'Basic DeFi definition question',
    shouldHaveResults: true,
  },
  {
    question: 'DeFi 是什麼意思？',
    category: 'basic',
    expectedCategory: 'defi-basics',
    description: 'Alternative phrasing of DeFi question',
    shouldHaveResults: true,
  },
  {
    question: '請解釋一下去中心化金融',
    category: 'basic',
    expectedCategory: 'defi-basics',
    description: 'Request-style question',
    shouldHaveResults: true,
  },

  // DEX questions
  {
    question: '什麼是去中心化交易所？',
    category: 'dex',
    expectedCategory: 'dex',
    description: 'DEX definition question',
    shouldHaveResults: true,
  },
  {
    question: 'Uniswap 怎麼用？',
    category: 'dex',
    expectedCategory: 'dex',
    description: 'How-to question about DEX',
    shouldHaveResults: true,
  },
  {
    question: 'DEX 和 CEX 差在哪裡？',
    category: 'dex',
    expectedCategory: 'dex',
    description: 'Comparison question',
    shouldHaveResults: true,
  },

  // Liquidity mining questions
  {
    question: '流動性挖礦是什麼？',
    category: 'liquidity',
    expectedCategory: 'liquidity-mining',
    description: 'Liquidity mining question',
    shouldHaveResults: true,
  },
  {
    question: '無常損失是什麼意思？',
    category: 'liquidity',
    expectedCategory: 'liquidity-mining',
    description: 'Impermanent loss question',
    shouldHaveResults: true,
  },
  {
    question: 'APY 和 APR 有什麼差別？',
    category: 'liquidity',
    expectedCategory: 'liquidity-mining',
    description: 'APY vs APR question',
    shouldHaveResults: true,
  },

  // Lending questions
  {
    question: '借貸協議如何運作？',
    category: 'lending',
    expectedCategory: 'lending',
    description: 'Lending protocol question',
    shouldHaveResults: true,
  },
  {
    question: '什麼是超額抵押？',
    category: 'lending',
    expectedCategory: 'lending',
    description: 'Over-collateralization question',
    shouldHaveResults: true,
  },
  {
    question: '如何避免被清算？',
    category: 'lending',
    expectedCategory: 'lending',
    description: 'Liquidation prevention question',
    shouldHaveResults: true,
  },

  // Risk questions
  {
    question: 'DeFi 有哪些風險？',
    category: 'risk',
    expectedCategory: 'risks',
    description: 'Risk question',
    shouldHaveResults: true,
  },
  {
    question: '如何保護私鑰？',
    category: 'risk',
    expectedCategory: 'risks',
    description: 'Security question',
    shouldHaveResults: true,
  },

  // Smart contract questions
  {
    question: '智能合約安全嗎？',
    category: 'smart-contract',
    expectedCategory: 'smart-contracts',
    description: 'Smart contract security question',
    shouldHaveResults: true,
  },
  {
    question: 'Gas 費怎麼算？',
    category: 'smart-contract',
    expectedCategory: 'smart-contracts',
    description: 'Gas fee question',
    shouldHaveResults: true,
  },

  // Edge cases
  {
    question: '今天天氣如何？',
    category: 'edge-case',
    description: 'Non-DeFi question (should have no/low similarity)',
    shouldHaveResults: false,
  },
  {
    question: '什麼是 NFT？',
    category: 'edge-case',
    description: 'Related but different topic (NFT, not DeFi)',
    shouldHaveResults: false,
  },
  {
    question: 'What is DeFi?',
    category: 'edge-case',
    description: 'English question (should handle gracefully)',
    shouldHaveResults: true, // Might still find results
  },
  {
    question: 'DeFi 和傳統金融的差異是什麼？',
    category: 'edge-case',
    expectedCategory: 'defi-basics',
    description: 'Very similar to existing question',
    shouldHaveResults: true,
  },
];

async function testRAG() {
  try {
    // Dynamically import modules that depend on config
    const { default: connectDB } = await import('../lib/utils/mongodb');
    const { knowledgeBaseService } = await import('../lib/services/knowledgeBaseService');
    const { ragService } = await import('../lib/services/ragService');

    log('\n🧪 Starting RAG Workflow Tests...\n', 'blue');

    // Connect to database
    log('📡 Connecting to MongoDB...', 'cyan');
    await connectDB();
    log('✅ Connected to MongoDB\n', 'green');

    // Check if knowledge base has items
    const allItems = await knowledgeBaseService.getAll();
    if (allItems.length === 0) {
      log('❌ Knowledge base is empty! Please run: npm run seed:knowledge-base', 'red');
      process.exit(1);
    }

    log(`📚 Knowledge base has ${allItems.length} items\n`, 'cyan');

    // Test statistics
    let passed = 0;
    let failed = 0;
    const results: Array<{
      question: string;
      passed: boolean;
      searchTime?: number;
      ragTime?: number;
      similarity?: number;
      error?: string;
    }> = [];

    // Test 1: Similarity Search
    log('='.repeat(60), 'blue');
    log('Test 1: Similarity Search Tests', 'blue');
    log('='.repeat(60) + '\n', 'blue');

    for (const testCase of testCases) {
      try {
        const startTime = Date.now();
        const searchResults = await knowledgeBaseService.searchSimilar(
          testCase.question,
          3,
          0.5 // Lower threshold for testing
        );
        const searchTime = Date.now() - startTime;

        const hasResults = searchResults.length > 0;

        const passedTest = testCase.shouldHaveResults === hasResults;

        if (passedTest) {
          passed++;
          log(`✅ ${testCase.description}`, 'green');
        } else {
          failed++;
          log(`❌ ${testCase.description}`, 'red');
          log(`   Expected: ${testCase.shouldHaveResults ? 'results' : 'no results'}, Got: ${hasResults ? 'results' : 'no results'}`, 'yellow');
        }

        log(`   Found ${searchResults.length} results in ${searchTime}ms`, 'cyan');
        if (searchResults.length > 0) {
          log(`   Top result: ${searchResults[0].question.substring(0, 50)}...`, 'cyan');
          if (testCase.expectedCategory && searchResults[0].category !== testCase.expectedCategory) {
            log(`   ⚠️  Category mismatch: expected ${testCase.expectedCategory}, got ${searchResults[0].category}`, 'yellow');
          }
        }

        results.push({
          question: testCase.question,
          passed: passedTest,
          searchTime,
        });

        log('');
      } catch (error) {
        failed++;
        log(`❌ ${testCase.description} - Error: ${error instanceof Error ? error.message : String(error)}`, 'red');
        results.push({
          question: testCase.question,
          passed: false,
          error: error instanceof Error ? error.message : String(error),
        });
        log('');
      }
    }

    // Test 2: RAG Response Generation
    log('='.repeat(60), 'blue');
    log('Test 2: RAG Response Generation Tests', 'blue');
    log('='.repeat(60) + '\n', 'blue');

    const ragTestQuestions = [
      '什麼是 DeFi？',
      '流動性挖礦有什麼風險？',
      '如何避免被清算？',
      '今天天氣如何？', // Non-DeFi question
    ];

    for (const question of ragTestQuestions) {
      try {
        log(`Testing: ${question}`, 'cyan');
        const startTime = Date.now();
        const response = await ragService.generateRAGResponse(question, []);
        const ragTime = Date.now() - startTime;

        log(`✅ Response generated in ${ragTime}ms`, 'green');
        log(`   Response length: ${response.length} characters`, 'cyan');
        log(`   Preview: ${response.substring(0, 100)}...`, 'cyan');
        log('');

        // Check if response mentions knowledge base content
        const hasDeFiKeywords = 
          response.includes('DeFi') || 
          response.includes('去中心化') || 
          response.includes('區塊鏈') ||
          response.includes('智能合約');

        if (question.includes('天氣')) {
          // Non-DeFi question should indicate no relevant knowledge
          if (response.includes('沒有相關') || response.includes('無法回答') || response.includes('DeFi')) {
            log(`   ⚠️  Non-DeFi question handling: ${response.includes('沒有相關') ? 'Good' : 'Could be better'}`, 'yellow');
          }
        } else {
          // DeFi questions should have relevant content
          if (hasDeFiKeywords) {
            log(`   ✅ Response contains DeFi-related content`, 'green');
          } else {
            log(`   ⚠️  Response may not be based on knowledge base`, 'yellow');
          }
        }

        log('');
      } catch (error) {
        log(`❌ Error generating response: ${error instanceof Error ? error.message : String(error)}`, 'red');
        log('');
      }
    }

    // Test 3: Performance Tests
    log('='.repeat(60), 'blue');
    log('Test 3: Performance Tests', 'blue');
    log('='.repeat(60) + '\n', 'blue');

    const performanceTests = [
      '什麼是 DeFi？',
      'Uniswap 如何運作？',
      '流動性挖礦的收益如何計算？',
    ];

    const performanceResults: number[] = [];

    for (const question of performanceTests) {
      try {
        const startTime = Date.now();
        await ragService.generateRAGResponse(question, []);
        const totalTime = Date.now() - startTime;
        performanceResults.push(totalTime);

        log(`Question: ${question}`, 'cyan');
        log(`Total time: ${totalTime}ms`, totalTime < 30000 ? 'green' : 'yellow');
        if (totalTime > 30000) {
          log(`   ⚠️  Response time exceeds 30 seconds`, 'yellow');
        }
        log('');
      } catch (error) {
        log(`❌ Error: ${error instanceof Error ? error.message : String(error)}`, 'red');
        log('');
      }
    }

    // Summary
    log('='.repeat(60), 'blue');
    log('\n📊 Test Summary:', 'blue');
    log(`  ✅ Passed: ${passed}`, 'green');
    log(`  ❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
    log(`  📈 Success rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`, 'cyan');

    if (performanceResults.length > 0) {
      const avgTime = performanceResults.reduce((a, b) => a + b, 0) / performanceResults.length;
      const maxTime = Math.max(...performanceResults);
      const minTime = Math.min(...performanceResults);

      log(`\n⏱️  Performance Metrics:`, 'blue');
      log(`  Average time: ${avgTime.toFixed(0)}ms`, 'cyan');
      log(`  Min time: ${minTime}ms`, 'cyan');
      log(`  Max time: ${maxTime}ms`, maxTime > 30000 ? 'yellow' : 'cyan');
      if (avgTime > 30000) {
        log(`  ⚠️  Average response time exceeds 30 seconds`, 'yellow');
      }
    }

    log('='.repeat(60) + '\n', 'blue');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    log('\n❌ Fatal error during testing:', 'red');
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

// Run if executed directly
testRAG().catch((error) => {
  log(`\n❌ Unhandled error: ${error}`, 'red');
  process.exit(1);
});

