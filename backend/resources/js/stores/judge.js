import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useJudgeStore = defineStore('judge', () => {
  // State
  const eventId = ref(null);
  const judgeId = ref(localStorage.getItem('judgeId') || '');
  const isLocked = ref(false);
  const activeRound = ref(null);
  
  // Data
  const candidates = ref([]);
  const judges = ref([]);
  const criteria = ref([]);
  const rounds = ref([]);
  const scores = ref({});

  // Computed
  const femaleCandidates = computed(() => 
    candidates.value.filter(c => c.category === 'Female' || c.gender === 'Female')
  );

  const maleCandidates = computed(() => 
    candidates.value.filter(c => c.category === 'Male' || c.gender === 'Male')
  );

  // Actions
  const setJudgeId = (id) => {
    judgeId.value = id;
    localStorage.setItem('judgeId', id);
  };

  const clearJudge = () => {
    judgeId.value = '';
    localStorage.removeItem('judgeId');
  };

  return {
    eventId,
    judgeId,
    isLocked,
    activeRound,
    candidates,
    judges,
    criteria,
    rounds,
    scores,
    femaleCandidates,
    maleCandidates,
    setJudgeId,
    clearJudge
  };
});
