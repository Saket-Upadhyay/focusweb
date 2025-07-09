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
            countdown: isInFinalCountdown,
            'chime-playing': chimePlaying
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
          
          <!-- Settings button -->
          <div 
            class="controls-text" 
            tabindex="0"  
            @click="settingsOpen = true"
          >
            <span 
              class="controls-key" 
              role="button" 
              tabindex="0" 
              @keydown.enter.prevent="settingsOpen = true" 
              aria-label="Open settings"
            >
              P
            </span> 
            Settings
          </div>
        </div>
      </div>
    </div>
    
    <!-- Settings Panel -->
    <div 
      v-if="settingsOpen" 
      class="settings-overlay"
      @click="settingsOpen = false"
    >
      <div 
        class="settings-panel"
        @click.stop
      >
        <div class="settings-header">
          <h2>Settings</h2>
          <button 
            class="settings-close"
            @click="settingsOpen = false"
            aria-label="Close settings"
          >
            ×
          </button>
        </div>
        
        <div class="settings-content">
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-icon">🔊</span>
              <span>Chime Sound (plays 3x)</span>
            </div>
            <div class="setting-control">
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="chimeEnabled"
                >
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-icon">🔔</span>
              <span>Browser Notifications</span>
            </div>
            <div class="setting-control">
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="notificationsEnabled"
                >
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <span class="setting-icon">🎵</span>
              <span>Test Chime</span>
            </div>
            <div class="setting-control">
              <button 
                class="test-button"
                @click="testChime"
                :disabled="!chimeEnabled"
              >
                Play
              </button>
            </div>
          </div>
        </div>
        
        <div class="settings-footer">
          <p class="settings-hint">
            Press <kbd>P</kbd> to close settings
          </p>
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

// Audio context for chime sound
let audioContext: AudioContext | null = null;
let hasPlayedChime = ref<boolean>(false);
const chimeEnabled = ref<boolean>(true);
const chimePlaying = ref<boolean>(false);
const notificationsEnabled = ref<boolean>(true);

// Settings panel
const settingsOpen = ref<boolean>(false);

// Chime sequence tracking
let chimeSequenceCount = 0;
const TOTAL_CHIMES = 3;
const CHIME_INTERVAL = 2000; // 2 seconds between chimes

// Robust timer tracking for background execution
let timerStartTime: number = 0;
let timerDuration: number = 0;
let lastUpdateTime: number = 0;
let timerWorker: Worker | null = null;

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

// ===== CHIME SOUND =====
function playChime(isTest: boolean = false): void {
  // Don't play if chime is disabled
  if (!chimeEnabled.value) return;
  
  // Initialize audio context if not already done
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  // Resume audio context if suspended (required for autoplay policies)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  // Create a classical music-inspired chime with orchestral harmonies
  const duration = 8.0; // 8 seconds - longer for classical progression
  const now = audioContext.currentTime;
  
  // Classical chord progression: I - IV - V - I (C major)
  // Each chord has multiple voices for rich orchestral sound
  const chordProgression = [
    // C major (I) - Root position
    { time: 0, chord: [
      { freq: 261.63, type: 'sine', gain: 0.4, voice: 'bass' },      // C3 - bass
      { freq: 523.25, type: 'sine', gain: 0.35, voice: 'tenor' },     // C4 - tenor
      { freq: 659.25, type: 'sine', gain: 0.3, voice: 'alto' },       // E4 - alto
      { freq: 783.99, type: 'sine', gain: 0.25, voice: 'soprano' },   // G4 - soprano
      { freq: 1046.50, type: 'triangle', gain: 0.15, voice: 'harmony' } // C5 - harmony
    ]},
    // F major (IV) - First inversion
    { time: 2.5, chord: [
      { freq: 349.23, type: 'sine', gain: 0.4, voice: 'bass' },       // F3 - bass
      { freq: 523.25, type: 'sine', gain: 0.35, voice: 'tenor' },     // C4 - tenor
      { freq: 698.46, type: 'sine', gain: 0.3, voice: 'alto' },       // F4 - alto
      { freq: 880.00, type: 'sine', gain: 0.25, voice: 'soprano' },   // A4 - soprano
      { freq: 1396.91, type: 'triangle', gain: 0.15, voice: 'harmony' } // F5 - harmony
    ]},
    // G major (V) - Second inversion
    { time: 5.0, chord: [
      { freq: 392.00, type: 'sine', gain: 0.4, voice: 'bass' },       // G3 - bass
      { freq: 523.25, type: 'sine', gain: 0.35, voice: 'tenor' },     // C4 - tenor
      { freq: 659.25, type: 'sine', gain: 0.3, voice: 'alto' },       // E4 - alto
      { freq: 783.99, type: 'sine', gain: 0.25, voice: 'soprano' },   // G4 - soprano
      { freq: 1567.98, type: 'triangle', gain: 0.15, voice: 'harmony' } // G5 - harmony
    ]},
    // C major (I) - Final resolution
    { time: 7.5, chord: [
      { freq: 261.63, type: 'sine', gain: 0.4, voice: 'bass' },       // C3 - bass
      { freq: 523.25, type: 'sine', gain: 0.35, voice: 'tenor' },     // C4 - tenor
      { freq: 659.25, type: 'sine', gain: 0.3, voice: 'alto' },       // E4 - alto
      { freq: 783.99, type: 'sine', gain: 0.25, voice: 'soprano' },   // G4 - soprano
      { freq: 1046.50, type: 'triangle', gain: 0.15, voice: 'harmony' } // C5 - harmony
    ]}
  ];
  
  // Create a master gain node for overall volume control
  const masterGain = audioContext.createGain();
  masterGain.connect(audioContext.destination);
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(0.7, now + 1.0);
  masterGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
  
  // Play each chord in the progression
  chordProgression.forEach(({ time, chord }, chordIndex) => {
    const chordStartTime = now + time;
    const chordDuration = chordIndex === chordProgression.length - 1 ? 
      duration - time : 
      chordProgression[chordIndex + 1].time - time;
    
    chord.forEach(({ freq, type, gain, voice }, noteIndex) => {
      const oscillator = audioContext!.createOscillator();
      const gainNode = audioContext!.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(masterGain);
      
      // Set frequency and wave type
      oscillator.frequency.setValueAtTime(freq, chordStartTime);
      oscillator.type = type as OscillatorType;
      
      // Create orchestral-style envelope with voice-specific characteristics
      const attackTime = 0.3 + (noteIndex * 0.05); // Staggered attack for natural feel
      const decayTime = 1.0;
      const sustainLevel = voice === 'bass' ? 0.8 : 0.6; // Bass sustains longer
      const releaseTime = chordDuration - attackTime - decayTime;
      
      gainNode.gain.setValueAtTime(0, chordStartTime);
      gainNode.gain.linearRampToValueAtTime(gain, chordStartTime + attackTime);
      gainNode.gain.linearRampToValueAtTime(gain * sustainLevel, chordStartTime + attackTime + decayTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, chordStartTime + chordDuration);
      
      // Add subtle vibrato for classical authenticity
      const vibrato = audioContext!.createOscillator();
      const vibratoGain = audioContext!.createGain();
      vibrato.connect(vibratoGain);
      vibratoGain.connect(oscillator.frequency);
      vibrato.frequency.setValueAtTime(5.5, chordStartTime); // Classical vibrato rate
      vibratoGain.gain.setValueAtTime(freq * 0.005, chordStartTime); // Subtle depth
      vibrato.start(chordStartTime);
      vibrato.stop(chordStartTime + chordDuration);
      
      // Add slight detuning for ensemble effect
      const detuneAmount = (Math.random() - 0.5) * 2; // ±1 cent
      oscillator.detune.setValueAtTime(detuneAmount, chordStartTime);
      
      // Start and stop oscillator
      oscillator.start(chordStartTime);
      oscillator.stop(chordStartTime + chordDuration);
    });
  });
  
  // Add a subtle cathedral-like reverb
  const delay1 = audioContext!.createDelay();
  const delay2 = audioContext!.createDelay();
  const delayGain1 = audioContext!.createGain();
  const delayGain2 = audioContext!.createGain();
  
  delay1.delayTime.setValueAtTime(0.4, now);
  delay2.delayTime.setValueAtTime(0.6, now);
  delayGain1.gain.setValueAtTime(0.15, now);
  delayGain2.gain.setValueAtTime(0.1, now);
  
  delayGain1.gain.exponentialRampToValueAtTime(0.01, now + duration);
  delayGain2.gain.exponentialRampToValueAtTime(0.01, now + duration);
  
  delay1.connect(delayGain1);
  delay2.connect(delayGain2);
  delayGain1.connect(masterGain);
  delayGain2.connect(masterGain);
  
  // Visual feedback
  chimePlaying.value = true;
  setTimeout(() => {
    chimePlaying.value = false;
  }, duration * 1000);
  
  // Handle chime sequence for timer completion
  if (!isTest) {
    chimeSequenceCount++;
    if (chimeSequenceCount < TOTAL_CHIMES) {
      // Schedule next chime
      setTimeout(() => {
        playChime(false);
      }, CHIME_INTERVAL);
    } else {
      // Sequence complete, reset counter
      chimeSequenceCount = 0;
      hasPlayedChime.value = true;
    }
  }
}

function testChime(): void {
  if (chimeEnabled.value) {
    playChime(true);
  }
}

// Show browser notification when timer completes
function showNotification(): void {
  if (!notificationsEnabled.value) return;
  
  // Check if browser supports notifications
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Focus Timer Complete!', {
      body: 'Your focus session has ended. Time for a break!',
      icon: '/favicon.ico',
      tag: 'focus-timer',
      requireInteraction: false
    });
  }
}

// Request notification permissions
function requestNotificationPermission(): void {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    });
  }
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
  
  // Reset chime flag and sequence counter when starting new timer
  hasPlayedChime.value = false;
  chimeSequenceCount = 0;
  
  // Set up robust timer tracking
  timerStartTime = Date.now();
  timerDuration = time.value * 1000; // Convert to milliseconds
  lastUpdateTime = Date.now();
  
  isRunning.value = true;
  
  // Use a combination of requestAnimationFrame and timestamp tracking
  function updateTimer() {
    if (!isRunning.value) return;
    
    const currentTime = Date.now();
    const elapsed = currentTime - timerStartTime;
    const remaining = Math.max(0, timerDuration - elapsed);
    
    // Update time value (round up to ensure we don't skip seconds)
    const newTimeValue = Math.ceil(remaining / 1000);
    
    // Only update if the time has actually changed
    if (newTimeValue !== time.value) {
      time.value = newTimeValue;
    }
    
    if (remaining <= 0) {
      // Timer finished - start chime sequence
      if (!hasPlayedChime.value) {
        playChime(false); // Start the 3-chime sequence
      }
      showNotification(); // Show notification when timer finishes
      pauseTimer();
    } else {
      // Continue updating - use setTimeout for more consistent timing
      // but fall back to requestAnimationFrame for smooth UI updates
      setTimeout(() => {
        if (isRunning.value) {
          requestAnimationFrame(updateTimer);
        }
      }, 100); // Update every 100ms for accuracy
    }
  }
  
  // Start the animation frame loop
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

// ===== EVENT HANDLERS =====
function handleKeydown(e: KeyboardEvent): void {
  if (e.code === 'Space') {
    e.preventDefault();
    toggleTimer();
  } else if (e.key === 'r' || e.key === 'R') {
    e.preventDefault();
    resetTimer();
  } else if (e.key === 'p' || e.key === 'P') {
    e.preventDefault();
    settingsOpen.value = !settingsOpen.value;
  }
}

function handleGlobalWheel(e: WheelEvent): void {
  if (isRunning.value) return;
  
  const picker = minutePickerRef.value;
  if (picker?.$?.exposed?.onWheel) {
    picker.$.exposed.onWheel(e);
  }
}

// Handle page visibility changes
function handleVisibilityChange(): void {
  if (isRunning.value) {
    // When page becomes visible again, update the timer start time
    // to account for the time the page was hidden
    const currentTime = Date.now();
    const elapsed = currentTime - timerStartTime;
    const remaining = Math.max(0, timerDuration - elapsed);
    
    // Adjust timer start time to maintain accuracy
    timerStartTime = currentTime - (timerDuration - remaining);
  }
}

// ===== WATCHERS =====
watch(selectedMinutes, (newVal) => {
  if (skipMinuteWatcher) return;
  if (!isRunning.value) {
    time.value = newVal * 60;
  }
});

// Watch for timer completion to play chime
watch(isTimerFinished, (finished) => {
  if (finished && !hasPlayedChime.value && isRunning.value) {
    playChime(false); // Start the 3-chime sequence
  }
});

// ===== LIFECYCLE =====
const route = useRoute();

onMounted(() => {
  initializeFromUrl();
  setupEventListeners();
  requestNotificationPermission(); // Request permission on mount
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
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

function cleanupEventListeners(): void {
  window.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('wheel', handleGlobalWheel);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
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

/* ===== SETTINGS PANEL ===== */
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

/* Toggle Switch */
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

/* Test Button */
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

/* Animations */
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

/* Responsive Settings */
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