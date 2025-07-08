<template>
  <div class="home-page">
    <FocusTimer />
  </div>
</template>

<script setup lang="ts">
import FocusTimer from '~/components/FocusTimer.vue';
</script>

<style scoped>
.home-page {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}
</style> 