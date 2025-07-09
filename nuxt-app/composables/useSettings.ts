import { ref } from 'vue';

export function useSettings() {
  const settingsOpen = ref<boolean>(false);
  const chimeEnabled = ref<boolean>(true);

  function openSettings(): void {
    settingsOpen.value = true;
  }

  function closeSettings(): void {
    settingsOpen.value = false;
  }

  function toggleSettings(): void {
    settingsOpen.value = !settingsOpen.value;
  }

  return {
    settingsOpen,
    chimeEnabled,
    openSettings,
    closeSettings,
    toggleSettings
  };
} 