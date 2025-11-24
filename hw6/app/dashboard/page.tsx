'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type {
  ConversationListItem,
  ConversationListResponse,
} from '@/types/api/conversations';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  });

  // Filters
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
  const [userIdFilter, setUserIdFilter] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dateFilterType, setDateFilterType] = useState<'startedAt' | 'lastMessageAt'>('lastMessageAt');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      params.set('limit', pagination.limit.toString());
      params.set('offset', pagination.offset.toString());
      
      if (activeFilter !== null) {
        params.set('active', activeFilter.toString());
      }
      if (userIdFilter.trim()) {
        params.set('userId', userIdFilter.trim());
      }
      
      // Date range filters
      if (startDate) {
        params.set('startDate', startDate);
      }
      if (endDate) {
        params.set('endDate', endDate);
      }
      if (dateFilterType) {
        params.set('dateFilterType', dateFilterType);
      }

      const response = await fetch(`/api/conversations?${params.toString()}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch conversations');
      }

      const result = data.data as ConversationListResponse;
      setConversations(result.conversations);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [activeFilter, userIdFilter, startDate, endDate, dateFilterType, pagination.offset]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchConversations();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, activeFilter, userIdFilter, startDate, endDate, dateFilterType]);

  const handleFilterChange = (filter: 'all' | 'active' | 'inactive') => {
    if (filter === 'all') {
      setActiveFilter(null);
    } else {
      setActiveFilter(filter === 'active');
    }
    setPagination((prev) => ({ ...prev, offset: 0 }));
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLastMessage = (conversation: ConversationListItem) => {
    if (conversation.messages.length === 0) return '無訊息';
    const lastMsg = conversation.messages[conversation.messages.length - 1];
    const preview = lastMsg.content.substring(0, 50);
    return `${lastMsg.role === 'user' ? '👤' : '🤖'} ${preview}${lastMsg.content.length > 50 ? '...' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">對話紀錄</h1>
          <p className="text-gray-600 mt-1">
            總共 {pagination.total} 個對話
          </p>
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
            onClick={fetchConversations}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            🔄 重新整理
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Active Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              狀態篩選
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeFilter === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => handleFilterChange('active')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeFilter === true
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                進行中
              </button>
              <button
                onClick={() => handleFilterChange('inactive')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeFilter === false
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                已結束
              </button>
            </div>
          </div>

          {/* User ID Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              使用者 ID 搜尋
            </label>
            <input
              type="text"
              value={userIdFilter}
              onChange={(e) => {
                setUserIdFilter(e.target.value);
                setPagination((prev) => ({ ...prev, offset: 0 }));
              }}
              placeholder="輸入使用者 ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date Filter Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              日期篩選類型
            </label>
            <select
              value={dateFilterType}
              onChange={(e) => {
                setDateFilterType(e.target.value as 'startedAt' | 'lastMessageAt');
                setPagination((prev) => ({ ...prev, offset: 0 }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lastMessageAt">最後訊息時間</option>
              <option value="startedAt">開始時間</option>
            </select>
          </div>

          {/* Start Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              開始日期
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPagination((prev) => ({ ...prev, offset: 0 }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              結束日期
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPagination((prev) => ({ ...prev, offset: 0 }));
              }}
              min={startDate || undefined}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Clear Date Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setPagination((prev) => ({ ...prev, offset: 0 }));
              }}
              disabled={!startDate && !endDate}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              清除日期篩選
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>錯誤：</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">載入中...</p>
        </div>
      )}

      {/* Conversations List */}
      {!loading && !error && (
        <>
          {conversations.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
              <p className="text-gray-500 text-lg">目前沒有對話紀錄</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        使用者
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        最後訊息
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        訊息數
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        開始時間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        狀態
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {conversations.map((conv) => (
                      <tr key={conv.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {conv.pictureUrl && (
                              <img
                                className="h-10 w-10 rounded-full mr-3"
                                src={conv.pictureUrl}
                                alt={conv.displayName}
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {conv.displayName || '未知使用者'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {conv.userId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {getLastMessage(conv)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(conv.lastMessageAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {conv.messageCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(conv.startedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              conv.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {conv.isActive ? '進行中' : '已結束'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/dashboard/conversations/${conv.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            查看詳情
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.total > pagination.limit && (
                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
                  <div className="text-sm text-gray-700">
                    顯示 {pagination.offset + 1} -{' '}
                    {Math.min(pagination.offset + pagination.limit, pagination.total)} /{' '}
                    {pagination.total}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          offset: Math.max(0, prev.offset - prev.limit),
                        }))
                      }
                      disabled={pagination.offset === 0}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一頁
                    </button>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          offset: prev.offset + prev.limit,
                        }))
                      }
                      disabled={!pagination.hasMore}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一頁
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

