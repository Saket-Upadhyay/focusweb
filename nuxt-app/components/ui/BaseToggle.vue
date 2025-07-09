<template>
  <label
    :class="toggleClasses"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedBy"
  >
    <input
      ref="inputRef"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      :aria-label="ariaLabel"
      @change="handleChange"
      @keydown="handleKeydown"
    />
    <span class="toggle-slider" :class="{ 'toggle-slider--checked': modelValue }">
      <span class="toggle-thumb"></span>
    </span>
    <span v-if="$slots.default" class="toggle-label">
      <slot />
    </span>
  </label>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  modelValue: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'md'
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  change: [value: boolean];
}>();

const inputRef = ref<HTMLInputElement>();

const toggleClasses = computed(() => [
  'base-toggle',
  `base-toggle--${props.size}`,
  {
    'base-toggle--disabled': props.disabled
  }
]);

function handleChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  const newValue = target.checked;
  
  emit('update:modelValue', newValue);
  emit('change', newValue);
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    if (inputRef.value) {
      inputRef.value.checked = !inputRef.value.checked;
      handleChange(event as any);
    }
  }
}

function focus(): void {
  inputRef.value?.focus();
}

defineExpose({ focus });
</script>

<style scoped>
.base-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  font-family: 'Noto Sans', sans-serif;
}

.base-toggle--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-toggle input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: relative;
  display: inline-block;
  background-color: #ccc;
  border-radius: 2rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.toggle-slider--checked {
  background-color: #42b8ff;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  background-color: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-label {
  font-size: 0.875rem;
  color: #333;
  font-weight: 500;
}

/* Sizes */
.base-toggle--sm .toggle-slider {
  width: 2.5rem;
  height: 1.25rem;
}

.base-toggle--sm .toggle-thumb {
  width: 1rem;
  height: 1rem;
}

.base-toggle--sm .toggle-slider--checked .toggle-thumb {
  transform: translateX(1.25rem);
}

.base-toggle--md .toggle-slider {
  width: 3.5rem;
  height: 2rem;
}

.base-toggle--md .toggle-thumb {
  width: 1.6rem;
  height: 1.6rem;
}

.base-toggle--md .toggle-slider--checked .toggle-thumb {
  transform: translateX(1.5rem);
}

.base-toggle--lg .toggle-slider {
  width: 4.5rem;
  height: 2.5rem;
}

.base-toggle--lg .toggle-thumb {
  width: 2rem;
  height: 2rem;
}

.base-toggle--lg .toggle-slider--checked .toggle-thumb {
  transform: translateX(2rem);
}

/* Focus styles */
.base-toggle input:focus-visible + .toggle-slider {
  outline: 2px solid #42b8ff;
  outline-offset: 2px;
}

/* Hover effects */
.base-toggle:not(.base-toggle--disabled):hover .toggle-slider {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.base-toggle:not(.base-toggle--disabled):hover .toggle-slider--checked {
  box-shadow: 0 2px 8px rgba(66, 184, 255, 0.3);
}
</style> 