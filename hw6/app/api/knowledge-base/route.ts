import { NextRequest } from 'next/server';
import { withDatabase } from '@/lib/utils/withDatabase';
import { knowledgeBaseRepository } from '@/lib/repositories/mongoose';
import { embeddingService } from '@/lib/services/embeddingService';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { withValidation, validateInt, validateString } from '@/lib/utils/requestValidator';
import type {
  KnowledgeBaseListResponse,
  KnowledgeBaseQueryParams,
  CreateKnowledgeBaseRequest,
  KnowledgeBaseItem,
  PaginationInfo,
} from '@/types/api/knowledge-base';
import { toKnowledgeBaseItem } from '@/types/api/knowledge-base';
import { LLMError } from '@/lib/errors';
import { logger } from '@/lib/utils/logger';
import type { KnowledgeBaseCategory } from '@/lib/models/KnowledgeBase';

/**
 * GET /api/knowledge-base
 * List all knowledge base items with optional filters
 */
export async function GET(request: NextRequest) {
  return await withValidation(async () => {
    return await withDatabase(async () => {
      try {
        const searchParams = request.nextUrl.searchParams;
        const limit = validateInt(searchParams.get('limit'), 'limit', {
          min: 1,
          max: 100,
          defaultValue: 50,
        });
        const offset = validateInt(searchParams.get('offset'), 'offset', {
          min: 0,
          defaultValue: 0,
        });
        const category = validateString(searchParams.get('category'), 'category', {
          required: false,
        }) as KnowledgeBaseCategory | '';

        // Build query
        const query: Record<string, unknown> = {};
        if (category) {
          // Validate category
          const validCategories: KnowledgeBaseCategory[] = [
            'defi-basics',
            'dex',
            'liquidity-mining',
            'lending',
            'risks',
            'smart-contracts',
          ];
          if (!validCategories.includes(category as KnowledgeBaseCategory)) {
            return errorResponse(
              new Error(
                `Invalid category. Must be one of: ${validCategories.join(', ')}`
              ),
              400
            );
          }
          query.category = category;
        }

        // Get total count
        const total = await knowledgeBaseRepository.count(query);

        // Get knowledge base items
        const items = category
          ? await knowledgeBaseRepository.findAll(category as KnowledgeBaseCategory)
          : await knowledgeBaseRepository.findAll();

        // Apply pagination
        const paginatedItems = items.slice(offset, offset + limit);

        // Format response (exclude embeddings)
        const formattedItems: KnowledgeBaseItem[] = paginatedItems.map(toKnowledgeBaseItem);

        const pagination: PaginationInfo = {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        };

        const response: KnowledgeBaseListResponse = {
          items: formattedItems,
          pagination,
        };

        return successResponse(response);
      } catch (error) {
        return errorResponse(error);
      }
    })();
  })();
}

/**
 * POST /api/knowledge-base
 * Create a new knowledge base item (automatically generates embedding)
 */
export async function POST(request: NextRequest) {
  return await withValidation(async () => {
    return await withDatabase(async () => {
      try {
        const body = (await request.json()) as CreateKnowledgeBaseRequest;

        // Validate required fields
        if (!body.question || !body.answer || !body.category) {
          return errorResponse(
            new Error('question, answer, and category are required'),
            400
          );
        }

        // Validate category
        const validCategories: KnowledgeBaseCategory[] = [
          'defi-basics',
          'dex',
          'liquidity-mining',
          'lending',
          'risks',
          'smart-contracts',
        ];
        if (!validCategories.includes(body.category)) {
          return errorResponse(
            new Error(
              `Invalid category. Must be one of: ${validCategories.join(', ')}`
            ),
            400
          );
        }

        // Generate embedding for the question
        let embedding: number[] | undefined;
        try {
          logger.debug('Generating embedding for new knowledge base item', {
            question: body.question.substring(0, 50),
          });
          embedding = await embeddingService.generateEmbedding(body.question);
        } catch (embeddingError) {
          logger.error('Failed to generate embedding', embeddingError, {
            question: body.question.substring(0, 50),
          });

          // If embedding generation fails, we can still create the item without embedding
          // But log a warning
          if (embeddingError instanceof LLMError) {
            // For non-retryable errors (quota, auth), fail the request
            if (embeddingError.code === 'QUOTA_EXCEEDED' || embeddingError.code === 'AUTH_ERROR') {
              return errorResponse(
                new Error('Failed to generate embedding. Please check API configuration.'),
                500
              );
            }
          }

          // For retryable errors, continue without embedding (item can be updated later)
          logger.warn('Creating knowledge base item without embedding', {
            question: body.question.substring(0, 50),
          });
        }

        // Create knowledge base item
        const newItem = await knowledgeBaseRepository.create({
          question: body.question,
          answer: body.answer,
          category: body.category,
          embedding: embedding,
          metadata: body.metadata || {},
        });

        const formattedItem = toKnowledgeBaseItem(newItem);

        logger.info('Knowledge base item created', {
          id: newItem._id.toString(),
          category: body.category,
          hasEmbedding: !!embedding,
        });

        return successResponse(formattedItem, 201);
      } catch (error) {
        return errorResponse(error);
      }
    })();
  })();
}

