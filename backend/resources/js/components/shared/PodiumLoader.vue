<template>
  <div class="podium-loader" :style="{ gap: size * 0.08 + 'px' }">
    <svg class="letter" :width="size" :height="size" viewBox="0 0 100 100">
      <!-- P -->
      <path d="M15 85 L15 15 L60 15 Q85 15 85 35 Q85 55 60 55 L15 55" 
            fill="none" stroke="#000" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <svg class="letter spinning-o" :width="size" :height="size" viewBox="0 0 100 100" :style="{ transform: `rotate(${rotation}deg)` }">
      <!-- O (circle) -->
      <circle cx="50" cy="50" r="35" fill="none" stroke="#000" :stroke-width="strokeWidth * 1.25" stroke-linecap="round"
              :stroke-dasharray="dashArray" :stroke-dashoffset="dashOffset"/>
    </svg>
    <svg class="letter" :width="size" :height="size" viewBox="0 0 100 100">
      <!-- D -->
      <path d="M15 85 L15 15 L50 15 Q85 15 85 50 Q85 85 50 85 L15 85" 
            fill="none" stroke="#000" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <svg class="letter" :width="size" :height="size" viewBox="0 0 100 100">
      <!-- I -->
      <path d="M30 15 L70 15 M50 15 L50 85 M30 85 L70 85" 
            fill="none" stroke="#000" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <svg class="letter" :width="size" :height="size" viewBox="0 0 100 100">
      <!-- U -->
      <path d="M15 15 L15 60 Q15 85 50 85 Q85 85 85 60 L85 15" 
            fill="none" stroke="#000" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <svg class="letter" :width="size" :height="size" viewBox="0 0 100 100">
      <!-- M -->
      <path d="M15 85 L15 15 L50 50 L85 15 L85 85" 
            fill="none" stroke="#000" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  size: { type: Number, default: 48 }
})

const strokeWidth = computed(() => 12)
const rotation = ref(0)
const dashProgress = ref(0)

// Circle circumference for dash animation
const circumference = 2 * Math.PI * 35
const dashArray = computed(() => circumference)
const dashOffset = computed(() => {
  const progress = dashProgress.value
  // Animate the circle drawing
  return circumference * (1 - Math.min(progress * 2, 1))
})

let animationFrame = null
let startTime = null

const easeInOut = (t) => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

const animate = (timestamp) => {
  if (!startTime) startTime = timestamp
  const elapsed = timestamp - startTime
  
  // Dash animation (2s cycle)
  const dashCycle = (elapsed % 2000) / 2000
  dashProgress.value = dashCycle
  
  // Spin animation (8s cycle with steps)
  const spinCycle = (elapsed % 8000) / 8000
  let rot = 0
  
  if (spinCycle < 0.125) {
    rot = 0
  } else if (spinCycle < 0.25) {
    rot = easeInOut((spinCycle - 0.125) / 0.125) * 270
  } else if (spinCycle < 0.375) {
    rot = 270
  } else if (spinCycle < 0.5) {
    rot = 270 + easeInOut((spinCycle - 0.375) / 0.125) * 270
  } else if (spinCycle < 0.625) {
    rot = 540
  } else if (spinCycle < 0.75) {
    rot = 540 + easeInOut((spinCycle - 0.625) / 0.125) * 270
  } else if (spinCycle < 0.875) {
    rot = 810
  } else {
    rot = 810 + easeInOut((spinCycle - 0.875) / 0.125) * 270
  }
  
  rotation.value = rot
  animationFrame = requestAnimationFrame(animate)
}

onMounted(() => {
  animationFrame = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
})
</script>

<style scoped>
.podium-loader {
  display: flex;
  align-items: center;
  justify-content: center;
}

.letter {
  display: block;
}

.spinning-o {
  transition: none;
}
</style>
