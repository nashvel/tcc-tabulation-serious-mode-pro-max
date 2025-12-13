<template>
  <div class="preloader">
    <PodiumLoader :size="size" />
  </div>
</template>

<script setup>
import PodiumLoader from './PodiumLoader.vue'

defineProps({
  size: { type: Number, default: 48 }
})
</script>

<style scoped>
.preloader {
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
