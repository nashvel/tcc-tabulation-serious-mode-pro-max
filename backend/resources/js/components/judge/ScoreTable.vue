<template>
  <div class="mb-0">
    <!-- Header -->
    <div 
      class="flex items-center justify-between px-4 py-3 border-b"
      :class="headerClasses"
    >
      <h3 class="text-sm font-semibold uppercase tracking-wide text-white flex items-center gap-2">
        <component :is="headerIcon" :size="18" />
        {{ title }}
        <span class="text-xs opacity-75">({{ candidates.length }})</span>
      </h3>
      <button
        v-if="showHideButton"
        @click="$emit('toggle-hidden')"
        :class="[
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all',
          scoresHidden ? 'bg-white/20 text-white' : 'bg-white/90 text-gray-700'
        ]"
      >
        <component :is="scoresHidden ? EyeOff : Eye" :size="12" />
        {{ scoresHidden ? 'Show' : 'Hide' }}
      </button>
    </div>

    <!-- Simplified Card Layout for Mobile/Tablet -->
    <div class="bg-white">
      <div v-for="candidate in candidates" :key="candidate.id" class="border-b border-gray-100 last:border-b-0">
        <!-- Candidate Header - Large & Clear -->
        <div 
          class="px-4 py-3 flex items-center justify-between cursor-pointer"
          :class="[
            expandedCandidate === candidate.id ? headerClasses : 'bg-gray-50 hover:bg-gray-100'
          ]"
          @click="toggleCandidate(candidate.id)"
        >
          <div class="flex items-center gap-3">
            <div 
              class="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm"
              :class="numberBadgeClasses"
            >
              {{ candidate.number }}
            </div>
            <div v-if="displaySettings.show_candidate_name || displaySettings.show_team_department">
              <p v-if="displaySettings.show_candidate_name" class="font-bold text-base uppercase tracking-wide" :class="expandedCandidate === candidate.id ? 'text-white' : 'text-gray-900'">
                {{ candidate.name?.toUpperCase() }}
              </p>
              <p v-if="displaySettings.show_team_department" class="text-xs" :class="expandedCandidate === candidate.id ? 'text-white/70' : 'text-gray-500'">
                {{ candidate.team || candidate.department || 'No Team' }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <!-- Score Summary Badge -->
            <div 
              class="px-3 py-1.5 rounded-lg text-center min-w-[80px]"
              :class="[
                getCandidateProgress(candidate.id) === 100 
                  ? 'bg-green-500 text-white' 
                  : expandedCandidate === candidate.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-200 text-gray-700'
              ]"
            >
              <p class="text-[10px] uppercase tracking-wider opacity-75">Total</p>
              <p class="text-lg font-bold" :class="scoresHidden ? 'blur-sm' : ''">
                {{ getTotal(candidate.id).toFixed(1) }}
              </p>
            </div>
            <ChevronDown 
              :size="24" 
              :class="[
                'transition-transform',
                expandedCandidate === candidate.id ? 'rotate-180 text-white' : 'text-gray-400'
              ]" 
            />
          </div>
        </div>

        <!-- Expanded Scoring Area -->
        <div v-if="expandedCandidate === candidate.id" class="p-4 bg-gray-50 space-y-4">
          <!-- Progress Bar -->
          <div class="flex items-center gap-3 mb-4">
            <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                class="h-full transition-all duration-300 rounded-full"
                :class="getCandidateProgress(candidate.id) === 100 ? 'bg-green-500' : 'bg-blue-500'"
                :style="{ width: getCandidateProgress(candidate.id) + '%' }"
              />
            </div>
            <span class="text-xs font-medium text-gray-500">
              {{ getFilledCount(candidate.id) }}/{{ criteria.length }} scored
            </span>
          </div>

          <!-- Criteria Cards - Large Touch Targets -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div 
              v-for="crit in criteria" 
              :key="crit.id"
              class="bg-white rounded-xl border-2 p-4 transition-all"
              :class="getScoreCardClasses(candidate.id, crit.id)"
            >
              <div class="flex items-center justify-between mb-3">
                <div>
                  <p class="font-semibold text-gray-900 text-sm uppercase">{{ crit.name }}</p>
                  <p class="text-xs text-gray-500">Max: {{ crit.points }} points</p>
                </div>
                <div 
                  v-if="hasScore(candidate.id, crit.id)"
                  class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                >
                  <Check :size="14" class="text-white" />
                </div>
              </div>
              
              <!-- Large Score Input -->
              <div class="relative">
                <input
                  type="number"
                  :value="scores[`${candidate.id}-${crit.id}`] || ''"
                  @input="handleInput(candidate.id, crit.id, $event.target.value, crit.points)"
                  @focus="activeInput = `${candidate.id}-${crit.id}`"
                  @blur="activeInput = null"
                  :max="crit.points"
                  min="0"
                  step="0.5"
                  :placeholder="`Enter 0-${crit.points}`"
                  class="w-full text-center py-4 px-4 text-2xl font-bold border-2 rounded-xl transition-all judge-input-focus"
                  :class="[
                    scoresHidden ? 'blur-md' : '',
                    hasScore(candidate.id, crit.id) 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-200 bg-white',
                    activeInput === `${candidate.id}-${crit.id}` ? 'judge-active-input ring-4 ring-indigo-300' : ''
                  ]"
                  style="caret-color: #4f46e5; caret-shape: block;"
                />
                <!-- Quick Score Buttons -->
                <div class="flex gap-2 mt-2">
                  <button
                    v-for="quickScore in getQuickScores(crit.points)"
                    :key="quickScore"
                    @click="setQuickScore(candidate.id, crit.id, quickScore, crit.points)"
                    class="flex-1 py-3 text-base font-bold rounded-lg border-2 border-gray-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 active:bg-indigo-100 active:scale-95 transition-all cursor-pointer"
                  >
                    {{ quickScore }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Candidate Total Summary -->
          <div class="mt-4 p-4 rounded-xl" :class="summaryClasses">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-white/80">
                  Total Score for {{ displaySettings.show_candidate_name ? candidate.name : `#${candidate.number}` }}
                </p>
                <p class="text-3xl font-bold text-white" :class="scoresHidden ? 'blur-md' : ''">
                  {{ getTotal(candidate.id).toFixed(2) }}
                </p>
              </div>
              <div v-if="getCandidateProgress(candidate.id) === 100" class="flex items-center gap-2 text-white">
                <CheckCircle :size="24" />
                <span class="text-sm font-medium">Complete!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="candidates.length === 0" class="py-16 text-center">
        <Users :size="48" class="text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500">No candidates in this category</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Eye, EyeOff, ChevronDown, Check, CheckCircle, Users, User, UsersRound } from 'lucide-vue-next';

const props = defineProps({
  title: String,
  candidates: Array,
  criteria: Array,
  scores: Object,
  scoresHidden: Boolean,
  colorTheme: { type: String, default: 'pink' },
  showHideButton: { type: Boolean, default: true },
  displaySettings: { 
    type: Object, 
    default: () => ({ show_candidate_name: true, show_team_department: true }) 
  }
});

const emit = defineEmits(['toggle-hidden', 'score-change', 'flush-scores']);

const expandedCandidate = ref(null);
const activeInput = ref(null);

// Auto-expand first candidate if none expanded
if (props.candidates.length > 0 && !expandedCandidate.value) {
  expandedCandidate.value = props.candidates[0]?.id;
}

const toggleCandidate = (id) => {
  expandedCandidate.value = expandedCandidate.value === id ? null : id;
};

const headerClasses = computed(() => {
  switch (props.colorTheme) {
    case 'pink': return 'bg-gradient-to-r from-pink-500 to-pink-600';
    case 'blue': return 'bg-gradient-to-r from-blue-500 to-blue-600';
    case 'indigo': return 'bg-gradient-to-r from-indigo-500 to-indigo-600';
    case 'purple': return 'bg-gradient-to-r from-purple-500 to-purple-600';
    default: return 'bg-gradient-to-r from-gray-600 to-gray-700';
  }
});

const numberBadgeClasses = computed(() => {
  switch (props.colorTheme) {
    case 'pink': return 'bg-pink-100 text-pink-600';
    case 'blue': return 'bg-blue-100 text-blue-600';
    case 'indigo': return 'bg-indigo-100 text-indigo-600';
    case 'purple': return 'bg-purple-100 text-purple-600';
    default: return 'bg-gray-100 text-gray-600';
  }
});

const summaryClasses = computed(() => {
  switch (props.colorTheme) {
    case 'pink': return 'bg-gradient-to-r from-pink-500 to-pink-600';
    case 'blue': return 'bg-gradient-to-r from-blue-500 to-blue-600';
    case 'indigo': return 'bg-gradient-to-r from-indigo-500 to-indigo-600';
    case 'purple': return 'bg-gradient-to-r from-purple-500 to-purple-600';
    default: return 'bg-gradient-to-r from-gray-600 to-gray-700';
  }
});

const headerIcon = computed(() => {
  switch (props.colorTheme) {
    case 'pink': return User;
    case 'blue': return User;
    case 'purple': return UsersRound;
    default: return Users;
  }
});

const handleInput = (candidateId, criteriaId, value, maxPoints) => {
  emit('score-change', { candidateId, criteriaId, value, maxPoints });
};

const hasScore = (candidateId, criteriaId) => {
  const key = `${candidateId}-${criteriaId}`;
  const value = props.scores[key];
  return value !== '' && value !== null && value !== undefined;
};

const getScoreCardClasses = (candidateId, criteriaId) => {
  if (hasScore(candidateId, criteriaId)) {
    return 'border-green-300 bg-green-50/50';
  }
  return 'border-gray-200';
};

const getTotal = (candidateId) => {
  return props.criteria.reduce((sum, crit) => {
    const score = parseFloat(props.scores[`${candidateId}-${crit.id}`] || 0);
    return sum + score;
  }, 0);
};

const getFilledCount = (candidateId) => {
  return props.criteria.filter(crit => hasScore(candidateId, crit.id)).length;
};

const getCandidateProgress = (candidateId) => {
  const filled = getFilledCount(candidateId);
  return props.criteria.length > 0 ? (filled / props.criteria.length) * 100 : 0;
};

const getQuickScores = (maxPoints) => {
  // Generate quick score buttons based on max points
  const scores = [];
  const step = maxPoints <= 10 ? 2 : maxPoints <= 25 ? 5 : 10;
  for (let i = step; i <= maxPoints; i += step) {
    scores.push(i);
  }
  if (scores[scores.length - 1] !== maxPoints) {
    scores.push(maxPoints);
  }
  return scores.slice(-4); // Show max 4 quick buttons
};

const setQuickScore = (candidateId, criteriaId, value, maxPoints) => {
  emit('score-change', { candidateId, criteriaId, value: value.toString(), maxPoints });
};
</script>

<style scoped>
/* Enhanced cursor visibility for judge scoring interface */
input[type="number"] {
  cursor: text;
  caret-color: #4f46e5;
}

input[type="number"]:focus {
  cursor: text;
  outline: none;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.25), 0 0 0 2px rgba(79, 70, 229, 0.5);
}

/* Make number input spinners more visible */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 1;
  height: 40px;
  width: 30px;
  cursor: pointer;
}

/* Large touch-friendly buttons */
button {
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: rgba(79, 70, 229, 0.2);
}

button:active {
  transform: scale(0.97);
}

/* Candidate card hover effect */
.cursor-pointer:hover {
  cursor: pointer;
}
</style>
