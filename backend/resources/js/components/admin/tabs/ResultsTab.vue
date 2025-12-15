<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-900">Results</h2>
      <div class="flex gap-2">
        <select v-model="selectedRound" class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm">
          <option value="">All Rounds</option>
          <option v-for="round in rounds" :key="round.id" :value="round.id">{{ round.name }}</option>
        </select>
        <button
          @click="showScores = !showScores"
          class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Eye v-if="showScores" :size="16" />
          <EyeOff v-else :size="16" />
          {{ showScores ? 'Hide' : 'Show' }}
        </button>
        <button
          @click="exportResults"
          class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download :size="16" />
          Export
        </button>
      </div>
    </div>

    <!-- Female Results -->
    <div v-if="femaleResults.length > 0" class="mb-4">
      <div class="flex items-center gap-2 px-3 py-1.5 bg-white border-b border-gray-200">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-600">Female</h3>
      </div>
      <div class="bg-white border border-t-0 border-gray-200 overflow-x-auto">
        <table class="w-full min-w-max">
          <thead>
            <tr class="bg-white border-b border-gray-200">
              <th class="px-3 py-1.5 text-center text-xs font-medium text-gray-500 w-14">RANK</th>
              <th class="px-3 py-1.5 text-left text-xs font-medium text-gray-500">CANDIDATE</th>
              <th class="px-3 py-1.5 text-center text-xs font-medium text-gray-500 w-24">TOTAL</th>
              <th class="px-3 py-1.5 text-center text-xs font-medium text-gray-500 w-24">AVG</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(result, index) in femaleResults" :key="result.candidate.id" class="border-b border-gray-100 hover:bg-gray-50">
              <td class="px-3 py-1.5 text-center">
                <span :class="getRankClass(index)">{{ index + 1 }}</span>
              </td>
              <td class="px-3 py-1.5 text-sm text-gray-900">
                {{ result.candidate.number }} - {{ result.candidate.name?.toUpperCase() }}
              </td>
              <td class="px-3 py-1.5 text-center text-sm font-semibold text-gray-900" :class="{ 'blur-sm select-none': !showScores }">{{ result.total.toFixed(2) }}</td>
              <td class="px-3 py-1.5 text-center text-sm text-gray-500" :class="{ 'blur-sm select-none': !showScores }">{{ result.average.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Male Results -->
    <div v-if="maleResults.length > 0" class="mb-4">
      <div class="flex items-center gap-2 px-3 py-1.5 bg-white border-b border-gray-200">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-600">Male</h3>
      </div>
      <div class="bg-white border border-t-0 border-gray-200 overflow-x-auto">
        <table class="w-full min-w-max">
          <thead>
            <tr class="bg-white border-b border-gray-200">
              <th class="px-3 py-1.5 text-center text-xs font-medium text-gray-500 w-14">RANK</th>
              <th class="px-3 py-1.5 text-left text-xs font-medium text-gray-500">CANDIDATE</th>
              <th class="px-3 py-1.5 text-center text-xs font-medium text-gray-500 w-24">TOTAL</th>
              <th class="px-3 py-1.5 text-center text-xs font-medium text-gray-500 w-24">AVG</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(result, index) in maleResults" :key="result.candidate.id" class="border-b border-gray-100 hover:bg-gray-50">
              <td class="px-3 py-1.5 text-center">
                <span :class="getRankClass(index)">{{ index + 1 }}</span>
              </td>
              <td class="px-3 py-1.5 text-sm text-gray-900">
                {{ result.candidate.number }} - {{ result.candidate.name?.toUpperCase() }}
              </td>
              <td class="px-3 py-1.5 text-center text-sm font-semibold text-gray-900" :class="{ 'blur-sm select-none': !showScores }">{{ result.total.toFixed(2) }}</td>
              <td class="px-3 py-1.5 text-center text-sm text-gray-500" :class="{ 'blur-sm select-none': !showScores }">{{ result.average.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Group/Team Results -->
    <div v-if="groupResults.length > 0" class="mb-4">
      <div class="flex items-center gap-2 px-3 py-1.5 bg-white border-b border-gray-200">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-600">Teams / Groups</h3>
      </div>
      <div class="bg-white border border-t-0 border-gray-200 overflow-x-auto">
        <table class="w-full min-w-max">
          <thead>
            <tr class="bg-white border-b border-gray-200">
              <th class="px-3 py-1.5 text-center text-xs font-medium text-gray-500 w-14">RANK</th>
              <th class="px-3 py-1.5 text-left text-xs font-medium text-gray-500">TEAM</th>
              <th class="px-3 py-1.5 text-center text-xs font-medium text-gray-500 w-24">TOTAL</th>
              <th class="px-3 py-1.5 text-center text-xs font-medium text-gray-500 w-24">AVG</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(result, index) in groupResults" :key="result.candidate.id" class="border-b border-gray-100 hover:bg-gray-50">
              <td class="px-3 py-1.5 text-center">
                <span :class="getRankClass(index)">{{ index + 1 }}</span>
              </td>
              <td class="px-3 py-1.5 text-sm text-gray-900">
                {{ result.candidate.number }} - {{ result.candidate.name?.toUpperCase() }}
              </td>
              <td class="px-3 py-1.5 text-center text-sm font-semibold text-gray-900" :class="{ 'blur-sm select-none': !showScores }">{{ result.total.toFixed(2) }}</td>
              <td class="px-3 py-1.5 text-center text-sm text-gray-500" :class="{ 'blur-sm select-none': !showScores }">{{ result.average.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Solo/Individual Results -->
    <div v-if="soloResults.length > 0" class="mb-4">
      <div class="flex items-center gap-2 px-3 py-1.5 bg-white border-b border-gray-200">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-600">Participants</h3>
      </div>
      <div class="bg-white border border-t-0 border-gray-200 overflow-x-auto">
        <table class="w-full min-w-max">
          <thead>
            <tr class="bg-white border-b border-gray-200">
              <th class="px-3 py-1.5 text-center text-xs font-medium text-gray-500 w-14">RANK</th>
              <th class="px-3 py-1.5 text-left text-xs font-medium text-gray-500">PARTICIPANT</th>
              <th class="px-3 py-1.5 text-center text-xs font-medium text-gray-500 w-24">TOTAL</th>
              <th class="px-3 py-1.5 text-center text-xs font-medium text-gray-500 w-24">AVG</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(result, index) in soloResults" :key="result.candidate.id" class="border-b border-gray-100 hover:bg-gray-50">
              <td class="px-3 py-1.5 text-center">
                <span :class="getRankClass(index)">{{ index + 1 }}</span>
              </td>
              <td class="px-3 py-1.5 text-sm text-gray-900">
                {{ result.candidate.number }} - {{ result.candidate.name?.toUpperCase() }}
              </td>
              <td class="px-3 py-1.5 text-center text-sm font-semibold text-gray-900" :class="{ 'blur-sm select-none': !showScores }">{{ result.total.toFixed(2) }}</td>
              <td class="px-3 py-1.5 text-center text-sm text-gray-500" :class="{ 'blur-sm select-none': !showScores }">{{ result.average.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!femaleResults.length && !maleResults.length && !groupResults.length && !soloResults.length" class="text-center py-4">
      <Trophy class="w-6 h-6 text-gray-300 mx-auto mb-2" />
      <p class="text-gray-400 text-sm">No results available</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Download, Trophy, Eye, EyeOff } from 'lucide-vue-next';
import { showError, showSuccess } from '../../../utils/alerts';

const props = defineProps({
  eventId: [String, Number],
  candidates: Array,
  rounds: Array,
  criteria: Array
});

const selectedRound = ref('');
const scores = ref([]);
const loading = ref(true);
const showScores = ref(false);
let refreshInterval = null;

const calculateResult = (candidate) => {
  const candidateScores = scores.value.filter(s => s.candidate_id == candidate.id);
  let filteredScores = candidateScores;
  
  if (selectedRound.value) {
    filteredScores = candidateScores.filter(s => s.round_id == selectedRound.value);
  }
  
  const rawTotal = filteredScores.reduce((sum, s) => sum + (parseFloat(s.points) || 0), 0);
  const judgeIds = [...new Set(filteredScores.map(s => s.judge_id))];
  const judgeCount = judgeIds.length || 1;
  const average = rawTotal / judgeCount;
  
  return { candidate, total: average, average, rawTotal };
};

const femaleResults = computed(() => {
  const females = (props.candidates || []).filter(c => c.gender?.toLowerCase() === 'female');
  return females.map(calculateResult).sort((a, b) => b.total - a.total);
});

const maleResults = computed(() => {
  const males = (props.candidates || []).filter(c => c.gender?.toLowerCase() === 'male');
  return males.map(calculateResult).sort((a, b) => b.total - a.total);
});

const groupResults = computed(() => {
  const groups = (props.candidates || []).filter(c => 
    c.gender?.toLowerCase() === 'group' || c.participant_type?.toLowerCase() === 'group'
  );
  return groups.map(calculateResult).sort((a, b) => b.total - a.total);
});

const soloResults = computed(() => {
  const solos = (props.candidates || []).filter(c => 
    c.gender?.toLowerCase() === 'solo' || 
    c.participant_type?.toLowerCase() === 'solo' ||
    c.participant_type?.toLowerCase() === 'individual'
  );
  return solos.map(calculateResult).sort((a, b) => b.total - a.total);
});

const getRankClass = (index) => {
  const base = 'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold';
  if (index === 0) return `${base} bg-yellow-400 text-white`;
  if (index === 1) return `${base} bg-gray-400 text-white`;
  if (index === 2) return `${base} bg-orange-400 text-white`;
  return `${base} text-gray-500`;
};

const loadScores = async (showLoadingSpinner = true) => {
  if (!props.eventId) return;
  
  try {
    if (showLoadingSpinner) loading.value = true;
    const response = await fetch(`/api/points?event_id=${props.eventId}`);
    const data = await response.json();
    scores.value = data;
  } catch (error) {
    if (showLoadingSpinner) showError('Failed to load scores');
  } finally {
    if (showLoadingSpinner) loading.value = false;
  }
};

const exportResults = () => {
  const roundName = selectedRound.value 
    ? props.rounds?.find(r => r.id == selectedRound.value)?.name || 'Round'
    : 'All Rounds';
  
  let csv = `Results - ${roundName}\n\n`;
  
  const addSection = (title, results) => {
    if (results.length === 0) return;
    csv += `${title}\n`;
    csv += 'Rank,Candidate,Total,Average\n';
    results.forEach((r, i) => {
      csv += `${i + 1},"${r.candidate.number} - ${r.candidate.name}",${r.total.toFixed(2)},${r.average.toFixed(2)}\n`;
    });
    csv += '\n';
  };
  
  addSection('Female', femaleResults.value);
  addSection('Male', maleResults.value);
  addSection('Teams / Groups', groupResults.value);
  addSection('Participants', soloResults.value);
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `results-${roundName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showSuccess('Results exported');
};

onMounted(() => {
  loadScores(true);
  refreshInterval = setInterval(() => loadScores(false), 2000);
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});
</script>
