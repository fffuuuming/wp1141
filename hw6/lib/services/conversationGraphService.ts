import { knowledgeBaseService } from './knowledgeBaseService';
import { knowledgeBaseRepository } from '@/lib/repositories/mongoose';
import type { KnowledgeBaseCategory } from '@/lib/models/KnowledgeBase';
import { logger } from '@/lib/utils/logger';

/**
 * Conversation Node Types
 */
export type NodeType = 'root' | 'category' | 'question' | 'answer';

/**
 * Conversation Node Interface
 * Represents a node in the conversation graph
 */
export interface ConversationNode {
  id: string;
  type: NodeType;
  title: string;
  content?: string; // For answer nodes
  children?: ConversationNode[]; // Child nodes (options user can choose)
  category?: KnowledgeBaseCategory; // For category nodes
  questionId?: string; // For question nodes
}

/**
 * Conversation Graph Service
 * Manages the graph-based conversation flow
 */
class ConversationGraphService {
  // Cache for category questions (in-memory cache)
  private categoryQuestionsCache = new Map<KnowledgeBaseCategory, {
    questions: ConversationNode[];
    timestamp: number;
  }>();
  private readonly CACHE_TTL = 1000 * 60 * 5; // 5 minutes cache

  /**
   * Get the root node (main menu)
   */
  getRootNode(): ConversationNode {
    return {
      id: 'root',
      type: 'root',
      title: 'DeFi 知識庫',
      content: '歡迎使用 DeFi 知識庫！請選擇您想了解的類別：',
      children: [
        {
          id: 'category-defi-basics',
          type: 'category',
          title: 'DeFi 基礎',
          category: 'defi-basics',
        },
        {
          id: 'category-dex',
          type: 'category',
          title: '去中心化交易所 (DEX)',
          category: 'dex',
        },
        {
          id: 'category-liquidity-mining',
          type: 'category',
          title: '流動性挖礦',
          category: 'liquidity-mining',
        },
        {
          id: 'category-lending',
          type: 'category',
          title: '借貸協議',
          category: 'lending',
        },
        {
          id: 'category-risks',
          type: 'category',
          title: '風險管理',
          category: 'risks',
        },
        {
          id: 'category-smart-contracts',
          type: 'category',
          title: '智能合約',
          category: 'smart-contracts',
        },
      ],
    };
  }

  /**
   * Get node by ID
   */
  getNodeById(nodeId: string): ConversationNode | null {
    const root = this.getRootNode();
    
    // Check root
    if (root.id === nodeId) {
      return root;
    }

    // Check children
    if (root.children) {
      for (const child of root.children) {
        if (child.id === nodeId) {
          return child;
        }
      }
    }

    return null;
  }

  /**
   * Get questions for a category
   * Uses caching to avoid repeated database queries
   */
  async getCategoryQuestions(category: KnowledgeBaseCategory): Promise<ConversationNode[]> {
    try {
      // Check cache first
      const cached = this.categoryQuestionsCache.get(category);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
        logger.debug('Using cached category questions', { 
          category, 
          itemCount: cached.questions.length 
        });
        return cached.questions;
      }

      // Fetch from database
      const items = await knowledgeBaseService.getByCategory(category);
      
      logger.debug('Getting category questions from database', { 
        category, 
        itemCount: items.length 
      });
      
      const questions: ConversationNode[] = items.map((item, index) => ({
        id: `question-${category}-${index}`,
        type: 'question' as const,
        title: item.question,
        questionId: item._id.toString(),
        children: [
          {
            id: `answer-${category}-${index}`,
            type: 'answer' as const,
            title: '查看答案',
            questionId: item._id.toString(), // Store questionId for easier lookup
            // Content will be loaded when navigating to this node
          },
          {
            id: `back-to-category-${category}`,
            type: 'category' as const,
            title: '返回類別',
            category: category,
          },
          {
            id: 'back-to-root',
            type: 'root' as const,
            title: '返回主選單',
          },
        ],
      }));

      // Cache the results
      this.categoryQuestionsCache.set(category, {
        questions,
        timestamp: now,
      });

      // Clean up old cache entries if cache is too large
      if (this.categoryQuestionsCache.size > 10) {
        for (const [key, value] of this.categoryQuestionsCache.entries()) {
          if (now - value.timestamp >= this.CACHE_TTL) {
            this.categoryQuestionsCache.delete(key);
          }
        }
      }

      return questions;
    } catch (error) {
      logger.error('Error getting category questions', error, { category });
      return [];
    }
  }

  /**
   * Clear category questions cache
   * Useful when knowledge base is updated
   */
  clearCategoryCache(category?: KnowledgeBaseCategory): void {
    if (category) {
      this.categoryQuestionsCache.delete(category);
      logger.debug('Cleared cache for category', { category });
    } else {
      this.categoryQuestionsCache.clear();
      logger.debug('Cleared all category cache');
    }
  }

  /**
   * Get answer node for a question
   */
  async getAnswerNode(questionId: string): Promise<ConversationNode | null> {
    try {
      // Use findById instead of getAll() - much more efficient
      const item = await knowledgeBaseRepository.findById(questionId);

      if (!item) {
        return null;
      }

      return {
        id: `answer-${questionId}`,
        type: 'answer',
        title: item.question,
        content: item.answer,
        children: [
          {
            id: `back-to-category-${item.category}`,
            type: 'category',
            title: '返回類別',
            category: item.category,
          },
          {
            id: 'back-to-root',
            type: 'root',
            title: '返回主選單',
          },
        ],
      };
    } catch (error) {
      logger.error('Error getting answer node', error, { questionId });
      return null;
    }
  }

  /**
   * Get answer node by question node ID
   */
  async getAnswerNodeByQuestionNodeId(questionNodeId: string): Promise<ConversationNode | null> {
    try {
      // Parse question node ID: question-{category}-{index}
      const parts = questionNodeId.split('-');
      if (parts.length < 3 || parts[0] !== 'question') {
        return null;
      }

      const category = parts.slice(1, -1).join('-') as KnowledgeBaseCategory;
      const questionIndex = parseInt(parts[parts.length - 1]);

      if (isNaN(questionIndex)) {
        return null;
      }

      const questions = await this.getCategoryQuestions(category);
      const questionNode = questions[questionIndex];

      if (!questionNode || !questionNode.questionId) {
        return null;
      }

      return await this.getAnswerNode(questionNode.questionId);
    } catch (error) {
      logger.error('Error getting answer node by question node ID', error, { questionNodeId });
      return null;
    }
  }

  /**
   * Navigate to a node
   * Returns the node and its children
   */
  async navigateToNode(nodeId: string): Promise<ConversationNode | null> {
    // Check if it's root
    if (nodeId === 'root' || nodeId === 'back-to-root') {
      return this.getRootNode();
    }

    // Check if it's a category node
    const node = this.getNodeById(nodeId);
    if (node && node.type === 'category' && node.category) {
      const questions = await this.getCategoryQuestions(node.category);
      return {
        ...node,
        children: questions,
      };
    }

    // Check if it's a question node (need to get from category)
    if (nodeId.startsWith('question-')) {
      const parts = nodeId.split('-');
      if (parts.length >= 3) {
        const category = parts.slice(1, -1).join('-') as KnowledgeBaseCategory;
        const questionIndex = parseInt(parts[parts.length - 1]);
        const questions = await this.getCategoryQuestions(category);
        return questions[questionIndex] || null;
      }
    }

    // Check if it's an answer node
    if (nodeId.startsWith('answer-')) {
      // Format: answer-{category}-{index} (from question node children)
      // Example: answer-defi-basics-0
      // We need to find where the category ends and index begins
      // Categories can have hyphens, so we need to parse from the end
      const parts = nodeId.split('-');
      if (parts.length >= 3) {
        // Try to parse: answer-{category}-{index}
        // The last part should be the index (a number)
        const lastPart = parts[parts.length - 1];
        const questionIndex = parseInt(lastPart);
        
        if (!isNaN(questionIndex)) {
          // Everything between 'answer' and the last part is the category
          const category = parts.slice(1, -1).join('-') as KnowledgeBaseCategory;
          
          logger.debug('Parsing answer node', { 
            nodeId, 
            category, 
            questionIndex, 
            parts 
          });
          
          try {
            const questions = await this.getCategoryQuestions(category);
            logger.debug('Got questions for category', { 
              category, 
              questionCount: questions.length,
              questionIndex 
            });
            
            if (questions[questionIndex]) {
              const questionNode = questions[questionIndex];
              if (questionNode.questionId) {
                logger.debug('Getting answer node', { 
                  questionId: questionNode.questionId 
                });
                const answerNode = await this.getAnswerNode(questionNode.questionId);
                if (answerNode) {
                  return answerNode;
                }
              } else {
                logger.warn('Question node missing questionId', { 
                  questionIndex, 
                  questionNodeId: questionNode.id 
                });
              }
            } else {
              logger.warn('Question index out of range', { 
                category, 
                questionIndex, 
                totalQuestions: questions.length 
              });
            }
          } catch (error) {
            logger.error('Error getting answer node from category', error, { 
              category, 
              questionIndex 
            });
          }
        }
      }
      
      // If not found, try as direct questionId (answer-{questionId})
      // This would be a MongoDB ObjectId format
      const questionId = nodeId.replace('answer-', '');
      if (questionId.length === 24) { // MongoDB ObjectId length
        try {
          logger.debug('Trying to get answer node by questionId', { questionId });
          return await this.getAnswerNode(questionId);
        } catch (error) {
          logger.error('Error getting answer node by questionId', error, { questionId });
        }
      }
    }

    // Check if it's back to category
    if (nodeId.startsWith('back-to-category-')) {
      const category = nodeId.replace('back-to-category-', '') as KnowledgeBaseCategory;
      const questions = await this.getCategoryQuestions(category);
      return {
        id: `category-${category}`,
        type: 'category',
        title: this.getCategoryTitle(category),
        category: category,
        children: questions,
      };
    }

    return null;
  }

  /**
   * Get category title in Chinese
   */
  getCategoryTitle(category: KnowledgeBaseCategory): string {
    const titles: Record<KnowledgeBaseCategory, string> = {
      'defi-basics': 'DeFi 基礎',
      'dex': '去中心化交易所 (DEX)',
      'liquidity-mining': '流動性挖礦',
      'lending': '借貸協議',
      'risks': '風險管理',
      'smart-contracts': '智能合約',
    };
    return titles[category] || category;
  }
}

// Export singleton instance
export const conversationGraphService = new ConversationGraphService();

