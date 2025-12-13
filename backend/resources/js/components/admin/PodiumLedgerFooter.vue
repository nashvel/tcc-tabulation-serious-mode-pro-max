<template>
  <footer ref="footerRef" class="mt-16 pb-8">
    <div class="text-center select-none">
      <h1 
        class="text-[11vw] text-gray-900 leading-none inline-flex items-end"
        style="font-family: 'Playfair Display', Georgia, serif; font-weight: 600; letter-spacing: -0.02em;"
      >
        <span>PodiumLed</span>
        <span class="inline-flex items-end" :key="animationKey">
          <span 
            :class="isVisible ? 'rise-up' : ''" 
            style="animation-delay: 0ms; display: inline-block;"
          >g</span>
          <span 
            :class="isVisible ? 'rise-up' : ''" 
            style="animation-delay: 100ms; display: inline-block;"
          >e</span>
          <span 
            :class="[isVisible ? 'rise-up' : '', 'text-[1.1em]']" 
            style="animation-delay: 200ms; display: inline-block;"
          >r</span>
        </span>
      </h1>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const footerRef = ref(null);
const isVisible = ref(false);
const animationKey = ref(0);

let observer = null;

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        isVisible.value = false;
        // Reset and trigger animation
        setTimeout(() => {
          animationKey.value++;
          isVisible.value = true;
        }, 50);
      }
    },
    { threshold: 0.3 }
  );

  if (footerRef.value) {
    observer.observe(footerRef.value);
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
@keyframes rise-up {
  0% { transform: translateY(0); }
  100% { transform: translateY(-0.15em); }
}

.rise-up {
  animation: rise-up 0.5s ease-out forwards;
}
</style>
