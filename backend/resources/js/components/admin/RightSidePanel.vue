<template>
  <!-- Toggle Button (always visible on right edge) -->
  <button
    @click="isOpen = !isOpen"
    class="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-white border border-r-0 border-gray-200 rounded-l-lg p-2 shadow-sm hover:bg-gray-50 transition-all"
    :class="isOpen ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'"
  >
    <ChevronLeft :size="18" class="text-gray-400" />
  </button>

  <!-- Panel Overlay -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/10 z-40"
    @click="isOpen = false"
  />

  <!-- Side Panel - Half screen width, minimalist white -->
  <div
    :class="[
      'fixed top-0 right-0 h-full w-1/2 bg-white border-l border-gray-100 shadow-lg z-50 transition-transform duration-300 ease-in-out',
      isOpen ? 'translate-x-0' : 'translate-x-full'
    ]"
  >
    <!-- Panel Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-medium text-gray-700">Activity Feed</h2>
        <div class="flex items-center gap-1">
          <span v-if="wsConnected" class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
          <span v-else class="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
          <span class="text-[10px] text-gray-400">{{ wsConnected ? 'Live' : 'Offline' }}</span>
        </div>
      </div>
      <button
        @click="isOpen = false"
        class="p-1.5 rounded hover:bg-gray-50 transition-colors"
      >
        <X :size="16" class="text-gray-400" />
      </button>
    </div>

    <!-- Panel Content - Split into LEFT and RIGHT halves -->
    <div class="flex h-[calc(100%-56px)]">
      
      <!-- LEFT HALF: Chart Section -->
      <div class="w-1/2 p-4 border-r border-gray-100 flex flex-col">
        <!-- Event Info + Stats -->
        <div class="mb-3">
          <p class="text-[10px] text-gray-400 uppercase tracking-widest">Event</p>
          <p class="text-sm font-light text-gray-800 mb-3">{{ event?.title || 'No event' }}</p>
          <div class="flex gap-3">
            <div class="text-center">
              <p class="text-lg font-light text-gray-800">{{ judges?.length || 0 }}</p>
              <p class="text-[8px] text-gray-400 uppercase">Judges</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-light text-gray-800">{{ candidates?.length || 0 }}</p>
              <p class="text-[8px] text-gray-400 uppercase">Candidates</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-light text-gray-800">{{ rounds?.length || 0 }}</p>
              <p class="text-[8px] text-gray-400 uppercase">Rounds</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-light text-gray-800">{{ criteria?.length || 0 }}</p>
              <p class="text-[8px] text-gray-400 uppercase">Criteria</p>
            </div>
          </div>
        </div>

        <!-- ApexCharts Timeline -->
        <div class="flex-1 flex flex-col">
          <div class="flex items-center justify-between mb-2">
            <p class="text-[10px] text-gray-400 uppercase tracking-widest">Rounds & Criteria</p>
            <p class="text-[10px] text-gray-500">{{ rounds?.length || 0 }} rounds</p>
          </div>
          
          <!-- ApexCharts Container -->
          <div class="flex-1 bg-gray-50 rounded-lg overflow-hidden min-h-[200px]">
            <apexchart
              v-if="chartSeries.length > 0"
              type="rangeBar"
              height="100%"
              :options="chartOptions"
              :series="chartSeries"
            />
            <div v-else class="flex items-center justify-center h-full text-[10px] text-gray-400">
              No rounds configured
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT HALF: Activity Logs -->
      <div class="w-1/2 p-4 flex flex-col">
        <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Recent Activity</p>
        
        <div class="flex-1 overflow-y-auto space-y-1">
          <div v-if="activityLogs.length === 0" class="text-center py-8">
            <p class="text-[10px] text-gray-400">No activity yet</p>
          </div>
          <div
            v-for="log in activityLogs"
            :key="log.id"
            class="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0"
          >
            <div :class="['w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', getActionClass(log.action)]">
              <component :is="getActionIcon(log.action)" :size="8" class="text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[11px] text-gray-600 leading-tight">{{ log.description }}</p>
              <p class="text-[9px] text-gray-400">{{ log.time_ago }}</p>
            </div>
            <div v-if="log.details?.points !== undefined" class="flex-shrink-0">
              <span class="text-[10px] font-medium text-gray-500">{{ log.details.points }}pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { ChevronLeft, X, Lock, Unlock, CheckCircle, Edit, LogIn, LogOut, Play, Trash2, Activity } from 'lucide-vue-next';
import VueApexCharts from 'vue3-apexcharts';

const apexchart = VueApexCharts;

const props = defineProps({
  event: Object,
  judges: Array,
  candidates: Array,
  rounds: Array,
  criteria: Array,
  activeRound: Object
});

defineEmits(['action', 'activate-round']);

const isOpen = ref(false);
const activityLogs = ref([]);
const wsConnected = ref(false);
let echoChannel = null;

// Build chart series from rounds and criteria
const chartSeries = computed(() => {
  if (!props.rounds || props.rounds.length === 0) return [];
  
  const data = [];
  const today = new Date();
  
  props.rounds.forEach((round, roundIndex) => {
    // Round bar
    const roundStart = new Date(today);
    roundStart.setDate(today.getDate() + roundIndex * 7);
    const roundEnd = new Date(roundStart);
    roundEnd.setDate(roundStart.getDate() + 6);
    
    data.push({
      x: round.name,
      y: [roundStart.getTime(), roundEnd.getTime()],
      fillColor: '#4f46e5'
    });
    
    // Criteria bars under this round
    const roundCriteria = props.criteria?.filter(c => c.round_id === round.id) || [];
    roundCriteria.forEach((criterion, idx) => {
      const criteriaStart = new Date(roundStart);
      criteriaStart.setDate(roundStart.getDate() + idx);
      const criteriaEnd = new Date(criteriaStart);
      criteriaEnd.setDate(criteriaStart.getDate() + 1);
      
      const label = criterion.points 
        ? `  ${criterion.name} (${criterion.points}pts)` 
        : `  ${criterion.name}`;
      
      data.push({
        x: label,
        y: [criteriaStart.getTime(), criteriaEnd.getTime()],
        fillColor: '#818cf8'
      });
    });
  });
  
  return [{ data }];
});

// Chart options
const chartOptions = computed(() => ({
  chart: {
    type: 'rangeBar',
    toolbar: { show: false },
    fontFamily: 'inherit',
    animations: { enabled: true }
  },
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: '60%',
      rangeBarGroupRows: true
    }
  },
  xaxis: {
    type: 'datetime',
    labels: {
      style: { fontSize: '9px', colors: '#9ca3af' },
      datetimeFormatter: {
        day: 'dd MMM'
      }
    }
  },
  yaxis: {
    labels: {
      style: { fontSize: '10px', colors: '#374151' }
    }
  },
  grid: {
    borderColor: '#e5e7eb',
    strokeDashArray: 4
  },
  tooltip: {
    enabled: true,
    x: { format: 'dd MMM yyyy' }
  },
  legend: { show: false }
}));

// Fetch initial activity logs
const fetchLogs = async () => {
  if (!props.event?.id) return;
  try {
    const res = await fetch(`/api/activity-logs?event_id=${props.event.id}&limit=20`);
    activityLogs.value = await res.json();
  } catch (e) {
    console.error('Failed to fetch activity logs', e);
  }
};

// Setup websocket listener
const setupWebSocket = () => {
  if (!props.event?.id || !window.Echo) return;
  
  if (echoChannel) {
    window.Echo.leave(`activity.${echoChannel}`);
  }
  
  echoChannel = props.event.id;
  
  window.Echo.channel(`activity.${props.event.id}`)
    .listen('.ActivityLogCreated', (data) => {
      activityLogs.value.unshift(data.log);
      if (activityLogs.value.length > 20) {
        activityLogs.value.pop();
      }
    });
  
  wsConnected.value = true;
};

// Get icon for action type
const getActionIcon = (action) => {
  switch (action) {
    case 'score_entered': return CheckCircle;
    case 'score_updated': return Edit;
    case 'judge_login': return LogIn;
    case 'judge_logout': return LogOut;
    case 'round_activated': return Play;
    case 'voting_locked': return Lock;
    case 'voting_unlocked': return Unlock;
    case 'scores_cleared': return Trash2;
    default: return Activity;
  }
};

// Get class for action type
const getActionClass = (action) => {
  switch (action) {
    case 'score_entered': return 'bg-green-500';
    case 'score_updated': return 'bg-amber-500';
    case 'judge_login': return 'bg-blue-500';
    case 'judge_logout': return 'bg-gray-400';
    case 'round_activated': return 'bg-purple-500';
    case 'voting_locked': return 'bg-red-500';
    case 'voting_unlocked': return 'bg-green-500';
    case 'scores_cleared': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
};

// Watch for event changes
watch(() => props.event?.id, (newId) => {
  if (newId) {
    fetchLogs();
    setupWebSocket();
  }
}, { immediate: true });

onMounted(() => {
  if (props.event?.id) {
    fetchLogs();
    setupWebSocket();
  }
});

onUnmounted(() => {
  if (echoChannel && window.Echo) {
    window.Echo.leave(`activity.${echoChannel}`);
  }
});
</script>
