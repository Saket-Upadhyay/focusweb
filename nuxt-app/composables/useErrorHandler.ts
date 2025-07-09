import { ref, computed } from 'vue';
import type { AppError } from '~/types';

export function useErrorHandler() {
  const errors = ref<AppError[]>([]);
  const hasErrors = computed(() => errors.value.length > 0);
  const latestError = computed(() => errors.value[errors.value.length - 1]);

  function addError(message: string, code: string, component?: string): void {
    const error: AppError = {
      message,
      code,
      timestamp: new Date(),
      component
    };
    
    errors.value.push(error);
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${error.code}] ${error.message}`, error);
    }
    
    // Keep only last 10 errors
    if (errors.value.length > 10) {
      errors.value = errors.value.slice(-10);
    }
  }

  function removeError(errorIndex: number): void {
    if (errorIndex >= 0 && errorIndex < errors.value.length) {
      errors.value.splice(errorIndex, 1);
    }
  }

  function clearErrors(): void {
    errors.value = [];
  }

  function handleAsyncError<T>(promise: Promise<T>, errorMessage: string, code: string, component?: string): Promise<T> {
    return promise.catch((error) => {
      addError(errorMessage, code, component);
      throw error;
    });
  }

  function createErrorBoundary(componentName: string) {
    return {
      handleError: (error: Error) => {
        addError(error.message, 'COMPONENT_ERROR', componentName);
      }
    };
  }

  return {
    errors,
    hasErrors,
    latestError,
    addError,
    removeError,
    clearErrors,
    handleAsyncError,
    createErrorBoundary
  };
} 