<template>
  <!-- Preloader -->
  <Preloader v-if="loading" />

  <!-- Not Allowed Screen (too many connections) -->
  <div v-else-if="notAllowed" class="min-h-screen bg-gray-50 flex flex-col">
    <div class="flex-1 flex items-center justify-center">
      <div class="text-center px-6 max-w-md">
        <div class="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Ban class="w-12 h-12 text-amber-500" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-3">All Judge Positions Filled</h1>
        <p class="text-gray-600 mb-2">{{ notAllowedMessage || 'All available judge positions are currently occupied.' }}</p>
        <p class="text-sm text-gray-400 mb-8">If you believe this is an error, please contact the event administrator.</p>
        
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            @click="retryRegistration"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors w-full sm:w-auto justify-center"
          >
            <RefreshCw class="w-4 h-4" />
            Try Again
          </button>
          <button
            @click="showContactInfo = true"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 transition-colors w-full sm:w-auto justify-center"
          >
            <HelpCircle class="w-4 h-4" />
            Contact Admin
          </button>
        </div>
        
        <!-- Contact Admin Info Modal -->
        <div v-if="showContactInfo" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showContactInfo = false">
          <div class="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900">Contact Administrator</h2>
              <button @click="showContactInfo = false" class="text-gray-400 hover:text-gray-600">
                <X class="w-5 h-5" />
              </button>
            </div>
            <p class="text-gray-600 text-sm mb-4">
              Please reach out to the event administrator to resolve this issue. They can:
            </p>
            <ul class="text-sm text-gray-500 space-y-2 mb-6">
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-0.5">•</span>
                <span>Free up a judge position for you</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-0.5">•</span>
                <span>Reset all screen registrations</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-0.5">•</span>
                <span>Switch to manual judge selection mode</span>
              </li>
            </ul>
            <button
              @click="showContactInfo = false"
              class="w-full px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
    <PodiumLedgerFooter />
  </div>

  <!-- Assigned Number Display Screen (auto-assign mode) -->
  <div v-else-if="showAssignedNumber" class="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex flex-col items-center justify-center">
    <div class="text-center text-white">
      <div class="mb-4">
        <Gavel class="w-16 h-16 mx-auto text-white/80" />
      </div>
      <p class="text-lg text-white/80 uppercase tracking-widest mb-2">You are assigned as</p>
      <div class="text-9xl font-bold mb-4 animate-pulse">
        {{ String(assignedChairNumber).padStart(2, '0') }}
      </div>
      <p class="text-xl text-white/90 mb-8">Judge #{{ assignedChairNumber }}</p>
      <div class="flex items-center justify-center gap-2 text-white/60">
        <Loader2 class="w-5 h-5 animate-spin" />
        <span>Proceeding to scoring...</span>
      </div>
    </div>
  </div>

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
      <template v-if="judges.length === 0">
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
            :class="[
              'relative p-6 rounded-xl border-2 transition-all text-center',
              judgeId === judge.id.toString()
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            ]"
          >
            <Gavel :class="['w-8 h-8 mx-auto mb-3', judgeId === judge.id.toString() ? 'text-indigo-600' : 'text-gray-400']" />
            <div class="text-2xl font-bold text-gray-900 mb-1">
              {{ String(judge.chair_number).padStart(2, '0') }}
            </div>
            <div class="text-xs text-gray-500 uppercase tracking-wide">
              {{ judge.name }}
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
          v-if="femaleCandidates.length > 0"
          title="Female Candidates"
          :candidates="femaleCandidates"
          :criteria="filteredCriteria"
          :scores="scores"
          :scoresHidden="scoresHidden"
          :displaySettings="displaySettings"
          @toggle-hidden="scoresHidden = !scoresHidden"
          @score-change="handleScoreChange"
          colorTheme="pink"
        />

        <!-- Male Candidates Table -->
        <ScoreTable
          v-if="maleCandidates.length > 0"
          title="Male Candidates"
          :candidates="maleCandidates"
          :criteria="filteredCriteria"
          :scores="scores"
          :scoresHidden="scoresHidden"
          :displaySettings="displaySettings"
          @score-change="handleScoreChange"
          colorTheme="blue"
          :showHideButton="femaleCandidates.length === 0"
        />

        <!-- Solo Candidates Table -->
        <ScoreTable
          v-if="soloCandidates.length > 0"
          title="Solo Contestants"
          :candidates="soloCandidates"
          :criteria="filteredCriteria"
          :scores="scores"
          :scoresHidden="scoresHidden"
          :displaySettings="displaySettings"
          @toggle-hidden="scoresHidden = !scoresHidden"
          @score-change="handleScoreChange"
          colorTheme="indigo"
        />

        <!-- Group Candidates Table -->
        <ScoreTable
          v-if="groupCandidates.length > 0"
          title="Groups / Teams"
          :candidates="groupCandidates"
          :criteria="filteredCriteria"
          :scores="scores"
          :scoresHidden="scoresHidden"
          :displaySettings="displaySettings"
          @toggle-hidden="scoresHidden = !scoresHidden"
          @score-change="handleScoreChange"
          colorTheme="purple"
          :showHideButton="soloCandidates.length === 0"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Preloader from '../../components/shared/Preloader.vue';
import JudgePreloader from '../../components/judge/JudgePreloader.vue';
import ScoreTable from '../../components/judge/ScoreTable.vue';
import { showError, showSuccess } from '../../utils/alerts';
import PodiumLedgerFooter from '../../components/admin/PodiumLedgerFooter.vue';
import { CalendarX, RefreshCw, Users, Gavel, ArrowRight, Lock, Ban, Loader2, HelpCircle, X } from 'lucide-vue-next';

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
const eventTheme = ref(null);

// Screen registration state
const notAllowed = ref(false);
const notAllowedMessage = ref('');
const showContactInfo = ref(false);
const screenNumber = ref(null);
const deviceId = ref('');
const showAssignedNumber = ref(false);
const assignedChairNumber = ref(null);
const judgeLoginMode = ref('auto'); // 'auto' | 'manual'

// Display settings (controlled by admin)
const displaySettings = ref({
  show_candidate_name: true,
  show_team_department: true,
});

// Generate a proper UUID v4
const generateUUID = () => {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Generate or retrieve device ID (persisted in localStorage)
const getDeviceId = () => {
  const STORAGE_KEY = 'podium_device_id';
  let id = localStorage.getItem(STORAGE_KEY);
  
  // Check if existing ID is in old format (not a proper UUID) and regenerate
  const isValidUUID = id && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  
  if (!id || !isValidUUID) {
    id = generateUUID();
    localStorage.setItem(STORAGE_KEY, id);
    console.log('🆔 Generated new device UUID:', id);
  } else {
    console.log('🆔 Using existing device UUID:', id);
  }
  
  return id;
};

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
  candidates.value.filter(c => (c.category === 'Female' || c.gender === 'Female') && c.gender?.toLowerCase() !== 'solo' && c.gender?.toLowerCase() !== 'group')
);

const maleCandidates = computed(() => 
  candidates.value.filter(c => (c.category === 'Male' || c.gender === 'Male') && c.gender?.toLowerCase() !== 'solo' && c.gender?.toLowerCase() !== 'group')
);

const soloCandidates = computed(() => 
  candidates.value.filter(c => c.category?.toLowerCase() === 'solo' || c.gender?.toLowerCase() === 'solo')
);

const groupCandidates = computed(() => 
  candidates.value.filter(c => c.category?.toLowerCase() === 'group' || c.gender?.toLowerCase() === 'group')
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
    // Skip selection screen and show scoring interface directly
    showJudgeSelection.value = false;
    await loadJudgeScores(judgeId.value);
    // Update URL without reloading
    router.replace(`/judge?event_id=${eventId.value}&judge_id=${judgeId.value}`);
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
    const [candidatesRes, roundsRes, criteriaRes, judgesRes, occupiedRes, eventRes] = await Promise.all([
      fetch(`/api/candidates?event_id=${eid}`).then(r => r.json()),
      fetch(`/api/rounds?event_id=${eid}`).then(r => r.json()),
      fetch(`/api/criteria?event_id=${eid}`).then(r => r.json()),
      fetch(`/api/judges?event_id=${eid}`).then(r => r.json()),
      fetch(`/api/occupied-judges?event_id=${eid}`).then(r => r.json()).catch(() => ({ occupied_judge_ids: [] })),
      fetch(`/api/events/${eid}`).then(r => r.json()).catch(() => null)
    ]);
    
    // Load theme if event has one
    if (eventRes?.theme_id) {
      try {
        const themeRes = await fetch(`/api/event-themes/${eventRes.theme_id}`);
        if (themeRes.ok) {
          eventTheme.value = await themeRes.json();
          applyTheme(eventTheme.value);
        }
      } catch (e) { console.log('No theme applied'); }
    }

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

// Apply theme CSS variables
const applyTheme = (theme) => {
  if (!theme) return;
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', theme.primary_color);
  root.style.setProperty('--theme-secondary', theme.secondary_color);
  root.style.setProperty('--theme-accent', theme.accent_color);
  if (theme.background_value) {
    root.style.setProperty('--theme-background', theme.background_value);
  }
  console.log('🎨 Theme applied:', theme.name);
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
    
    // Load display settings
    await loadDisplaySettings(eid);
  } catch (error) {
    showError('Failed to load voting state');
  }
};

// Load display settings from server
const loadDisplaySettings = async (eid) => {
  try {
    const response = await fetch(`/api/voting/display-settings?event_id=${eid}`);
    const data = await response.json();
    if (data?.display_settings) {
      displaySettings.value = data.display_settings;
      // Capture judge login mode (default to 'auto' if not set)
      judgeLoginMode.value = data.display_settings.judge_login_mode || 'auto';
      console.log('📋 Display settings loaded:', displaySettings.value);
      console.log('🔐 Judge login mode:', judgeLoginMode.value);
    }
  } catch (error) {
    console.error('Failed to load display settings:', error);
  }
};

// Register this screen with the server
const registerScreen = async (eid) => {
  try {
    deviceId.value = getDeviceId();
    
    const response = await fetch('/api/voting/register-screen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: eid,
        device_id: deviceId.value
      })
    });
    
    const data = await response.json();
    console.log('📱 Screen registration result:', data);
    
    if (data.allowed) {
      screenNumber.value = data.screen_number;
      // Auto-assign judge based on screen number
      if (data.judge_id) {
        judgeId.value = data.judge_id.toString();
      }
      // Capture assigned chair number for display
      if (data.chair_number) {
        assignedChairNumber.value = data.chair_number;
      }
      return true;
    } else {
      notAllowed.value = true;
      notAllowedMessage.value = data.message || 'You are not allowed to access this system';
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to register screen:', error);
    return false;
  }
};

// Retry registration
const retryRegistration = async () => {
  loading.value = true;
  notAllowed.value = false;
  await checkActiveEvent();
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
  showAssignedNumber.value = false;
  notAllowed.value = false;
  
  console.log('🔍 Checking for active event...');
  const activeEventId = await fetchActiveEvent();
  console.log('📋 Active event ID:', activeEventId);
  
  if (activeEventId) {
    eventId.value = activeEventId;
    
    // Load display settings first to get judge_login_mode
    await loadDisplaySettings(activeEventId);
    
    // Load event data
    await loadData(activeEventId);
    await loadVotingState(activeEventId);
    
    // Check login mode
    if (judgeLoginMode.value === 'auto') {
      // Auto-assign mode: register screen and get assigned judge
      const registered = await registerScreen(activeEventId);
      
      if (!registered) {
        // Not allowed - show denied screen
        loading.value = false;
        return;
      }
      
      // If we have a judge assigned from registration, show assigned number briefly
      if (judgeId.value && assignedChairNumber.value) {
        showAssignedNumber.value = true;
        loading.value = false;
        await loadJudgeScores(judgeId.value);
        
        // Show assigned number for 3 seconds, then proceed to scoring
        setTimeout(() => {
          showAssignedNumber.value = false;
          showJudgeSelection.value = false;
        }, 3000);
      } else {
        // Fallback to manual selection if no judge assigned
        showJudgeSelection.value = true;
        loading.value = false;
      }
    } else {
      // Manual mode: show judge selection screen
      showJudgeSelection.value = true;
      loading.value = false;
    }
    
    showNoActiveEvent.value = false;
    votingChannel = setupVotingWebSocket();
  } else {
    showNoActiveEvent.value = true;
    showJudgeSelection.value = false;
    loading.value = false;
  }
};

// WebSocket handler for voting state changes
const handleVotingStateChange = async (data) => {
  console.log('📥 Voting state update:', data);
  
  // Handle lock/unlock events
  if (data.action === 'locked') {
    isLocked.value = true;
  } else if (data.action === 'unlocked') {
    isLocked.value = false;
  }
  // Handle display settings change
  else if (data.action === 'display_settings_changed' && data.voting_state?.display_settings) {
    console.log('🎨 Display settings changed:', data.voting_state.display_settings);
    displaySettings.value = data.voting_state.display_settings;
    
    // Check if judge_login_mode changed
    if (data.voting_state.display_settings.judge_login_mode) {
      const newMode = data.voting_state.display_settings.judge_login_mode;
      if (newMode !== judgeLoginMode.value) {
        console.log('🔐 Judge login mode changed to:', newMode);
        judgeLoginMode.value = newMode;
        // If switching to manual mode and we're in auto-assign flow, reload
        if (newMode === 'manual' && showAssignedNumber.value) {
          showAssignedNumber.value = false;
          showJudgeSelection.value = true;
        }
      }
    }
  }
  // Handle screen cleared (admin kicked all screens)
  else if (data.action === 'screens_cleared') {
    console.log('🚫 All screens cleared by admin');
    notAllowed.value = true;
    notAllowedMessage.value = 'Your session was ended by the administrator';
  }
  // Handle this specific screen being removed
  else if (data.action === 'screen_removed' && data.voting_state?.removed_screen === screenNumber.value) {
    console.log('🚫 This screen was removed by admin');
    notAllowed.value = true;
    notAllowedMessage.value = 'Your session was ended by the administrator';
  }
  // Handle screen reassignment
  else if (data.action === 'screen_reassigned' && data.voting_state?.reassigned_screen === screenNumber.value) {
    console.log('🔄 Screen reassigned to judge:', data.voting_state.new_judge_id);
    if (data.voting_state.new_judge_id) {
      judgeId.value = data.voting_state.new_judge_id.toString();
      await loadJudgeScores(judgeId.value);
    }
  }
  // Handle round activation/change
  else if ((data.action === 'round_activated' || data.action === 'round_changed') && data.voting_state?.active_round) {
    const newRoundId = data.voting_state.active_round.id.toString();
    console.log('🔄 Round changed to:', newRoundId, data.voting_state.active_round.name);
    
    selectedRound.value = newRoundId;
    activeRoundName.value = data.voting_state.active_round.name || 'Loading...';
    showScoringInterface.value = true;
    
    // Reload scores for the new round
    if (judgeId.value) {
      await loadJudgeScores(judgeId.value);
    }
  }
  // Handle voting stop
  else if (data.action === 'stopped') {
    selectedRound.value = '';
    showScoringInterface.value = false;
  }
};

// WebSocket handler for screen registration changes
const handleScreenRegistrationChange = (data) => {
  console.log('📥 Screen registration update:', data);
  
  // Handle all screens cleared
  if (data.action === 'cleared') {
    console.log('🚫 All screens cleared by admin');
    notAllowed.value = true;
    notAllowedMessage.value = 'Your session was ended by the administrator';
    showAssignedNumber.value = false;
    showJudgeSelection.value = false;
  }
  // Handle this specific screen being unregistered
  else if (data.action === 'unregistered' && data.affected_screen) {
    const affected = data.affected_screen;
    if (affected.device_id === deviceId.value || affected.screen_number === screenNumber.value) {
      console.log('🚫 This screen was removed by admin');
      notAllowed.value = true;
      notAllowedMessage.value = 'Your session was ended by the administrator';
      showAssignedNumber.value = false;
      showJudgeSelection.value = false;
    }
  }
  // Handle screen reassignment
  else if (data.action === 'reassigned' && data.affected_screen) {
    const affected = data.affected_screen;
    if (affected.screen_number === screenNumber.value && affected.new_judge_id) {
      console.log('🔄 Screen reassigned to judge:', affected.new_judge_id);
      judgeId.value = affected.new_judge_id.toString();
      // Find the new chair number from judges list
      const newJudge = judges.value.find(j => j.id === affected.new_judge_id);
      if (newJudge) {
        assignedChairNumber.value = newJudge.chair_number;
      }
      loadJudgeScores(judgeId.value);
    }
  }
  // Handle judge swap between screens
  else if (data.action === 'swapped' && data.affected_screen) {
    const affected = data.affected_screen;
    // Check if this screen is one of the swapped screens
    const screen1 = affected.screen_1;
    const screen2 = affected.screen_2;
    
    // Check if this device is screen_1
    if (screen1 && (screen1.device_id === deviceId.value || screen1.screen_number === screenNumber.value)) {
      console.log('🔄 This screen was swapped - new judge:', screen1.new_judge_id, 'chair:', screen1.new_chair_number);
      judgeId.value = screen1.new_judge_id.toString();
      assignedChairNumber.value = screen1.new_chair_number;
      // Reload scores for the new judge assignment
      loadJudgeScores(judgeId.value);
      // Show brief notification of the swap
      showAssignedNumber.value = true;
      setTimeout(() => {
        showAssignedNumber.value = false;
      }, 3000);
    }
    // Check if this device is screen_2
    else if (screen2 && (screen2.device_id === deviceId.value || screen2.screen_number === screenNumber.value)) {
      console.log('🔄 This screen was swapped - new judge:', screen2.new_judge_id, 'chair:', screen2.new_chair_number);
      judgeId.value = screen2.new_judge_id.toString();
      assignedChairNumber.value = screen2.new_chair_number;
      // Reload scores for the new judge assignment
      loadJudgeScores(judgeId.value);
      // Show brief notification of the swap
      showAssignedNumber.value = true;
      setTimeout(() => {
        showAssignedNumber.value = false;
      }, 3000);
    }
  }
};

// Setup WebSocket for voting state
const setupVotingWebSocket = () => {
  if (!eventId.value) {
    console.warn('⚠️ No eventId, skipping WebSocket setup');
    return null;
  }
  
  if (!window.Echo) {
    console.warn('⚠️ Echo not available, skipping WebSocket setup');
    return null;
  }
  
  const channelName = `voting.${eventId.value}`;
  console.log('📡 JudgePage: Connecting to voting channel:', channelName);
  
  const channel = window.Echo.channel(channelName);
  
  channel.subscribed(() => {
    console.log('✅ JudgePage: Subscribed to voting channel:', channelName);
  });
  
  channel.error((error) => {
    console.error('❌ WebSocket error:', error);
  });
  
  channel.listen('VotingStateChanged', (data) => {
    console.log('📥 Received VotingStateChanged event:', data);
    handleVotingStateChange(data);
  });
  
  // Listen for screen registration changes
  channel.listen('ScreenRegistrationChanged', (data) => {
    console.log('📥 Received ScreenRegistrationChanged event:', data);
    handleScreenRegistrationChange(data);
  });
  
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
  
  channel.listen('ActiveEventChanged', handleActiveEventChange);
  
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
    
    // Load display settings first to get judge_login_mode
    await loadDisplaySettings(urlEventId);
    
    await loadData(eventId.value);
    await loadVotingState(eventId.value);

    // If judge_id is in URL, use it directly (skip auto-assign)
    if (urlJudgeId) {
      judgeId.value = urlJudgeId;
      showJudgeSelection.value = false;
      await loadJudgeScores(urlJudgeId);
    } else if (judgeLoginMode.value === 'auto') {
      // Auto-assign mode: register screen and get assigned judge
      const registered = await registerScreen(urlEventId);
      
      if (!registered) {
        loading.value = false;
        return;
      }
      
      // If we have a judge assigned from registration, show assigned number briefly
      if (judgeId.value && assignedChairNumber.value) {
        showAssignedNumber.value = true;
        loading.value = false;
        await loadJudgeScores(judgeId.value);
        
        // Show assigned number for 3 seconds, then proceed to scoring
        setTimeout(() => {
          showAssignedNumber.value = false;
          showJudgeSelection.value = false;
        }, 3000);
      } else {
        // Fallback to manual selection if no judge assigned
        showJudgeSelection.value = true;
        loading.value = false;
      }
    } else {
      // Manual mode: show judge selection screen
      showJudgeSelection.value = true;
      loading.value = false;
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
