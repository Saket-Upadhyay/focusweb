<template>
  <div
    :class="spinnerClasses"
    :aria-label="ariaLabel"
    role="status"
    :aria-live="ariaLive"
  >
    <div class="spinner-ring">
      <div class="spinner-segment"></div>
      <div class="spinner-segment"></div>
      <div class="spinner-segment"></div>
      <div class="spinner-segment"></div>
    </div>
    <span v-if="showText" class="spinner-text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white';
  text?: string;
  showText?: boolean;
  ariaLabel?: string;
  ariaLive?: 'polite' | 'assertive' | 'off';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'primary',
  text: 'Loading...',
  showText: false,
  ariaLabel: 'Loading',
  ariaLive: 'polite'
});

const spinnerClasses = computed(() => [
  'loading-spinner',
  `loading-spinner--${props.size}`,
  `loading-spinner--${props.variant}`,
  {
    'loading-spinner--with-text': props.showText
  }
]);
</script>

<style scoped>
.loading-spinner {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-family: 'Noto Sans', sans-serif;
}

.spinner-ring {
  position: relative;
  display: inline-block;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-segment {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: currentColor;
  opacity: 0.25;
}

.spinner-segment:nth-child(1) {
  animation: spin 1s linear infinite;
}

.spinner-segment:nth-child(2) {
  animation: spin 1s linear infinite 0.25s;
  border-top-color: transparent;
  border-right-color: currentColor;
}

.spinner-segment:nth-child(3) {
  animation: spin 1s linear infinite 0.5s;
  border-top-color: transparent;
  border-right-color: transparent;
  border-bottom-color: currentColor;
}

.spinner-segment:nth-child(4) {
  animation: spin 1s linear infinite 0.75s;
  border-top-color: transparent;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: currentColor;
}

.spinner-text {
  font-size: 0.875rem;
  color: currentColor;
  font-weight: 500;
}

/* Sizes */
.loading-spinner--sm .spinner-ring {
  width: 1rem;
  height: 1rem;
}

.loading-spinner--sm .spinner-text {
  font-size: 0.75rem;
}

.loading-spinner--md .spinner-ring {
  width: 1.5rem;
  height: 1.5rem;
}

.loading-spinner--md .spinner-text {
  font-size: 0.875rem;
}

.loading-spinner--lg .spinner-ring {
  width: 2rem;
  height: 2rem;
}

.loading-spinner--lg .spinner-text {
  font-size: 1rem;
}

.loading-spinner--xl .spinner-ring {
  width: 3rem;
  height: 3rem;
}

.loading-spinner--xl .spinner-text {
  font-size: 1.125rem;
}

/* Variants */
.loading-spinner--primary {
  color: #42b8ff;
}

.loading-spinner--secondary {
  color: #1565c0;
}

.loading-spinner--white {
  color: white;
}

/* Animation */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Accessibility */
.loading-spinner[aria-live="polite"] {
  animation: none;
}

.loading-spinner[aria-live="assertive"] {
  animation: none;
}
</style> 