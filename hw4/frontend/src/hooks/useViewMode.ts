/**
 * 視圖模式管理 Hook
 * 提供視圖模式切換功能
 */

import { useState } from 'react';

type ViewMode = 'list' | 'map' | 'both';

interface UseViewModeReturn {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  isListView: boolean;
  isMapView: boolean;
  isBothView: boolean;
}

export const useViewMode = (initialMode: ViewMode = 'both'): UseViewModeReturn => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);

  const toggleViewMode = () => {
    const modes: ViewMode[] = ['list', 'map', 'both'];
    const currentIndex = modes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setViewMode(modes[nextIndex]);
  };

  const isListView = viewMode === 'list';
  const isMapView = viewMode === 'map';
  const isBothView = viewMode === 'both';

  return {
    viewMode,
    setViewMode,
    toggleViewMode,
    isListView,
    isMapView,
    isBothView,
  };
};
