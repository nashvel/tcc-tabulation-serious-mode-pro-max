<template>
  <a
    @click="$emit('click')"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    :class="[
      'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
      isActive
        ? 'text-indigo-600 bg-white/60 shadow-sm font-semibold'
        : isHovered
          ? 'text-gray-800 bg-black/5'
          : 'text-gray-600 hover:bg-black/5 hover:text-gray-800'
    ]"
  >
    <span class="material-icons" style="font-size: 18px">{{ icon }}</span>
    <span>{{ label }}</span>
  </a>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  icon: String,
  label: String,
  isActive: Boolean
});

defineEmits(['click']);

const isHovered = ref(false);
</script>
