'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ConversationDetail, MessageListItem } from '@/types/api/conversations';

export default function ConversationDetailPage() {
  const params = useParams();
  const conversationId = params.id as string;

  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch conversation details
  const fetchConversation = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/conversations/${conversationId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch conversation');
      }

      setConversation(data.data as ConversationDetail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (conversationId) {
      fetchConversation();
    }
  }, [conversationId]);

  // Auto-refresh every 3 seconds (more frequent for detail page)
  useEffect(() => {
    if (!autoRefresh || !conversationId) return;

    const interval = setInterval(() => {
      fetchConversation();
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, conversationId]);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatMessageTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">載入中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>錯誤：</strong> {error}
        </div>
        <Link
          href="/dashboard"
          className="text-blue-600 hover:text-blue-900"
        >
          ← 返回對話列表
        </Link>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">找不到此對話</p>
        <Link
          href="/dashboard"
          className="text-blue-600 hover:text-blue-900 mt-4 inline-block"
        >
          ← 返回對話列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-900 mb-4 inline-block"
          >
            ← 返回對話列表
          </Link>
          <div className="flex items-center space-x-4">
            {conversation.pictureUrl && (
              <img
                className="h-16 w-16 rounded-full"
                src={conversation.pictureUrl}
                alt={conversation.displayName}
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {conversation.displayName || '未知使用者'}
              </h1>
              <p className="text-gray-600 mt-1">
                {conversation.userId}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">自動更新</span>
          </label>
          <button
            onClick={fetchConversation}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            🔄 重新整理
          </button>
        </div>
      </div>

      {/* Conversation Info */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500">狀態</div>
            <div className="mt-1">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  conversation.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {conversation.isActive ? '進行中' : '已結束'}
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">訊息數</div>
            <div className="text-lg font-semibold text-gray-900">
              {conversation.messageCount}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">開始時間</div>
            <div className="text-sm text-gray-900">
              {formatDate(conversation.startedAt)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">最後訊息</div>
            <div className="text-sm text-gray-900">
              {formatDate(conversation.lastMessageAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            對話內容 ({conversation.messages.length} 則訊息)
          </h2>
        </div>
        <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
          {conversation.messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              目前沒有訊息
            </div>
          ) : (
            conversation.messages.map((message: MessageListItem) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === 'user'
                        ? 'text-blue-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {formatMessageTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

