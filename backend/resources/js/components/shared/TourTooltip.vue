<template>
  <!-- Backdrop -->
  <div 
    v-if="isActive" 
    class="fixed inset-0 bg-black/50 z-[1000]" 
    @click="$emit('skip')"
  ></div>
  
  <!-- Tooltip -->
  <Transition name="tour-fade">
    <div 
      v-if="isActive && step?.title" 
      class="bg-white rounded-xl shadow-2xl border border-gray-100 p-5"
      :style="tooltipStyle"
    >
      <!-- Arrow -->
      <div 
        class="absolute w-3 h-3 bg-white border-gray-100 transform rotate-45"
        :class="arrowBorderClasses"
        :style="arrowStyle"
      ></div>
      
      <!-- Content -->
      <div class="mb-4 relative">
        <div class="flex items-center gap-2 mb-2">
          <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
            {{ currentStep + 1 }}
          </span>
          <h4 class="font-semibold text-gray-900 text-sm">{{ step.title }}</h4>
        </div>
        <p class="text-gray-600 text-xs leading-relaxed pl-8">{{ step.content }}</p>
      </div>
      
      <!-- Footer -->
      <div class="flex items-center justify-between pt-3 border-t border-gray-100">
        <div class="flex items-center gap-1">
          <span 
            v-for="i in totalSteps" 
            :key="i"
            class="w-1.5 h-1.5 rounded-full transition-colors"
            :class="i - 1 === currentStep ? 'bg-indigo-600' : 'bg-gray-200'"
          ></span>
        </div>
        <div class="flex gap-2">
          <button 
            v-if="currentStep > 0"
            @click="$emit('prev')"
            class="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            Back
          </button>
          <button 
            @click="$emit('skip')"
            class="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip
          </button>
          <button 
            @click="$emit('next')"
            class="px-4 py-1.5 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition-colors"
          >
            {{ currentStep === totalSteps - 1 ? 'Finish' : 'Next' }}
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

const arrowBorderClasses = computed(() => {
  switch (props.placement) {
    case 'bottom': return 'border-t border-l';
    case 'top': return 'border-b border-r';
    case 'left': return 'border-t border-r';
    case 'right': return 'border-b border-l';
    default: return 'border-t border-l';
  }
});
</script>

<style scoped>
.tour-fade-enter-active, .tour-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.tour-fade-enter-from, .tour-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
