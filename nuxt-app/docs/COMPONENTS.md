# Component Library Documentation

## Overview

This document provides comprehensive documentation for all components and composables in the Focus Timer application.

## Table of Contents

- [UI Components](#ui-components)
- [Feature Components](#feature-components)
- [Composables](#composables)
- [Types](#types)
- [Utilities](#utilities)

## UI Components

### BaseButton

A reusable button component with multiple variants, sizes, and accessibility features.

```vue
<BaseButton
  variant="primary"
  size="md"
  :disabled="false"
  :loading="false"
  aria-label="Click me"
  @click="handleClick"
>
  Button Text
</BaseButton>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `disabled`: boolean (default: false)
- `loading`: boolean (default: false)
- `type`: 'button' | 'submit' | 'reset' (default: 'button')
- `fullWidth`: boolean (default: false)
- `ariaLabel`: string
- `ariaDescribedBy`: string
- `ariaPressed`: boolean
- `ariaExpanded`: boolean

**Events:**
- `click`: MouseEvent
- `keydown`: KeyboardEvent

### BaseModal

A modal component with focus management, accessibility, and backdrop support.

```vue
<BaseModal
  v-model:isOpen="modalOpen"
  title="Modal Title"
  size="md"
  :centered="true"
  :backdrop="true"
  @close="handleClose"
>
  <template #description>
    Modal description text
  </template>
  
  Modal content here
  
  <template #footer>
    <BaseButton @click="handleSave">Save</BaseButton>
    <BaseButton variant="secondary" @click="handleCancel">Cancel</BaseButton>
  </template>
</BaseModal>
```

**Props:**
- `isOpen`: boolean (required)
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `centered`: boolean (default: true)
- `backdrop`: boolean (default: true)
- `showCloseButton`: boolean (default: true)
- `closeButtonLabel`: string (default: 'Close modal')
- `preventClose`: boolean (default: false)

**Events:**
- `close`: void
- `update:isOpen`: boolean

**Slots:**
- `header`: Custom header content
- `description`: Modal description
- `footer`: Footer actions
- `default`: Main modal content

### BaseToggle

A toggle switch component with accessibility support.

```vue
<BaseToggle
  v-model="enabled"
  size="md"
  :disabled="false"
  aria-label="Enable notifications"
>
  Enable Notifications
</BaseToggle>
```

**Props:**
- `modelValue`: boolean (required)
- `disabled`: boolean (default: false)
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `ariaLabel`: string
- `ariaDescribedBy`: string

**Events:**
- `update:modelValue`: boolean
- `change`: boolean

### ErrorBoundary

A component that catches and displays errors gracefully.

```vue
<ErrorBoundary
  :fallback="handleError"
  :onRetry="retryOperation"
  :onReset="resetState"
  @error="logError"
  @retry="handleRetry"
  @reset="handleReset"
>
  <ComponentThatMightError />
</ErrorBoundary>
```

**Props:**
- `fallback`: (error: AppError) => void
- `onRetry`: () => void
- `onReset`: () => void

**Events:**
- `error`: AppError
- `retry`: void
- `reset`: void

### LoadingSpinner

A loading spinner component with multiple sizes and variants.

```vue
<LoadingSpinner
  size="md"
  variant="primary"
  text="Loading data..."
  :showText="true"
  aria-label="Loading data"
/>
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `variant`: 'primary' | 'secondary' | 'white' (default: 'primary')
- `text`: string (default: 'Loading...')
- `showText`: boolean (default: false)
- `ariaLabel`: string (default: 'Loading')
- `ariaLive`: 'polite' | 'assertive' | 'off' (default: 'polite')

## Feature Components

### FocusTimer

The main timer component that orchestrates the entire focus timer experience.

```vue
<FocusTimer
  :initialMinutes="5"
  :autoStart="false"
/>
```

**Props:**
- `initialMinutes`: number (default: 5)
- `autoStart`: boolean (default: false)

### MinuteWheelPicker

A wheel picker component for selecting minutes with touch, wheel, and keyboard support.

```vue
<MinuteWheelPicker
  v-model="selectedMinutes"
  :disabled="false"
  :min="1"
  :max="60"
  :keyboard="true"
/>
```

**Props:**
- `modelValue`: number (required)
- `disabled`: boolean (default: false)
- `min`: number (default: 1)
- `max`: number (default: 60)
- `keyboard`: boolean (default: true)

**Events:**
- `update:modelValue`: number

**Exposed Methods:**
- `onWheel`: (event: WheelEvent) => void

### Paani

A water animation component that provides visual feedback for timer progress.

```vue
<Paani
  :progress="0.5"
  :flushing="false"
  :isRunning="true"
  :remainingMinutes="3"
  :progressPercentage="0.5"
/>
```

**Props:**
- `progress`: number (default: 0)
- `flushing`: boolean (default: false)
- `isRunning`: boolean (default: false)
- `remainingMinutes`: number (default: 0)
- `progressPercentage`: number (default: 0)

## Composables

### useTimer

Manages timer state and controls.

```typescript
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
```

### useNotifications

Manages browser notifications.

```typescript
const {
  notificationsEnabled,
  showNotification,
  requestNotificationPermission
} = useNotifications();
```

### useSettings

Manages settings panel state.

```typescript
const {
  settingsOpen,
  chimeEnabled,
  openSettings,
  closeSettings,
  toggleSettings
} = useSettings();
```

### useAudioGenerator

Manages audio chime generation and playback.

```typescript
const {
  hasPlayedChime,
  chimePlaying,
  playChime,
  testChime,
  resetChimeState
} = useAudioGenerator();
```

### useEventHandlers

Manages keyboard and wheel event handling.

```typescript
const {
  handleKeydown,
  handleGlobalWheel,
  setupEventListeners,
  cleanupEventListeners
} = useEventHandlers(
  toggleTimer,
  resetTimer,
  toggleSettings,
  handleVisibilityChange,
  minutePickerRef,
  isRunning
);
```

### useUrlParams

Manages URL parameter handling.

```typescript
const { initializeFromUrl } = useUrlParams();
```

### useErrorHandler

Manages application errors and error boundaries.

```typescript
const {
  errors,
  hasErrors,
  latestError,
  addError,
  removeError,
  clearErrors,
  handleAsyncError,
  createErrorBoundary
} = useErrorHandler();
```

### useLoading

Manages loading states across the application.

```typescript
const {
  loadingStates,
  globalLoading,
  loadingCount,
  setLoading,
  getLoading,
  removeLoading,
  clearAllLoading,
  withLoading,
  updateProgress
} = useLoading();
```

### useAccessibility

Provides accessibility utilities and ARIA helpers.

```typescript
const {
  generateId,
  createAriaProps,
  getAriaAttributes,
  createLiveRegion,
  createAnnouncement,
  createFocusTrap,
  createSkipLink
} = useAccessibility();
```

## Types

### Timer Types
- `TimerState`: Timer state interface
- `TimerControls`: Timer control functions interface

### Audio Types
- `AudioState`: Audio state interface
- `AudioControls`: Audio control functions interface

### Settings Types
- `SettingsState`: Settings state interface
- `SettingsControls`: Settings control functions interface

### Component Props Types
- `MinuteWheelPickerProps`: MinuteWheelPicker props interface
- `PaaniProps`: Paani props interface
- `FocusTimerProps`: FocusTimer props interface

### Error Types
- `AppError`: Application error interface

### Loading Types
- `LoadingState`: Loading state interface

### Accessibility Types
- `AriaProps`: ARIA properties interface

## Utilities

### Constants (`utils/constants.ts`)

Contains all application constants including:
- Timer defaults
- Audio patterns
- Number words mapping
- Musical frequencies and patterns

### Time Utils (`utils/timeUtils.ts`)

Contains time-related utility functions:
- `numberToWords()`: Converts numbers to words
- `formatTimeInWords()`: Formats time display

## Best Practices

### Component Usage

1. **Always use TypeScript interfaces** for props and events
2. **Implement proper accessibility** with ARIA labels and keyboard navigation
3. **Handle loading and error states** appropriately
4. **Use composables for shared logic** instead of duplicating code
5. **Follow the single responsibility principle** for each component

### Error Handling

1. **Wrap components in ErrorBoundary** for graceful error handling
2. **Use useErrorHandler** for centralized error management
3. **Provide meaningful error messages** to users
4. **Log errors appropriately** in development

### Accessibility

1. **Use semantic HTML** elements
2. **Provide ARIA labels** for interactive elements
3. **Ensure keyboard navigation** works properly
4. **Test with screen readers** regularly
5. **Use useAccessibility** composable for common patterns

### Performance

1. **Use lazy loading** for heavy components
2. **Implement proper cleanup** in composables
3. **Optimize re-renders** with computed properties
4. **Use v-memo** for expensive components when appropriate

## Testing

Each component should have corresponding test files that cover:
- Props validation
- Event emission
- Accessibility features
- Error handling
- Loading states
- User interactions

## Contributing

When adding new components:
1. Create TypeScript interfaces for props and events
2. Implement proper accessibility features
3. Add comprehensive documentation
4. Include error handling
5. Write tests
6. Update this documentation