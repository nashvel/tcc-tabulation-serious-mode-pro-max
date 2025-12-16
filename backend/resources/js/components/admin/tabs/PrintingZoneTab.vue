<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <!-- Print Controls - Centered -->
    <div class="max-w-4xl mx-auto mb-6 no-print">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-800">Printing Zone</h2>
          <p class="text-sm text-gray-500">Generate and print official result sheets</p>
        </div>
        <div class="flex gap-3">
          <HelpButton @click="startTour" />
          <select id="round-selector" v-model="selectedRound" class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
            <option value="">Select Round</option>
            <option v-for="round in rounds" :key="round.id" :value="round.id">{{ round.name }}</option>
          </select>
          <select id="top-filter" v-model="topFilter" class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
            <option value="all">All Results</option>
            <option value="3">Top 3</option>
            <option value="5">Top 5</option>
            <option value="10">Top 10</option>
          </select>
          <button 
            id="print-btn"
            @click="generatePrint" 
            :disabled="!selectedRound || !sortedResults.length"
            class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Printer :size="16" />
            PRINT
          </button>
          <button 
            id="export-pdf-btn"
            @click="exportPDF" 
            :disabled="!selectedRound || !sortedResults.length"
            class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download :size="16" />
            EXPORT PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Print Preview - Document Style (A4 aspect ratio) -->
    <div id="print-preview" ref="printArea" class="print-area max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow-lg">
      <!-- Print Header -->
      <div class="text-center py-6 border-b border-gray-100">
        <div class="flex justify-center items-center gap-4 mb-4">
          <img src="/assets/logos/tcc-seal.jpg" class="h-14" alt="TCC Seal" />
          <img src="/assets/logos/mr&miss-2025.png" class="h-14" alt="Mr & Miss 2025" />
          <img src="/assets/logos/bsit.png" class="h-14" alt="BSIT Logo" />
        </div>
        <h2 class="text-xl font-bold text-gray-800">{{ event?.title || 'Event Name' }}</h2>
        <h3 class="text-lg font-semibold text-gray-700 mt-2">{{ selectedRoundName || 'Select a Round' }}</h3>
        <p class="text-sm text-gray-500 mt-1">Result as of {{ currentDate }}</p>
      </div>

      <!-- Results Table -->
      <div class="p-6">
        <div v-if="!selectedRound" class="text-center py-12 text-gray-400">
          <FileText :size="48" class="mx-auto mb-3 opacity-50" />
          <p>Select a round to view results</p>
        </div>

        <div v-if="selectedRound">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">CANDIDATES</th>
                <th 
                  v-for="judge in sortedJudges" 
                  :key="judge.id" 
                  class="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700"
                >
                  JUDGE #{{ judge.chair_number }}
                </th>
                <th class="border border-gray-200 px-4 py-3 text-center font-semibold text-red-600">AVERAGE</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="candidate in sortedResults" :key="candidate.id" class="hover:bg-gray-50">
                <td class="border border-gray-200 px-4 py-3">
                  (#{{ candidate.number }}). {{ candidate.name }}
                </td>
                <td 
                  v-for="judge in sortedJudges" 
                  :key="judge.id" 
                  class="border border-gray-200 px-4 py-3 text-center font-semibold"
                >
                  {{ formatScore(getJudgeScore(candidate.id, judge.id)) }}
                </td>
                <td class="border border-gray-200 px-4 py-3 text-center font-bold text-red-600">
                  {{ formatScore(candidate.average) }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Winner Section - Shows ties on same line -->
          <div id="winner-section" v-if="displayedWinners.length" class="mt-6 p-4 bg-gray-50 rounded-lg">
            <p class="text-gray-700 whitespace-nowrap overflow-x-auto">
              <span class="font-bold">{{ displayedWinners.length > 1 ? 'TIED WINNERS:' : 'WINNER:' }}</span>
              <template v-for="(w, idx) in displayedWinners" :key="w.id">
                <span 
                  class="inline-flex items-center gap-1 mx-1 group cursor-pointer"
                  @click="toggleWinnerExclusion(w.id)"
                  :title="excludedWinners.has(w.id) ? 'Click to include' : 'Click to exclude from print'"
                >
                  <span 
                    class="px-2 py-0.5 text-white text-sm rounded"
                    :class="excludedWinners.has(w.id) ? 'bg-gray-400 line-through opacity-50' : 'bg-red-600'"
                  >{{ w.number }}</span>
                  <span 
                    class="font-semibold uppercase"
                    :class="[excludedWinners.has(w.id) ? 'line-through opacity-50 text-gray-400' : 'underline text-gray-700']"
                  >{{ w.name }}</span>
                  <X v-if="!excludedWinners.has(w.id) && displayedWinners.length > 1" :size="14" class="text-gray-400 opacity-0 group-hover:opacity-100" />
                </span><span v-if="idx < displayedWinners.length - 1" class="text-gray-500">&</span>
              </template>
            </p>
            <p v-if="displayedWinners.length > 1" class="text-xs text-gray-400 mt-2 no-print">
              Click on a name to exclude/include from print
            </p>
          </div>

          <!-- Nothing to Follow -->
          <div class="text-center py-4 text-gray-500 italic border-t border-gray-200 mt-6">
            ****** Nothing to follow ******
          </div>

          <!-- Signature Section - Dynamic based on judges -->
          <div 
            v-for="(row, rowIndex) in signatureRows" 
            :key="rowIndex" 
            class="grid gap-8 text-center"
            :class="[rowIndex === 0 ? 'mt-8' : 'mt-6']"
            :style="{ gridTemplateColumns: `repeat(${Math.min(row.length, 3)}, minmax(0, 1fr))` }"
          >
            <div v-for="judge in row" :key="judge.id">
              <div class="border-b border-gray-400 pb-1 mb-1">________________________</div>
              <p class="text-xs text-gray-500 italic">Signature Over Printed Name</p>
              <p class="text-xs text-gray-600 font-medium">{{ judge.name || `JUDGE #${judge.chair_number}` }}</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="mt-8 pt-4 border-t border-gray-200 text-center">
            <a href="#" class="text-gray-700 tracking-wide">{{ footerSettings.website }}</a>
            <p class="text-xs text-gray-400 mt-2">
              {{ footerSettings.line1 }}<br>
              {{ footerSettings.line2 }}<br>
              {{ footerSettings.line3 }}<br>
              {{ footerSettings.line4 }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Settings Panel (collapsible) -->
    <div id="footer-settings-panel" class="max-w-4xl mx-auto mt-6 no-print">
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <button 
          @click="showFooterSettings = !showFooterSettings"
          class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
        >
          <div class="flex items-center gap-2">
            <Settings :size="16" class="text-gray-500" />
            <span class="text-sm font-medium text-gray-700">Footer Settings</span>
          </div>
          <ChevronDown :size="16" :class="['text-gray-400 transition-transform', showFooterSettings ? 'rotate-180' : '']" />
        </button>
        
        <div v-if="showFooterSettings" class="px-4 py-4 border-t border-gray-100 space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Website URL</label>
            <input 
              v-model="footerSettings.website" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="www.example.com"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Line 1 (e.g., Computer Generated Result)</label>
            <input 
              v-model="footerSettings.line1" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Line 2 (e.g., Developed by)</label>
            <input 
              v-model="footerSettings.line2" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Line 3 (e.g., Inquiry text)</label>
            <input 
              v-model="footerSettings.line3" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Line 4 (e.g., Contact info)</label>
            <input 
              v-model="footerSettings.line4" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div class="flex justify-end pt-2">
            <button 
              @click="resetFooterSettings"
              class="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
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
import { ref, computed, watch, onMounted } from 'vue';
import { Printer, FileText, Download, X, Settings, ChevronDown } from 'lucide-vue-next';
import { useTour } from '../../../composables/useTour';
import TourTooltip from '../../shared/TourTooltip.vue';
import HelpButton from '../../shared/HelpButton.vue';

// Tour steps for Printing Zone
const tourSteps = [
  {
    target: '#round-selector',
    title: 'Select Round',
    content: 'Choose which round\'s results you want to print. The table will update automatically.',
    placement: 'bottom'
  },
  {
    target: '#print-preview',
    title: 'Print Preview',
    content: 'This is a live preview of how your printed results will look. It includes logos, scores table, winner section, and signatures.',
    placement: 'top'
  },
  {
    target: '#winner-section',
    title: 'Winner Section',
    content: 'Shows the winner(s) based on highest average score. If there\'s a tie, click on names to exclude/include them from the print.',
    placement: 'top'
  },
  {
    target: '#print-btn',
    title: 'Print Results',
    content: 'Opens the print dialog to print the results sheet directly.',
    placement: 'bottom'
  },
  {
    target: '#export-pdf-btn',
    title: 'Export as PDF',
    content: 'Opens print dialog where you can choose "Save as PDF" to export the results.',
    placement: 'bottom'
  },
  {
    target: '#footer-settings-panel',
    title: 'Footer Settings',
    content: 'Customize the footer text that appears on printed results - website, developer info, and contact details.',
    placement: 'top'
  }
];

const tour = useTour('printing-zone-tab', tourSteps);

const startTour = () => {
  tour.startTour();
};

const props = defineProps({
  eventId: [Number, String],
  event: Object,
  candidates: Array,
  rounds: Array,
  judges: Array,
  criteria: Array,
  activeRound: Object
});

const selectedRound = ref('');
const topFilter = ref('all');
const allScores = ref([]);
const printArea = ref(null);
const excludedWinners = ref(new Set());
const showFooterSettings = ref(false);

// Footer settings with defaults
const defaultFooterSettings = {
  website: 'www.tcc.edu.ph',
  line1: '`Computer Generated Result`',
  line2: 'Tabulation was developed by: College of Information Technology',
  line3: 'For Any Computerized Software Inquiry',
  line4: 'Contact Me +(63) 9758669139 | cwrkent@gmail.com'
};

const footerSettings = ref({ ...defaultFooterSettings });

// Load footer settings from localStorage
const loadFooterSettings = () => {
  const saved = localStorage.getItem('printFooterSettings');
  if (saved) {
    try {
      footerSettings.value = { ...defaultFooterSettings, ...JSON.parse(saved) };
    } catch (e) {
      footerSettings.value = { ...defaultFooterSettings };
    }
  }
};

// Save footer settings to localStorage
const saveFooterSettings = () => {
  localStorage.setItem('printFooterSettings', JSON.stringify(footerSettings.value));
};

// Reset footer settings to default
const resetFooterSettings = () => {
  footerSettings.value = { ...defaultFooterSettings };
  saveFooterSettings();
};

// Watch for changes and auto-save
watch(footerSettings, saveFooterSettings, { deep: true });

// Auto-select active round when it changes
watch(() => props.activeRound, (newRound) => {
  if (newRound?.id && !selectedRound.value) {
    selectedRound.value = newRound.id;
  }
}, { immediate: true });

// Reset excluded winners when round changes
watch(selectedRound, () => {
  excludedWinners.value = new Set();
});

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const selectedRoundName = computed(() => {
  if (!selectedRound.value) return '';
  const round = props.rounds?.find(r => r.id == selectedRound.value);
  return round?.name || '';
});

// Get sorted judges by chair number
const sortedJudges = computed(() => {
  if (!props.judges) return [];
  return [...props.judges].sort((a, b) => (a.chair_number || 0) - (b.chair_number || 0));
});

// Calculate results with averages per judge
const sortedResults = computed(() => {
  if (!props.candidates || !allScores.value.length) return [];
  
  const roundScores = allScores.value.filter(s => s.round_id == selectedRound.value);
  
  let results = props.candidates.map(candidate => {
    const candidateScores = roundScores.filter(s => s.candidate_id == candidate.id);
    
    const judgeScores = {};
    sortedJudges.value.forEach(judge => {
      const judgePoints = candidateScores
        .filter(s => s.judge_id == judge.id)
        .reduce((sum, s) => sum + (parseFloat(s.points) || 0), 0);
      judgeScores[judge.id] = judgePoints;
    });
    
    const scoredJudges = Object.values(judgeScores).filter(s => s > 0);
    const total = scoredJudges.reduce((sum, s) => sum + s, 0);
    const average = scoredJudges.length > 0 ? total / scoredJudges.length : 0;
    
    return {
      id: candidate.id,
      number: candidate.number,
      name: candidate.name,
      average,
      judgeScores
    };
  }).filter(c => c.average > 0).sort((a, b) => b.average - a.average);
  
  // Apply top filter
  if (topFilter.value !== 'all') {
    const limit = parseInt(topFilter.value);
    results = results.slice(0, limit);
  }
  
  return results;
});

// Get all winners (including ties)
const displayedWinners = computed(() => {
  if (!sortedResults.value.length) return [];
  const topScore = sortedResults.value[0].average;
  return sortedResults.value.filter(c => c.average === topScore);
});

// Toggle winner exclusion
const toggleWinnerExclusion = (id) => {
  if (displayedWinners.value.length <= 1) return;
  const newSet = new Set(excludedWinners.value);
  if (newSet.has(id)) {
    newSet.delete(id);
  } else {
    // Don't allow excluding all winners
    const remaining = displayedWinners.value.filter(w => !newSet.has(w.id) && w.id !== id);
    if (remaining.length > 0) {
      newSet.add(id);
    }
  }
  excludedWinners.value = newSet;
};

// Chunk judges into rows of 3 for signature section
const signatureRows = computed(() => {
  const judges = sortedJudges.value;
  if (!judges.length) return [];
  
  const rows = [];
  for (let i = 0; i < judges.length; i += 3) {
    rows.push(judges.slice(i, i + 3));
  }
  return rows;
});

const getJudgeScore = (candidateId, judgeId) => {
  const candidate = sortedResults.value.find(c => c.id === candidateId);
  return candidate?.judgeScores?.[judgeId] || 0;
};

const formatScore = (score) => {
  return (score || 0).toFixed(2);
};

const fetchScores = async () => {
  if (!props.eventId) return;
  
  try {
    const res = await fetch(`/api/points?event_id=${props.eventId}`);
    const data = await res.json();
    allScores.value = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Failed to fetch scores', e);
    allScores.value = [];
  }
};

const getPrintStyles = () => `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .font-bold { font-weight: bold; }
  .font-semibold { font-weight: 600; }
  .font-medium { font-weight: 500; }
  .italic { font-style: italic; }
  .underline { text-decoration: underline; }
  .uppercase { text-transform: uppercase; }
  .text-xl { font-size: 1.25rem; }
  .text-lg { font-size: 1.125rem; }
  .text-sm { font-size: 0.875rem; }
  .text-xs { font-size: 0.75rem; }
  .text-gray-400 { color: #9ca3af; }
  .text-gray-500 { color: #6b7280; }
  .text-gray-600 { color: #4b5563; }
  .text-gray-700 { color: #374151; }
  .text-gray-800 { color: #1f2937; }
  .text-red-600 { color: #dc2626; }
  .bg-gray-50 { background-color: #f9fafb; }
  .bg-red-600 { background-color: #dc2626; }
  .bg-gray-400 { background-color: #9ca3af; }
  .text-white { color: white; }
  .mt-1 { margin-top: 0.25rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-6 { margin-top: 1.5rem; }
  .mt-8 { margin-top: 2rem; }
  .mb-1 { margin-bottom: 0.25rem; }
  .mb-4 { margin-bottom: 1rem; }
  .ml-2 { margin-left: 0.5rem; }
  .mx-1 { margin-left: 0.25rem; margin-right: 0.25rem; }
  .p-4 { padding: 1rem; }
  .p-6 { padding: 1.5rem; }
  .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
  .px-4 { padding-left: 1rem; padding-right: 1rem; }
  .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
  .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
  .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
  .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
  .pt-4 { padding-top: 1rem; }
  .pb-1 { padding-bottom: 0.25rem; }
  .gap-4 { gap: 1rem; }
  .gap-8 { gap: 2rem; }
  .rounded { border-radius: 0.25rem; }
  .rounded-lg { border-radius: 0.5rem; }
  .border { border: 1px solid #e5e7eb; }
  .border-b { border-bottom: 1px solid #e5e7eb; }
  .border-t { border-top: 1px solid #e5e7eb; }
  .border-gray-100 { border-color: #f3f4f6; }
  .border-gray-200 { border-color: #e5e7eb; }
  .border-gray-400 { border-color: #9ca3af; }
  .flex { display: flex; }
  .inline-flex { display: inline-flex; }
  .grid { display: grid; }
  .justify-center { justify-content: center; }
  .items-center { align-items: center; }
  .w-full { width: 100%; }
  .line-through { text-decoration: line-through; }
  .opacity-50 { opacity: 0.5; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #e5e7eb; padding: 8px 12px; }
  th { background-color: #f9fafb; }
  img { height: 56px; }
  .no-print, .group-hover\\:opacity-100 { display: none !important; }
  @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
`;

const getFilteredContent = () => {
  const printContent = printArea.value;
  if (!printContent) return '';
  
  // Clone the content
  const clone = printContent.cloneNode(true);
  
  // Rebuild winner section for print (inline on same line)
  const winnerSection = clone.querySelector('.bg-gray-50.rounded-lg');
  if (winnerSection) {
    const activeWinners = displayedWinners.value.filter(w => !excludedWinners.value.has(w.id));
    const winnerHtml = activeWinners.map((w, idx) => 
      `<span style="background:#dc2626;color:white;padding:2px 8px;border-radius:4px;font-size:14px;margin:0 4px;">${w.number}</span><span style="font-weight:600;text-transform:uppercase;text-decoration:underline;">${w.name}</span>${idx < activeWinners.length - 1 ? ' <span style="color:#6b7280;margin:0 4px;">&</span>' : ''}`
    ).join('');
    
    winnerSection.innerHTML = `<p style="color:#374151;white-space:nowrap;">
      <span style="font-weight:bold;">${activeWinners.length > 1 ? 'TIED WINNERS:' : 'WINNER:'}</span>
      ${winnerHtml}
    </p>`;
  }
  
  // Remove no-print elements
  clone.querySelectorAll('.no-print').forEach(el => el.remove());
  
  return clone.innerHTML;
};

const generatePrint = () => {
  const content = getFilteredContent();
  if (!content) return;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print Results - ${props.event?.title || 'Event'}</title>
      <style>${getPrintStyles()}</style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

const exportPDF = () => {
  // Use print dialog with "Save as PDF" option
  const content = getFilteredContent();
  if (!content) return;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${props.event?.title || 'Event'} - ${selectedRoundName.value} Results</title>
      <style>${getPrintStyles()}</style>
    </head>
    <body>
      ${content}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      <\/script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

onMounted(() => {
  fetchScores();
  loadFooterSettings();
});
</script>

<style>
@media print {
  .no-print {
    display: none !important;
  }
  
  table {
    font-size: 11px;
  }
  
  tr:hover {
    background: transparent !important;
  }
}
</style>
