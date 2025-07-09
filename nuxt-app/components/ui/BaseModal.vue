<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="modal-overlay"
        :class="{ 'modal-overlay--backdrop': backdrop }"
        @click="handleOverlayClick"
        @keydown.escape="handleEscape"
      >
        <div
          ref="modalRef"
          class="modal-container"
          :class="[
            `modal-container--${size}`,
            { 'modal-container--centered': centered }
          ]"
          role="dialog"
          :aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="descriptionId"
          @click.stop
        >
          <div class="modal-header" v-if="$slots.header || title">
            <slot name="header">
              <h2 :id="titleId" class="modal-title">{{ title }}</h2>
            </slot>
            <button
              v-if="showCloseButton"
              class="modal-close"
              @click="handleClose"
              :aria-label="closeButtonLabel"
            >
              <span class="modal-close-icon">×</span>
            </button>
          </div>

          <div class="modal-body">
            <div v-if="$slots.description" :id="descriptionId" class="modal-description">
              <slot name="description" />
            </div>
            <slot />
          </div>

          <div class="modal-footer" v-if="$slots.footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useAccessibility } from '~/composables/useAccessibility';

interface Props {
  isOpen: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  centered?: boolean;
  backdrop?: boolean;
  showCloseButton?: boolean;
  closeButtonLabel?: string;
  preventClose?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  centered: true,
  backdrop: true,
  showCloseButton: true,
  closeButtonLabel: 'Close modal',
  preventClose: false
});

const emit = defineEmits<{
  close: [];
  'update:isOpen': [value: boolean];
}>();

const modalRef = ref<HTMLElement>();
const { generateId } = useAccessibility();

const titleId = generateId('modal-title');
const descriptionId = generateId('modal-description');

let previousActiveElement: HTMLElement | null = null;
let focusTrapCleanup: (() => void) | null = null;

function handleClose(): void {
  if (!props.preventClose) {
    emit('close');
    emit('update:isOpen', false);
  }
}

function handleOverlayClick(): void {
  if (props.backdrop && !props.preventClose) {
    handleClose();
  }
}

function handleEscape(): void {
  if (!props.preventClose) {
    handleClose();
  }
}

function setupFocusTrap(): void {
  if (modalRef.value) {
    const { createFocusTrap } = useAccessibility();
    focusTrapCleanup = createFocusTrap(modalRef.value);
  }
}

function restoreFocus(): void {
  if (previousActiveElement) {
    previousActiveElement.focus();
  }
}

function saveActiveElement(): void {
  previousActiveElement = document.activeElement as HTMLElement;
}

async function openModal(): Promise<void> {
  saveActiveElement();
  await nextTick();
  setupFocusTrap();
  
  if (modalRef.value) {
    const focusableElement = modalRef.value.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    
    if (focusableElement) {
      focusableElement.focus();
    }
  }
}

function closeModal(): void {
  if (focusTrapCleanup) {
    focusTrapCleanup();
    focusTrapCleanup = null;
  }
  restoreFocus();
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    openModal();
  } else {
    closeModal();
  }
});

onMounted(() => {
  if (props.isOpen) {
    openModal();
  }
});

onUnmounted(() => {
  closeModal();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay--backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: 'Noto Sans', sans-serif;
}

.modal-container--centered {
  margin: auto;
}

.modal-container--sm {
  width: 400px;
}

.modal-container--md {
  width: 600px;
}

.modal-container--lg {
  width: 800px;
}

.modal-container--xl {
  width: 1000px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.modal-close {
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

.modal-close:hover {
  background: #e0e0e0;
  color: #333;
}

.modal-close-icon {
  line-height: 1;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.modal-description {
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
    max-height: calc(100vh - 2rem);
  }
  
  .modal-header {
    padding: 1rem 1.5rem;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
    flex-direction: column;
  }
}
</style> 