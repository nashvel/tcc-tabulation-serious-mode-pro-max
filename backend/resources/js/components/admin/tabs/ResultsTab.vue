<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-semibold text-gray-900">Results</h2>
        <HelpButton @click="startTour" />
        <span v-if="isLive" class="flex items-center gap-1 text-xs text-green-600">
          <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live
        </span>
      </div>
      <div id="results-controls" class="flex gap-2">
        <select id="round-filter" v-model="selectedRound" class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm">
          <option value="">All Rounds</option>
          <option v-for="round in rounds" :key="round.id" :value="round.id">{{ round.name }}</option>
        </select>
        <button
          id="hide-scores-btn"
          @click="showScores = !showScores"
          class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Eye v-if="showScores" :size="16" />
          <EyeOff v-else :size="16" />
          {{ showScores ? 'Hide' : 'Show' }}
        </button>
        <button
          id="export-btn"
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

  <!-- Tour Tooltip (teleported to body) -->
  <Teleport to="body">
    <TourTooltip
      :isActive="tour.isActive.value"
      :currentStep="tour.currentStep.value"
      :totalSteps="tourSteps.length"
      :step="tourSteps[tour.currentStep.value] || {}"
      :tooltipStyle="tour.tooltipStyle.value"
      :arrowStyle="tour.arrowStyle.value"
      :placement="tour.placement.value"
      @next="tour.nextStep"
      @prev="tour.prevStep"
      @skip="tour.endTour(false)"
    />
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Download, Trophy, Eye, EyeOff } from 'lucide-vue-next';
import { showError, showSuccess } from '../../../utils/alerts';
import { useTour } from '../../../composables/useTour';
import TourTooltip from '../../shared/TourTooltip.vue';
import HelpButton from '../../shared/HelpButton.vue';

const props = defineProps({
  eventId: [String, Number],
  candidates: Array,
  rounds: Array,
  criteria: Array,
  judges: Array
});

const selectedRound = ref('');
const scores = ref([]);
const loading = ref(true);
const showScores = ref(false);
const isLive = ref(false);
let scoresChannel = null;

// Tour steps for Results tab
const tourSteps = [
  {
    target: '#round-filter',
    title: 'Filter by Round',
    content: 'Select a specific round to view results for that round only, or view all rounds combined.',
    placement: 'bottom'
  },
  {
    target: '#hide-scores-btn',
    title: 'Hide/Show Scores',
    content: 'Toggle score visibility. Useful when presenting results without revealing exact scores.',
    placement: 'bottom'
  },
  {
    target: '#export-btn',
    title: 'Export Results',
    content: 'Download results as a CSV file for printing or further analysis.',
    placement: 'bottom'
  }
];

const tour = useTour('results-tab', tourSteps);

const startTour = () => {
  tour.startTour();
};

const calculateResult = (candidate) => {
  const candidateScores = scores.value.filter(s => s.candidate_id == candidate.id);
  let filteredScores = candidateScores;
  const totalJudgeCount = props.judges?.length || 1;
  
  if (selectedRound.value) {
    // Single round selected - filter by that round
    filteredScores = candidateScores.filter(s => s.round_id == selectedRound.value);
    
    const rawTotal = filteredScores.reduce((sum, s) => sum + (parseFloat(s.points) || 0), 0);
    const average = rawTotal / totalJudgeCount;
    
    return { candidate, total: average, average, rawTotal };
  } else {
    // "All Rounds" selected
    // Calculate average per round, then average those (excluding rounds with zero scores)
    
    // Group scores by round
    const scoresByRound = {};
    filteredScores.forEach(s => {
      if (!scoresByRound[s.round_id]) {
        scoresByRound[s.round_id] = [];
      }
      scoresByRound[s.round_id].push(s);
    });
    
    // Calculate average for each round that has scores
    const roundAverages = [];
    Object.keys(scoresByRound).forEach(roundId => {
      const roundScores = scoresByRound[roundId];
      const roundTotal = roundScores.reduce((sum, s) => sum + (parseFloat(s.points) || 0), 0);
      const roundAvg = roundTotal / totalJudgeCount;
      if (roundAvg > 0) {
        roundAverages.push(roundAvg);
      }
    });
    
    // Total = sum of all round averages / number of rounds with scores
    const totalOfAverages = roundAverages.reduce((sum, avg) => sum + avg, 0);
    const roundsWithScores = roundAverages.length || 1;
    const finalAverage = totalOfAverages / roundsWithScores;
    
    return { candidate, total: finalAverage, average: finalAverage, rawTotal: totalOfAverages };
  }
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

// Handle WebSocket score updates
const handleScoreUpdate = (data) => {
  // Handle batch updates
  if (data.is_batch && data.batch_scores) {
    data.batch_scores.forEach(score => {
      updateLocalScore(data.judge_id, score.candidate_id, score.criteria_id, score.points, data.round_id);
    });
    return;
  }
  
  // Handle single score update
  if (data.judge_id && data.candidate_id && data.criteria_id !== undefined) {
    updateLocalScore(data.judge_id, data.candidate_id, data.criteria_id, data.points, data.round_id);
  }
};

// Update local scores array
const updateLocalScore = (judgeId, candidateId, criteriaId, points, roundId) => {
  const existingIndex = scores.value.findIndex(
    s => s.judge_id == judgeId && s.candidate_id == candidateId && s.criteria_id == criteriaId
  );
  
  if (existingIndex >= 0) {
    scores.value[existingIndex].points = points;
  } else {
    scores.value.push({
      judge_id: judgeId,
      candidate_id: candidateId,
      criteria_id: criteriaId,
      round_id: roundId,
      points: points
    });
  }
};

// Setup WebSocket connection for scores
const setupScoresWebSocket = () => {
  if (!props.eventId) {
    console.log('[WebSocket] ResultsTab: No eventId, skipping WebSocket setup');
    return null;
  }
  
  if (!window.Echo) {
    console.log('[WebSocket] ResultsTab: Echo not available, retrying in 1s...');
    setTimeout(() => {
      scoresChannel = setupScoresWebSocket();
    }, 1000);
    return null;
  }
  
  const channelName = `scores.${props.eventId}`;
  console.log('[WebSocket] ResultsTab: Connecting to scores channel:', channelName);
  
  try {
    const channel = window.Echo.channel(channelName);
    
    channel.subscribed(() => {
      console.log('[WebSocket] ResultsTab: ✓ Subscribed to scores channel:', channelName);
      isLive.value = true;
    });
    
    channel.error((error) => {
      console.error('[WebSocket] ResultsTab: Channel error:', error);
      isLive.value = false;
    });
    
    channel.listen('.ScoreUpdated', (data) => {
      console.log('[WebSocket] ResultsTab: Score update received:', data);
      handleScoreUpdate(data);
    });
    
    return channelName;
  } catch (error) {
    console.error('[WebSocket] ResultsTab: Failed to setup channel:', error);
    return null;
  }
};

onMounted(async () => {
  await loadScores(true);
  // Small delay to ensure Echo is ready
  setTimeout(() => {
    scoresChannel = setupScoresWebSocket();
  }, 500);
});

onUnmounted(() => {
  // Cleanup WebSocket channel
  if (scoresChannel && window.Echo) {
    try {
      window.Echo.leave(scoresChannel);
      console.log('[WebSocket] ResultsTab: Left scores channel:', scoresChannel);
    } catch (e) {
      console.error('[WebSocket] ResultsTab: Error leaving channel:', e);
    }
  }
  isLive.value = false;
});

// Re-setup WebSocket if eventId changes
watch(() => props.eventId, async (newEventId, oldEventId) => {
  if (newEventId && newEventId !== oldEventId) {
    // Leave old channel
    if (scoresChannel && window.Echo) {
      try {
        window.Echo.leave(scoresChannel);
      } catch (e) {
        console.error('[WebSocket] ResultsTab: Error leaving old channel:', e);
      }
    }
    isLive.value = false;
    // Reload data and setup new channel
    await loadScores(true);
    scoresChannel = setupScoresWebSocket();
  }
}, { immediate: false });
</script>
