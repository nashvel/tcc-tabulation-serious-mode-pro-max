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
  <div v-else-if="showAssignedNumber" class="min-h-screen bg-white flex flex-col items-center justify-center">
    <div class="text-center">
      <div class="assigned-number text-[12rem] text-gray-800 leading-none">
        {{ String(assignedChairNumber).padStart(2, '0') }}
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

  <!-- Judge Selection Screen (only for manual mode) -->
  <div v-else-if="showJudgeSelection && judgeLoginMode === 'manual'" class="min-h-screen bg-gray-50">
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

  <!-- Auto-assign mode: Show preloader while waiting -->
  <JudgePreloader v-else-if="showJudgeSelection && judgeLoginMode === 'auto'" />

  <!-- Scoring Interface -->
  <div v-else class="min-h-screen bg-gray-50 relative font-sans antialiased">
    <!-- Lock Screen Overlay -->
    <div v-if="isLocked" class="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center">
      <!-- Custom Lock Screen Image -->
      <template v-if="activeEvent?.lock_screen_image && !lockScreenImageError">
        <img 
          :src="activeEvent.lock_screen_image" 
          alt="Lock Screen"
          class="max-w-full max-h-full object-contain"
          @error="lockScreenImageError = true"
        />
      </template>
      <!-- Default Lock Screen -->
      <template v-else>
        <Lock class="w-20 h-20 text-gray-400 mb-6" />
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Screen Locked</h1>
        <p class="text-gray-500">Waiting for admin to unlock...</p>
      </template>
    </div>

    <!-- Waiting for Admin Screen -->
    <JudgePreloader v-if="!isLocked && !showScoringInterface" />

    <!-- Scoring Interface -->
    <div v-if="!isLocked && showScoringInterface" class="bg-white">
      <!-- Multiple Header Logos -->
      <div v-if="headerLogos.length > 0" class="w-full bg-gray-50 border-b border-gray-200 py-3">
        <div class="flex items-center justify-center gap-4 px-4">
          <img 
            v-for="(logo, idx) in headerLogos" 
            :key="idx"
            :src="logo.path" 
            alt="Event Logo"
            class="h-20 max-h-20 w-auto object-contain"
            @error="handleLogoError(idx)"
          />
        </div>
      </div>
      <!-- Fallback: Single Header Image (legacy support) -->
      <div v-else-if="activeEvent?.header_image && !headerImageError" class="w-full bg-gray-50 border-b border-gray-200">
        <img 
          :src="activeEvent.header_image" 
          alt="Event Header"
          class="w-full h-auto max-h-32 object-contain mx-auto"
          @error="headerImageError = true"
        />
      </div>

      <!-- Round Header with Progress Counter -->
      <div class="flex items-center justify-between py-3 px-4 bg-white border-b border-gray-200">
        <!-- Empty left side for balance -->
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
                  backgroundColor: progressPercent === 100 ? '#374151' : '#6b7280'
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
import Swal from 'sweetalert2';
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

// Image error states
const headerImageError = ref(false);
const lockScreenImageError = ref(false);
const logoErrors = ref(new Set());

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
    console.log('[Device] Generated new device UUID:', id);
  } else {
    console.log('[Device] Using existing device UUID:', id);
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

// Header logos - sorted by order, filtered for errors
const headerLogos = computed(() => {
  if (!activeEvent.value?.header_logos || !Array.isArray(activeEvent.value.header_logos)) {
    return [];
  }
  return activeEvent.value.header_logos
    .filter((logo, idx) => !logoErrors.value.has(idx))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});

// Handle logo load error
const handleLogoError = (idx) => {
  logoErrors.value.add(idx);
};

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
const handleJudgeSelect = async (id) => {
  const newId = id.toString();
  
  // If already selected the same judge, do nothing
  if (judgeId.value === newId) return;
  
  // If switching from another judge, show confirmation
  if (judgeId.value && judgeId.value !== newId) {
    const currentJudge = judges.value.find(j => j.id === parseInt(judgeId.value));
    const newJudge = judges.value.find(j => j.id === parseInt(newId));
    
    const result = await Swal.fire({
      title: 'Switch Judge?',
      html: `
        <div class="text-left">
          <p class="mb-3">You are about to switch from:</p>
          <div class="flex items-center justify-center gap-4 mb-3">
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-700">#${String(currentJudge?.chair_number || judgeId.value).padStart(2, '0')}</div>
              <div class="text-xs text-gray-500">Current</div>
            </div>
            <div class="text-2xl text-gray-400">→</div>
            <div class="text-center">
              <div class="text-3xl font-bold text-indigo-600">#${String(newJudge?.chair_number || newId).padStart(2, '0')}</div>
              <div class="text-xs text-gray-500">New</div>
            </div>
          </div>
          <p class="text-sm text-amber-600 bg-amber-50 p-2 rounded">
            ⚠️ Your scores are saved per judge. Switching will load the new judge's scores.
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Switch',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    });
    
    if (!result.isConfirmed) return;
  }
  
  judgeId.value = newId;
  loadJudgeScores(newId);
};

const handleProceed = async () => {
  if (judgeId.value) {
    // Load scores first
    await loadJudgeScores(judgeId.value);
    
    // Set assignedChairNumber for show judge numbers feature
    const currentJudge = judges.value.find(j => j.id === parseInt(judgeId.value));
    if (currentJudge) {
      assignedChairNumber.value = currentJudge.chair_number;
    }
    
    // Skip selection screen - if there's an active round, show scoring interface
    showJudgeSelection.value = false;
    if (selectedRound.value) {
      showScoringInterface.value = true;
    }
    
    // Update URL without reloading (use replace to avoid back button issues)
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

  // ScoreTable already validates and caps the value, so just use it directly
  const numValue = parseFloat(value);
  if (!isNaN(numValue)) {
    scores.value[key] = value.toString();
    queueScore(candidateId, criteriaId, numValue);
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
  console.log('[JudgePage] Loading data for event:', eid);
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
    
    // Update activeEvent with full event data (includes header_logos)
    if (eventRes) {
      activeEvent.value = eventRes;
      // Reset image error states
      headerImageError.value = false;
      lockScreenImageError.value = false;
      logoErrors.value = new Set();
    }
    
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

    console.log('[JudgePage] Raw judges response:', judgesRes);
    console.log('[JudgePage] Occupied judges:', occupiedRes);

    candidates.value = Array.isArray(candidatesRes) ? candidatesRes : candidatesRes.data || [];
    rounds.value = Array.isArray(roundsRes) ? roundsRes : roundsRes.data || [];
    criteria.value = Array.isArray(criteriaRes) ? criteriaRes : criteriaRes.data || [];
    
    // Handle judges - check if it's an error response
    if (Array.isArray(judgesRes)) {
      judges.value = judgesRes;
    } else if (judgesRes?.data && Array.isArray(judgesRes.data)) {
      judges.value = judgesRes.data;
    } else if (judgesRes?.error) {
      console.error('[JudgePage] Judges API error:', judgesRes.error);
      judges.value = [];
    } else {
      judges.value = [];
    }
    
    occupiedJudgeIds.value = occupiedRes?.occupied_judge_ids || [];
    
    console.log('[JudgePage] Loaded judges:', judges.value.length, 'Available:', availableJudges.value.length);
    loading.value = false;
  } catch (error) {
    console.error('[JudgePage] Failed to load event data:', error);
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
  console.log('[Theme] Applied:', theme.name);
};

// Track server-side show_judge_numbers state
const serverShowJudgeNumbers = ref(false);

const loadVotingState = async (eid) => {
  try {
    const response = await fetch(`/api/voting/state?event_id=${eid}`);
    const data = await response.json();

    if (data) {
      isLocked.value = data.is_locked ?? false;
      
      // Store the show_judge_numbers state from server
      serverShowJudgeNumbers.value = data.show_judge_numbers ?? false;
      console.log('[JudgePage] Server show_judge_numbers state:', serverShowJudgeNumbers.value);
      
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

// Apply show_judge_numbers state after judge is assigned
const applyShowJudgeNumbersState = () => {
  if (serverShowJudgeNumbers.value && judgeId.value && assignedChairNumber.value) {
    showAssignedNumber.value = true;
    console.log('[JudgePage] Applying show_judge_numbers state, displaying number:', assignedChairNumber.value);
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
      console.log('[JudgePage] Display settings loaded:', displaySettings.value);
      console.log('[JudgePage] Judge login mode:', judgeLoginMode.value);
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
    console.log('[Screen] Registration result:', data);
    
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
    console.error('[Screen] Failed to register:', error);
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
    console.log('[JudgePage] Fetching active event...');
    const response = await fetch('/api/events/active');
    console.log('[JudgePage] Active event response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('[JudgePage] Active event data:', data);
      if (data && data.id) {
        activeEvent.value = data;
        // Reset image error states when event changes
        headerImageError.value = false;
        lockScreenImageError.value = false;
        return data.id;
      }
    } else {
      console.log('[JudgePage] No active event found (status:', response.status, ')');
    }
    return null;
  } catch (error) {
    console.error('[JudgePage] Failed to fetch active event:', error);
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
  
  console.log('[JudgePage] Checking for active event...');
  const activeEventId = await fetchActiveEvent();
  console.log('[JudgePage] Active event ID:', activeEventId);
  
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
        
        // Show assigned number for 3 seconds, then hide UNLESS server says to keep showing
        setTimeout(() => {
          // Only hide if server doesn't have show_judge_numbers enabled
          if (!serverShowJudgeNumbers.value) {
            showAssignedNumber.value = false;
          }
          showJudgeSelection.value = false;
          // Update URL with event_id and judge_id parameters
          router.replace(`/judge?event_id=${activeEventId}&judge_id=${judgeId.value}`);
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
  console.log('[WebSocket] Voting state update:', data);
  
  // Handle lock/unlock events
  if (data.action === 'locked') {
    isLocked.value = true;
  } else if (data.action === 'unlocked') {
    isLocked.value = false;
  }
  // Handle display settings change
  else if (data.action === 'display_settings_changed' && data.voting_state?.display_settings) {
    console.log('[Settings] Display settings changed:', data.voting_state.display_settings);
    displaySettings.value = data.voting_state.display_settings;
    
    // Check if judge_login_mode changed
    if (data.voting_state.display_settings.judge_login_mode) {
      const newMode = data.voting_state.display_settings.judge_login_mode;
      if (newMode !== judgeLoginMode.value) {
        console.log('[Settings] Judge login mode changed to:', newMode, '- reloading page');
        // Reload the page to properly handle the mode change
        window.location.href = `/judge?event_id=${eventId.value}`;
        return;
      }
    }
  }
  // Handle screen cleared (admin kicked all screens)
  else if (data.action === 'screens_cleared') {
    console.log('[Screen] All screens cleared by admin');
    notAllowed.value = true;
    notAllowedMessage.value = 'Your session was ended by the administrator';
  }
  // Handle this specific screen being removed
  else if (data.action === 'screen_removed' && data.voting_state?.removed_screen === screenNumber.value) {
    console.log('[Screen] This screen was removed by admin');
    notAllowed.value = true;
    notAllowedMessage.value = 'Your session was ended by the administrator';
  }
  // Handle screen reassignment
  else if (data.action === 'screen_reassigned' && data.voting_state?.reassigned_screen === screenNumber.value) {
    console.log('[Screen] Reassigned to judge:', data.voting_state.new_judge_id);
    if (data.voting_state.new_judge_id) {
      judgeId.value = data.voting_state.new_judge_id.toString();
      await loadJudgeScores(judgeId.value);
    }
  }
  // Handle round activation/change
  else if ((data.action === 'round_activated' || data.action === 'round_changed') && data.voting_state?.active_round) {
    const newRoundId = data.voting_state.active_round.id.toString();
    console.log('[Round] Changed to:', newRoundId, data.voting_state.active_round.name);
    
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
  // Handle show judge numbers broadcast from admin (toggle on)
  else if (data.action === 'show_judge_numbers') {
    const targetJudgeIds = data.voting_state?.judge_ids || [];
    const target = data.voting_state?.target || 'all';
    
    // Check if this judge should show their number
    const currentJudgeId = parseInt(judgeId.value);
    const shouldShow = target === 'all' || targetJudgeIds.includes(currentJudgeId);
    
    console.log('[JudgeNumbers] Show event:', { target, targetJudgeIds, currentJudgeId, shouldShow });
    
    if (shouldShow && currentJudgeId) {
      // Ensure assignedChairNumber is set from judges list if not already
      if (!assignedChairNumber.value) {
        const currentJudge = judges.value.find(j => j.id === currentJudgeId);
        if (currentJudge) {
          assignedChairNumber.value = currentJudge.chair_number;
        } else {
          // Fallback to selectedJudgeNumber computed value
          assignedChairNumber.value = parseInt(selectedJudgeNumber.value);
        }
      }
      
      console.log('[JudgeNumbers] Showing judge number:', assignedChairNumber.value);
      // Show the assigned number screen (stays until hide_judge_numbers)
      showAssignedNumber.value = true;
    }
  }
  // Handle hide judge numbers broadcast from admin (toggle off)
  else if (data.action === 'hide_judge_numbers') {
    console.log('[JudgeNumbers] Hide event received');
    showAssignedNumber.value = false;
  }
  // Handle refresh screens broadcast from admin
  else if (data.action === 'refresh_screens') {
    const targetJudgeIds = data.voting_state?.judge_ids || [];
    const target = data.voting_state?.target || 'all';
    const currentJudgeId = parseInt(judgeId.value);
    
    // Check if this judge should refresh
    const shouldRefresh = target === 'all' || targetJudgeIds.includes(currentJudgeId);
    
    console.log('[Refresh] Refresh event:', { target, targetJudgeIds, currentJudgeId, shouldRefresh });
    
    if (shouldRefresh) {
      console.log('[Refresh] Refreshing page...');
      window.location.reload();
    }
  }
};

// WebSocket handler for screen registration changes
const handleScreenRegistrationChange = (data) => {
  console.log('[WebSocket] Screen registration update:', data);
  
  // Handle all screens cleared
  if (data.action === 'cleared') {
    console.log('[Screen] All screens cleared by admin');
    notAllowed.value = true;
    notAllowedMessage.value = 'Your session was ended by the administrator';
    showAssignedNumber.value = false;
    showJudgeSelection.value = false;
  }
  // Handle this specific screen being unregistered
  else if (data.action === 'unregistered' && data.affected_screen) {
    const affected = data.affected_screen;
    if (affected.device_id === deviceId.value || affected.screen_number === screenNumber.value) {
      console.log('[Screen] This screen was removed by admin');
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
      console.log('[Screen] Reassigned to judge:', affected.new_judge_id);
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
      const newJudgeId = screen1.new_judge_id || screen1.judge_id;
      const newChairNumber = screen1.new_chair_number || screen1.chair_number;
      console.log('[Screen] This screen was swapped - new judge:', newJudgeId, 'chair:', newChairNumber);
      judgeId.value = newJudgeId.toString();
      assignedChairNumber.value = newChairNumber;
      // Reload scores for the new judge assignment
      loadJudgeScores(judgeId.value);
      // Update URL to reflect new judge
      router.replace(`/judge?event_id=${eventId.value}&judge_id=${judgeId.value}`);
      // Show brief notification of the swap (unless show_judge_numbers is on)
      if (!serverShowJudgeNumbers.value) {
        showAssignedNumber.value = true;
        setTimeout(() => {
          showAssignedNumber.value = false;
        }, 3000);
      }
    }
    // Check if this device is screen_2
    else if (screen2 && (screen2.device_id === deviceId.value || screen2.screen_number === screenNumber.value)) {
      const newJudgeId = screen2.new_judge_id || screen2.judge_id;
      const newChairNumber = screen2.new_chair_number || screen2.chair_number;
      console.log('[Screen] This screen was swapped - new judge:', newJudgeId, 'chair:', newChairNumber);
      judgeId.value = newJudgeId.toString();
      assignedChairNumber.value = newChairNumber;
      // Reload scores for the new judge assignment
      loadJudgeScores(judgeId.value);
      // Update URL to reflect new judge
      router.replace(`/judge?event_id=${eventId.value}&judge_id=${judgeId.value}`);
      // Show brief notification of the swap (unless show_judge_numbers is on)
      if (!serverShowJudgeNumbers.value) {
        showAssignedNumber.value = true;
        setTimeout(() => {
          showAssignedNumber.value = false;
        }, 3000);
      }
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
  console.log('[WebSocket] Connecting to voting channel:', channelName);
  
  const channel = window.Echo.channel(channelName);
  
  channel.subscribed(() => {
    console.log('[WebSocket] Subscribed to voting channel:', channelName);
  });
  
  channel.error((error) => {
    console.error('❌ WebSocket error:', error);
  });
  
  channel.listen('.VotingStateChanged', (data) => {
    console.log('[WebSocket] Received VotingStateChanged event:', data);
    handleVotingStateChange(data);
  });
  
  // Listen for screen registration changes
  channel.listen('.ScreenRegistrationChanged', (data) => {
    console.log('[WebSocket] Received ScreenRegistrationChanged event:', data);
    handleScreenRegistrationChange(data);
  });
  
  return channelName;
};

// Handle active event change from admin
const handleActiveEventChange = (data) => {
  console.log('[WebSocket] Active event changed:', data);
  
  // If the new active event is different from current, redirect to the new event
  if (data.event_id && data.event_id !== parseInt(eventId.value)) {
    console.log(`🔄 Switching from event ${eventId.value} to event ${data.event_id}`);
    // Redirect to /judge without parameters - it will fetch the active event
    // This ensures we don't stay on the old event_id from URL params
    window.location.href = '/judge';
  }
};

// Setup global WebSocket for event changes
const setupGlobalWebSocket = () => {
  if (!window.Echo) return null;
  
  console.log('[WebSocket] Connecting to global channel');
  
  const channel = window.Echo.channel('global');
  
  channel.subscribed(() => {
    console.log('[WebSocket] Subscribed to global channel');
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

  // Always initialize deviceId for swap detection
  deviceId.value = getDeviceId();

  // If event_id is in URL, use it directly
  if (urlEventId) {
    eventId.value = urlEventId;
    
    // Load display settings first to get judge_login_mode
    await loadDisplaySettings(urlEventId);
    
    await loadData(eventId.value);
    await loadVotingState(eventId.value);

    // If judge_id is in URL and NOT in manual mode, use it directly
    if (urlJudgeId && judgeLoginMode.value !== 'manual') {
      judgeId.value = urlJudgeId;
      showJudgeSelection.value = false;
      await loadJudgeScores(urlJudgeId);
      
      // Set assignedChairNumber from judges list for show judge numbers feature
      const currentJudge = judges.value.find(j => j.id === parseInt(urlJudgeId));
      if (currentJudge) {
        assignedChairNumber.value = currentJudge.chair_number;
      }
      
      // Try to find this device's screen number from registered screens (for swap detection)
      try {
        const regResponse = await fetch(`/api/voting/registered-screens?event_id=${urlEventId}`);
        const regData = await regResponse.json();
        const myScreen = regData.registered_screens?.find(s => s.device_id === deviceId.value);
        if (myScreen) {
          screenNumber.value = myScreen.screen_number;
          console.log('[Screen] Found registered screen:', screenNumber.value);
        }
      } catch (e) {
        console.log('[Screen] Could not fetch registered screens');
      }
      
      // Check if show_judge_numbers is enabled on server and apply it
      applyShowJudgeNumbersState();
      
      loading.value = false;
    } else if (judgeLoginMode.value === 'manual') {
      // Manual mode: always show judge selection screen, clear judge_id from URL
      if (urlJudgeId) {
        router.replace(`/judge?event_id=${urlEventId}`);
      }
      showJudgeSelection.value = true;
      loading.value = false;
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
        
        // Show assigned number for 3 seconds, then hide UNLESS server says to keep showing
        setTimeout(() => {
          // Only hide if server doesn't have show_judge_numbers enabled
          if (!serverShowJudgeNumbers.value) {
            showAssignedNumber.value = false;
          }
          showJudgeSelection.value = false;
          // Update URL with event_id and judge_id parameters
          router.replace(`/judge?event_id=${urlEventId}&judge_id=${judgeId.value}`);
        }, 3000);
      } else {
        // Fallback to manual selection if no judge assigned
        showJudgeSelection.value = true;
        loading.value = false;
      }
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

<style scoped>
.assigned-number {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-weight: 400;
  font-style: italic;
  letter-spacing: 0.02em;
}
</style>
