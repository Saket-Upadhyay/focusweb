// Timer Types
export interface TimerState {
  selectedMinutes: number;
  time: number;
  isRunning: boolean;
  isFlushing: boolean;
  minutes: number;
  seconds: number;
  waterProgress: number;
  isInFinalCountdown: boolean;
  isTimerFinished: boolean;
  progressPercentage: number;
}

export interface TimerControls {
  startTimer: () => void;
  pauseTimer: () => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  handleVisibilityChange: () => void;
  cleanupTimer: () => void;
  setSelectedMinutes: (minutes: number) => void;
  getSkipMinuteWatcher: () => boolean;
  setSkipMinuteWatcher: (value: boolean) => void;
}

// Audio Types
export interface AudioState {
  hasPlayedChime: boolean;
  chimePlaying: boolean;
}

export interface AudioControls {
  playChime: (isTest: boolean, chimeEnabled: boolean) => void;
  testChime: (chimeEnabled: boolean) => void;
  resetChimeState: () => void;
}

// Settings Types
export interface SettingsState {
  settingsOpen: boolean;
  chimeEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface SettingsControls {
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;
}

// Notification Types
export interface NotificationState {
  notificationsEnabled: boolean;
}

export interface NotificationControls {
  showNotification: () => void;
  requestNotificationPermission: () => void;
}

// Component Props Types
export interface MinuteWheelPickerProps {
  modelValue: number;
  disabled?: boolean;
  min?: number;
  max?: number;
  keyboard?: boolean;
}

export interface PaaniProps {
  progress: number;
  flushing: boolean;
  isRunning: boolean;
  remainingMinutes: number;
  progressPercentage: number;
}

export interface FocusTimerProps {
  initialMinutes?: number;
  autoStart?: boolean;
}

// Event Types
export interface WheelEvent {
  deltaY: number;
  preventDefault: () => void;
}

export interface TouchEvent {
  touches: TouchList;
  preventDefault: () => void;
}

export interface KeyboardEvent {
  key: string;
  code: string;
  preventDefault: () => void;
}

// Audio Pattern Types
export interface BassFrequency {
  freq: number;
  time: number;
  slide: number;
}

export interface HiHatPattern {
  time: number;
  vel: number;
  type: 'open' | 'closed';
}

export interface KickPattern {
  time: number;
  vel: number;
}

export interface ClassicalChord {
  freq: number;
  type: string;
  gain: number;
  voice: string;
}

export interface ClassicalProgression {
  time: number;
  chord: ClassicalChord[];
}

export interface StringVoice {
  freq: number;
  type: string;
  gain: number;
  voice: string;
}

export interface WoodwindNote {
  freq: number;
  time: number;
  duration: number;
}

// Particle Types
export interface Particle {
  x: number;
  y: number;
  length: number;
  speed: number;
}

export interface WaveLayer {
  opacity: number;
  waveOffset: number;
  amplitude: number;
}

// Error Types
export interface AppError {
  message: string;
  code: string;
  timestamp: Date;
  component?: string;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
}

// Accessibility Types
export interface AriaProps {
  label?: string;
  describedBy?: string;
  controls?: string;
  expanded?: boolean;
  pressed?: boolean;
  selected?: boolean;
  disabled?: boolean;
  hidden?: boolean;
} 