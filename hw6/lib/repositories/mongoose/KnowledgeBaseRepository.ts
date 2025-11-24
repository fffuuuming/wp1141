import { withDatabase } from '@/lib/utils/withDatabase';
import KnowledgeBase, {
  type IKnowledgeBase,
  type KnowledgeBaseCategory,
} from '@/lib/models/KnowledgeBase';
import type { IKnowledgeBaseRepository } from '../IKnowledgeBaseRepository';
import type mongoose from 'mongoose';

/**
 * Calculate cosine similarity between two vectors
 * This is a simple implementation. For production with large datasets,
 * consider using MongoDB Atlas Vector Search
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  if (vecA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

/**
 * Mongoose implementation of Knowledge Base Repository
 */
class KnowledgeBaseRepository implements IKnowledgeBaseRepository {
  async findById(id: string | mongoose.Types.ObjectId): Promise<IKnowledgeBase | null> {
    return await withDatabase(async () => {
      return await KnowledgeBase.findById(id);
    })();
  }

  async findAll(category?: KnowledgeBaseCategory): Promise<IKnowledgeBase[]> {
    return await withDatabase(async () => {
      const query = category ? { category } : {};
      return await KnowledgeBase.find(query).sort({ createdAt: -1 }).exec();
    })();
  }

  async create(knowledgeData: {
    question: string;
    answer: string;
    category: KnowledgeBaseCategory;
    embedding?: number[];
    metadata?: Record<string, unknown>;
  }): Promise<IKnowledgeBase> {
    return await withDatabase(async () => {
      return await KnowledgeBase.create({
        question: knowledgeData.question,
        answer: knowledgeData.answer,
        category: knowledgeData.category,
        embedding: knowledgeData.embedding,
        metadata: knowledgeData.metadata || {},
      });
    })();
  }

  async update(
    id: string | mongoose.Types.ObjectId,
    updates: Partial<{
      question: string;
      answer: string;
      category: KnowledgeBaseCategory;
      embedding: number[];
      metadata: Record<string, unknown>;
    }>
  ): Promise<IKnowledgeBase | null> {
    return await withDatabase(async () => {
      return await KnowledgeBase.findByIdAndUpdate(id, { $set: updates }, { new: true });
    })();
  }

  async delete(id: string | mongoose.Types.ObjectId): Promise<boolean> {
    return await withDatabase(async () => {
      const result = await KnowledgeBase.findByIdAndDelete(id);
      return result !== null;
    })();
  }

  async searchBySimilarity(
    queryEmbedding: number[],
    limit: number,
    threshold: number = 0
  ): Promise<IKnowledgeBase[]> {
    return await withDatabase(async () => {
      // Get all items with embeddings
      const allItems = await KnowledgeBase.find({
        embedding: { $exists: true, $ne: null },
      }).exec();

      // Calculate similarity for each item
      const itemsWithSimilarity = allItems
        .map((item) => {
          if (!item.embedding || item.embedding.length === 0) {
            return null;
          }

          const similarity = cosineSimilarity(queryEmbedding, item.embedding);
          return {
            item,
            similarity,
          };
        })
        .filter(
          (result): result is { item: IKnowledgeBase; similarity: number } =>
            result !== null && result.similarity >= threshold
        )
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map((result) => result.item);

      return itemsWithSimilarity;
    })();
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    return await withDatabase(async () => {
      const query = filter || {};
      return await KnowledgeBase.countDocuments(query);
    })();
  }
}

// Export singleton instance
export const knowledgeBaseRepository = new KnowledgeBaseRepository();

