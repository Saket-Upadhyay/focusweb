<template>
  <div
    class="wheel-picker fade-list"
    :tabindex="keyboard ? 0 : undefined"
    @keydown="keyboard ? onKeydown : undefined"
    @wheel.prevent="onWheel"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    :aria-disabled="disabled"
  >
    <div class="wheel-list" :style="listStyle">
      <div class="wheel-padding" />
      <div
        v-for="i in (max * 3)"
        :key="i"
        :class="['wheel-item', { selected: ((i - 1) % max + min) === modelValue, disabled }]"
        @click="!disabled && select((i - 1) % max + min)"
      >
        {{ (i - 1) % max + min }}
      </div>
      <div class="wheel-padding" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

// --- Props ---
const props = defineProps({
  modelValue: { type: Number, required: true },
  disabled: { type: Boolean, default: false },
  min: { type: Number, default: 1 },
  max: { type: Number, default: 60 },
  keyboard: { type: Boolean, default: true }
});
const emit = defineEmits(['update:modelValue']);

// --- State ---
const itemHeight = 30;
const visibleCount = 3;
const scrollY = ref((props.modelValue + props.max) * itemHeight);
const paddingCount = Math.floor(visibleCount / 2);
let touchStartY = 0;
let lastScrollY = scrollY.value;

// --- Computed ---
const listStyle = computed(() => ({
  transform: `translateY(${-scrollY.value + paddingCount * itemHeight}px)`
}));

// --- Methods ---
function select(val: number) {
  emit('update:modelValue', val);
}
function onWheel(e: WheelEvent) {
  if (props.disabled) return;
  scrollY.value += e.deltaY;
  clampScroll();
  updateSelected();
  // Looping logic for infinite scroll
  if (scrollY.value <= 0 && e.deltaY < 0) {
    emit('update:modelValue', props.max);
    scrollY.value = (props.max + props.max) * itemHeight;
  } else if (scrollY.value >= (props.max - 1) * itemHeight && e.deltaY > 0) {
    emit('update:modelValue', props.min);
    scrollY.value = props.max * itemHeight;
  }
}
function onTouchStart(e: TouchEvent) {
  if (props.disabled) return;
  touchStartY = e.touches[0].clientY;
  lastScrollY = scrollY.value;
}
function onTouchMove(e: TouchEvent) {
  if (props.disabled) return;
  const delta = e.touches[0].clientY - touchStartY;
  scrollY.value = lastScrollY - delta;
  clampScroll();
  updateSelected();
}
function onTouchEnd() {
  if (props.disabled) return;
  const val = Math.round(scrollY.value / itemHeight) % props.max;
  select((val + props.max) % props.max + props.min);
  nextTick(() => {
    scrollY.value = (props.modelValue - props.min + props.max) * itemHeight;
  });
}
function onKeydown(e: KeyboardEvent) {
  if (props.disabled) return;
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (props.modelValue > props.min) {
      emit('update:modelValue', props.modelValue - 1);
    } else {
      emit('update:modelValue', props.max);
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (props.modelValue < props.max) {
      emit('update:modelValue', props.modelValue + 1);
    } else {
      emit('update:modelValue', props.min);
    }
  }
}
function clampScroll() {
  // Clamp to a wide range to avoid abrupt jumps
  if (scrollY.value < 0) scrollY.value = 0;
  if (scrollY.value > (props.max * 3 - 1) * itemHeight) scrollY.value = (props.max * 3 - 1) * itemHeight;
}
function updateSelected() {
  const val = Math.round(scrollY.value / itemHeight) % props.max;
  emit('update:modelValue', (val + props.max) % props.max + props.min);
}

// --- Watchers ---
watch(() => props.modelValue, (val) => {
  // Always keep the selected value in the middle set
  scrollY.value = (val - props.min + props.max) * itemHeight;
});

// --- Lifecycle ---
onMounted(() => {
  if (props.keyboard) window.addEventListener('keydown', onKeydown);
});
onUnmounted(() => {
  if (props.keyboard) window.removeEventListener('keydown', onKeydown);
});

defineExpose({ onWheel });
</script>

<style scoped>
.wheel-picker {
  position: relative;
  width: 80px;
  height: 90px;
  overflow: hidden;
  border-radius: 1.2rem;
  background: #f5fbff;
  box-shadow: 0 2px 12px rgba(66, 184, 255, 0.10);
  user-select: none;
  touch-action: pan-y;
  margin-bottom: 1.5rem;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.wheel-list {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  transition: transform 0.18s cubic-bezier(.4,1.4,.6,1);
}
.wheel-padding {
  height: 2px;
}
.wheel-item {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #2196f3;
  opacity: 0.5;
  cursor: pointer;
  transition: color 0.2s, opacity 0.2s;
}
.wheel-item.selected {
  color: #1565c0;
  font-weight: 600;
  opacity: 1;
  font-size: 2rem;
}
.wheel-item.disabled {
  pointer-events: none;
  opacity: 0.5;
}
.wheel-highlight {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  top: 30px;
  height: 30px;
  border-radius: 100rem;
  background: rgba(66, 184, 255, 0.10);
  box-shadow: 0 2px 8px rgba(66, 184, 255, 0.08);
  pointer-events: none;
  border: 1.5px solid #42b8ff;
}
.wheel-picker.fade-list {
  width: 80px;
  height: 80vh;
  min-height: 320px;
  max-height: 100vh;
  margin-bottom: 0;
  background: none;
  box-shadow: none;
  border-radius: 2rem;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Fade effect using mask */
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 20%, #000 80%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, #000 20%, #000 80%, transparent 100%);
}
.wheel-list {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  transition: transform 0.18s cubic-bezier(.4,1.4,.6,1);
}
.wheel-padding {
  height: calc(40vh - 15px);
}
.wheel-item {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #2196f3;
  opacity: 0.5;
  cursor: pointer;
  transition: color 0.2s, opacity 0.2s, font-size 0.2s;
  font-family: 'Quicksand', 'Inter', 'Roboto', Arial, sans-serif;
  font-weight: 500;
}
.wheel-item.selected {
  color: #1565c0;
  font-weight: 700;
  opacity: 1;
  font-size: 2.2rem;
  z-index: 1;
}
.wheel-item.disabled {
  pointer-events: none;
  opacity: 0.5;
}
</style> 