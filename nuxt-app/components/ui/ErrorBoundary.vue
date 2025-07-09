<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">Something went wrong</h2>
      <p class="error-message">{{ error.message }}</p>
      <div class="error-details" v-if="showDetails">
        <p class="error-code">Error Code: {{ error.code }}</p>
        <p class="error-component" v-if="error.component">
          Component: {{ error.component }}
        </p>
        <p class="error-timestamp">
          Time: {{ formatTimestamp(error.timestamp) }}
        </p>
      </div>
      <div class="error-actions">
        <BaseButton
          variant="primary"
          size="sm"
          @click="handleRetry"
          :loading="retrying"
        >
          Try Again
        </BaseButton>
        <BaseButton
          variant="secondary"
          size="sm"
          @click="toggleDetails"
        >
          {{ showDetails ? 'Hide' : 'Show' }} Details
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="sm"
          @click="handleReset"
        >
          Reset
        </BaseButton>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';
import type { AppError } from '~/types';
import { useErrorHandler } from '~/composables/useErrorHandler';
import BaseButton from './BaseButton.vue';

interface Props {
  fallback?: (error: AppError) => void;
  onRetry?: () => void;
  onReset?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  fallback: undefined,
  onRetry: undefined,
  onReset: undefined
});

const emit = defineEmits<{
  error: [error: AppError];
  retry: [];
  reset: [];
}>();

const { addError } = useErrorHandler();
const error = ref<AppError | null>(null);
const showDetails = ref(false);
const retrying = ref(false);

onErrorCaptured((err: Error, instance, info) => {
  const appError: AppError = {
    message: err.message,
    code: 'COMPONENT_ERROR',
    timestamp: new Date(),
    component: instance?.$options?.name || 'Unknown'
  };
  
  error.value = appError;
  addError(err.message, 'COMPONENT_ERROR', instance?.$options?.name);
  emit('error', appError);
  
  if (props.fallback) {
    props.fallback(appError);
  }
  
  return false; // Prevent error from propagating
});

function handleRetry(): void {
  retrying.value = true;
  
  if (props.onRetry) {
    props.onRetry();
  }
  
  emit('retry');
  
  // Reset error after a short delay
  setTimeout(() => {
    error.value = null;
    retrying.value = false;
  }, 1000);
}

function handleReset(): void {
  if (props.onReset) {
    props.onReset();
  }
  
  emit('reset');
  error.value = null;
  showDetails.value = false;
}

function toggleDetails(): void {
  showDetails.value = !showDetails.value;
}

function formatTimestamp(timestamp: Date): string {
  return timestamp.toLocaleString();
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  font-family: 'Noto Sans', sans-serif;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-title {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.error-message {
  margin: 0 0 1.5rem 0;
  color: #666;
  line-height: 1.5;
}

.error-details {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f0f0f0;
  border-radius: 0.25rem;
  text-align: left;
}

.error-code,
.error-component,
.error-timestamp {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #666;
  font-family: monospace;
}

.error-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .error-boundary {
    padding: 1rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style> 