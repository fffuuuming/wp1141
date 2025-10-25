import { useState, useEffect, useCallback } from 'react';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

const defaultOptions: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000, // 5 minutes
};

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
  });

  const optionsWithDefaults = { ...defaultOptions, ...options };

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: '此瀏覽器不支援地理位置功能',
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        let errorMessage = '無法獲取位置資訊';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '用戶拒絕了位置權限請求';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置資訊不可用';
            break;
          case error.TIMEOUT:
            errorMessage = '獲取位置資訊超時';
            break;
          default:
            errorMessage = '獲取位置資訊時發生未知錯誤';
            break;
        }

        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      },
      optionsWithDefaults
    );
  }, [optionsWithDefaults.enableHighAccuracy, optionsWithDefaults.timeout, optionsWithDefaults.maximumAge]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearLocation = useCallback(() => {
    setState({
      latitude: null,
      longitude: null,
      accuracy: null,
      error: null,
      loading: false,
    });
  }, []);

  return {
    ...state,
    getCurrentPosition,
    clearError,
    clearLocation,
  };
};
