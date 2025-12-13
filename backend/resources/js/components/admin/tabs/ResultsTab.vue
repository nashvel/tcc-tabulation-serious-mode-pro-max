<template>
  <div>
    <div class="flex items-center justify-between mb-6">
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

    <!-- Results Table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase">Rank</th>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Candidate</th>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Gender</th>
            <th class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase">Total Score</th>
            <th class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase">Average</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="(result, index) in rankedResults" :key="result.candidate.id" class="hover:bg-gray-50">
            <td class="py-3 px-4 text-center">
              <span :class="[
                'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold',
                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                index === 1 ? 'bg-gray-100 text-gray-800' :
                index === 2 ? 'bg-orange-100 text-orange-800' :
                'bg-gray-50 text-gray-600'
              ]">
                {{ index + 1 }}
              </span>
            </td>
            <td class="py-3 px-4 text-sm font-medium text-gray-900">
              {{ result.candidate.number }} - {{ result.candidate.name }}
            </td>
            <td class="py-3 px-4 text-sm text-gray-600">{{ result.candidate.gender }}</td>
            <td class="py-3 px-4 text-center text-sm font-mono font-bold text-indigo-600">
              {{ result.total.toFixed(2) }}
            </td>
            <td class="py-3 px-4 text-center text-sm font-mono text-gray-600">
              {{ result.average.toFixed(2) }}
            </td>
          </tr>
          <tr v-if="!rankedResults.length">
            <td colspan="5" class="py-8 text-center text-gray-500">No results yet</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { showError, showSuccess, showInfo } from '../../../utils/alerts';

const props = defineProps({
  eventId: [String, Number],
  candidates: Array,
  rounds: Array,
  criteria: Array
});

const selectedRound = ref('');
const scores = ref([]);

const rankedResults = computed(() => {
  const results = (props.candidates || []).map(candidate => {
    const candidateScores = scores.value.filter(s => s.candidate_id === candidate.id);
    const total = candidateScores.reduce((sum, s) => sum + (s.points || 0), 0);
    const judgeCount = new Set(candidateScores.map(s => s.judge_id)).size || 1;
    
    return {
      candidate,
      total,
      average: total / judgeCount
    };
  });
  
  return results.sort((a, b) => b.total - a.total);
});

const loadScores = async () => {
  if (!props.eventId) return;
  
  try {
    const response = await fetch(`/api/points?event_id=${props.eventId}`);
    scores.value = await response.json();
  } catch (error) {
    showError('Failed to load scores');
  }
};

const exportResults = () => {
  // TODO: Implement export functionality
  showInfo('Export feature coming soon');
};

onMounted(() => {
  loadScores();
});
</script>
