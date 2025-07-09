import { ref, computed } from 'vue';
import type { LoadingState } from '~/types';

export function useLoading() {
  const loadingStates = ref<Map<string, LoadingState>>(new Map());
  
  const globalLoading = computed(() => {
    return Array.from(loadingStates.value.values()).some(state => state.isLoading);
  });

  const loadingCount = computed(() => {
    return Array.from(loadingStates.value.values()).filter(state => state.isLoading).length;
  });

  function setLoading(key: string, isLoading: boolean, message?: string, progress?: number): void {
    loadingStates.value.set(key, {
      isLoading,
      loadingMessage: message,
      progress
    });
  }

  function getLoading(key: string): LoadingState {
    return loadingStates.value.get(key) || { isLoading: false };
  }

  function removeLoading(key: string): void {
    loadingStates.value.delete(key);
  }

  function clearAllLoading(): void {
    loadingStates.value.clear();
  }

  function withLoading<T>(
    key: string,
    asyncFn: () => Promise<T>,
    message?: string
  ): Promise<T> {
    setLoading(key, true, message);
    
    return asyncFn()
      .finally(() => {
        setLoading(key, false);
      });
  }

  function updateProgress(key: string, progress: number): void {
    const current = loadingStates.value.get(key);
    if (current) {
      current.progress = progress;
      loadingStates.value.set(key, current);
    }
  }

  return {
    loadingStates,
    globalLoading,
    loadingCount,
    setLoading,
    getLoading,
    removeLoading,
    clearAllLoading,
    withLoading,
    updateProgress
  };
} 