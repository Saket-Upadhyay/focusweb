import { onMounted, onUnmounted } from 'vue';

export function useEventHandlers(
  toggleTimer: () => void,
  resetTimer: () => void,
  toggleSettings: () => void,
  handleVisibilityChange: () => void,
  minutePickerRef: any,
  isRunning: any
) {
  function handleKeydown(e: KeyboardEvent): void {
    if (e.code === 'Space') {
      e.preventDefault();
      toggleTimer();
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      resetTimer();
    } else if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      toggleSettings();
    }
  }

  function handleGlobalWheel(e: WheelEvent): void {
    if (isRunning.value) return;
    
    const picker = minutePickerRef.value;
    if (picker?.$?.exposed?.onWheel) {
      picker.$.exposed.onWheel(e);
    }
  }

  function setupEventListeners(): void {
    window.addEventListener('keydown', handleKeydown);
    document.addEventListener('wheel', handleGlobalWheel, { passive: false });
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  function cleanupEventListeners(): void {
    window.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('wheel', handleGlobalWheel);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  }

  onMounted(() => {
    setupEventListeners();
  });

  onUnmounted(() => {
    cleanupEventListeners();
  });

  return {
    handleKeydown,
    handleGlobalWheel,
    setupEventListeners,
    cleanupEventListeners
  };
} 