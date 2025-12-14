<template>
  <div class="print-page">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p class="text-gray-500">Loading scores...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button @click="loadData" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Retry
        </button>
      </div>
    </div>

    <!-- Print Content -->
    <div v-else class="print-container">
      <!-- Screen Controls (hidden when printing) -->
      <div class="no-print bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div class="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 class="text-xl font-bold text-gray-900">Judge Score Sheet</h1>
            <p class="text-sm text-gray-500">{{ reportData?.event?.name }}</p>
          </div>
          <div class="flex gap-3">
            <button
              @click="goBack"
              class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              @click="printSheet"
              class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Printer class="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      <!-- Printable Score Sheet -->
      <div ref="printRef" class="score-sheet max-w-4xl mx-auto bg-white p-8">
        <!-- Header -->
        <div class="text-center mb-8 border-b-2 border-gray-800 pb-6">
          <h1 class="text-2xl font-bold text-gray-900 uppercase tracking-wide mb-2">
            Official Score Sheet
          </h1>
          <h2 class="text-lg font-semibold text-gray-700 mb-4">
            {{ reportData?.event?.name || 'Event Name' }}
          </h2>
          <div class="flex justify-center gap-8 text-sm text-gray-600">
            <div>
              <span class="font-medium">Judge:</span>
              {{ reportData?.judge?.name || 'Judge Name' }}
              <span v-if="reportData?.judge?.chair_number" class="text-gray-500">
                (Chair #{{ reportData.judge.chair_number }})
              </span>
            </div>
            <div>
              <span class="font-medium">Date:</span>
              {{ formattedDate }}
            </div>
          </div>
        </div>

        <!-- Scores by Round -->
        <div v-for="round in reportData?.rounds || []" :key="round.round_id" class="mb-8">
          <h3 class="text-lg font-bold text-gray-800 uppercase tracking-wide mb-4 bg-gray-100 px-4 py-2">
            {{ round.round_name }}
          </h3>

          <!-- Candidates Table -->
          <table class="w-full border-collapse mb-4">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                  Candidate
                </th>
                <th class="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                  Criteria
                </th>
                <th class="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase w-24">
                  Max
                </th>
                <th class="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase w-24">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="candidate in round.candidates" :key="candidate.candidate_id">
                <!-- First criteria row with candidate name -->
                <tr v-for="(score, scoreIndex) in candidate.scores" :key="`${candidate.candidate_id}-${score.criteria_id}`">
                  <td 
                    v-if="scoreIndex === 0" 
                    :rowspan="candidate.scores.length + 1"
                    class="border border-gray-300 px-3 py-2 align-top font-medium text-gray-900"
                  >
                    <span class="font-bold">#{{ candidate.candidate_number }}</span>
                    <br>
                    {{ candidate.candidate_name }}
                  </td>
                  <td class="border border-gray-300 px-3 py-2 text-sm text-gray-700">
                    {{ score.criteria_name }}
                  </td>
                  <td class="border border-gray-300 px-3 py-2 text-center text-sm text-gray-500">
                    {{ score.max_points }}
                  </td>
                  <td class="border border-gray-300 px-3 py-2 text-center font-mono text-sm">
                    {{ score.points }}
                  </td>
                </tr>
                <!-- Total row for candidate -->
                <tr class="bg-gray-50">
                  <td class="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700" colspan="2">
                    Total
                  </td>
                  <td class="border border-gray-300 px-3 py-2 text-center font-bold text-indigo-600">
                    {{ candidate.total.toFixed(2) }}
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="!reportData?.rounds?.length" class="text-center py-12 text-gray-500">
          No scores recorded for this judge.
        </div>

        <!-- Footer with Signature -->
        <div class="mt-12 pt-8 border-t-2 border-gray-800">
          <div class="flex justify-between items-end">
            <div class="text-xs text-gray-500">
              <p>Generated: {{ generatedAt }}</p>
              <p class="mt-1">PodiumLedger Tabulation System</p>
            </div>
            <div class="text-center">
              <div class="w-64 border-b border-gray-400 mb-2"></div>
              <p class="text-sm font-medium text-gray-700">Judge's Signature</p>
              <p class="text-xs text-gray-500 mt-1">{{ reportData?.judge?.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Printer } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref(null);
const reportData = ref(null);
const printRef = ref(null);

const formattedDate = computed(() => {
  if (!reportData.value?.event?.date) return new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  return new Date(reportData.value.event.date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

const generatedAt = computed(() => {
  if (!reportData.value?.generated_at) return new Date().toLocaleString();
  return new Date(reportData.value.generated_at).toLocaleString();
});

const loadData = async () => {
  loading.value = true;
  error.value = null;

  const eventId = route.query.event_id;
  const judgeId = route.query.judge_id;

  if (!eventId || !judgeId) {
    error.value = 'Missing event_id or judge_id parameter';
    loading.value = false;
    return;
  }

  try {
    const response = await fetch(`/api/reports/judge-scores?event_id=${eventId}&judge_id=${judgeId}`);
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to load scores');
    }

    reportData.value = await response.json();
  } catch (err) {
    error.value = err.message || 'Failed to load judge scores';
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.back();
};

const printSheet = () => {
  window.print();
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.print-page {
  min-height: 100vh;
  background-color: #f3f4f6;
}

.score-sheet {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }

  .print-page {
    background-color: white;
  }

  .score-sheet {
    box-shadow: none;
    max-width: none;
    padding: 0;
    margin: 0;
  }

  @page {
    size: A4;
    margin: 1cm;
  }

  table {
    page-break-inside: auto;
  }

  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  thead {
    display: table-header-group;
  }

  /* Ensure colors print */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
}
</style>
