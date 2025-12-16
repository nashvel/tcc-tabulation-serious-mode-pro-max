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

            <!-- Round Selector -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Round</label>
              <select 
                v-model="selectedRound" 
                @change="updateTopOne"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Rounds</option>
                <option v-for="round in rounds" :key="round.id" :value="round.id">
                  {{ round.name }}
                </option>
              </select>
            </div>

            <!-- Category Type Selector -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                v-model="selectedCategory" 
                @change="updateTopOne"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Select Category --</option>
                <option v-if="hasFemale" value="female">Female</option>
                <option v-if="hasMale" value="male">Male</option>
                <option v-if="hasGroup" value="group">Group / Team</option>
                <option v-if="hasSolo" value="solo">Solo / Individual</option>
              </select>
              <p v-if="selectedCategory && topOneInCategory" class="text-xs text-green-600 mt-1">
                Top 1: {{ topOneInCategory.name }} ({{ topOneInCategory.total.toFixed(2) }} pts)
              </p>
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
              <div class="relative">
                <select
                  v-model="selectedSignatoryPerson"
                  @change="onSignatoryPersonChange"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                >
                  <option value="">-- Select from event setup or type custom --</option>
                  <option v-for="person in importantPeople" :key="person.id" :value="person.id">
                    {{ person.name }} ({{ person.position }})
                  </option>
                  <option value="custom">Custom...</option>
                </select>
                <input
                  v-if="selectedSignatoryPerson === 'custom' || !selectedSignatoryPerson"
                  v-model="signatoryName"
                  type="text"
                  placeholder="e.g., Dr. Juan Dela Cruz"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <!-- Signatory Title -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Signatory Title</label>
              <div class="relative">
                <select
                  v-model="selectedSignatoryTitle"
                  @change="onSignatoryTitleChange"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                >
                  <option value="">-- Select from event setup or type custom --</option>
                  <option v-for="position in uniquePositions" :key="position" :value="position">
                    {{ position }}
                  </option>
                  <option value="custom">Custom...</option>
                </select>
                <input
                  v-if="selectedSignatoryTitle === 'custom' || !selectedSignatoryTitle"
                  v-model="signatoryTitle"
                  type="text"
                  placeholder="e.g., Event Director"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
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
                <div class="flex items-start justify-center gap-20 mt-auto w-full">
                  <div class="text-center min-w-[140px]">
                    <div class="border-t border-gray-400 pt-1 px-4 mb-1">
                      <p class="text-xs font-medium text-gray-800">
                        {{ formattedDate }}
                      </p>
                    </div>
                    <p class="text-[10px] text-gray-500 uppercase tracking-wider">Date</p>
                  </div>
                  <div class="text-center min-w-[140px]">
                    <div class="border-t border-gray-400 pt-1 px-4 mb-1">
                      <p class="text-xs font-medium text-gray-800">{{ signatoryName || '_______________' }}</p>
                      <p class="text-[10px] text-gray-500">{{ signatoryTitle }}</p>
                    </div>
                    <p class="text-[10px] text-gray-500 uppercase tracking-wider">Signature</p>
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
const selectedRound = ref('');
const selectedCategory = ref('');
const certificateRef = ref(null);
const selectedSignatoryPerson = ref('');
const selectedSignatoryTitle = ref('');

// Data
const candidates = ref([]);
const scores = ref([]);
const rounds = ref([]);
const event = ref(null);
const importantPeople = ref([]);

// Computed: unique positions from important people
const uniquePositions = computed(() => {
  const positions = importantPeople.value.map(p => p.position).filter(Boolean);
  return [...new Set(positions)];
});

// Handle signatory person selection
const onSignatoryPersonChange = () => {
  if (selectedSignatoryPerson.value && selectedSignatoryPerson.value !== 'custom') {
    const person = importantPeople.value.find(p => p.id === parseInt(selectedSignatoryPerson.value));
    if (person) {
      signatoryName.value = person.name;
      // Also set the title/position if available
      if (person.position) {
        signatoryTitle.value = person.position;
        selectedSignatoryTitle.value = person.position;
      }
    }
  } else if (selectedSignatoryPerson.value === 'custom') {
    signatoryName.value = '';
  }
};

// Handle signatory title selection
const onSignatoryTitleChange = () => {
  if (selectedSignatoryTitle.value && selectedSignatoryTitle.value !== 'custom') {
    signatoryTitle.value = selectedSignatoryTitle.value;
  } else if (selectedSignatoryTitle.value === 'custom') {
    signatoryTitle.value = '';
  }
};

// Calculate result for a candidate (filtered by selected round)
const calculateResult = (candidate) => {
  let candidateScores = scores.value.filter(s => s.candidate_id == candidate.id);
  
  // Filter by round if selected
  if (selectedRound.value) {
    candidateScores = candidateScores.filter(s => s.round_id == selectedRound.value);
  }
  
  const rawTotal = candidateScores.reduce((sum, s) => sum + (parseFloat(s.points) || 0), 0);
  const judgeIds = [...new Set(candidateScores.map(s => s.judge_id))];
  const judgeCount = judgeIds.length || 1;
  const average = rawTotal / judgeCount;
  return { ...candidate, total: average, average, rawTotal };
};

// Check if categories have candidates (based on actual gender values in data)
const hasFemale = computed(() => candidates.value.some(c => c.gender?.toLowerCase() === 'female'));
const hasMale = computed(() => candidates.value.some(c => c.gender?.toLowerCase() === 'male'));
const hasGroup = computed(() => {
  // Show group if any candidate has group gender or group/team participant_type
  return candidates.value.some(c => {
    const gender = c.gender?.toLowerCase();
    const pType = c.participant_type?.toLowerCase();
    return gender === 'group' || pType === 'group' || pType === 'team';
  });
});
const hasSolo = computed(() => {
  // Only show solo category if:
  // 1. Event is NOT a pageant (no male/female candidates)
  // 2. Candidates have solo/individual gender or participant_type
  const hasMaleFemale = hasFemale.value || hasMale.value;
  if (hasMaleFemale) return false; // Don't show solo for pageant events
  
  return candidates.value.some(c => {
    const gender = c.gender?.toLowerCase();
    const pType = c.participant_type?.toLowerCase();
    return gender === 'solo' || pType === 'solo' || pType === 'individual';
  });
});

// Category results (filtered by round)
const femaleResults = computed(() => {
  const females = candidates.value.filter(c => c.gender?.toLowerCase() === 'female');
  return females.map(calculateResult).sort((a, b) => b.total - a.total);
});

const maleResults = computed(() => {
  const males = candidates.value.filter(c => c.gender?.toLowerCase() === 'male');
  return males.map(calculateResult).sort((a, b) => b.total - a.total);
});

const groupResults = computed(() => {
  const groups = candidates.value.filter(c => 
    c.gender?.toLowerCase() === 'group' || c.participant_type?.toLowerCase() === 'group'
  );
  return groups.map(calculateResult).sort((a, b) => b.total - a.total);
});

const soloResults = computed(() => {
  const solos = candidates.value.filter(c => 
    c.gender?.toLowerCase() === 'solo' || 
    c.participant_type?.toLowerCase() === 'solo' ||
    c.participant_type?.toLowerCase() === 'individual'
  );
  return solos.map(calculateResult).sort((a, b) => b.total - a.total);
});

// Get top 1 in selected category
const topOneInCategory = computed(() => {
  if (!selectedCategory.value) return null;
  
  let results = [];
  switch (selectedCategory.value) {
    case 'female': results = femaleResults.value; break;
    case 'male': results = maleResults.value; break;
    case 'group': results = groupResults.value; break;
    case 'solo': results = soloResults.value; break;
  }
  
  return results.length > 0 ? results[0] : null;
});

// Update top one and fill recipient name
const updateTopOne = () => {
  const top1 = topOneInCategory.value;
  if (top1) {
    recipientName.value = top1.name;
    
    // Build award title
    const roundName = selectedRound.value 
      ? rounds.value.find(r => r.id == selectedRound.value)?.name || ''
      : '';
    const categoryLabel = getCategoryLabel(selectedCategory.value);
    
    if (roundName && categoryLabel) {
      awardTitle.value = `1st Place - ${categoryLabel} (${roundName})`;
    } else if (categoryLabel) {
      awardTitle.value = `1st Place - ${categoryLabel}`;
    } else if (roundName) {
      awardTitle.value = `1st Place - ${roundName}`;
    }
  }
};

const getCategoryLabel = (category) => {
  const labels = { female: 'Female', male: 'Male', group: 'Group/Team', solo: 'Solo' };
  return labels[category] || category;
};

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

    const [eventRes, candidatesRes, scoresRes, roundsRes] = await Promise.all([
      fetch(`/api/events/${eventId}`).then(r => r.json()),
      fetch(`/api/candidates?event_id=${eventId}`).then(r => r.json()),
      fetch(`/api/points?event_id=${eventId}`).then(r => r.json()),
      fetch(`/api/rounds?event_id=${eventId}`).then(r => r.json())
    ]);

    event.value = eventRes;
    candidates.value = Array.isArray(candidatesRes) ? candidatesRes : candidatesRes.data || [];
    scores.value = Array.isArray(scoresRes) ? scoresRes : scoresRes.data || [];
    rounds.value = Array.isArray(roundsRes) ? roundsRes : roundsRes.data || [];
    
    // Load important people from event response
    importantPeople.value = eventRes.important_people || [];
    
    // Auto-fill event name from fetched event
    if (event.value?.title) {
      eventName.value = event.value.title;
    }
    
    // Auto-select first important person as signatory if available
    if (importantPeople.value.length > 0) {
      const firstPerson = importantPeople.value[0];
      selectedSignatoryPerson.value = firstPerson.id;
      signatoryName.value = firstPerson.name;
      if (firstPerson.position) {
        signatoryTitle.value = firstPerson.position;
        selectedSignatoryTitle.value = firstPerson.position;
      }
    }
  } catch (error) {
    console.error('Failed to load data:', error);
  }
};

onMounted(() => {
  loadData();
});
</script>
