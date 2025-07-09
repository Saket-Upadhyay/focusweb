import { ref, computed } from 'vue';
import { DEFAULT_MINUTES, FLUSH_DURATION } from '~/utils/constants';

export function useTimer() {
  const selectedMinutes = ref<number>(DEFAULT_MINUTES);
  const time = ref<number>(selectedMinutes.value * 60);
  const isRunning = ref<boolean>(false);
  const isFlushing = ref<boolean>(false);
  
  let timerInterval: ReturnType<typeof setInterval> | null = null;
  let skipMinuteWatcher = false;
  let timerStartTime: number = 0;
  let timerDuration: number = 0;
  let lastUpdateTime: number = 0;
  let timerWorker: Worker | null = null;

  const minutes = computed(() => Math.floor(time.value / 60));
  const seconds = computed(() => time.value % 60);
  const waterProgress = computed(() => 1 - time.value / (selectedMinutes.value * 60));
  const isInFinalCountdown = computed(() => minutes.value === 0 && seconds.value < 10);
  const isTimerFinished = computed(() => time.value === 0);
  const progressPercentage = computed(() => 1 - (time.value / (selectedMinutes.value * 60)));

  function startTimer(): void {
    if (isRunning.value) return;
    
    timerStartTime = Date.now();
    timerDuration = time.value * 1000;
    lastUpdateTime = Date.now();
    
    isRunning.value = true;
    
    function updateTimer() {
      if (!isRunning.value) return;
      
      const currentTime = Date.now();
      const elapsed = currentTime - timerStartTime;
      const remaining = Math.max(0, timerDuration - elapsed);
      
      const newTimeValue = Math.ceil(remaining / 1000);
      
      if (newTimeValue !== time.value) {
        time.value = newTimeValue;
      }
      
      if (remaining <= 0) {
        pauseTimer();
      } else {
        setTimeout(() => {
          if (isRunning.value) {
            requestAnimationFrame(updateTimer);
          }
        }, 100);
      }
    }
    
    requestAnimationFrame(updateTimer);
  }

  function pauseTimer(): void {
    isRunning.value = false;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function toggleTimer(): void {
    if (isRunning.value) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function resetTimer(): void {
    pauseTimer();
    isFlushing.value = true;
    
    setTimeout(() => {
      isFlushing.value = false;
      time.value = selectedMinutes.value * 60;
    }, FLUSH_DURATION);
  }

  function handleVisibilityChange(): void {
    if (isRunning.value) {
      const currentTime = Date.now();
      const elapsed = currentTime - timerStartTime;
      const remaining = Math.max(0, timerDuration - elapsed);
      
      timerStartTime = currentTime - (timerDuration - remaining);
    }
  }

  function cleanupTimer(): void {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function setSelectedMinutes(minutes: number): void {
    skipMinuteWatcher = true;
    selectedMinutes.value = minutes;
    if (!isRunning.value) {
      time.value = minutes * 60;
    }
    skipMinuteWatcher = false;
  }

  function getSkipMinuteWatcher(): boolean {
    return skipMinuteWatcher;
  }

  function setSkipMinuteWatcher(value: boolean): void {
    skipMinuteWatcher = value;
  }

  return {
    selectedMinutes,
    time,
    isRunning,
    isFlushing,
    minutes,
    seconds,
    waterProgress,
    isInFinalCountdown,
    isTimerFinished,
    progressPercentage,
    startTimer,
    pauseTimer,
    toggleTimer,
    resetTimer,
    handleVisibilityChange,
    cleanupTimer,
    setSelectedMinutes,
    getSkipMinuteWatcher,
    setSkipMinuteWatcher
  };
} 