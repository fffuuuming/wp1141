import { llmService } from './llmService';
import { knowledgeBaseService } from './knowledgeBaseService';
import { RAG_CONFIG, RAG_SYSTEM_PROMPT } from '@/lib/constants/llm';
import { logger } from '@/lib/utils/logger';
import type { IKnowledgeBase } from '@/lib/models/KnowledgeBase';

/**
 * Format knowledge base items into context string for LLM
 */
function formatKnowledgeContext(items: IKnowledgeBase[]): string {
  if (items.length === 0) {
    return '（知識庫中沒有相關資訊）';
  }

  return items
    .map((item, index) => {
      return `[${index + 1}] 問題：${item.question}\n   答案：${item.answer}`;
    })
    .join('\n\n');
}

/**
 * Format conversation history for LLM prompt
 */
function formatConversationHistory(
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): string {
  if (history.length === 0) {
    return '（無對話歷史）';
  }

  return history
    .map((msg) => {
      const role = msg.role === 'user' ? '使用者' : '助手';
      return `${role}：${msg.content}`;
    })
    .join('\n');
}

/**
 * RAG Service
 * Implements Retrieval-Augmented Generation workflow:
 * 1. Search knowledge base for relevant content
 * 2. Format context from knowledge base
 * 3. Generate response using LLM with RAG-enhanced prompt
 */
class RAGService {
  /**
   * Generate RAG-enhanced response
   * @param userQuestion - User's question
   * @param conversationHistory - Previous conversation messages
   * @param topK - Number of knowledge base items to retrieve (default: from RAG_CONFIG)
   * @returns Generated response string
   */
  async generateRAGResponse(
    userQuestion: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    topK: number = RAG_CONFIG.MAX_CONTEXT_ITEMS
  ): Promise<string> {
    const startTime = Date.now();
    let embeddingTime = 0;
    let searchTime = 0;
    let llmTime = 0;

    try {
      // Step 1: Search knowledge base for relevant content
      const searchStartTime = Date.now();
      const knowledgeItems = await knowledgeBaseService.searchSimilar(
        userQuestion,
        topK,
        RAG_CONFIG.SIMILARITY_THRESHOLD
      );
      searchTime = Date.now() - searchStartTime;
      embeddingTime = searchTime; // Embedding is part of search

      logger.debug('Knowledge base search completed', {
        query: userQuestion.substring(0, 50),
        itemsFound: knowledgeItems.length,
        searchTimeMs: searchTime,
      });

      // Step 2: Format knowledge base context
      const knowledgeContext = formatKnowledgeContext(knowledgeItems);
      const conversationContext = formatConversationHistory(conversationHistory);

      // Step 3: Build RAG-enhanced prompt
      const ragPrompt = `知識庫內容：
${knowledgeContext}

對話歷史：
${conversationContext}

使用者問題：${userQuestion}

請根據上述知識庫內容回答使用者的問題。如果知識庫中有相關資訊，請基於這些資訊回答；如果知識庫中沒有相關資訊，請誠實告知，並引導用戶詢問其他 DeFi 相關的問題。`;

      // Step 4: Generate response using LLM with RAG system prompt
      const llmStartTime = Date.now();
      const response = await llmService.generateResponse(
        ragPrompt,
        conversationHistory,
        RAG_SYSTEM_PROMPT
      );
      llmTime = Date.now() - llmStartTime;

      const totalTime = Date.now() - startTime;

      // Log performance metrics
      logger.info('RAG response generated', {
        query: userQuestion.substring(0, 50),
        embeddingTimeMs: embeddingTime,
        searchTimeMs: searchTime,
        llmTimeMs: llmTime,
        totalTimeMs: totalTime,
        knowledgeItemsCount: knowledgeItems.length,
      });

      // Warn if response time is too long
      if (totalTime > 30000) {
        logger.warn('RAG response time exceeds 30 seconds', {
          totalTimeMs: totalTime,
          embeddingTimeMs: embeddingTime,
          searchTimeMs: searchTime,
          llmTimeMs: llmTime,
        });
      }

      return response.content;
    } catch (error) {
      const totalTime = Date.now() - startTime;
      logger.error('Error generating RAG response', error, {
        query: userQuestion.substring(0, 50),
        totalTimeMs: totalTime,
        embeddingTimeMs: embeddingTime,
        searchTimeMs: searchTime,
        llmTimeMs: llmTime,
      });

      // Re-throw error to allow caller to handle fallback
      throw error;
    }
  }

  /**
   * Check if knowledge base has relevant content for a query
   * @param query - User's query
   * @param threshold - Similarity threshold (default: from RAG_CONFIG)
   * @returns True if relevant content exists
   */
  async hasRelevantContent(
    query: string,
    threshold: number = RAG_CONFIG.SIMILARITY_THRESHOLD
  ): Promise<boolean> {
    try {
      const items = await knowledgeBaseService.searchSimilar(query, 1, threshold);
      return items.length > 0;
    } catch (error) {
      logger.error('Error checking relevant content', error, { query: query.substring(0, 50) });
      return false;
    }
  }
}

// Export singleton instance
export const ragService = new RAGService();

