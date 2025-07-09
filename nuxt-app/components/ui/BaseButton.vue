<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedBy"
    :aria-pressed="ariaPressed"
    :aria-expanded="ariaExpanded"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <div v-if="loading" class="button-loading">
      <div class="loading-spinner"></div>
    </div>
    <div v-else class="button-content">
      <slot name="icon" />
      <span v-if="$slots.default" class="button-text">
        <slot />
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AriaProps } from '~/types';

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  fullWidth: false
});

const emit = defineEmits<{
  click: [event: MouseEvent];
  keydown: [event: KeyboardEvent];
}>();

const buttonClasses = computed(() => [
  'base-button',
  `base-button--${props.variant}`,
  `base-button--${props.size}`,
  {
    'base-button--disabled': props.disabled,
    'base-button--loading': props.loading,
    'base-button--full-width': props.fullWidth
  }
]);

function handleClick(event: MouseEvent): void {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
}

function handleKeydown(event: KeyboardEvent): void {
  emit('keydown', event);
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 0.5rem;
  font-family: 'Noto Sans', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  user-select: none;
  text-decoration: none;
  outline: none;
}

.base-button:focus-visible {
  outline: 2px solid #42b8ff;
  outline-offset: 2px;
}

.base-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.base-button--loading {
  cursor: wait;
}

.base-button--full-width {
  width: 100%;
}

/* Variants */
.base-button--primary {
  background: #42b8ff;
  color: white;
}

.base-button--primary:hover:not(:disabled) {
  background: #2196f3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 184, 255, 0.3);
}

.base-button--secondary {
  background: #e3f6fd;
  color: #1565c0;
  border: 1px solid #b2ebf2;
}

.base-button--secondary:hover:not(:disabled) {
  background: #b2ebf2;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 184, 255, 0.2);
}

.base-button--danger {
  background: #f44336;
  color: white;
}

.base-button--danger:hover:not(:disabled) {
  background: #d32f2f;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.base-button--ghost {
  background: transparent;
  color: #2196f3;
  border: 1px solid transparent;
}

.base-button--ghost:hover:not(:disabled) {
  background: rgba(66, 184, 255, 0.1);
  border-color: #42b8ff;
}

/* Sizes */
.base-button--sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  min-height: 2rem;
}

.base-button--md {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  min-height: 2.5rem;
}

.base-button--lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  min-height: 3rem;
}

/* Loading state */
.button-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.button-text {
  white-space: nowrap;
}
</style> 