<template>
  <div class="judge-preloader">
    <PodiumLoader :size="48" />
  </div>
</template>

<script setup>
import PodiumLoader from '../shared/PodiumLoader.vue'
</script>

<style scoped>
.judge-preloader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #fff;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
}
</style>
