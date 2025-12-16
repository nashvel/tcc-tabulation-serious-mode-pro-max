<template>
  <div class="font-sans antialiased min-h-screen bg-white pb-20">
    <!-- Empty State -->
    <div v-if="!judges.length && !loading" class="text-center py-4">
      <Users class="w-8 h-8 text-gray-300 mx-auto mb-2" />
      <p class="text-gray-500">No judges configured yet</p>
    </div>

    <!-- Main Content -->
    <template v-else-if="judges.length && (femaleCandidates.length || maleCandidates.length || groupCandidates.length || soloCandidates.length)">
      <!-- Round Header -->
      <div id="judges-round-header" class="bg-white border-b border-gray-200 px-6 py-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-widest mb-1">Currently Scoring</p>
            <h2 class="text-xl font-bold text-gray-900 uppercase tracking-wide">
              {{ activeRound?.name || 'No Active Round' }}
            </h2>
          </div>
          <div class="flex items-center gap-3">
            <HelpButton @click="startTour" />
            <span id="judges-live-indicator" class="flex items-center gap-1 text-xs text-green-600">
              <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
        </div>
      </div>

      <!-- Score Tables - Full Width -->
      <div class="w-full">
        <!-- Female Candidates -->
        <div v-if="femaleCandidates.length > 0">
          <div class="flex items-center justify-between px-6 py-3 bg-pink-50 border-b border-pink-200">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-pink-600">Female Candidates</h3>
            <button
              @click="scoresHidden = !scoresHidden"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all"
            >
              <EyeOff v-if="scoresHidden" :size="14" />
              <Eye v-else :size="14" />
              {{ scoresHidden ? 'Show' : 'Hide' }}
            </button>
          </div>
          
          <div class="bg-white overflow-x-auto">
            <table class="w-full border-collapse table-fixed">
              <colgroup>
                <col style="width: 30%">
                <col v-for="judge in judges" :key="'col-f-'+judge.id" :style="{ width: (60 / judges.length) + '%' }">
                <col style="width: 10%">
              </colgroup>
              <thead>
                <tr class="bg-gray-50 border-b border-gray-300">
                  <th class="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">Candidate</th>
                  <th v-for="judge in judges" :key="judge.id" class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                    <div class="flex items-center justify-center gap-1.5">
                      <span>Judge {{ judge.chair_number || judge.id }}</span>
                      <button
                        @click="printJudgeScores(judge.id)"
                        class="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Print judge scores"
                      >
                        <Printer :size="14" />
                      </button>
                    </div>
                  </th>
                  <th class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="candidate in femaleCandidates" :key="candidate.id" class="border-b border-gray-100 hover:bg-gray-50/50">
                  <td class="py-3 px-6 border-r border-gray-200">
                    <span class="font-semibold text-gray-900 text-sm uppercase">
                      {{ candidate.number }} - {{ candidate.name }}
                    </span>
                  </td>
                  <td 
                    v-for="judge in judges" 
                    :key="judge.id" 
                    class="py-3 px-4 text-center border-r border-gray-200"
                    :class="scoresHidden ? 'cursor-pointer hover:bg-gray-100' : ''"
                    @click="peekScore('judge', judge.id, candidate.id)"
                  >
                    <span :class="['font-mono text-sm transition-all duration-200', !isScoreVisible('judge', judge.id, candidate.id) ? 'blur-md' : '']">
                      {{ getJudgeTotal(judge.id, candidate.id) || '-' }}
                    </span>
                  </td>
                  <td 
                    class="py-3 px-4 text-center"
                    :class="scoresHidden ? 'cursor-pointer hover:bg-gray-100' : ''"
                    @click="peekScore('total', null, candidate.id)"
                  >
                    <span :class="['font-mono text-sm font-bold text-blue-600 transition-all duration-200', !isScoreVisible('total', null, candidate.id) ? 'blur-md' : '']">
                      {{ getCandidateTotal(candidate.id) || '-' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Male Candidates -->
        <div v-if="maleCandidates.length > 0">
          <div class="flex items-center justify-between px-6 py-3 bg-blue-50 border-b border-blue-200">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-blue-600">Male Candidates</h3>
          </div>
          
          <div class="bg-white overflow-x-auto">
            <table class="w-full border-collapse table-fixed">
              <colgroup>
                <col style="width: 30%">
                <col v-for="judge in judges" :key="'col-m-'+judge.id" :style="{ width: (60 / judges.length) + '%' }">
                <col style="width: 10%">
              </colgroup>
              <thead>
                <tr class="bg-gray-50 border-b border-gray-300">
                  <th class="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">Candidate</th>
                  <th v-for="judge in judges" :key="judge.id" class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                    <div class="flex items-center justify-center gap-1.5">
                      <span>Judge {{ judge.chair_number || judge.id }}</span>
                      <button
                        @click="printJudgeScores(judge.id)"
                        class="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Print judge scores"
                      >
                        <Printer :size="14" />
                      </button>
                    </div>
                  </th>
                  <th class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="candidate in maleCandidates" :key="candidate.id" class="border-b border-gray-100 hover:bg-gray-50/50">
                  <td class="py-3 px-6 border-r border-gray-200">
                    <span class="font-semibold text-gray-900 text-sm uppercase">
                      {{ candidate.number }} - {{ candidate.name }}
                    </span>
                  </td>
                  <td 
                    v-for="judge in judges" 
                    :key="judge.id" 
                    class="py-3 px-4 text-center border-r border-gray-200"
                    :class="scoresHidden ? 'cursor-pointer hover:bg-gray-100' : ''"
                    @click="peekScore('judge', judge.id, candidate.id)"
                  >
                    <span :class="['font-mono text-sm transition-all duration-200', !isScoreVisible('judge', judge.id, candidate.id) ? 'blur-md' : '']">
                      {{ getJudgeTotal(judge.id, candidate.id) || '-' }}
                    </span>
                  </td>
                  <td 
                    class="py-3 px-4 text-center"
                    :class="scoresHidden ? 'cursor-pointer hover:bg-gray-100' : ''"
                    @click="peekScore('total', null, candidate.id)"
                  >
                    <span :class="['font-mono text-sm font-bold text-blue-600 transition-all duration-200', !isScoreVisible('total', null, candidate.id) ? 'blur-md' : '']">
                      {{ getCandidateTotal(candidate.id) || '-' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Group/Team Candidates (for competitions like Battle of the Bands) -->
        <div v-if="groupCandidates.length > 0">
          <div class="flex items-center justify-between px-6 py-3 bg-purple-50 border-b border-purple-200">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-purple-600">Teams / Groups</h3>
            <button
              v-if="!femaleCandidates.length && !maleCandidates.length"
              @click="scoresHidden = !scoresHidden"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all"
            >
              <EyeOff v-if="scoresHidden" :size="14" />
              <Eye v-else :size="14" />
              {{ scoresHidden ? 'Show' : 'Hide' }}
            </button>
          </div>
          
          <div class="bg-white overflow-x-auto">
            <table class="w-full border-collapse table-fixed">
              <colgroup>
                <col style="width: 30%">
                <col v-for="judge in judges" :key="'col-g-'+judge.id" :style="{ width: (60 / judges.length) + '%' }">
                <col style="width: 10%">
              </colgroup>
              <thead>
                <tr class="bg-gray-50 border-b border-gray-300">
                  <th class="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">Team / Group</th>
                  <th v-for="judge in judges" :key="judge.id" class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                    <div class="flex items-center justify-center gap-1.5">
                      <span>Judge {{ judge.chair_number || judge.id }}</span>
                      <button
                        @click="printJudgeScores(judge.id)"
                        class="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Print judge scores"
                      >
                        <Printer :size="14" />
                      </button>
                    </div>
                  </th>
                  <th class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="candidate in groupCandidates" :key="candidate.id" class="border-b border-gray-100 hover:bg-gray-50/50">
                  <td class="py-3 px-6 border-r border-gray-200">
                    <span class="font-semibold text-gray-900 text-sm uppercase">
                      {{ candidate.number }} - {{ candidate.name }}
                    </span>
                    <span v-if="candidate.department" class="block text-xs text-gray-500">{{ candidate.department }}</span>
                  </td>
                  <td 
                    v-for="judge in judges" 
                    :key="judge.id" 
                    class="py-3 px-4 text-center border-r border-gray-200"
                    :class="scoresHidden ? 'cursor-pointer hover:bg-gray-100' : ''"
                    @click="peekScore('judge', judge.id, candidate.id)"
                  >
                    <span :class="['font-mono text-sm transition-all duration-200', !isScoreVisible('judge', judge.id, candidate.id) ? 'blur-md' : '']">
                      {{ getJudgeTotal(judge.id, candidate.id) || '-' }}
                    </span>
                  </td>
                  <td 
                    class="py-3 px-4 text-center"
                    :class="scoresHidden ? 'cursor-pointer hover:bg-gray-100' : ''"
                    @click="peekScore('total', null, candidate.id)"
                  >
                    <span :class="['font-mono text-sm font-bold text-blue-600 transition-all duration-200', !isScoreVisible('total', null, candidate.id) ? 'blur-md' : '']">
                      {{ getCandidateTotal(candidate.id) || '-' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Solo/Individual Candidates (no gender separation - singing contests, etc.) -->
        <div v-if="soloCandidates.length > 0">
          <div class="flex items-center justify-between px-6 py-3 bg-indigo-50 border-b border-indigo-200">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-indigo-600">Participants</h3>
            <button
              v-if="!femaleCandidates.length && !maleCandidates.length && !groupCandidates.length"
              @click="scoresHidden = !scoresHidden"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all"
            >
              <EyeOff v-if="scoresHidden" :size="14" />
              <Eye v-else :size="14" />
              {{ scoresHidden ? 'Show' : 'Hide' }}
            </button>
          </div>
          
          <div class="bg-white overflow-x-auto">
            <table class="w-full border-collapse table-fixed">
              <colgroup>
                <col style="width: 30%">
                <col v-for="judge in judges" :key="'col-s-'+judge.id" :style="{ width: (60 / judges.length) + '%' }">
                <col style="width: 10%">
              </colgroup>
              <thead>
                <tr class="bg-gray-50 border-b border-gray-300">
                  <th class="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">Participant</th>
                  <th v-for="judge in judges" :key="judge.id" class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                    <div class="flex items-center justify-center gap-1.5">
                      <span>Judge {{ judge.chair_number || judge.id }}</span>
                      <button
                        @click="printJudgeScores(judge.id)"
                        class="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Print judge scores"
                      >
                        <Printer :size="14" />
                      </button>
                    </div>
                  </th>
                  <th class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="candidate in soloCandidates" :key="candidate.id" class="border-b border-gray-100 hover:bg-gray-50/50">
                  <td class="py-3 px-6 border-r border-gray-200">
                    <span class="font-semibold text-gray-900 text-sm uppercase">
                      {{ candidate.number }} - {{ candidate.name }}
                    </span>
                    <span v-if="candidate.department" class="block text-xs text-gray-500">{{ candidate.department }}</span>
                  </td>
                  <td 
                    v-for="judge in judges" 
                    :key="judge.id" 
                    class="py-3 px-4 text-center border-r border-gray-200"
                    :class="scoresHidden ? 'cursor-pointer hover:bg-gray-100' : ''"
                    @click="peekScore('judge', judge.id, candidate.id)"
                  >
                    <span :class="['font-mono text-sm transition-all duration-200', !isScoreVisible('judge', judge.id, candidate.id) ? 'blur-md' : '']">
                      {{ getJudgeTotal(judge.id, candidate.id) || '-' }}
                    </span>
                  </td>
                  <td 
                    class="py-3 px-4 text-center"
                    :class="scoresHidden ? 'cursor-pointer hover:bg-gray-100' : ''"
                    @click="peekScore('total', null, candidate.id)"
                  >
                    <span :class="['font-mono text-sm font-bold text-blue-600 transition-all duration-200', !isScoreVisible('total', null, candidate.id) ? 'blur-md' : '']">
                      {{ getCandidateTotal(candidate.id) || '-' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
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
import { Eye, EyeOff, Users, Printer } from 'lucide-vue-next';
import { showError } from '../../../utils/alerts';
import { useTour } from '../../../composables/useTour';
import TourTooltip from '../../shared/TourTooltip.vue';
import HelpButton from '../../shared/HelpButton.vue';

const props = defineProps({
  eventId: [String, Number],
  judges: Array,
  rounds: Array,
  candidates: Array,
  criteria: Array
});

const loading = ref(true);
const scoresHidden = ref(true);
const scores = ref({});
const activeRound = ref(null);
const isLive = ref(false);
const peekingScore = ref(null); // Track which score is being peeked: 'judge-candidate' or 'total-candidate'

// Peek at a hidden score for 1 second
const peekScore = (type, judgeId, candidateId) => {
  if (!scoresHidden.value) return; // Only works when hidden
  const key = type === 'total' ? `total-${candidateId}` : `${judgeId}-${candidateId}`;
  peekingScore.value = key;
  setTimeout(() => {
    if (peekingScore.value === key) {
      peekingScore.value = null;
    }
  }, 1000);
};

// Check if a score should be visible (either not hidden or being peeked)
const isScoreVisible = (type, judgeId, candidateId) => {
  if (!scoresHidden.value) return true;
  const key = type === 'total' ? `total-${candidateId}` : `${judgeId}-${candidateId}`;
  return peekingScore.value === key;
};

// Tour steps for Judges Scoring tab
const tourSteps = [
  {
    target: '#judges-round-header',
    title: 'Active Round Display',
    content: 'Shows the currently active round being scored. Judges can only submit scores for the active round.',
    placement: 'bottom'
  },
  {
    target: '#judges-live-indicator',
    title: 'Live Updates Indicator',
    content: 'When green, scores update in real-time via WebSocket. You\'ll see judge scores appear instantly as judges submit them.',
    placement: 'left'
  }
];

const tour = useTour('judges-scoring-tab', tourSteps);

const startTour = () => {
  tour.startTour();
};

// Pending updates buffer for batching WebSocket updates
let pendingUpdates = [];
let updateTimeout = null;

const femaleCandidates = computed(() => 
  (props.candidates || []).filter(c => c.gender?.toLowerCase() === 'female')
);

const maleCandidates = computed(() => 
  (props.candidates || []).filter(c => c.gender?.toLowerCase() === 'male')
);

// Group/Team candidates (for competitions like Battle of the Bands)
const groupCandidates = computed(() => 
  (props.candidates || []).filter(c => 
    c.gender?.toLowerCase() === 'group' || 
    c.participant_type?.toLowerCase() === 'group'
  )
);

// Solo/Individual candidates (no gender separation - for singing contests, etc.)
const soloCandidates = computed(() => 
  (props.candidates || []).filter(c => 
    c.gender?.toLowerCase() === 'solo' || 
    c.participant_type?.toLowerCase() === 'solo' ||
    c.participant_type?.toLowerCase() === 'individual'
  )
);

const getJudgeTotal = (judgeId, candidateId) => {
  if (!scores.value[judgeId]?.[candidateId]) return null;
  const judgeScores = Object.values(scores.value[judgeId][candidateId]);
  const total = judgeScores.reduce((sum, score) => sum + (score || 0), 0);
  return total > 0 ? total.toFixed(2) : null;
};

const getCandidateTotal = (candidateId) => {
  // Sum all scores from all judges for this candidate
  let total = 0;
  props.judges?.forEach(judge => {
    if (scores.value[judge.id]?.[candidateId]) {
      Object.values(scores.value[judge.id][candidateId]).forEach(score => {
        total += score || 0;
      });
    }
  });
  
  // Calculate average across ALL judges (including those who haven't scored = 0)
  const judgeCount = props.judges?.length || 1;
  const average = total / judgeCount;
  
  return average > 0 ? average.toFixed(2) : null;
};

// Flush all pending updates in a single state update
const flushPendingUpdates = () => {
  if (pendingUpdates.length === 0) return;
  
  const updates = [...pendingUpdates];
  pendingUpdates = [];
  
  const newScores = { ...scores.value };
  updates.forEach(({ judgeId, batchScores }) => {
    if (!newScores[judgeId]) return;
    batchScores.forEach(score => {
      if (newScores[judgeId][score.candidate_id]) {
        newScores[judgeId][score.candidate_id][score.criteria_id] = score.points;
      }
    });
  });
  scores.value = newScores;
};

// Handle WebSocket score updates
const handleScoreUpdate = (data) => {
  // Handle batch updates from judges
  if (data.is_batch && data.batch_scores) {
    pendingUpdates.push({
      judgeId: data.judge_id,
      batchScores: data.batch_scores
    });
    
    // Debounce: wait 50ms for more updates before rendering
    if (updateTimeout) clearTimeout(updateTimeout);
    updateTimeout = setTimeout(flushPendingUpdates, 50);
    return;
  }

  // Handle single score update (backward compatibility)
  if (data.judge_id && data.candidate_id && data.criteria_id !== undefined) {
    pendingUpdates.push({
      judgeId: data.judge_id,
      batchScores: [{ candidate_id: data.candidate_id, criteria_id: data.criteria_id, points: data.points }]
    });
    
    if (updateTimeout) clearTimeout(updateTimeout);
    updateTimeout = setTimeout(flushPendingUpdates, 50);
  }
};

const loadScores = async () => {
  if (!props.eventId) return;
  
  try {
    // Build URL with optional round_id filter
    let url = `/api/points?event_id=${props.eventId}`;
    if (activeRound.value?.id) {
      url += `&round_id=${activeRound.value.id}`;
    }
    
    const response = await fetch(url);
    const pointsData = await response.json();
    
    // Get criteria for the active round only
    const activeRoundCriteria = activeRound.value?.id 
      ? (props.criteria || []).filter(c => c.round_id === activeRound.value.id)
      : props.criteria || [];
    
    const newScores = {};
    props.judges?.forEach(judge => {
      newScores[judge.id] = {};
      props.candidates?.forEach(candidate => {
        newScores[judge.id][candidate.id] = {};
        activeRoundCriteria.forEach(criterion => {
          newScores[judge.id][candidate.id][criterion.id] = null;
        });
      });
    });
    
    pointsData.forEach(point => {
      if (newScores[point.judge_id]?.[point.candidate_id]) {
        newScores[point.judge_id][point.candidate_id][point.criteria_id] = point.points;
      }
    });
    
    scores.value = newScores;
  } catch (error) {
    showError('Failed to load scores');
  }
};

const loadVotingState = async () => {
  if (!props.eventId) return;
  
  try {
    const response = await fetch(`/api/voting/state?event_id=${props.eventId}`);
    const data = await response.json();
    activeRound.value = data.active_round;
  } catch (error) {
    showError('Failed to load voting state');
  }
};

// Setup WebSocket connection for scores
const setupScoresWebSocket = () => {
  if (!props.eventId || !window.Echo) return null;
  
  const channelName = `scores.${props.eventId}`;
  console.log('[WebSocket] JudgesScoringTab: Connecting to scores channel:', channelName);
  
  const channel = window.Echo.channel(channelName);
  
  channel.subscribed(() => {
    console.log('[WebSocket] JudgesScoringTab: Subscribed to scores channel:', channelName);
    isLive.value = true;
  });
  
  channel.listen('.ScoreUpdated', (data) => {
    console.log('[WebSocket] Score update received:', data);
    handleScoreUpdate(data);
  });
  
  return channelName;
};

// Setup WebSocket connection for voting state changes (round changes)
const setupVotingWebSocket = () => {
  if (!props.eventId || !window.Echo) return null;
  
  const channelName = `voting.${props.eventId}`;
  console.log('[WebSocket] JudgesScoringTab: Connecting to voting channel:', channelName);
  
  const channel = window.Echo.channel(channelName);
  
  channel.listen('.VotingStateChanged', (data) => {
    console.log('[WebSocket] Voting state changed:', data);
    // Update active round when it changes
    if (data.action === 'round_activated' || data.action === 'round_changed') {
      if (data.voting_state?.active_round) {
        activeRound.value = data.voting_state.active_round;
      }
    }
  });
  
  return channelName;
};

let scoresChannel = null;
let votingChannel = null;

onMounted(async () => {
  await loadVotingState();
  await loadScores();
  loading.value = false;
  
  // Setup WebSocket channels after data is loaded
  scoresChannel = setupScoresWebSocket();
  votingChannel = setupVotingWebSocket();
});

onUnmounted(() => {
  // Cleanup WebSocket channels
  if (scoresChannel && window.Echo) {
    window.Echo.leave(scoresChannel);
    console.log('[WebSocket] Left scores channel:', scoresChannel);
  }
  if (votingChannel && window.Echo) {
    window.Echo.leave(votingChannel);
    console.log('[WebSocket] Left voting channel:', votingChannel);
  }
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  isLive.value = false;
});

// Re-setup WebSocket if eventId changes
watch(() => props.eventId, async (newEventId, oldEventId) => {
  if (newEventId !== oldEventId) {
    // Leave old channels
    if (scoresChannel && window.Echo) {
      window.Echo.leave(scoresChannel);
    }
    if (votingChannel && window.Echo) {
      window.Echo.leave(votingChannel);
    }
    // Reload data and setup new channels
    await loadVotingState();
    await loadScores();
    scoresChannel = setupScoresWebSocket();
    votingChannel = setupVotingWebSocket();
  }
});

// Reload scores when active round changes
watch(activeRound, async (newRound, oldRound) => {
  if (newRound?.id !== oldRound?.id) {
    console.log('[JudgesScoringTab] Active round changed, reloading scores...');
    await loadScores();
  }
});

// Open print page for a specific judge
const printJudgeScores = (judgeId) => {
  const url = `/admin/print-judge-scores?event_id=${props.eventId}&judge_id=${judgeId}`;
  window.open(url, '_blank');
};
</script>
