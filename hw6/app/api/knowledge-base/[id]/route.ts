import { NextRequest } from 'next/server';
import { withDatabase } from '@/lib/utils/withDatabase';
import { knowledgeBaseRepository } from '@/lib/repositories/mongoose';
import { embeddingService } from '@/lib/services/embeddingService';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import type {
  UpdateKnowledgeBaseRequest,
  KnowledgeBaseItem,
} from '@/types/api/knowledge-base';
import { toKnowledgeBaseItem } from '@/types/api/knowledge-base';
import { LLMError } from '@/lib/errors';
import { logger } from '@/lib/utils/logger';
import type { KnowledgeBaseCategory } from '@/lib/models/KnowledgeBase';

/**
 * GET /api/knowledge-base/[id]
 * Get a specific knowledge base item
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return await withDatabase(async () => {
    try {
      const itemId = params.id;

      const item = await knowledgeBaseRepository.findById(itemId);

      if (!item) {
        return errorResponse(new Error('Knowledge base item not found'), 404);
      }

      const formattedItem = toKnowledgeBaseItem(item);
      return successResponse(formattedItem);
    } catch (error) {
      return errorResponse(error);
    }
  })();
}

/**
 * PATCH /api/knowledge-base/[id]
 * Update a knowledge base item (regenerates embedding if question/answer changed)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return await withDatabase(async () => {
    try {
      const itemId = params.id;
      const body = (await request.json()) as UpdateKnowledgeBaseRequest;

      // Get existing item
      const existingItem = await knowledgeBaseRepository.findById(itemId);
      if (!existingItem) {
        return errorResponse(new Error('Knowledge base item not found'), 404);
      }

      // Validate category if provided
      if (body.category) {
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
      }

      // Prepare update object
      const updates: {
        question?: string;
        answer?: string;
        category?: KnowledgeBaseCategory;
        embedding?: number[];
        metadata?: Record<string, unknown>;
      } = {};

      if (body.question !== undefined) {
        updates.question = body.question;
      }
      if (body.answer !== undefined) {
        updates.answer = body.answer;
      }
      if (body.category !== undefined) {
        updates.category = body.category;
      }
      if (body.metadata !== undefined) {
        updates.metadata = body.metadata;
      }

      // Regenerate embedding if question or answer changed
      const questionChanged = body.question !== undefined && body.question !== existingItem.question;
      const answerChanged = body.answer !== undefined && body.answer !== existingItem.answer;

      if (questionChanged || answerChanged) {
        // Use question for embedding (or existing question if not changed)
        const questionForEmbedding = body.question || existingItem.question;

        try {
          logger.debug('Regenerating embedding for updated knowledge base item', {
            id: itemId,
            question: questionForEmbedding.substring(0, 50),
          });
          const embedding = await embeddingService.generateEmbedding(questionForEmbedding);
          updates.embedding = embedding;
        } catch (embeddingError) {
          logger.error('Failed to regenerate embedding', embeddingError, {
            id: itemId,
            question: questionForEmbedding.substring(0, 50),
          });

          // If embedding generation fails, we can still update other fields
          // But log a warning
          if (embeddingError instanceof LLMError) {
            // For non-retryable errors (quota, auth), fail the request
            if (embeddingError.code === 'QUOTA_EXCEEDED' || embeddingError.code === 'AUTH_ERROR') {
              return errorResponse(
                new Error('Failed to regenerate embedding. Please check API configuration.'),
                500
              );
            }
          }

          // For retryable errors, continue without updating embedding
          logger.warn('Updating knowledge base item without regenerating embedding', {
            id: itemId,
          });
        }
      }

      // Update the item
      const updatedItem = await knowledgeBaseRepository.update(itemId, updates);

      if (!updatedItem) {
        return errorResponse(new Error('Failed to update knowledge base item'), 500);
      }

      const formattedItem = toKnowledgeBaseItem(updatedItem);

      logger.info('Knowledge base item updated', {
        id: itemId,
        hasEmbedding: !!(updatedItem.embedding && updatedItem.embedding.length > 0),
      });

      return successResponse(formattedItem);
    } catch (error) {
      return errorResponse(error);
    }
  })();
}

/**
 * DELETE /api/knowledge-base/[id]
 * Delete a knowledge base item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return await withDatabase(async () => {
    try {
      const itemId = params.id;

      // Check if item exists
      const existingItem = await knowledgeBaseRepository.findById(itemId);
      if (!existingItem) {
        return errorResponse(new Error('Knowledge base item not found'), 404);
      }

      // Delete the item
      const deleted = await knowledgeBaseRepository.delete(itemId);

      if (!deleted) {
        return errorResponse(new Error('Failed to delete knowledge base item'), 500);
      }

      logger.info('Knowledge base item deleted', { id: itemId });

      return successResponse({ id: itemId, deleted: true });
    } catch (error) {
      return errorResponse(error);
    }
  })();
}

