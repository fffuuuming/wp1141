import { conversationGraphService, type ConversationNode } from './conversationGraphService';
import { sendButtonsTemplate, sendCarouselTemplate, sendTextMessage, replyMessage } from './lineService';
import { Conversation } from '@/lib/models';
import { logger } from '@/lib/utils/logger';
import type { Message } from '@line/bot-sdk';

/**
 * Conversation Flow Service
 * Handles navigation through the conversation graph
 */
class ConversationFlowService {
  /**
   * Render a node and send appropriate message to user
   * Note: replyToken can only be used once, so we don't catch errors here
   * to avoid trying to use the token again
   */
  async renderNode(
    node: ConversationNode,
    replyToken: string,
    conversationId?: string
  ): Promise<void> {
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
    // Note: LINE supports max 4 buttons, so we can only show 3 questions + 1 back button
    if (node.children.length <= 3) {
      // Use buttons template for small number of questions
      const buttons = node.children.map((child) => ({
        label: child.title.length > 20 ? child.title.substring(0, 17) + '...' : child.title,
        data: child.id,
      }));

      // Add back button (max 4 buttons total)
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
      // Note: LINE reply token can only be used once, so we can't send a second message
      // Users can type "主選單" or "返回" to go back
      const carouselItems = node.children.map((child) => ({
        title: child.title.length > 40 ? child.title.substring(0, 37) + '...' : child.title,
        text: '點擊查看答案',
        actions: [
          {
            label: '查看答案',
            data: child.children?.[0]?.id || child.id, // Get answer node ID
            displayText: child.title, // Show question text when clicked
          },
        ],
      }));

      await sendCarouselTemplate(replyToken, carouselItems);
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
        displayText: node.title, // Show question text when clicked
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
   * Send full answer text first, then navigation buttons (both in one reply)
   */
  private async renderAnswerNode(node: ConversationNode, replyToken: string): Promise<void> {
    const answerText = `答案：\n\n${node.content || '沒有答案'}`;

    // Build messages array - can send multiple messages in one reply
    const messages: Message[] = [
      {
        type: 'text',
        text: answerText,
      },
    ];

    // Add navigation buttons if available
    if (node.children && node.children.length > 0) {
      const buttons = node.children.map((child) => ({
        label: child.title,
        data: child.id,
      }));

      // Create buttons template message
      const buttonsToSend = buttons.slice(0, 4);
      const buttonsMessage: Message = {
        type: 'template',
        altText: '接下來要做什麼？',
        template: {
          type: 'buttons',
          text: '接下來要做什麼？',
          actions: buttonsToSend.map((button) => {
            const label = button.label.length > 20 ? button.label.substring(0, 17) + '...' : button.label;
            const data = button.data.length > 300 ? button.data.substring(0, 297) + '...' : button.data;
            return {
              type: 'postback',
              label: label,
              data: data,
              displayText: button.label,
            };
          }),
        },
      };

      messages.push(buttonsMessage);
    }

    // Send all messages in one reply (reply token used only once)
    await replyMessage(replyToken, messages);
  }

  /**
   * Handle postback event (button click)
   * Note: replyToken can only be used once, so errors are logged but not handled
   * with additional messages to avoid reusing the token
   */
  async handlePostback(
    postbackData: string,
    replyToken: string,
    conversationId?: string
  ): Promise<void> {
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

