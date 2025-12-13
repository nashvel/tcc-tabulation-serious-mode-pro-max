<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Certificates</h1>
          <p class="text-sm text-gray-500 mt-1">Generate and print certificates for winners</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="printCertificate"
            class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Printer class="w-4 h-4" />
            Print Certificate
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Certificate Editor Panel -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Certificate Details</h3>
            
            <!-- Certificate Type -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Certificate Type</label>
              <select v-model="certificateType" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="achievement">Certificate of Achievement</option>
                <option value="recognition">Certificate of Recognition</option>
                <option value="participation">Certificate of Participation</option>
                <option value="excellence">Certificate of Excellence</option>
              </select>
            </div>

            <!-- Recipient Name -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
              <input
                v-model="recipientName"
                type="text"
                placeholder="Enter recipient name"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <!-- Award Title -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Award Title</label>
              <input
                v-model="awardTitle"
                type="text"
                placeholder="e.g., Best in Sports Attire"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <!-- Description -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="description"
                rows="3"
                placeholder="Certificate description..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>

            <!-- Event Name -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
              <input
                v-model="eventName"
                type="text"
                placeholder="e.g., TCC Intramurals 2025"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <!-- Date -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                v-model="certificateDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <!-- Signatory Name -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Signatory Name</label>
              <input
                v-model="signatoryName"
                type="text"
                placeholder="e.g., Dr. Juan Dela Cruz"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <!-- Signatory Title -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Signatory Title</label>
              <input
                v-model="signatoryTitle"
                type="text"
                placeholder="e.g., Event Director"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <!-- Quick Select from Results -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Select Winner</h3>
            <p class="text-sm text-gray-500 mb-4">Select a winner from results to auto-fill</p>
            
            <select 
              v-model="selectedWinner"
              @change="fillFromWinner"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Select a winner --</option>
              <option v-for="candidate in rankedCandidates" :key="candidate.id" :value="candidate.id">
                #{{ candidate.rank }} - {{ candidate.name }} ({{ candidate.total.toFixed(2) }} pts)
              </option>
            </select>
          </div>
        </div>

        <!-- Certificate Preview -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-auto">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Certificate Preview</h3>
            
            <!-- Certificate Template - Scaled to fit -->
            <div class="flex justify-center">
              <div 
                ref="certificateRef"
                class="relative bg-white border-8 border-double border-gray-300 flex-shrink-0"
                style="width: 700px; height: 500px; background: linear-gradient(135deg, #fff 60%, #f8f4f0 100%);"
              >
              <!-- Decorative Corner - Top Left -->
              <div class="absolute top-0 left-0 w-24 h-24 overflow-hidden">
                <div class="absolute -top-12 -left-12 w-36 h-36 bg-gradient-to-br from-amber-400 to-amber-600 transform rotate-45"></div>
              </div>
              
              <!-- Decorative Wave - Left Side -->
              <div class="absolute left-0 top-0 bottom-0 w-20 overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-r from-rose-800 to-rose-700" style="clip-path: ellipse(100% 50% at 0% 50%);"></div>
              </div>

              <!-- Gold Seal -->
              <div class="absolute bottom-12 left-8 w-16 h-16">
                <div class="w-full h-full rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 shadow-lg flex items-center justify-center border-3 border-amber-500">
                  <div class="text-center">
                    <Award class="w-6 h-6 text-amber-800 mx-auto" />
                  </div>
                </div>
              </div>

              <!-- Certificate Content -->
              <div class="absolute inset-0 flex flex-col items-center justify-center pl-24 pr-8 py-8">
                <!-- Title -->
                <h1 class="text-3xl font-light tracking-[0.3em] text-gray-800 mb-1">CERTIFICATE</h1>
                <p class="text-xs tracking-[0.2em] text-gray-600 mb-6">OF {{ certificateTypeLabel }}</p>

                <!-- Recipient Name -->
                <p class="text-3xl font-script text-gray-800 mb-4 italic" style="font-family: 'Georgia', serif;">
                  {{ recipientName || 'Recipient Name' }}
                </p>

                <!-- Description -->
                <p class="text-xs text-gray-600 text-center max-w-md leading-relaxed mb-6">
                  {{ description || 'This certificate is awarded in recognition of outstanding achievement and dedication.' }}
                </p>

                <!-- Award Title -->
                <div v-if="awardTitle" class="mb-4">
                  <p class="text-base font-semibold text-rose-800 tracking-wide">{{ awardTitle }}</p>
                </div>

                <!-- Event Name -->
                <p v-if="eventName" class="text-xs text-gray-600 mb-6">{{ eventName }}</p>

                <!-- Date and Signature -->
                <div class="flex items-end justify-center gap-16 mt-auto">
                  <div class="text-center">
                    <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Date</p>
                    <p class="text-xs font-medium text-gray-800 border-t border-gray-400 pt-1 px-6">
                      {{ formattedDate }}
                    </p>
                  </div>
                  <div class="text-center">
                    <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Signature</p>
                    <div class="border-t border-gray-400 pt-1 px-6">
                      <p class="text-xs font-medium text-gray-800">{{ signatoryName || '_______________' }}</p>
                      <p class="text-[10px] text-gray-500">{{ signatoryTitle }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Border Frame -->
              <div class="absolute inset-3 border border-gray-300 pointer-events-none"></div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Printer, Award } from 'lucide-vue-next';
import { showSuccess, showError } from '../../utils/alerts';

// Certificate data
const certificateType = ref('achievement');
const recipientName = ref('');
const awardTitle = ref('');
const description = ref('This certificate is proudly presented in recognition of exceptional performance and outstanding achievement during the competition.');
const eventName = ref('TCC Intramurals 2025');
const certificateDate = ref(new Date().toISOString().split('T')[0]);
const signatoryName = ref('');
const signatoryTitle = ref('Event Director');
const selectedWinner = ref('');
const certificateRef = ref(null);

// Candidates data
const candidates = ref([]);
const scores = ref([]);

const certificateTypeLabel = computed(() => {
  const types = {
    achievement: 'ACHIEVEMENT',
    recognition: 'RECOGNITION',
    participation: 'PARTICIPATION',
    excellence: 'EXCELLENCE'
  };
  return types[certificateType.value] || 'ACHIEVEMENT';
});

const formattedDate = computed(() => {
  if (!certificateDate.value) return '';
  const date = new Date(certificateDate.value);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
});

const rankedCandidates = computed(() => {
  return candidates.value
    .map((candidate, index) => {
      const candidateScores = scores.value.filter(s => s.candidate_id === candidate.id);
      const total = candidateScores.reduce((sum, s) => sum + (parseFloat(s.points) || 0), 0);
      return { ...candidate, total, rank: 0 };
    })
    .sort((a, b) => b.total - a.total)
    .map((c, i) => ({ ...c, rank: i + 1 }));
});

const fillFromWinner = () => {
  const winner = rankedCandidates.value.find(c => c.id === parseInt(selectedWinner.value));
  if (winner) {
    recipientName.value = winner.name;
    const rankSuffix = winner.rank === 1 ? '1st Place' : winner.rank === 2 ? '2nd Place' : winner.rank === 3 ? '3rd Place' : `${winner.rank}th Place`;
    awardTitle.value = rankSuffix;
  }
};

const printCertificate = () => {
  const printContent = certificateRef.value;
  if (!printContent) return;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Certificate - ${recipientName.value}</title>
      <script src="https://cdn.tailwindcss.com"><\/script>
      <style>
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        @media print {
          body { margin: 0; padding: 0; }
          @page { size: landscape; margin: 0.5cm; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
        body { 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          min-height: 100vh;
          background: white;
        }
      </style>
    </head>
    <body>
      ${printContent.outerHTML}
      <script>
        setTimeout(() => { window.print(); window.close(); }, 500);
      <\/script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

const loadData = async () => {
  try {
    // Get event from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event_id') || 1;

    const [candidatesRes, scoresRes] = await Promise.all([
      fetch(`/api/candidates?event_id=${eventId}`).then(r => r.json()),
      fetch(`/api/points?event_id=${eventId}`).then(r => r.json())
    ]);

    candidates.value = Array.isArray(candidatesRes) ? candidatesRes : candidatesRes.data || [];
    scores.value = Array.isArray(scoresRes) ? scoresRes : scoresRes.data || [];
  } catch (error) {
    console.error('Failed to load data:', error);
  }
};

onMounted(() => {
  loadData();
});
</script>
