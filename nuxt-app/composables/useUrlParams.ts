import { useRoute } from '#imports';

export function useUrlParams() {
  const route = useRoute();

  function initializeFromUrl(setSelectedMinutes: (minutes: number) => void, setSkipMinuteWatcher: (value: boolean) => void): void {
    setSkipMinuteWatcher(true);
    
    const minParam = parseFloat(route.query.min as string);
    if (!isNaN(minParam) && minParam >= 0) {
      setSelectedMinutes(minParam);
    }
    
    setSkipMinuteWatcher(false);
  }

  return {
    initializeFromUrl
  };
} 