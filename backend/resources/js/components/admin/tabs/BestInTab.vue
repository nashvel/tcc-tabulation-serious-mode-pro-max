<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-sm text-gray-600">Loading best in results...</p>
      </div>
    </div>

    <template v-else>
      <!-- Category Tabs -->
      <div class="px-4 py-3 border-b-2 border-gray-200 bg-gray-50 overflow-x-auto">
        <div class="flex gap-1 min-w-max">
          <button
            v-for="cat in criteria"
            :key="cat.id"
            @click="selectCategory(cat.id)"
            :class="[
              'relative px-4 py-2 text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2',
              selectedCategory === cat.id ? 'font-bold text-gray-900' : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            <Star class="w-4 h-4" />
            {{ cat.name }}
            <div 
              v-if="selectedCategory === cat.id"
              class="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-gray-900"
            ></div>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!currentResult || !currentResult.allResults.length" class="p-8 text-center text-gray-500">
        <Trophy class="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p class="mt-4 text-lg">No scores available for this category</p>
        <p class="text-sm text-gray-400 mt-2">Scores will appear once judges submit their evaluations</p>
      </div>

      <!-- Winner Display with Rankings List -->
      <div v-else class="p-8">
        <div class="flex gap-6 max-w-7xl mx-auto">
          <!-- Main Winner Card -->
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
              Best in {{ currentResult.category.name }}
            </h2>

            <div :class="['bg-white rounded-xl overflow-hidden shadow-2xl border-4', getBorderColor(selectedRank)]">
              <!-- Large Winner Image -->
              <div class="relative">
                <div class="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <User class="w-32 h-32 text-gray-300" />
                </div>
                <div class="absolute top-4 left-4 rounded-full p-4 shadow-lg bg-gray-900">
                  <Trophy class="w-8 h-8 text-white" />
                </div>
                <div class="absolute bottom-4 right-4 bg-black bg-opacity-80 px-6 py-3 rounded-full">
                  <span class="text-white font-bold text-3xl">{{ currentWinner.score.toFixed(2) }}</span>
                </div>
                <div class="absolute top-4 right-4 bg-white bg-opacity-90 px-4 py-2 rounded-full">
                  <span class="text-gray-900 font-bold text-sm">{{ getRankLabel(selectedRank) }}</span>
                </div>
              </div>

              <!-- Winner Info -->
              <div class="p-6 text-white text-center" :style="getGradientStyle(selectedRank)">
                <div class="flex items-center justify-center gap-2 mb-2">
                  <Trophy class="w-6 h-6" />
                  <h3 class="text-xl font-bold">{{ getRankLabel(selectedRank).toUpperCase() }}</h3>
                </div>
                <div class="text-4xl font-bold mb-2">#{{ currentWinner.candidate.number }}</div>
                <div class="text-2xl font-bold">{{ currentWinner.candidate.name }}</div>
              </div>
            </div>

            <!-- Other Category Stats -->
            <div class="mt-3 bg-gray-50 rounded p-2">
              <h4 class="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                <BarChart3 class="w-3 h-3" />
                Other Categories
              </h4>
              <div class="grid grid-cols-3 gap-1.5">
                <template v-for="otherCategory in otherCategoryResults" :key="otherCategory.category.id">
                  <div
                    v-if="otherCategory.candidateResult"
                    class="bg-white rounded border border-gray-200 p-1.5 hover:border-blue-300 transition-colors"
                  >
                    <div class="flex items-center justify-between mb-0.5">
                      <span class="text-[10px] font-semibold text-gray-600 truncate leading-tight">
                        {{ otherCategory.category.name }}
                      </span>
                      <span :class="[
                        'text-[9px] font-bold px-1 py-0.5 rounded',
                        otherCategory.rank <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                      ]">
                        #{{ otherCategory.rank }}
                      </span>
                    </div>
                    <div class="text-xs font-bold text-gray-900">
                      {{ otherCategory.candidateResult.score.toFixed(2) }}
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Rankings List - Right Side -->
          <div class="w-64">
            <h3 class="text-sm font-bold text-gray-900 mb-3">All Rankings</h3>
            <div class="space-y-1.5">
              <div
                v-for="(item, index) in currentResult.allResults"
                :key="item.candidate.id"
                @click="selectedRank = index"
                :class="[
                  'bg-white rounded border overflow-hidden cursor-pointer transition-all hover:shadow-md',
                  selectedRank === index ? getBorderColor(index) + ' border-2' : 'border-gray-200'
                ]"
              >
                <div class="flex items-center gap-2 p-2">
                  <!-- Rank Badge -->
                  <div 
                    class="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    :style="getGradientStyle(index)"
                  >
                    {{ index + 1 }}
                  </div>

                  <!-- Candidate Image -->
                  <div class="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                    <User class="w-5 h-5 text-gray-400" />
                  </div>

                  <!-- Candidate Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-1">
                      <div class="font-bold text-xs text-gray-900 truncate">
                        #{{ item.candidate.number }}
                      </div>
                      <Trophy v-if="index < 3" class="w-3 h-3 text-yellow-600" />
                    </div>
                    <div class="text-xs text-gray-600 truncate">
                      {{ item.candidate.name }}
                    </div>
                    <div class="text-sm font-bold text-gray-700">
                      {{ item.score.toFixed(2) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Star, Trophy, BarChart3, User } from 'lucide-vue-next';
import { showError } from '../../../utils/alerts';

const props = defineProps({
  eventId: [String, Number],
  candidates: Array,
  criteria: Array
});

const loading = ref(true);
const scores = ref({});
const selectedCategory = ref(null);
const selectedRank = ref(0);
let refreshInterval = null;

// Calculate best in category results
const bestInResults = computed(() => {
  if (!props.criteria?.length || !props.candidates?.length) return [];

  return props.criteria.map(category => {
    const categoryScores = scores.value[category.id] || [];
    
    // Group scores by candidate and calculate average
    const candidateAverages = {};
    categoryScores.forEach(score => {
      if (!candidateAverages[score.candidate_id]) {
        candidateAverages[score.candidate_id] = [];
      }
      candidateAverages[score.candidate_id].push(score.points);
    });

    // Create results with average scores
    const categoryResults = props.candidates
      .map(candidate => {
        const candidateScores = candidateAverages[candidate.id] || [];
        const avgScore = candidateScores.length > 0 
          ? candidateScores.reduce((a, b) => a + b, 0) / candidateScores.length 
          : 0;
        return {
          candidate,
          score: avgScore
        };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);

    return {
      category,
      allResults: categoryResults
    };
  });
});

const currentResult = computed(() => {
  return bestInResults.value.find(r => r.category.id === selectedCategory.value);
});

const currentWinner = computed(() => {
  if (!currentResult.value || !currentResult.value.allResults.length) return null;
  return currentResult.value.allResults[selectedRank.value];
});

const otherCategoryResults = computed(() => {
  if (!currentWinner.value) return [];
  
  return bestInResults.value
    .filter(r => r.category.id !== selectedCategory.value)
    .map(otherCategory => {
      const candidateResult = otherCategory.allResults.find(
        r => r.candidate.id === currentWinner.value.candidate.id
      );
      const rank = otherCategory.allResults.findIndex(
        r => r.candidate.id === currentWinner.value.candidate.id
      ) + 1;
      
      return {
        category: otherCategory.category,
        candidateResult,
        rank
      };
    })
    .filter(r => r.candidateResult);
});

const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId;
  selectedRank.value = 0;
};

const getRankLabel = (index) => {
  if (index === 0) return '1st Place';
  if (index === 1) return '2nd Place';
  if (index === 2) return '3rd Place';
  return `${index + 1}th Place`;
};

const getBorderColor = (index) => {
  if (index === 0) return 'border-yellow-400';
  if (index === 1) return 'border-gray-400';
  if (index === 2) return 'border-gray-400';
  return 'border-gray-300';
};

const getGradientStyle = (index) => {
  if (index === 0) return { background: 'linear-gradient(135deg, #1F2937, #374151)' };
  if (index === 1) return { background: 'linear-gradient(135deg, #9CA3AF, #6B7280)' };
  if (index === 2) return { background: 'linear-gradient(135deg, #9CA3AF, #6B7280)' };
  return { background: 'linear-gradient(135deg, #9CA3AF, #6B7280)' };
};

const loadScores = async (showLoadingSpinner = true) => {
  if (!props.eventId) return;
  
  try {
    if (showLoadingSpinner) {
      loading.value = true;
    }
    
    const response = await fetch(`/api/points?event_id=${props.eventId}`);
    const scoresData = await response.json();
    
    // Organize scores by criteria (category)
    const scoresMap = {};
    scoresData.forEach(score => {
      if (!scoresMap[score.criteria_id]) {
        scoresMap[score.criteria_id] = [];
      }
      scoresMap[score.criteria_id].push({
        candidate_id: score.candidate_id,
        points: parseFloat(score.points) || 0
      });
    });
    scores.value = scoresMap;
    
    // Set initial selected category
    if (!selectedCategory.value && props.criteria?.length > 0) {
      selectedCategory.value = props.criteria[0].id;
    }
  } catch (error) {
    if (showLoadingSpinner) {
      showError('Failed to load scores');
    }
  } finally {
    if (showLoadingSpinner) {
      loading.value = false;
    }
  }
};

// Watch for criteria changes to set initial category
watch(() => props.criteria, (newCriteria) => {
  if (newCriteria?.length > 0 && !selectedCategory.value) {
    selectedCategory.value = newCriteria[0].id;
  }
}, { immediate: true });

onMounted(() => {
  loadScores(true);
  refreshInterval = setInterval(() => loadScores(false), 2000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>
