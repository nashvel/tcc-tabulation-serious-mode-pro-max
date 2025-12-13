<template>
  <!-- Preloader -->
  <Preloader v-if="loading" />

  <!-- No Active Event Screen -->
  <div v-else-if="showNoActiveEvent" class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <CalendarX class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h1 class="text-lg font-medium text-gray-900 mb-1">No Active Event</h1>
      <p class="text-sm text-gray-500 mb-6">Waiting for admin to activate an event</p>
      <button
        @click="checkActiveEvent"
        class="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <RefreshCw class="w-4 h-4" />
        Refresh
      </button>
    </div>
  </div>

  <!-- Judge Selection Screen -->
  <div v-else-if="showJudgeSelection" class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-lg font-semibold text-gray-900">Select Judge</h1>
        <p class="text-sm text-gray-500">Choose your judge position to continue</p>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-6 py-8">
      <!-- Judge Selection Grid -->
      <template v-if="availableJudges.length === 0">
        <div class="text-center py-16">
          <Users class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500">No judges available</p>
        </div>
      </template>
      <template v-else>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          <button
            v-for="judge in judges"
            :key="judge.id"
            @click="handleJudgeSelect(judge.id)"
            :disabled="occupiedJudgeIds.includes(judge.id)"
            :class="[
              'relative p-6 rounded-xl border-2 transition-all text-center',
              judgeId === judge.id.toString()
                ? 'border-indigo-600 bg-indigo-50'
                : occupiedJudgeIds.includes(judge.id)
                  ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            ]"
          >
            <div v-if="occupiedJudgeIds.includes(judge.id)" class="absolute top-2 right-2">
              <UserX class="w-4 h-4 text-red-400" />
            </div>
            <Gavel :class="['w-8 h-8 mx-auto mb-3', judgeId === judge.id.toString() ? 'text-indigo-600' : 'text-gray-400']" />
            <div class="text-2xl font-bold text-gray-900 mb-1">
              {{ String(judge.chair_number).padStart(2, '0') }}
            </div>
            <div class="text-xs text-gray-500 uppercase tracking-wide">
              {{ occupiedJudgeIds.includes(judge.id) ? 'In Use' : 'Available' }}
            </div>
          </button>
        </div>

        <!-- Selected Judge & Proceed -->
        <div v-if="judgeId" class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <Gavel class="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p class="text-sm text-gray-500">Selected</p>
                <p class="font-semibold text-gray-900">Judge #{{ selectedJudgeNumber }}</p>
              </div>
            </div>
            <button
              @click="handleProceed"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Continue
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>

  <!-- Scoring Interface -->
  <div v-else class="min-h-screen bg-gray-50 relative font-sans antialiased">
    <!-- Lock Screen Overlay -->
    <div v-if="isLocked" class="fixed inset-0 bg-gray-900 z-[9999] flex flex-col items-center justify-center text-white">
      <Lock class="w-20 h-20 text-amber-500 mb-6" />
      <h1 class="text-3xl font-bold mb-2">Screen Locked</h1>
      <p class="text-gray-400">Waiting for admin to unlock...</p>
    </div>

    <!-- Waiting for Admin Screen -->
    <JudgePreloader v-if="!isLocked && !showScoringInterface" />

    <!-- Scoring Interface -->
    <div v-if="!isLocked && showScoringInterface" class="bg-gray-50">
      <!-- Round Header with Progress Counter -->
      <div class="flex items-center justify-between py-3 px-4 bg-white border-b border-gray-200">
        <div class="flex-1"></div>
        <div class="text-center flex-1">
          <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Currently Scoring</p>
          <h1 class="text-xl font-bold text-gray-900 uppercase tracking-wide">{{ activeRoundName }}</h1>
        </div>
        <!-- Progress Counter - Right side of header -->
        <div class="flex-1 flex justify-end">
          <div class="bg-white rounded-md px-3 py-1.5 border border-gray-200">
            <p class="text-[8px] text-gray-400 uppercase tracking-widest text-center">Scores Entered</p>
            <div class="text-center">
              <span class="text-xl font-bold text-gray-900">{{ filledInputsCount }}</span>
              <span class="text-sm text-gray-400 mx-0.5">/</span>
              <span class="text-xl font-bold text-gray-900">{{ totalInputsCount }}</span>
            </div>
            <div class="mt-1 bg-gray-200 rounded-full h-1 overflow-hidden" style="width: 80px">
              <div 
                class="h-full transition-all duration-300 ease-out rounded-full"
                :style="{ 
                  width: progressPercent + '%',
                  backgroundColor: progressPercent === 100 ? '#22c55e' : '#3b82f6'
                }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="w-full">
        <!-- Female Candidates Table -->
        <ScoreTable
          title="Female Candidates"
          :candidates="femaleCandidates"
          :criteria="filteredCriteria"
          :scores="scores"
          :scoresHidden="scoresHidden"
          @toggle-hidden="scoresHidden = !scoresHidden"
          @score-change="handleScoreChange"
          colorTheme="pink"
        />

        <!-- Male Candidates Table -->
        <ScoreTable
          title="Male Candidates"
          :candidates="maleCandidates"
          :criteria="filteredCriteria"
          :scores="scores"
          :scoresHidden="scoresHidden"
          @score-change="handleScoreChange"
          colorTheme="blue"
          :showHideButton="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Preloader from '../../components/shared/Preloader.vue';
import ScoreTable from '../../components/judge/ScoreTable.vue';
import { showError, showSuccess } from '../../utils/alerts';
import { CalendarX, RefreshCw, Users, UserX, Gavel, ArrowRight, Lock } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

// State
const loading = ref(true);
const showNoActiveEvent = ref(false);
const showJudgeSelection = ref(true);
const showScoringInterface = ref(false);
const isLocked = ref(false);
const judgeId = ref('');
const eventId = ref(null);
const activeEvent = ref(null);
const activeRoundName = ref('Loading...');
const selectedRound = ref('');
const scoresHidden = ref(false);
const scores = ref({});

// Data
const candidates = ref([]);
const judges = ref([]);
const occupiedJudgeIds = ref([]);
const criteria = ref([]);
const rounds = ref([]);

// Computed
// Available judges (not occupied by others)
const availableJudges = computed(() => {
  return judges.value.filter(j => !occupiedJudgeIds.value.includes(j.id));
});

const judgeRows = computed(() => {
  const rows = [];
  for (let i = 0; i < availableJudges.value.length; i += 3) {
    rows.push(availableJudges.value.slice(i, i + 3));
  }
  return rows;
});

const selectedJudgeNumber = computed(() => {
  const judge = judges.value.find(j => j.id === parseInt(judgeId.value));
  return String(judge?.chair_number || judgeId.value).padStart(2, '0');
});

const femaleCandidates = computed(() => 
  candidates.value.filter(c => c.category === 'Female' || c.gender === 'Female')
);

const maleCandidates = computed(() => 
  candidates.value.filter(c => c.category === 'Male' || c.gender === 'Male')
);

const filteredCriteria = computed(() => 
  selectedRound.value && rounds.value.length > 0
    ? criteria.value.filter(c => c.round_id === parseInt(selectedRound.value))
    : criteria.value
);

// Progress counter computed properties
const totalInputsCount = computed(() => candidates.value.length * filteredCriteria.value.length);

const filledInputsCount = computed(() => {
  return Object.keys(scores.value).filter(key => {
    const value = scores.value[key];
    return value !== '' && value !== null && value !== undefined;
  }).length;
});

const progressPercent = computed(() => {
  return totalInputsCount.value > 0 ? (filledInputsCount.value / totalInputsCount.value) * 100 : 0;
});

// Methods
const handleJudgeSelect = (id) => {
  judgeId.value = id.toString();
  loadJudgeScores(id.toString());
};

const handleProceed = async () => {
  if (judgeId.value) {
    try {
      // Mark judge as occupied
      await fetch('/api/occupy-judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judge_id: parseInt(judgeId.value),
          event_id: eventId.value
        })
      });
    } catch (error) {
      showError('Failed to occupy judge position');
    }
    // Navigate with URL parameters instead of localStorage
    router.push(`/judge?event_id=${eventId.value}&judge_id=${judgeId.value}`);
  }
};

const handleScoreChange = async ({ candidateId, criteriaId, value, maxPoints }) => {
  const key = `${candidateId}-${criteriaId}`;
  
  if (value === '') {
    scores.value[key] = '';
    queueScore(candidateId, criteriaId, 0);
    return;
  }

  if (!/^\d*\.?\d*$/.test(value)) return;

  const numValue = parseFloat(value);
  if (!isNaN(numValue)) {
    const cappedValue = numValue > maxPoints ? maxPoints : numValue;
    scores.value[key] = cappedValue.toString();
    queueScore(candidateId, criteriaId, cappedValue);
  }
};

// Pending scores for batch submission
const pendingScores = ref({});
let debounceTimer = null;

const queueScore = (candidateId, criteriaId, points) => {
  const key = `${candidateId}-${criteriaId}`;
  pendingScores.value[key] = { candidateId, criteriaId, points };

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(flushPendingScores, 300);

  if (Object.keys(pendingScores.value).length >= 5) {
    clearTimeout(debounceTimer);
    flushPendingScores();
  }
};

const flushPendingScores = async () => {
  const pending = { ...pendingScores.value };
  const scoresArray = Object.values(pending).map(data => ({
    candidate_id: data.candidateId,
    round_id: parseInt(selectedRound.value),
    criteria_id: data.criteriaId,
    points: data.points
  }));

  if (scoresArray.length === 0) return;
  pendingScores.value = {};

  try {
    await fetch('/api/points/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scores: scoresArray,
        judge_id: parseInt(judgeId.value),
        event_id: eventId.value
      })
    });
  } catch (error) {
    showError('Failed to save scores');
  }
};

const loadData = async (eid) => {
  console.log('📡 Loading data for event:', eid);
  try {
    // Fetch all data in parallel
    const [candidatesRes, roundsRes, criteriaRes, judgesRes, occupiedRes] = await Promise.all([
      fetch(`/api/candidates?event_id=${eid}`).then(r => r.json()),
      fetch(`/api/rounds?event_id=${eid}`).then(r => r.json()),
      fetch(`/api/criteria?event_id=${eid}`).then(r => r.json()),
      fetch(`/api/judges?event_id=${eid}`).then(r => r.json()),
      fetch(`/api/occupied-judges?event_id=${eid}`).then(r => r.json()).catch(() => ({ occupied_judge_ids: [] }))
    ]);

    console.log('📥 Raw judges response:', judgesRes);
    console.log('📥 Occupied judges:', occupiedRes);

    candidates.value = Array.isArray(candidatesRes) ? candidatesRes : candidatesRes.data || [];
    rounds.value = Array.isArray(roundsRes) ? roundsRes : roundsRes.data || [];
    criteria.value = Array.isArray(criteriaRes) ? criteriaRes : criteriaRes.data || [];
    
    // Handle judges - check if it's an error response
    if (Array.isArray(judgesRes)) {
      judges.value = judgesRes;
    } else if (judgesRes?.data && Array.isArray(judgesRes.data)) {
      judges.value = judgesRes.data;
    } else if (judgesRes?.error) {
      console.error('❌ Judges API error:', judgesRes.error);
      judges.value = [];
    } else {
      judges.value = [];
    }
    
    occupiedJudgeIds.value = occupiedRes?.occupied_judge_ids || [];
    
    console.log('✅ Loaded judges:', judges.value.length, 'Available:', availableJudges.value.length);
    loading.value = false;
  } catch (error) {
    console.error('❌ Failed to load event data:', error);
    showError('Failed to load event data');
    loading.value = false;
  }
};

const loadJudgeScores = async (jid) => {
  try {
    const response = await fetch(`/api/points?event_id=${eventId.value}&judge_id=${jid}`);
    const points = await response.json();
    
    const loadedScores = {};
    points.forEach(point => {
      const key = `${point.candidate_id}-${point.criteria_id}`;
      if (point.points !== null) {
        loadedScores[key] = point.points.toString();
      }
    });
    scores.value = loadedScores;
  } catch (error) {
    showError('Failed to load scores');
  }
};

const loadVotingState = async (eid) => {
  try {
    const response = await fetch(`/api/voting/state?event_id=${eid}`);
    const data = await response.json();

    if (data) {
      isLocked.value = data.is_locked ?? false;
      
      if (data.active_round?.id) {
        selectedRound.value = data.active_round.id.toString();
        activeRoundName.value = data.active_round.name || 'Loading...';
        showScoringInterface.value = true;
      } else if (data.active_round_id) {
        selectedRound.value = data.active_round_id.toString();
        showScoringInterface.value = true;
      }
    }
  } catch (error) {
    showError('Failed to load voting state');
  }
};

// Fetch the active event from server
const fetchActiveEvent = async () => {
  try {
    console.log('🔍 Fetching active event...');
    const response = await fetch('/api/events/active');
    console.log('📥 Active event response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📥 Active event data:', data);
      if (data && data.id) {
        activeEvent.value = data;
        return data.id;
      }
    } else {
      console.log('⚠️ No active event found (status:', response.status, ')');
    }
    return null;
  } catch (error) {
    console.error('❌ Failed to fetch active event:', error);
    return null;
  }
};

// Check for active event and load data
const checkActiveEvent = async () => {
  loading.value = true;
  showNoActiveEvent.value = false;
  showJudgeSelection.value = false;
  
  console.log('🔍 Checking for active event...');
  const activeEventId = await fetchActiveEvent();
  console.log('📋 Active event ID:', activeEventId);
  
  if (activeEventId) {
    eventId.value = activeEventId;
    await loadData(activeEventId);
    await loadVotingState(activeEventId);
    showJudgeSelection.value = true;
    showNoActiveEvent.value = false;
    votingChannel = setupVotingWebSocket();
  } else {
    showNoActiveEvent.value = true;
    showJudgeSelection.value = false;
    loading.value = false;
  }
};

// WebSocket handler for voting state changes
const handleVotingStateChange = (data) => {
  console.log('📥 Voting state update:', data);
  
  // Handle lock/unlock events
  if (data.action === 'locked') {
    isLocked.value = true;
  } else if (data.action === 'unlocked') {
    isLocked.value = false;
  }
  // Handle round activation/change
  else if ((data.action === 'round_activated' || data.action === 'round_changed') && data.voting_state?.active_round) {
    selectedRound.value = data.voting_state.active_round.id.toString();
    activeRoundName.value = data.voting_state.active_round.name || 'Loading...';
    showScoringInterface.value = true;
  }
  // Handle voting stop
  else if (data.action === 'stopped') {
    selectedRound.value = '';
    showScoringInterface.value = false;
  }
};

// Setup WebSocket for voting state
const setupVotingWebSocket = () => {
  if (!eventId.value || !window.Echo) return null;
  
  const channelName = `voting.${eventId.value}`;
  console.log('📡 JudgePage: Connecting to voting channel:', channelName);
  
  const channel = window.Echo.channel(channelName);
  
  channel.subscribed(() => {
    console.log('✅ JudgePage: Subscribed to voting channel:', channelName);
  });
  
  channel.listen('.VotingStateChanged', handleVotingStateChange);
  
  return channelName;
};

// Handle active event change from admin
const handleActiveEventChange = (data) => {
  console.log('📥 Active event changed:', data);
  
  // If the new active event is different from current, reload the page
  if (data.event_id && data.event_id !== parseInt(eventId.value)) {
    console.log(`🔄 Switching from event ${eventId.value} to event ${data.event_id}`);
    // Reload the page to get the new event
    window.location.reload();
  }
};

// Setup global WebSocket for event changes
const setupGlobalWebSocket = () => {
  if (!window.Echo) return null;
  
  console.log('📡 JudgePage: Connecting to global channel');
  
  const channel = window.Echo.channel('global');
  
  channel.subscribed(() => {
    console.log('✅ JudgePage: Subscribed to global channel');
  });
  
  channel.listen('.ActiveEventChanged', handleActiveEventChange);
  
  return 'global';
};

let votingChannel = null;
let globalChannel = null;

// Initialize
onMounted(async () => {
  // Setup global WebSocket to listen for event changes (always)
  globalChannel = setupGlobalWebSocket();
  
  // Get event_id and judge_id from URL parameters
  const urlEventId = route.query.event_id;
  const urlJudgeId = route.query.judge_id;

  // If event_id is in URL, use it directly
  if (urlEventId) {
    eventId.value = urlEventId;
    await loadData(eventId.value);
    await loadVotingState(eventId.value);

    // If judge_id is in URL, skip selection screen
    if (urlJudgeId) {
      judgeId.value = urlJudgeId;
      showJudgeSelection.value = false;
      await loadJudgeScores(urlJudgeId);
    }
    
    // Setup WebSocket for voting state updates
    votingChannel = setupVotingWebSocket();
  } else {
    // No event_id in URL - fetch active event from server
    await checkActiveEvent();
  }
});

// Cleanup
onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    flushPendingScores();
  }
  
  // Leave voting channel
  if (votingChannel && window.Echo) {
    window.Echo.leave(votingChannel);
    console.log('🔌 Left voting channel:', votingChannel);
  }
  
  // Leave global channel
  if (globalChannel && window.Echo) {
    window.Echo.leave(globalChannel);
    console.log('🔌 Left global channel');
  }
});
</script>
