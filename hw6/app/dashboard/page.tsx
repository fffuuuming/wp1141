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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">💬 對話紀錄</h1>
          <p className="text-gray-600 text-sm">
            總共 <span className="font-semibold text-gray-900">{pagination.total}</span> 個對話
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm text-gray-700 font-medium">自動更新</span>
          </label>
          <button
            onClick={fetchConversations}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all text-sm font-medium flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>重新整理</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">🔍</span>
            篩選條件
          </h2>
        </div>
        
        <div className="space-y-6">
          {/* First Row: Status and User ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                <span className="mr-2">📊</span>
                狀態篩選
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeFilter === null
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  全部
                </button>
                <button
                  onClick={() => handleFilterChange('active')}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeFilter === true
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  進行中
                </button>
                <button
                  onClick={() => handleFilterChange('inactive')}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeFilter === false
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  已結束
                </button>
              </div>
            </div>

            {/* User ID Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                <span className="mr-2">👤</span>
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
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Second Row: Date Filters */}
          <div className="pt-4 border-t border-gray-200">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">
                <span className="mr-2">📅</span>
                日期篩選
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Filter Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                  篩選類型
                </label>
                <select
                  value={dateFilterType}
                  onChange={(e) => {
                    setDateFilterType(e.target.value as 'startedAt' | 'lastMessageAt');
                    setPagination((prev) => ({ ...prev, offset: 0 }));
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="lastMessageAt">最後訊息時間</option>
                  <option value="startedAt">開始時間</option>
                </select>
              </div>

              {/* Start Date Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                  開始日期
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPagination((prev) => ({ ...prev, offset: 0 }));
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* End Date Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
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
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                  className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 hover:border-gray-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:hover:border-gray-300 text-sm font-medium"
                >
                  🗑️ 清除日期
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg shadow-sm">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <div>
              <strong className="font-semibold">錯誤：</strong> {error}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">載入中...</p>
        </div>
      )}

      {/* Conversations List */}
      {!loading && !error && (
        <>
          {conversations.length === 0 ? (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-500 text-lg font-medium">目前沒有對話紀錄</p>
              <p className="text-gray-400 text-sm mt-2">請調整篩選條件或稍後再試</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        使用者
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        最後訊息
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        訊息數
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        開始時間
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        狀態
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {conversations.map((conv) => (
                      <tr key={conv.id} className="hover:bg-blue-50 transition-colors duration-150">
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
                            className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full ${
                              conv.isActive
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full mr-1.5 ${
                              conv.isActive ? 'bg-green-500' : 'bg-gray-400'
                            }`}></span>
                            {conv.isActive ? '進行中' : '已結束'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/dashboard/conversations/${conv.id}`}
                            className="inline-flex items-center px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                          >
                            <span className="mr-1">👁️</span>
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
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-4">
                  <div className="text-sm text-gray-700 font-medium">
                    <span className="text-gray-900">顯示</span> {pagination.offset + 1} -{' '}
                    {Math.min(pagination.offset + pagination.limit, pagination.total)} /{' '}
                    <span className="text-gray-900">{pagination.total}</span>
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
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all shadow-sm"
                    >
                      ← 上一頁
                    </button>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          offset: prev.offset + prev.limit,
                        }))
                      }
                      disabled={!pagination.hasMore}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all shadow-sm"
                    >
                      下一頁 →
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

