<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-900">Results</h2>
      <div class="flex gap-2">
        <select v-model="selectedRound" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All Rounds</option>
          <option v-for="round in rounds" :key="round.id" :value="round.id">{{ round.name }}</option>
        </select>
        <button
          @click="exportResults"
          class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Export
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-sm text-gray-600">Loading results...</p>
      </div>
    </div>

    <!-- Results Table -->
    <div v-else class="bg-white rounded-lg border border-gray-200 overflow-x-auto">
      <table class="w-full min-w-max border-collapse">
        <thead>
          <tr class="bg-white border-b border-gray-300">
            <th class="px-4 py-2.5 text-center text-xs font-medium text-gray-900 border-r border-gray-300 w-16">RANK</th>
            <th class="px-4 py-2.5 text-left text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[280px]">CANDIDATE</th>
            <th class="px-4 py-2.5 text-left text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[100px]">GENDER</th>
            <th class="px-4 py-2.5 text-center text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[120px]">TOTAL SCORE</th>
            <th class="px-4 py-2.5 text-center text-xs font-medium text-gray-900 min-w-[100px]">AVERAGE</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(result, index) in rankedResults" 
            :key="result.candidate.id" 
            class="border-b border-gray-200 hover:bg-gray-50"
          >
            <td class="px-4 py-3 text-center border-r border-gray-200">
              <span :class="[
                'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold',
                index === 0 ? 'bg-yellow-400 text-white' :
                index === 1 ? 'bg-gray-400 text-white' :
                index === 2 ? 'bg-orange-400 text-white' :
                'text-gray-600'
              ]">
                {{ index + 1 }}
              </span>
            </td>
            <td class="px-4 py-3 text-left text-sm text-gray-900 border-r border-gray-200">
              {{ result.candidate.number }} - {{ result.candidate.name?.toUpperCase() }}
            </td>
            <td class="px-4 py-3 text-left text-sm text-gray-600 border-r border-gray-200">
              {{ result.candidate.gender }}
            </td>
            <td class="px-4 py-3 text-center text-sm font-bold border-r border-gray-200">
              <span class="text-indigo-600">{{ result.total.toFixed(2) }}</span>
            </td>
            <td class="px-4 py-3 text-center text-sm text-gray-600">
              {{ result.average.toFixed(2) }}
            </td>
          </tr>
          <tr v-if="!rankedResults.length">
            <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-500">
              No results available
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { showError, showSuccess, showInfo } from '../../../utils/alerts';

const props = defineProps({
  eventId: [String, Number],
  candidates: Array,
  rounds: Array,
  criteria: Array
});

const selectedRound = ref('');
const scores = ref([]);
const loading = ref(true);
let refreshInterval = null;

const rankedResults = computed(() => {
  const results = (props.candidates || []).map(candidate => {
    // Filter scores by selected round if applicable
    let candidateScores = scores.value.filter(s => s.candidate_id === candidate.id);
    
    if (selectedRound.value) {
      // Get criteria IDs for the selected round
      const roundCriteriaIds = (props.criteria || [])
        .filter(c => c.round_id === parseInt(selectedRound.value))
        .map(c => c.id);
      candidateScores = candidateScores.filter(s => roundCriteriaIds.includes(s.criteria_id));
    }
    
    const total = candidateScores.reduce((sum, s) => sum + (parseFloat(s.points) || 0), 0);
    const judgeCount = new Set(candidateScores.map(s => s.judge_id)).size || 1;
    
    return {
      candidate,
      total,
      average: total / judgeCount
    };
  });
  
  return results.sort((a, b) => b.total - a.total);
});

const loadScores = async (showLoadingSpinner = true) => {
  if (!props.eventId) return;
  
  try {
    if (showLoadingSpinner) {
      loading.value = true;
    }
    const response = await fetch(`/api/points?event_id=${props.eventId}`);
    scores.value = await response.json();
  } catch (error) {
    if (showLoadingSpinner) {
      showError('Failed to load scores');
    }
  } finally {
    if (showLoadingSpinner) {
      loading.value = false;
    }
  }
};

const exportResults = () => {
  // TODO: Implement export functionality
  showInfo('Export feature coming soon');
};

// Watch for round changes
watch(selectedRound, () => {
  // Results will automatically update via computed property
});

onMounted(() => {
  // Initial load with spinner
  loadScores(true);
  
  // Refresh every 2 seconds silently
  refreshInterval = setInterval(() => loadScores(false), 2000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>
