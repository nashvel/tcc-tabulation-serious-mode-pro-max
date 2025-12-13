<template>
  <div class="w-full font-sans relative z-40">
    <!-- Main Brand Header -->
    <div class="bg-white px-8 py-6 border-b border-slate-100 relative z-40">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6">

        <!-- Left: Event Title with Elegant Typography -->
        <div 
          class="flex flex-col items-center md:items-start gap-2 flex-1 min-w-[200px] cursor-pointer relative z-10"
          @mouseenter="isHoveringTitle = true"
          @mouseleave="isHoveringTitle = false"
          @click="goToSetup"
        >
          <!-- Original Title -->
          <h1 
            :class="[
              'text-3xl font-light text-slate-900 tracking-tight uppercase leading-none transition-all duration-300',
              isHoveringTitle ? 'opacity-0 -translate-x-8' : 'opacity-100 translate-x-0'
            ]"
          >
            {{ continuingEvent?.title || continuingEvent?.name || 'Loading Event...' }}
          </h1>
          
          <!-- Back Icon - Shows on Hover -->
          <div 
            :class="[
              'flex items-center gap-2 transition-all duration-300 absolute mt-0',
              isHoveringTitle ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
            ]"
          >
            <span class="material-icons text-slate-900" style="font-size: 28px">arrow_back</span>
            <span class="text-sm font-semibold text-slate-900 uppercase tracking-wide">Back to Setup</span>
          </div>
          
          <div class="flex items-center gap-3 text-xs font-medium text-slate-600 tracking-widest uppercase mt-1">
            <span class="text-slate-900 font-semibold">
              {{ continuingEvent?.days?.[0]?.day_number ? `Day ${continuingEvent.days[0].day_number}` : '' }}
            </span>
            <template v-if="continuingEvent?.days?.[0]?.title">
              <span class="text-slate-300">•</span>
              <span class="text-slate-600">{{ continuingEvent.days[0].title }}</span>
            </template>
          </div>
        </div>

        <!-- Center: Navigation Buttons -->
        <div class="flex items-center justify-center gap-2 flex-1 relative z-20">
          <button
            @click="goToAdmin"
            :class="[
              'px-4 py-2 text-sm font-medium transition-colors',
              isAdminPath ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-700 hover:text-gray-900'
            ]"
          >
            Home
          </button>
          <button
            @click="$emit('edit-click')"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Edit
          </button>

          <button
            @click="goToJudges"
            :class="[
              'px-4 py-2 text-sm font-medium transition-colors',
              isJudgesPath ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Judges
          </button>
          <button
            @click="goToCertificates"
            :class="[
              'px-4 py-2 text-sm font-medium transition-colors',
              isCertPath ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Certificates
          </button>
        </div>

        <!-- Right: Currently Active Category -->
        <div class="flex flex-col items-center md:items-end justify-center gap-2 flex-1 min-w-[200px]">
          <h2 class="text-2xl font-light text-slate-900 tracking-tight uppercase leading-none">
            {{ activeCategory?.name || 'Loading...' }}
          </h2>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const props = defineProps({
  activeCategory: Object,
  continuingEvent: Object,
  judges: Array
});

defineEmits(['edit-click']);

const router = useRouter();
const route = useRoute();

const isHoveringTitle = ref(false);

const isAdminPath = computed(() => route.path === '/admin');

const isJudgesPath = computed(() => route.path === '/judges/configure');
const isCertPath = computed(() => route.path === '/admin/certificates');

const goToSetup = () => router.push('/setup');
const goToAdmin = () => {
  const eventId = props.continuingEvent?.id;
  if (eventId) {
    router.push(`/admin?event_id=${eventId}`);
  } else {
    router.push('/setup');
  }
};

const goToJudges = () => router.push('/judges/configure');
const goToCertificates = () => router.push('/admin/certificates');
</script>
