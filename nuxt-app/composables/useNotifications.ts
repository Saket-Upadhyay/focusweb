import { ref } from 'vue';

export function useNotifications() {
  const notificationsEnabled = ref<boolean>(true);

  function showNotification(): void {
    if (!notificationsEnabled.value) return;
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Focus Timer Complete!', {
        body: 'Your focus session has ended. Time for a break!',
        icon: '/favicon.ico',
        tag: 'focus-timer',
        requireInteraction: false
      });
    }
  }

  function requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      });
    }
  }

  return {
    notificationsEnabled,
    showNotification,
    requestNotificationPermission
  };
} 