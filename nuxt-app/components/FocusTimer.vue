<template>
  <div class="focus-timer-bg">
    <div class="focus-timer-wrapper">
      <!-- Water animation background -->
      <Paani 
        class="water-bg" 
        :progress="waterProgress" 
        :flushing="isFlushing" 
        :isRunning="isRunning && !isTimerFinished" 
        :remainingMinutes="minutes"
        :progressPercentage="progressPercentage"
      />
      
      <!-- Minute picker (left side) -->
      <div class="minute-picker-abs" :class="{ hidden: isRunning }">
        <MinuteWheelPicker 
          ref="minutePickerRef" 
          v-model="selectedMinutes" 
          :disabled="isRunning"
          :min="1"
        />
      </div>
      
      <!-- Timer display and controls (center) -->
      <div class="timer-center">
        <div 
          class="timer-display" 
          :class="{ 
            running: isRunning, 
            countdown: isInFinalCountdown 
          }"
        >
          {{ timeInWords }}
        </div>
        
        <div class="controls-row">
          <!-- Minute adjustment hint -->
          <div class="controls-text" tabindex="0">
            <span class="controls-key">&#8593;</span>
            <span class="controls-key">&#8595;</span> 
            Set minutes
          </div>
          
          <!-- Start/Pause button -->
          <div 
            class="controls-text" 
            tabindex="0" 
            @click="toggleTimer"
          >
            <span 
              class="controls-key controls-space" 
              role="button" 
              tabindex="0"  
              @keydown.enter.prevent="toggleTimer" 
              :aria-label="isRunning ? 'Pause' : 'Start'"
            >
              <span class="spacebar-icon"></span>
            </span>
            <span>{{ isRunning ? 'Pause' : 'Start' }}</span>
          </div>
          
          <!-- Reset button -->
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from '#imports';
import Paani from './Paani.vue';
import MinuteWheelPicker from './MinuteWheelPicker.vue';

// ===== CONSTANTS =====
const DEFAULT_MINUTES = 5;
const COUNTDOWN_THRESHOLD = 10; // seconds
const FLUSH_DURATION = 600; // ms
const TIMER_INTERVAL = 1000; // ms

// ===== STATE MANAGEMENT =====
const selectedMinutes = ref<number>(DEFAULT_MINUTES);
const time = ref<number>(selectedMinutes.value * 60);
const isRunning = ref<boolean>(false);
const isFlushing = ref<boolean>(false);
const minutePickerRef = ref<any>(null);

// Timer interval management
let timerInterval: ReturnType<typeof setInterval> | null = null;
let skipMinuteWatcher = false;

// ===== UTILITIES =====
const numberWords = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
  'twenty-one', 'twenty-two', 'twenty-three', 'twenty-four', 'twenty-five', 'twenty-six', 'twenty-seven', 'twenty-eight', 'twenty-nine', 'thirty',
  'thirty-one', 'thirty-two', 'thirty-three', 'thirty-four', 'thirty-five', 'thirty-six', 'thirty-seven', 'thirty-eight', 'thirty-nine', 'forty',
  'forty-one', 'forty-two', 'forty-three', 'forty-four', 'forty-five', 'forty-six', 'forty-seven', 'forty-eight', 'forty-nine', 'fifty',
  'fifty-one', 'fifty-two', 'fifty-three', 'fifty-four', 'fifty-five', 'fifty-six', 'fifty-seven', 'fifty-eight', 'fifty-nine', 'sixty'
];

function numberToWords(n: number): string {
  if (n >= 0 && n <= 60) return numberWords[n];
  return n.toString();
}

// ===== COMPUTED PROPERTIES =====
const minutes = computed(() => Math.floor(time.value / 60));
const seconds = computed(() => time.value % 60);
const waterProgress = computed(() => 1 - time.value / (selectedMinutes.value * 60));
const isInFinalCountdown = computed(() => minutes.value === 0 && seconds.value < COUNTDOWN_THRESHOLD);
const isTimerFinished = computed(() => time.value === 0);
const progressPercentage = computed(() => 1 - (time.value / (selectedMinutes.value * 60)));

const timeInWords = computed(() => {
  const min = minutes.value;
  const sec = seconds.value;
  
  // More than 1 minute remaining
  if (min > 1) {
    // Round up if more than 30 seconds remaining
    const displayMinutes = sec > 30 ? min + 1 : min;
    return `${numberToWords(displayMinutes)} minutes left.`;
  }
  
  // Exactly 1 minute remaining
  if (min === 1) {
    if (sec === 0) {
      return 'Just one minute left.';
    } else {
      return formatSecondsOnly(sec);
    }
  }
  
  // Less than 1 minute remaining
  if (min === 0) {
    if (sec > 0) {
      return formatSecondsOnly(sec);
    } else {
      return '---';
    }
  }
  
  return '---';
});

function formatSecondsOnly(sec: number): string {
  if (sec < COUNTDOWN_THRESHOLD) {
    return `${sec}`;
  } else {
    const roundedSec = Math.floor(sec / 10) * 10;
    return `Only ${numberToWords(roundedSec)} seconds to go!`;
  }
}

// ===== TIMER CONTROLS =====
function startTimer(): void {
  if (isRunning.value) return;
  
  isRunning.value = true;
  timerInterval = setInterval(() => {
    if (time.value > 0) {
      time.value--;
    } else {
      pauseTimer();
    }
  }, TIMER_INTERVAL);
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

// ===== EVENT HANDLERS =====
function handleKeydown(e: KeyboardEvent): void {
  if (e.code === 'Space') {
    e.preventDefault();
    toggleTimer();
  } else if (e.key === 'r' || e.key === 'R') {
    e.preventDefault();
    resetTimer();
  }
}

function handleGlobalWheel(e: WheelEvent): void {
  if (isRunning.value) return;
  
  const picker = minutePickerRef.value;
  if (picker?.$?.exposed?.onWheel) {
    picker.$.exposed.onWheel(e);
  }
}

// ===== WATCHERS =====
watch(selectedMinutes, (newVal) => {
  if (skipMinuteWatcher) return;
  if (!isRunning.value) {
    time.value = newVal * 60;
  }
});

// ===== LIFECYCLE =====
const route = useRoute();

onMounted(() => {
  initializeFromUrl();
  setupEventListeners();
});

onUnmounted(() => {
  cleanupEventListeners();
  cleanupTimer();
});

function initializeFromUrl(): void {
  skipMinuteWatcher = true;
  
  const minParam = parseInt(route.query.min as string);
  if (!isNaN(minParam) && minParam >= 0) {
    selectedMinutes.value = minParam;
    time.value = minParam * 60;
  }
  
  skipMinuteWatcher = false;
}

function setupEventListeners(): void {
  window.addEventListener('keydown', handleKeydown);
  document.addEventListener('wheel', handleGlobalWheel, { passive: false });
}

function cleanupEventListeners(): void {
  window.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('wheel', handleGlobalWheel);
}

function cleanupTimer(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap');

/* ===== GLOBAL STYLES ===== */
:root, * {
  font-family: 'Noto Sans', 'Quicksand', 'Inter', 'Roboto', Arial, sans-serif;
}

/* ===== LAYOUT ===== */
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
  /* Dynamic scaling based on viewport */
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
  /* Responsive positioning */
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

/* ===== TIMER DISPLAY ===== */
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
  font-size: clamp(3rem, 15vw, 12rem);
  color: rgba(255, 255, 255, 0.85);
  font-weight: 700;
}

/* ===== CONTROLS ===== */
.controls-row {
  display: flex;
  gap: clamp(0.8rem, 2vw, 1.5rem);
  justify-content: center;
  align-items: center;
  margin-top: clamp(1rem, 3vh, 2rem);
  /* Responsive layout */
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
  /* Responsive sizing */
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

/* ===== BACKGROUND ELEMENTS ===== */
.water-bg {
  z-index: 0 !important;
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
}

/* ===== FONT OVERRIDES ===== */
.controls-row, 
.controls-text, 
.controls-key, 
.spacebar-icon {
  font-family: 'Noto Sans', 'Quicksand', 'Inter', 'Roboto', Arial, sans-serif;
}

/* ===== RESPONSIVE BREAKPOINTS ===== */
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
</style>

<style>
html, body {
  overflow: hidden !important;
  height: 100%;
}
</style> 