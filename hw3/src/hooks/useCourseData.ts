import { useState, useEffect } from 'react';
import { useAppState } from '../contexts/AppStateContext';

// 課程數據載入 Hook
export function useCourseData() {
  const { appState, loadCourseData } = useAppState();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized && appState.courses.length === 0) {
      console.log('開始載入課程數據...');
      loadCourseData();
      setIsInitialized(true);
    }
  }, [isInitialized, appState.courses.length, loadCourseData]);

  useEffect(() => {
    if (appState.courses.length > 0) {
      console.log('課程數據載入完成，共', appState.courses.length, '筆課程');
    }
  }, [appState.courses.length]);

  return {
    courses: appState.courses,
    isLoading: appState.isLoading,
    isInitialized
  };
}
