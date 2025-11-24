import { conversationGraphService, type ConversationNode } from './conversationGraphService';
import { sendButtonsTemplate, sendCarouselTemplate, sendTextMessage } from './lineService';
import { Conversation } from '@/lib/models';
import { logger } from '@/lib/utils/logger';

/**
 * Conversation Flow Service
 * Handles navigation through the conversation graph
 */
class ConversationFlowService {
  /**
   * Render a node and send appropriate message to user
   */
  async renderNode(
    node: ConversationNode,
    replyToken: string,
    conversationId?: string
  ): Promise<void> {
    try {
      // Update conversation current node if conversationId is provided
      if (conversationId) {
        await Conversation.findByIdAndUpdate(conversationId, {
          currentNodeId: node.id,
        });
      }

      switch (node.type) {
        case 'root':
          await this.renderRootNode(node, replyToken);
          break;
        case 'category':
          await this.renderCategoryNode(node, replyToken);
          break;
        case 'question':
          await this.renderQuestionNode(node, replyToken);
          break;
        case 'answer':
          await this.renderAnswerNode(node, replyToken);
          break;
        default:
          logger.warn('Unknown node type', { nodeType: node.type, nodeId: node.id });
          await sendTextMessage(replyToken, '發生錯誤，請重新開始。');
      }
    } catch (error) {
      logger.error('Error rendering node', error, { nodeId: node.id });
      await sendTextMessage(replyToken, '發生錯誤，請稍後再試。');
    }
  }

  /**
   * Render root node (main menu with category buttons)
   */
  private async renderRootNode(node: ConversationNode, replyToken: string): Promise<void> {
    if (!node.children || node.children.length === 0) {
      await sendTextMessage(replyToken, node.content || '歡迎使用 DeFi 知識庫！');
      return;
    }

    const buttons = node.children.map((child) => ({
      label: child.title,
      data: child.id,
    }));

    await sendButtonsTemplate(
      replyToken,
      node.content || '歡迎使用 DeFi 知識庫！請選擇您想了解的類別：',
      buttons
    );
  }

  /**
   * Render category node (show questions in carousel)
   */
  private async renderCategoryNode(node: ConversationNode, replyToken: string): Promise<void> {
    if (!node.children || node.children.length === 0) {
      await sendTextMessage(replyToken, `目前 ${node.title} 類別中沒有問題。`);
      return;
    }

    // If there are many questions, use carousel
    // Otherwise, use buttons
    if (node.children.length <= 4) {
      // Use buttons template for small number of questions
      const buttons = node.children.map((child) => ({
        label: child.title.length > 20 ? child.title.substring(0, 17) + '...' : child.title,
        data: child.id,
      }));

      // Add back button
      buttons.push({
        label: '返回主選單',
        data: 'back-to-root',
      });

      await sendButtonsTemplate(
        replyToken,
        `${node.title}\n\n請選擇一個問題：`,
        buttons
      );
    } else {
      // Use carousel for many questions
      const carouselItems = node.children.map((child) => ({
        title: child.title.length > 40 ? child.title.substring(0, 37) + '...' : child.title,
        text: '點擊查看答案',
        actions: [
          {
            label: '查看答案',
            data: child.children?.[0]?.id || child.id, // Get answer node ID
          },
        ],
      }));

      // Add back button as a separate message
      await sendCarouselTemplate(replyToken, carouselItems);
      await sendButtonsTemplate(
        replyToken,
        '或返回主選單：',
        [
          {
            label: '返回主選單',
            data: 'back-to-root',
          },
        ]
      );
    }
  }

  /**
   * Render question node (show answer button)
   */
  private async renderQuestionNode(node: ConversationNode, replyToken: string): Promise<void> {
    if (!node.children || node.children.length === 0) {
      await sendTextMessage(replyToken, node.title);
      return;
    }

    const buttons = node.children
      .filter((child) => child.type === 'answer')
      .map((child) => ({
        label: child.title,
        data: child.id,
      }));

    // Add navigation buttons
    const navButtons = node.children
      .filter((child) => child.type !== 'answer')
      .map((child) => ({
        label: child.title,
        data: child.id,
      }));

    const allButtons = [...buttons, ...navButtons].slice(0, 4);

    await sendButtonsTemplate(replyToken, `問題：${node.title}`, allButtons);
  }

  /**
   * Render answer node (show answer text)
   */
  private async renderAnswerNode(node: ConversationNode, replyToken: string): Promise<void> {
    // Send answer text
    await sendTextMessage(replyToken, `答案：\n\n${node.content || '沒有答案'}`);

    // Send navigation buttons if available
    if (node.children && node.children.length > 0) {
      const buttons = node.children.map((child) => ({
        label: child.title,
        data: child.id,
      }));

      await sendButtonsTemplate(replyToken, '接下來要做什麼？', buttons);
    }
  }

  /**
   * Handle postback event (button click)
   */
  async handlePostback(
    postbackData: string,
    replyToken: string,
    conversationId?: string
  ): Promise<void> {
    try {
      logger.debug('Handling postback', { postbackData, conversationId });

      // Navigate to the node
      const node = await conversationGraphService.navigateToNode(postbackData);

      if (!node) {
        logger.warn('Node not found', { postbackData });
        await sendTextMessage(replyToken, '找不到該選項，請重新選擇。');
        // Return to root
        const rootNode = conversationGraphService.getRootNode();
        await this.renderNode(rootNode, replyToken, conversationId);
        return;
      }

      // Render the node
      await this.renderNode(node, replyToken, conversationId);
    } catch (error) {
      logger.error('Error handling postback', error, { postbackData });
      await sendTextMessage(replyToken, '發生錯誤，請稍後再試。');
    }
  }

  /**
   * Handle text message (fallback to RAG or navigate if it's a command)
   */
  async handleTextMessage(
    text: string,
    replyToken: string,
    conversationId?: string
  ): Promise<boolean> {
    // Check if text matches a category name (for natural language navigation)
    const normalizedText = text.toLowerCase().trim();

    // Common navigation commands
    if (normalizedText === '主選單' || normalizedText === '返回' || normalizedText === 'back') {
      const rootNode = conversationGraphService.getRootNode();
      await this.renderNode(rootNode, replyToken, conversationId);
      return true; // Handled
    }

    // If not a navigation command, return false to let RAG handle it
    return false;
  }
}

// Export singleton instance
export const conversationFlowService = new ConversationFlowService();

