<template>
  <button
    @click="$emit('click')"
    class="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center text-xs font-medium transition-colors"
    title="Start tutorial"
  >
    ?
  </button>
</template>

<script setup>
defineEmits(['click']);
</script>
