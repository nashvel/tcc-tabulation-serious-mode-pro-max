<template>
  <div class="mb-0">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100">
      <h3 
        class="text-sm font-semibold uppercase tracking-wide"
        :class="colorTheme === 'pink' ? 'text-pink-600' : 'text-blue-600'"
      >
        {{ title }}
      </h3>
      <button
        v-if="showHideButton"
        @click="$emit('toggle-hidden')"
        :class="[
          'flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all',
          scoresHidden ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'
        ]"
      >
        <component :is="scoresHidden ? EyeOff : Eye" :size="10" />
        {{ scoresHidden ? 'Hidden' : 'Hide' }}
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style="min-width: 180px">
              Candidate
            </th>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style="min-width: 160px">
              Team/Dept
            </th>
            <th 
              v-for="crit in criteria" 
              :key="crit.id" 
              class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
              style="min-width: 120px"
            >
              {{ crit.name }} ({{ crit.points }}%)
            </th>
            <th class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider" style="min-width: 80px">
              AVG
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr 
            v-for="candidate in candidates" 
            :key="candidate.id"
            class="hover:bg-gray-50/50 transition-colors"
          >
            <td class="py-3 px-4">
              <span class="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                {{ candidate.number }} - {{ candidate.name?.toUpperCase() }}
              </span>
            </td>
            <td class="py-3 px-4">
              <span class="text-sm text-gray-600 font-medium">
                {{ candidate.team || candidate.department || '-' }}
              </span>
            </td>
            <td v-for="crit in criteria" :key="crit.id" class="py-2 px-2 text-center">
              <input
                type="number"
                :value="scores[`${candidate.id}-${crit.id}`] || ''"
                @input="handleInput(candidate.id, crit.id, $event.target.value, crit.points)"
                @keydown.enter="$emit('flush-scores')"
                :max="crit.points"
                min="0"
                step="0.01"
                :placeholder="`0-${crit.points}`"
                :class="[
                  'w-full text-center py-2 px-1 text-sm font-mono border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
                  scoresHidden ? 'blur-md' : ''
                ]"
              />
            </td>
            <td class="py-3 px-4 text-center">
              <span 
                :class="[
                  'font-mono text-sm font-bold tracking-tight',
                  getAverage(candidate.id) > 0 ? 'text-blue-500' : 'text-gray-300',
                  scoresHidden ? 'blur-md' : ''
                ]"
              >
                {{ getAverage(candidate.id) > 0 ? getAverage(candidate.id).toFixed(2) : '-' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { Eye, EyeOff } from 'lucide-vue-next';

const props = defineProps({
  title: String,
  candidates: Array,
  criteria: Array,
  scores: Object,
  scoresHidden: Boolean,
  colorTheme: { type: String, default: 'pink' },
  showHideButton: { type: Boolean, default: true }
});

const emit = defineEmits(['toggle-hidden', 'score-change', 'flush-scores']);

const handleInput = (candidateId, criteriaId, value, maxPoints) => {
  emit('score-change', { candidateId, criteriaId, value, maxPoints });
};

const getAverage = (candidateId) => {
  return props.criteria.reduce((sum, crit) => {
    const score = parseFloat(props.scores[`${candidateId}-${crit.id}`] || 0);
    return sum + score;
  }, 0);
};
</script>
