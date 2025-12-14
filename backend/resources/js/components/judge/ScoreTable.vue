<template>
  <div class="mb-0">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
      <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-700 flex items-center gap-2">
        <Users :size="18" class="text-gray-500" />
        {{ title }}
        <span class="text-xs text-gray-400">({{ candidates.length }})</span>
      </h3>
      <button
        v-if="showHideButton"
        @click="$emit('toggle-hidden')"
        :class="[
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wide transition-all border',
          scoresHidden ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
        ]"
      >
        <component :is="scoresHidden ? EyeOff : Eye" :size="12" />
        {{ scoresHidden ? 'Show' : 'Hide' }}
      </button>
    </div>

    <!-- Table Layout -->
    <div class="bg-white overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-48">
              Candidate
            </th>
            <th 
              v-for="crit in criteria" 
              :key="crit.id" 
              class="py-3 px-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200"
            >
              <div>{{ crit.name }}</div>
              <div class="text-[10px] font-normal text-gray-400">({{ crit.points }} pts)</div>
            </th>
            <th class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="candidate in candidates" 
            :key="candidate.id" 
            class="border-b border-gray-100 hover:bg-gray-50/50"
          >
            <!-- Candidate Info -->
            <td class="py-3 px-4 border-r border-gray-200">
              <div class="flex flex-col items-center justify-center text-center">
                <div class="candidate-number text-3xl text-gray-800 mb-1">
                  {{ candidate.number }}
                </div>
                <div v-if="displaySettings.show_candidate_name || displaySettings.show_team_department">
                  <p v-if="displaySettings.show_candidate_name" class="font-medium text-gray-700 text-xs uppercase tracking-wide">
                    {{ candidate.name }}
                  </p>
                  <p v-if="displaySettings.show_team_department" class="text-[10px] text-gray-400">
                    {{ candidate.team || candidate.department || '' }}
                  </p>
                </div>
              </div>
            </td>

            <!-- Score Inputs for each Criteria -->
            <td 
              v-for="crit in criteria" 
              :key="crit.id" 
              class="py-2 px-2 text-center border-r border-gray-200"
            >
              <input
                type="number"
                :value="scores[`${candidate.id}-${crit.id}`] || ''"
                @input="handleInput(candidate.id, crit.id, $event.target.value, crit.points, $event)"
                @focus="activeInput = `${candidate.id}-${crit.id}`"
                @blur="activeInput = null"
                :max="crit.points"
                min="0"
                step="0.5"
                :placeholder="`0-${crit.points}`"
                class="w-full text-center py-3 px-2 text-lg font-bold border-2 rounded-lg transition-all"
                :class="[
                  scoresHidden ? 'blur-md' : '',
                  hasScore(candidate.id, crit.id) 
                    ? 'border-gray-400 bg-gray-50' 
                    : 'border-gray-200 bg-white',
                  activeInput === `${candidate.id}-${crit.id}` ? 'ring-2 ring-gray-400 border-gray-500' : ''
                ]"
              />
            </td>

            <!-- Total -->
            <td class="py-3 px-4 text-center">
              <div 
                class="inline-flex items-center justify-center px-3 py-2 rounded-lg min-w-[60px]"
                :class="[
                  getCandidateProgress(candidate.id) === 100 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-100 text-gray-700'
                ]"
              >
                <span class="text-lg font-bold" :class="scoresHidden ? 'blur-md' : ''">
                  {{ getTotal(candidate.id).toFixed(1) }}
                </span>
                <Check v-if="getCandidateProgress(candidate.id) === 100" :size="16" class="ml-1.5" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

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
import { Eye, EyeOff, Check, Users } from 'lucide-vue-next';

const props = defineProps({
  title: String,
  candidates: Array,
  criteria: Array,
  scores: Object,
  scoresHidden: Boolean,
  colorTheme: { type: String, default: 'gray' },
  showHideButton: { type: Boolean, default: true },
  displaySettings: { 
    type: Object, 
    default: () => ({ show_candidate_name: true, show_team_department: true }) 
  }
});

const emit = defineEmits(['toggle-hidden', 'score-change', 'flush-scores']);

const activeInput = ref(null);

const handleInput = (candidateId, criteriaId, value, maxPoints, event) => {
  // If empty, just emit
  if (value === '') {
    emit('score-change', { candidateId, criteriaId, value, maxPoints });
    return;
  }
  
  // Parse the value
  const numValue = parseFloat(value);
  
  // If not a valid number, ignore
  if (isNaN(numValue)) return;
  
  // Cap to max if exceeded - instantly set to max
  let finalValue = numValue;
  if (numValue > maxPoints) {
    finalValue = maxPoints;
    // Update the input element directly to show capped value
    if (event?.target) {
      event.target.value = maxPoints.toString();
    }
  }
  
  // Prevent negative values
  if (numValue < 0) {
    finalValue = 0;
    if (event?.target) {
      event.target.value = '0';
    }
  }
  
  emit('score-change', { candidateId, criteriaId, value: finalValue.toString(), maxPoints });
};

const hasScore = (candidateId, criteriaId) => {
  const key = `${candidateId}-${criteriaId}`;
  const value = props.scores[key];
  return value !== '' && value !== null && value !== undefined;
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
</script>

<style scoped>
/* Elegant serif font for candidate numbers */
.candidate-number {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-weight: 400;
  font-style: italic;
  letter-spacing: 0.05em;
}

input[type="number"] {
  cursor: text;
}

input[type="number"]:focus {
  cursor: text;
  outline: none;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 1;
  height: 30px;
  width: 24px;
  cursor: pointer;
}

button {
  cursor: pointer;
  touch-action: manipulation;
}
</style>
