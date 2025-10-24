/**
 * 地點數據管理 Hook
 * 提供地點的 CRUD 操作和狀態管理
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
import type { Location, CreateLocationRequest, UpdateLocationRequest } from '../services/api';

interface UseLocationDataReturn {
  locations: Location[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  loadLocations: () => Promise<void>;
  createLocation: (data: CreateLocationRequest) => Promise<void>;
  updateLocation: (id: number, data: UpdateLocationRequest) => Promise<void>;
  deleteLocation: (id: number) => Promise<void>;
  clearError: () => void;
  clearSuccessMessage: () => void;
  setSuccessMessage: (message: string) => void;
}

export const useLocationData = (): UseLocationDataReturn => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getLocations();
      setLocations(response.data);
    } catch (err: any) {
      setError('載入地點失敗：' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  const createLocation = useCallback(async (data: CreateLocationRequest) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.createLocation(data);
      setSuccessMessage('地點新增成功！');
      await loadLocations(); // 重新載入列表
    } catch (err: any) {
      setError('新增地點失敗：' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [loadLocations]);

  const updateLocation = useCallback(async (id: number, data: UpdateLocationRequest) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.updateLocation(id, data);
      setSuccessMessage('地點更新成功！');
      await loadLocations(); // 重新載入列表
    } catch (err: any) {
      setError('更新地點失敗：' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [loadLocations]);

  const deleteLocation = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.deleteLocation(id);
      setSuccessMessage('地點已成功刪除');
      await loadLocations(); // 重新載入列表
    } catch (err: any) {
      setError('刪除地點失敗：' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [loadLocations]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSuccessMessage = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  return {
    locations,
    loading,
    error,
    successMessage,
    loadLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    clearError,
    clearSuccessMessage,
    setSuccessMessage,
  };
};
