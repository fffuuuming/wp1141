import type { IKnowledgeBase, KnowledgeBaseCategory } from '@/lib/models/KnowledgeBase';
import type mongoose from 'mongoose';

/**
 * Knowledge Base Repository Interface
 * Defines the contract for knowledge base data access operations
 */
export interface IKnowledgeBaseRepository {
  /**
   * Find knowledge base item by ID
   */
  findById(id: string | mongoose.Types.ObjectId): Promise<IKnowledgeBase | null>;

  /**
   * Find all knowledge base items, optionally filtered by category
   */
  findAll(category?: KnowledgeBaseCategory): Promise<IKnowledgeBase[]>;

  /**
   * Create a new knowledge base item
   */
  create(knowledgeData: {
    question: string;
    answer: string;
    category: KnowledgeBaseCategory;
    embedding?: number[];
    metadata?: Record<string, unknown>;
  }): Promise<IKnowledgeBase>;

  /**
   * Update knowledge base item
   */
  update(
    id: string | mongoose.Types.ObjectId,
    updates: Partial<{
      question: string;
      answer: string;
      category: KnowledgeBaseCategory;
      embedding: number[];
      metadata: Record<string, unknown>;
    }>
  ): Promise<IKnowledgeBase | null>;

  /**
   * Delete knowledge base item
   */
  delete(id: string | mongoose.Types.ObjectId): Promise<boolean>;

  /**
   * Search by similarity using cosine similarity
   * Note: This is a simple implementation. For production, consider using MongoDB Atlas Vector Search
   */
  searchBySimilarity(
    queryEmbedding: number[],
    limit: number,
    threshold?: number
  ): Promise<IKnowledgeBase[]>;

  /**
   * Count knowledge base items
   */
  count(filter?: Record<string, unknown>): Promise<number>;
}

