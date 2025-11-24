import { embeddingService } from './embeddingService';
import { knowledgeBaseRepository } from '@/lib/repositories/mongoose';
import type { IKnowledgeBase, KnowledgeBaseCategory } from '@/lib/models/KnowledgeBase';
import { logger } from '@/lib/utils/logger';

/**
 * Simple in-memory cache for query embeddings
 * Key: query text (normalized)
 * Value: embedding vector
 */
const embeddingCache = new Map<string, number[]>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const cacheTimestamps = new Map<string, number>();

/**
 * Knowledge Base Service
 * Provides high-level operations for searching and retrieving knowledge base items
 */
class KnowledgeBaseService {
  /**
   * Search for similar knowledge base items using semantic similarity
   * @param query - User's query text
   * @param limit - Maximum number of results to return (default: 3)
   * @param threshold - Minimum similarity threshold (default: 0.7)
   * @returns Array of knowledge base items sorted by similarity
   */
  async searchSimilar(
    query: string,
    limit: number = 3,
    threshold: number = 0.7
  ): Promise<IKnowledgeBase[]> {
    try {
      if (!query || query.trim().length === 0) {
        logger.warn('Empty query provided to searchSimilar');
        return [];
      }

      const normalizedQuery = query.trim().toLowerCase();

      // Check cache first
      let queryEmbedding: number[];
      const cached = embeddingCache.get(normalizedQuery);
      const cacheTime = cacheTimestamps.get(normalizedQuery);
      const now = Date.now();

      if (cached && cacheTime && now - cacheTime < CACHE_TTL) {
        logger.debug('Using cached embedding for query', { query: normalizedQuery.substring(0, 50) });
        queryEmbedding = cached;
      } else {
        // Generate embedding for query
        logger.debug('Generating embedding for query', { query: normalizedQuery.substring(0, 50) });
        queryEmbedding = await embeddingService.generateEmbedding(query);

        // Cache the embedding
        embeddingCache.set(normalizedQuery, queryEmbedding);
        cacheTimestamps.set(normalizedQuery, now);

        // Clean up old cache entries (simple cleanup - remove entries older than TTL)
        if (embeddingCache.size > 100) {
          // If cache is too large, remove oldest entries
          const entriesToRemove: string[] = [];
          for (const [key, timestamp] of cacheTimestamps.entries()) {
            if (now - timestamp >= CACHE_TTL) {
              entriesToRemove.push(key);
            }
          }
          entriesToRemove.forEach((key) => {
            embeddingCache.delete(key);
            cacheTimestamps.delete(key);
          });
        }
      }

      // Search knowledge base using repository
      const results = await knowledgeBaseRepository.searchBySimilarity(
        queryEmbedding,
        limit,
        threshold
      );

      logger.debug('Knowledge base search completed', {
        query: normalizedQuery.substring(0, 50),
        resultsCount: results.length,
        limit,
        threshold,
      });

      return results;
    } catch (error) {
      logger.error('Error searching knowledge base', error, { query: query.substring(0, 50) });
      // Return empty array on error to allow graceful degradation
      return [];
    }
  }

  /**
   * Get knowledge base items by category
   * @param category - Category to filter by
   * @returns Array of knowledge base items in the specified category
   */
  async getByCategory(category: KnowledgeBaseCategory): Promise<IKnowledgeBase[]> {
    try {
      return await knowledgeBaseRepository.findAll(category);
    } catch (error) {
      logger.error('Error getting knowledge base by category', error, { category });
      return [];
    }
  }

  /**
   * Get all knowledge base items
   * @returns Array of all knowledge base items
   */
  async getAll(): Promise<IKnowledgeBase[]> {
    try {
      return await knowledgeBaseRepository.findAll();
    } catch (error) {
      logger.error('Error getting all knowledge base items', error);
      return [];
    }
  }

  /**
   * Clear the embedding cache
   * Useful for testing or when embeddings need to be regenerated
   */
  clearCache(): void {
    embeddingCache.clear();
    cacheTimestamps.clear();
    logger.debug('Embedding cache cleared');
  }
}

// Export singleton instance
export const knowledgeBaseService = new KnowledgeBaseService();

