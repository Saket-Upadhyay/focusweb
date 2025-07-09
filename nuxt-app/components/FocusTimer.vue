<template>
  <div class="focus-timer-bg">
    <ErrorBoundary
      :onRetry="handleRetry"
      :onReset="handleReset"
      @error="handleError"
    >
      <div class="focus-timer-wrapper">
        <Paani 
          class="water-bg" 
          :progress="waterProgress" 
          :flushing="isFlushing" 
          :isRunning="isRunning && !isTimerFinished" 
          :remainingMinutes="minutes"
          :progressPercentage="progressPercentage"
        />
        
        <div class="minute-picker-abs" :class="{ hidden: isRunning }">
          <MinuteWheelPicker 
            ref="minutePickerRef" 
            v-model="selectedMinutes" 
            :disabled="isRunning"
            :min="1"
          />
        </div>
        
        <div class="timer-center">
          <div 
            class="timer-display" 
            :class="{ 
              running: isRunning, 
              countdown: isInFinalCountdown,
              'chime-playing': chimePlaying
            }"
          >
            {{ timeInWords }}
          </div>
          
          <div class="controls-row">
            <div class="controls-text" tabindex="0">
              <span class="controls-key">&#8593;</span>
              <span class="controls-key">&#8595;</span> 
              Set minutes
            </div>
            
            <div 
              class="controls-text" 
              tabindex="0" 
              @click="handleToggleTimer"
            >
              <span 
                class="controls-key controls-space" 
                role="button" 
                tabindex="0"  
                @keydown.enter.prevent="handleToggleTimer" 
                :aria-label="isRunning ? 'Pause' : 'Start'"
              >
                <span class="spacebar-icon"></span>
              </span>
              <span>{{ isRunning ? 'Pause' : 'Start' }}</span>
            </div>
            
            <div 
              class="controls-text" 
              tabindex="0"  
              @click="resetTimer"
            >
              <span 
                class="controls-key" 
                role="button" 
                tabindex="0" 
                @keydown.enter.prevent="resetTimer" 
                aria-label="Reset timer"
              >
                R
              </span> 
              Reset
            </div>
            
            <div 
              class="controls-text" 
              tabindex="0"  
              @click="openSettings"
            >
              <span 
                class="controls-key" 
                role="button" 
                tabindex="0" 
                @keydown.enter.prevent="openSettings" 
                aria-label="Open settings"
              >
                P
              </span> 
              Settings
            </div>
          </div>
        </div>
      <BaseModal
        v-model:isOpen="settingsOpen"
        title="Settings"
        size="md"
        @close="closeSettings"
      >
        <div class="settings-content">
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-icon">🔊</span>
              <span>Chime Sound (plays 3x)</span>
            </div>
            <div class="setting-control">
              <BaseToggle
                v-model="chimeEnabled"
                size="md"
                aria-label="Enable chime sound"
              />
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-icon">🔔</span>
              <span>Browser Notifications</span>
            </div>
            <div class="setting-control">
              <BaseToggle
                v-model="notificationsEnabled"
                size="md"
                aria-label="Enable browser notifications"
              />
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-icon">🎵</span>
              <span>Test Chime</span>
            </div>
            <div class="setting-control">
              <BaseButton
                variant="primary"
                size="sm"
                @click="handleTestChime"
                :disabled="!chimeEnabled"
              >
                Play
              </BaseButton>
            </div>
          </div>
        </div>
        
        <template #footer>
          <p class="settings-hint">
            Press <kbd>P</kbd> to close settings
          </p>
        </template>
      </BaseModal>
      </div>
    </ErrorBoundary>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import Paani from './Paani.vue';
import MinuteWheelPicker from './MinuteWheelPicker.vue';

import { formatTimeInWords } from '~/utils/timeUtils';
import { useTimer } from '~/composables/useTimer';
import { useNotifications } from '~/composables/useNotifications';
import { useUrlParams } from '~/composables/useUrlParams';
import { useSettings } from '~/composables/useSettings';
import { useAudioGenerator } from '~/composables/useAudioGenerator';
import { useEventHandlers } from '~/composables/useEventHandlers';
import { useErrorHandler } from '~/composables/useErrorHandler';
import { useLoading } from '~/composables/useLoading';
import BaseModal from '~/components/ui/BaseModal.vue';
import BaseButton from '~/components/ui/BaseButton.vue';
import BaseToggle from '~/components/ui/BaseToggle.vue';
import ErrorBoundary from '~/components/ui/ErrorBoundary.vue';
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue';

const minutePickerRef = ref<any>(null);

const {
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
} = useTimer();

const {
  notificationsEnabled,
  showNotification,
  requestNotificationPermission
} = useNotifications();

const { initializeFromUrl } = useUrlParams();

const {
  settingsOpen,
  chimeEnabled,
  openSettings,
  closeSettings,
  toggleSettings
} = useSettings();

const {
  hasPlayedChime,
  chimePlaying,
  playChime,
  testChime,
  resetChimeState
} = useAudioGenerator();

const { addError, hasErrors } = useErrorHandler();
const { globalLoading } = useLoading();

const timeInWords = computed(() => formatTimeInWords(minutes.value, seconds.value));

function handleTimerFinish(): void {
  console.log('handleTimerFinish', {
    hasPlayedChime: hasPlayedChime.value,
    isRunning: isRunning.value,
    chimeEnabled: chimeEnabled.value
  });
  if (!hasPlayedChime.value) {
    console.log('Playing chime at timer end');
    playChime(false, chimeEnabled.value);
  } else {
    console.log('Chime not played', {
      hasPlayedChime: hasPlayedChime.value,
      isRunning: isRunning.value,
      chimeEnabled: chimeEnabled.value
    });
  }
  showNotification();
}

function handleStartTimer(): void {
  resetChimeState();
  startTimer();
}

function handleToggleTimer(): void {
  if (isRunning.value) {
    pauseTimer();
  } else {
    handleStartTimer();
  }
}

function handleTestChime(): void {
  testChime(chimeEnabled.value);
}

function handleRetry(): void {
  resetTimer();
  addError('Timer reset due to error recovery', 'RECOVERY', 'FocusTimer');
}

function handleReset(): void {
  resetTimer();
  resetChimeState();
  addError('Timer reset due to error recovery', 'RECOVERY', 'FocusTimer');
}

function handleError(error: any): void {
  addError(error.message, 'COMPONENT_ERROR', 'FocusTimer');
}

watch(selectedMinutes, (newVal) => {
  if (getSkipMinuteWatcher()) return;
  if (!isRunning.value) {
    time.value = newVal * 60;
  }
});

watch(isTimerFinished, (finished) => {
  if (finished) {
    handleTimerFinish();
  }
});

onMounted(() => {
  initializeFromUrl(setSelectedMinutes, setSkipMinuteWatcher);
  requestNotificationPermission();
});

onUnmounted(() => {
  cleanupTimer();
});

const {
  setupEventListeners,
  cleanupEventListeners
} = useEventHandlers(
  handleToggleTimer,
  resetTimer,
  toggleSettings,
  handleVisibilityChange,
  minutePickerRef,
  isRunning
);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap');

:root, * {
  font-family: 'Noto Sans', 'Quicksand', 'Inter', 'Roboto', Arial, sans-serif;
}

.focus-timer-bg {
  min-height: 100vh;
  width: 100vw;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.focus-timer-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  --scale-factor: min(1, max(0.6, min(100vw / 1200, 100vh / 800)));
  transform: scale(var(--scale-factor));
  transform-origin: center center;
}

.minute-picker-abs {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  transition: opacity 0.3s ease, transform 0.3s ease;
  left: clamp(2rem, 5vw, 4rem);
}

.minute-picker-abs.hidden {
  opacity: 0;
  transform: translateY(-50%) translateX(-100%);
  pointer-events: none;
}

.timer-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}

.timer-display {
  font-family: 'Noto Sans', 'Quicksand', 'Inter', 'Roboto', Arial, sans-serif;
  font-size: clamp(2rem, 8vw, 6rem);
  font-weight: 400;
  color: rgba(0, 0, 0, 0.9);
  margin-bottom: 1.5rem;
  letter-spacing: 0.2em;
  transition: font-size 0.5s cubic-bezier(0.4,0,0.2,1);
}

.timer-display.running {
  font-size: clamp(2rem, 6vw, 5rem);
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: var(--timer-max-width, 100vw);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  word-break: break-word;
  white-space: nowrap;
  padding: 2rem 0;
}

.timer-display.countdown {
  font-size: clamp(3rem, 15vw, 24rem);
  color: rgba(0, 0, 0, 0.85);
  font-weight: 700;
}

.timer-display.chime-playing {
  animation: chime-pulse 0.5s ease-in-out;
  color: #42b8ff;
  text-shadow: 0 0 20px rgba(66, 184, 255, 0.6);
}

@keyframes chime-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.controls-row {
  display: flex;
  gap: clamp(0.8rem, 2vw, 1.5rem);
  justify-content: center;
  align-items: center;
  margin-top: clamp(1rem, 3vh, 2rem);
  flex-wrap: wrap;
  max-width: 90vw;
}

.controls-text {
  margin-top: 0;
  font-size: clamp(0.9rem, 2.5vw, 1.2rem);
  color: #2196f3;
  background: rgba(255,255,255,0.85);
  border-radius: 2rem;
  padding: clamp(0.25rem, 1vw, 0.4rem) clamp(0.8rem, 2vw, 1.5rem);
  box-shadow: 0 2px 8px rgba(66, 184, 255, 0.08);
  font-family: 'Noto Sans', 'Quicksand', 'Inter', 'Roboto', Arial, sans-serif;
  font-weight: 500;
  letter-spacing: 0.05em;
  display: inline-flex;
  align-items: center;
  gap: clamp(0.3rem, 1vw, 0.6rem);
  user-select: none;
  pointer-events: auto;
  cursor: pointer;
  transition: box-shadow 0.18s, background 0.18s;
  position: relative;
  white-space: nowrap;
}

.controls-text:focus, 
.controls-text:hover {
  background: #e3f6fd;
  box-shadow: 0 4px 16px rgba(66, 184, 255, 0.18);
}

.controls-key {
  display: inline-block;
  background: #e3f6fd;
  color: #1565c0;
  border-radius: 0.7em;
  font-size: clamp(0.8em, 2vw, 1em);
  font-weight: 700;
  padding: 0.13em 0.7em;
  margin: 0 0.1em;
  box-shadow: 0 1px 2px rgba(66,184,255,0.08);
  border: 1.5px solid #b2ebf2;
}

.controls-space {
  padding: 0.13em 0.3em;
}

.spacebar-icon {
  display: inline-block;
  width: 2.2em;
  height: 1.1em;
  border-radius: 0.4em;
  background: #e3f6fd;
  border: 1.5px solid #b2ebf2;
  box-shadow: 0 1px 2px rgba(66,184,255,0.08);
  position: relative;
}

.spacebar-icon::after {
  content: '';
  display: block;
  position: absolute;
  left: 15%;
  right: 15%;
  top: 60%;
  height: 0.18em;
  background: #1565c0;
  border-radius: 0.1em;
}

.water-bg {
  z-index: 0 !important;
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
}

.controls-row, 
.controls-text, 
.controls-key, 
.spacebar-icon {
  font-family: 'Noto Sans', 'Quicksand', 'Inter', 'Roboto', Arial, sans-serif;
}

@media (max-width: 480px) {
  .focus-timer-wrapper {
    --scale-factor: min(1, max(0.5, min(100vw / 800, 100vh / 600)));
  }
  
  .minute-picker-abs {
    left: clamp(1rem, 3vw, 2rem);
  }
  
  .controls-row {
    gap: clamp(0.5rem, 1.5vw, 1rem);
    margin-top: clamp(0.8rem, 2vh, 1.5rem);
  }
  
  .controls-text {
    padding: clamp(0.2rem, 0.8vw, 0.3rem) clamp(0.6rem, 1.5vw, 1rem);
    gap: clamp(0.2rem, 0.8vw, 0.4rem);
  }
}

@media (max-height: 600px) {
  .focus-timer-wrapper {
    --scale-factor: min(1, max(0.5, min(100vw / 1000, 100vh / 500)));
  }
  
  .timer-display {
    margin-bottom: clamp(0.8rem, 2vh, 1.2rem);
  }
  
  .controls-row {
    margin-top: clamp(0.8rem, 2vh, 1.2rem);
  }
}

.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.settings-panel {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
  font-family: 'Noto Sans', 'Quicksand', 'Inter', 'Roboto', Arial, sans-serif;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.settings-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.settings-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-close:hover {
  background: #e0e0e0;
  color: #333;
}

.settings-content {
  padding: 2rem;
  max-height: 60vh;
  overflow-y: auto;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.1rem;
  color: #333;
  font-weight: 500;
}

.setting-icon {
  font-size: 1.3rem;
  width: 2rem;
  text-align: center;
}

.setting-control {
  display: flex;
  align-items: center;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 3.5rem;
  height: 2rem;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 2rem;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 1.6rem;
  width: 1.6rem;
  left: 0.2rem;
  bottom: 0.2rem;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #42b8ff;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(1.5rem);
}

.test-button {
  background: #42b8ff;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: 'Noto Sans', 'Quicksand', 'Inter', 'Roboto', Arial, sans-serif;
}

.test-button:hover:not(:disabled) {
  background: #2196f3;
}

.test-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.settings-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
  text-align: center;
}

.settings-hint {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.settings-hint kbd {
  background: #e0e0e0;
  border: 1px solid #ccc;
  border-radius: 0.3rem;
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
  font-family: monospace;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(2rem) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 600px) {
  .settings-panel {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
  }
  
  .settings-header {
    padding: 1rem 1.5rem;
  }
  
  .settings-content {
    padding: 1.5rem;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .setting-control {
    align-self: flex-end;
  }
}
</style>

<style>
html, body {
  overflow: hidden !important;
  height: 100%;
}
</style> 