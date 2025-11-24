import type { IKnowledgeBase, KnowledgeBaseCategory } from '@/lib/models/KnowledgeBase';

/**
 * Knowledge base item for API responses (excludes embedding for security/performance)
 */
export interface KnowledgeBaseItem {
  id: string;
  question: string;
  answer: string;
  category: KnowledgeBaseCategory;
  metadata?: {
    tags?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    source?: string;
    [key: string]: unknown;
  };
  createdAt: Date;
  updatedAt: Date;
  hasEmbedding: boolean; // Indicates if embedding exists (without exposing the actual embedding)
}

/**
 * Knowledge base query parameters
 */
export interface KnowledgeBaseQueryParams {
  limit?: number;
  offset?: number;
  category?: KnowledgeBaseCategory;
}

/**
 * Create knowledge base request
 */
export interface CreateKnowledgeBaseRequest {
  question: string;
  answer: string;
  category: KnowledgeBaseCategory;
  metadata?: {
    tags?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    source?: string;
    [key: string]: unknown;
  };
}

/**
 * Update knowledge base request
 */
export interface UpdateKnowledgeBaseRequest {
  question?: string;
  answer?: string;
  category?: KnowledgeBaseCategory;
  metadata?: {
    tags?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    source?: string;
    [key: string]: unknown;
  };
}

/**
 * Pagination info
 */
export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Knowledge base list response
 */
export interface KnowledgeBaseListResponse {
  items: KnowledgeBaseItem[];
  pagination: PaginationInfo;
}

/**
 * Convert IKnowledgeBase to KnowledgeBaseItem (excludes embedding)
 */
export function toKnowledgeBaseItem(kb: IKnowledgeBase): KnowledgeBaseItem {
  return {
    id: kb._id.toString(),
    question: kb.question,
    answer: kb.answer,
    category: kb.category,
    metadata: kb.metadata,
    createdAt: kb.createdAt,
    updatedAt: kb.updatedAt,
    hasEmbedding: !!(kb.embedding && kb.embedding.length > 0),
  };
}

