<template>
  <!-- Backdrop -->
  <div v-if="isActive" class="fixed inset-0 bg-black/40 z-[1000]" @click="$emit('skip')"></div>
  
  <!-- Tooltip -->
  <Transition name="fade">
    <div 
      v-if="isActive" 
      class="bg-white rounded-lg shadow-xl border border-gray-200 p-4"
      :style="tooltipStyle"
    >
      <!-- Arrow -->
      <div 
        class="w-0 h-0 border-8 border-transparent"
        :class="arrowClasses"
        :style="arrowStyle"
      ></div>
      
      <!-- Content -->
      <div class="mb-3">
        <h4 class="font-semibold text-gray-900 text-sm mb-1">{{ step.title }}</h4>
        <p class="text-gray-600 text-xs leading-relaxed">{{ step.content }}</p>
      </div>
      
      <!-- Footer -->
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-400">{{ currentStep + 1 }} / {{ totalSteps }}</span>
        <div class="flex gap-2">
          <button 
            v-if="currentStep > 0"
            @click="$emit('prev')"
            class="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
          >
            Back
          </button>
          <button 
            @click="$emit('next')"
            class="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {{ currentStep === totalSteps - 1 ? 'Done' : 'Next' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  isActive: Boolean,
  currentStep: Number,
  totalSteps: Number,
  step: Object,
  tooltipStyle: Object,
  arrowStyle: Object,
  placement: String
});

defineEmits(['next', 'prev', 'skip']);

const arrowClasses = computed(() => {
  switch (props.placement) {
    case 'bottom': return 'border-b-white';
    case 'top': return 'border-t-white';
    case 'left': return 'border-l-white';
    case 'right': return 'border-r-white';
    default: return 'border-b-white';
  }
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
