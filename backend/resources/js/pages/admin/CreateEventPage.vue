<template>
  <div class="min-h-screen bg-white font-sans antialiased pb-20">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-3xl mx-auto px-6 py-4">
        <div class="flex items-center gap-3">
          <button @click="goBack" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft :size="20" class="text-gray-600" />
          </button>
          <div>
            <h1 class="text-xl font-bold text-gray-900">Create New Event</h1>
            <p class="text-sm text-gray-500">{{ selectedTemplate ? 'Using template' : 'Step ' + currentStep + ' of 4' }}</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Template Selection Banner (if not selected) -->
    <div v-if="!selectedTemplate && currentStep === 1 && templates.length > 0" class="bg-indigo-50 border-b border-indigo-100">
      <div class="max-w-3xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <FileText :size="20" class="text-indigo-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-indigo-900">Start with a template?</p>
              <p class="text-xs text-indigo-600">Pre-configured events to get you started quickly</p>
            </div>
          </div>
          <button @click="showTemplateModal = true" class="px-4 py-2 text-sm font-medium text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
            Browse Templates
          </button>
        </div>
      </div>
    </div>

    <!-- Selected Template Banner -->
    <div v-if="selectedTemplate" class="bg-green-50 border-b border-green-100">
      <div class="max-w-3xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Check :size="20" class="text-green-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-green-900">Using: {{ selectedTemplate.name }}</p>
              <p class="text-xs text-green-600">{{ selectedTemplate.participants?.length || 0 }} participants, {{ selectedTemplate.rounds?.length || 0 }} rounds</p>
            </div>
          </div>
          <button @click="clearTemplate" class="px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 rounded-lg transition-colors">
            Change
          </button>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-3xl mx-auto px-6 py-3">
        <div class="flex items-center gap-2">
          <template v-for="step in steps" :key="step.id">
            <div class="flex items-center gap-2 flex-1 cursor-pointer" @click="goToStep(step.id)">
              <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                currentStep >= step.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300']">
                {{ step.id }}
              </div>
              <span :class="['text-xs font-medium hidden sm:block', currentStep >= step.id ? 'text-gray-900' : 'text-gray-400']">
                {{ step.label }}
              </span>
            </div>
            <div v-if="step.id < 4" :class="['h-0.5 flex-1 transition-colors', currentStep > step.id ? 'bg-indigo-600' : 'bg-gray-200']"></div>
          </template>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-3xl mx-auto px-6 py-8">
      <!-- Step 1: Basic Info -->
      <div v-if="currentStep === 1" class="space-y-6">
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Event Title *</label>
              <input v-model="formData.title" type="text" required
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm"
                placeholder="e.g. Mr. & Ms. TCC 2025" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Event Date *</label>
                <input v-model="formData.event_date" type="date" required
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Event Type</label>
                <select v-model="formData.event_type"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm">
                  <option value="pageant">Pageant (Male/Female)</option>
                  <option value="solo_contest">Solo Contest</option>
                  <option value="group_contest">Group/Team Contest</option>
                  <option value="talent_show">Talent Show</option>
                  <option value="competition">Competition</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Number of Judges</label>
              <input v-model="formData.number_of_judges" type="number" min="1" max="20"
                class="w-32 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm"
                placeholder="5" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea v-model="formData.description" rows="3"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none text-sm"
                placeholder="Optional description..."></textarea>
            </div>

            <!-- Theme Selector -->
            <div v-if="themes.length > 0">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                <Palette :size="14" class="inline mr-1" /> Event Theme
              </label>
              <div class="grid grid-cols-3 gap-2">
                <button v-for="theme in themes" :key="theme.id" type="button"
                  @click="formData.theme_id = theme.id"
                  :class="['p-3 rounded-lg border-2 text-left transition-all', 
                    formData.theme_id === theme.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300']">
                  <div class="flex items-center gap-2 mb-1">
                    <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: theme.primary_color }"></div>
                    <span class="text-xs font-medium text-gray-900">{{ theme.name }}</span>
                  </div>
                  <div class="flex gap-1">
                    <div class="w-3 h-3 rounded" :style="{ backgroundColor: theme.primary_color }"></div>
                    <div class="w-3 h-3 rounded" :style="{ backgroundColor: theme.secondary_color }"></div>
                    <div class="w-3 h-3 rounded" :style="{ backgroundColor: theme.accent_color }"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Event Type Info Banner -->
        <div v-if="eventTypeInfo" class="flex items-center gap-3 p-4 rounded-xl border" :class="eventTypeInfo.borderClass">
          <div :class="['w-10 h-10 rounded-full flex items-center justify-center', eventTypeInfo.bgClass]">
            <component :is="eventTypeInfo.icon" :size="20" :class="eventTypeInfo.iconClass" />
          </div>
          <div>
            <p class="text-sm font-medium" :class="eventTypeInfo.textClass">{{ eventTypeInfo.title }}</p>
            <p class="text-xs text-gray-500">{{ eventTypeInfo.message }}</p>
          </div>
        </div>
      </div>

      <!-- Step 2: Participants -->
      <div v-if="currentStep === 2" class="space-y-6">
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Participants</h2>
            <button @click="addParticipant" class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
              <Plus :size="16" /> Add
            </button>
          </div>
          
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase w-20">#</th>
                <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase w-32">Type</th>
                <th class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase w-16"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(p, i) in formData.participants" :key="i" class="hover:bg-gray-50">
                <td class="py-2 px-4">
                  <input v-model="p.number" type="number" min="1"
                    class="w-16 px-2 py-1.5 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-indigo-500" />
                </td>
                <td class="py-2 px-4">
                  <input v-model="p.name" type="text" placeholder="Participant name"
                    class="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-indigo-500" />
                </td>
                <td class="py-2 px-4">
                  <select v-model="p.gender"
                    class="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-indigo-500">
                    <option v-for="opt in participantTypeOptions" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </td>
                <td class="py-2 px-4 text-center">
                  <button @click="removeParticipant(i)" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 :size="16" />
                  </button>
                </td>
              </tr>
              <tr v-if="!formData.participants.length">
                <td colspan="4" class="py-12 text-center">
                  <Users :size="32" class="text-gray-300 mx-auto mb-2" />
                  <p class="text-sm text-gray-500">No participants added yet</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Step 3: Rounds -->
      <div v-if="currentStep === 3" class="space-y-6">
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Rounds / Categories</h2>
            <button @click="addRound" class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
              <Plus :size="16" /> Add Round
            </button>
          </div>

          <div class="p-6 space-y-3">
            <div v-for="(round, ri) in formData.rounds" :key="ri" 
              class="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-600">
                  {{ ri + 1 }}
                </div>
                <input v-model="round.name" type="text" placeholder="Round name"
                  class="text-sm font-medium px-2 py-1 rounded-lg border border-gray-300 focus:ring-1 focus:ring-indigo-500" />
              </div>
              <button @click="removeRound(ri)" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 :size="16" />
              </button>
            </div>
            <div v-if="!formData.rounds.length" class="py-12 text-center">
              <Layers :size="32" class="text-gray-300 mx-auto mb-2" />
              <p class="text-sm text-gray-500">No rounds added yet</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4: Review -->
      <div v-if="currentStep === 4" class="space-y-6">
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Review & Create</h2>
          </div>
          
          <div class="divide-y divide-gray-100">
            <div class="p-6">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Event Details</div>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="flex items-center gap-2">
                  <span class="text-gray-500">Title:</span>
                  <span class="font-medium text-gray-900">{{ formData.title || '-' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-500">Date:</span>
                  <span class="font-medium text-gray-900">{{ formData.event_date || '-' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-500">Type:</span>
                  <span class="font-medium text-gray-900 capitalize">{{ formData.event_type.replace('_', ' ') }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-500">Judges:</span>
                  <span class="font-medium text-gray-900">{{ formData.number_of_judges }}</span>
                </div>
                <div v-if="selectedTheme" class="flex items-center gap-2 col-span-2">
                  <span class="text-gray-500">Theme:</span>
                  <span class="flex items-center gap-2 font-medium text-gray-900">
                    <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: selectedTheme.primary_color }"></span>
                    {{ selectedTheme.name }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="p-6">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Participants ({{ formData.participants.length }})
              </div>
              <div class="flex flex-wrap gap-2">
                <span v-for="p in formData.participants" :key="p.number" 
                  :class="['px-2.5 py-1 rounded-full text-xs font-medium', getTypeBadgeClass(p.gender)]">
                  {{ p.number }}. {{ p.name }}
                </span>
                <span v-if="!formData.participants.length" class="text-sm text-gray-400">None added</span>
              </div>
            </div>
            
            <div class="p-6">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Rounds ({{ formData.rounds.length }})
              </div>
              <div class="flex flex-wrap gap-2">
                <span v-for="(r, i) in formData.rounds" :key="r.name" 
                  class="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                  {{ i + 1 }}. {{ r.name }}
                </span>
                <span v-if="!formData.rounds.length" class="text-sm text-gray-400">None added</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer Navigation -->
    <footer class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div class="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <button v-if="currentStep > 1" @click="prevStep"
          class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft :size="16" /> Back
        </button>
        <div v-else></div>
        
        <button v-if="currentStep < 4" @click="nextStep"
          class="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
          Next <ArrowRight :size="16" />
        </button>
        <button v-else @click="createEvent" :disabled="creating"
          class="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm disabled:opacity-50">
          <Loader2 v-if="creating" :size="16" class="animate-spin" />
          <Check v-else :size="16" />
          {{ creating ? 'Creating...' : 'Create Event' }}
        </button>
      </div>
    </footer>

    <!-- Template Selection Modal -->
    <div v-if="showTemplateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Choose a Template</h2>
          <button @click="showTemplateModal = false" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X :size="20" class="text-gray-500" />
          </button>
        </div>
        <div class="p-6 max-h-[60vh] overflow-y-auto">
          <div v-if="templates.length === 0" class="py-12 text-center">
            <FileText :size="40" class="text-gray-300 mx-auto mb-3" />
            <p class="text-sm text-gray-500">No templates available</p>
          </div>
          <div v-else class="grid grid-cols-2 gap-4">
            <div v-for="template in templates" :key="template.id"
              @click="applyTemplate(template)"
              class="p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-all">
              <h4 class="font-semibold text-gray-900 mb-1">{{ template.name }}</h4>
              <p class="text-xs text-gray-500 mb-3 line-clamp-2">{{ template.description }}</p>
              <div class="flex items-center gap-3 text-xs text-gray-600">
                <span class="flex items-center gap-1"><Users :size="12" /> {{ template.participants?.length || 0 }}</span>
                <span class="flex items-center gap-1"><Layers :size="12" /> {{ template.rounds?.length || 0 }} rounds</span>
                <span class="px-2 py-0.5 bg-gray-100 rounded text-gray-600 capitalize">{{ template.event_type?.replace('_', ' ') }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 border-t border-gray-200 bg-gray-50 text-center">
          <button @click="showTemplateModal = false" class="text-sm text-gray-500 hover:text-gray-700">
            Skip and create from scratch
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowLeft, ArrowRight, Plus, Trash2, Check, Loader2, Users, User, UsersRound, Layers, FileText, X, Palette } from 'lucide-vue-next';
import { showSuccess, showError } from '../../utils/alerts';

const router = useRouter();
const route = useRoute();
const currentStep = ref(1);
const creating = ref(false);

// Templates & Themes
const templates = ref([]);
const themes = ref([]);
const selectedTemplate = ref(null);
const showTemplateModal = ref(false);

const steps = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Participants' },
  { id: 3, label: 'Rounds' },
  { id: 4, label: 'Review' }
];

const formData = ref({
  title: '',
  event_date: '',
  event_type: 'pageant',
  number_of_judges: 5,
  description: '',
  theme_id: null,
  participants: [],
  rounds: []
});

// Update URL when step changes
const updateStepUrl = (step) => {
  router.replace({ path: '/create-event', query: { step } });
};

// Fetch templates and themes
const fetchTemplates = async () => {
  try {
    const res = await fetch('/api/event-templates');
    if (res.ok) templates.value = await res.json();
  } catch (e) { console.error('Failed to fetch templates', e); }
};

const fetchThemes = async () => {
  try {
    const res = await fetch('/api/event-themes');
    if (res.ok) themes.value = await res.json();
  } catch (e) { console.error('Failed to fetch themes', e); }
};

// Apply template to form
const applyTemplate = (template) => {
  selectedTemplate.value = template;
  formData.value.event_type = template.event_type;
  formData.value.number_of_judges = template.default_judges;
  formData.value.description = template.description || '';
  formData.value.theme_id = template.default_theme_id;
  
  // Copy participants
  formData.value.participants = (template.participants || []).map(p => ({
    number: p.number,
    name: p.name,
    gender: p.gender,
  }));
  
  // Copy rounds
  formData.value.rounds = (template.rounds || []).map(r => ({
    name: r.name,
    spot: r.spot,
    criteria: (r.criteria || []).map(c => ({ name: c.name, points: c.points }))
  }));
  
  showTemplateModal.value = false;
  showSuccess(`Template "${template.name}" applied!`);
};

const clearTemplate = () => {
  selectedTemplate.value = null;
  formData.value.participants = [];
  formData.value.rounds = [];
  formData.value.theme_id = null;
  showTemplateModal.value = true;
};

// Initialize step from URL on mount
onMounted(() => {
  const stepParam = route.query.step;
  if (stepParam) {
    const step = parseInt(stepParam);
    if (step >= 1 && step <= 4) {
      currentStep.value = step;
    }
  }
  fetchTemplates();
  fetchThemes();
});

// Dynamic participant type options based on event type
const participantTypeOptions = computed(() => {
  switch (formData.value.event_type) {
    case 'solo_contest': return ['Solo'];
    case 'group_contest': return ['Group'];
    case 'pageant': return ['Female', 'Male'];
    case 'talent_show':
    case 'competition': return ['Female', 'Male', 'Solo', 'Group'];
    default: return ['Female', 'Male', 'Solo', 'Group'];
  }
});

const defaultParticipantType = computed(() => {
  switch (formData.value.event_type) {
    case 'solo_contest': return 'Solo';
    case 'group_contest': return 'Group';
    default: return 'Female';
  }
});

const eventTypeInfo = computed(() => {
  switch (formData.value.event_type) {
    case 'pageant':
      return { title: 'Pageant', message: 'Participants separated by gender (Male/Female)', icon: Users, bgClass: 'bg-pink-100', iconClass: 'text-pink-600', textClass: 'text-pink-700', borderClass: 'border-pink-200' };
    case 'solo_contest':
      return { title: 'Solo Contest', message: 'All participants compete together (no gender separation)', icon: User, bgClass: 'bg-indigo-100', iconClass: 'text-indigo-600', textClass: 'text-indigo-700', borderClass: 'border-indigo-200' };
    case 'group_contest':
      return { title: 'Group Contest', message: 'Teams/groups compete together', icon: UsersRound, bgClass: 'bg-purple-100', iconClass: 'text-purple-600', textClass: 'text-purple-700', borderClass: 'border-purple-200' };
    default: return null;
  }
});

const selectedTheme = computed(() => {
  if (!formData.value.theme_id) return null;
  return themes.value.find(t => t.id === formData.value.theme_id);
});

const getTypeBadgeClass = (type) => {
  switch (type?.toLowerCase()) {
    case 'female': return 'bg-pink-100 text-pink-700';
    case 'male': return 'bg-blue-100 text-blue-700';
    case 'solo': return 'bg-indigo-100 text-indigo-700';
    case 'group': return 'bg-purple-100 text-purple-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const goBack = () => router.push('/setup');

const goToStep = (step) => {
  if (step >= 1 && step <= 4) {
    currentStep.value = step;
    updateStepUrl(step);
  }
};

const prevStep = () => { 
  if (currentStep.value > 1) {
    currentStep.value--;
    updateStepUrl(currentStep.value);
  }
};

const nextStep = () => { 
  if (currentStep.value < 4) {
    currentStep.value++;
    updateStepUrl(currentStep.value);
  }
};

const addParticipant = () => {
  const nextNum = formData.value.participants.length + 1;
  formData.value.participants.push({ number: nextNum, name: '', gender: defaultParticipantType.value });
};

const removeParticipant = (index) => formData.value.participants.splice(index, 1);

const addRound = () => {
  const nextSpot = formData.value.rounds.length + 1;
  formData.value.rounds.push({ name: `Round ${nextSpot}`, spot: nextSpot });
};

const removeRound = (index) => formData.value.rounds.splice(index, 1);

const createEvent = async () => {
  if (!formData.value.title || !formData.value.event_date) {
    showError('Please fill in required fields');
    return;
  }
  
  creating.value = true;
  try {
    const eventRes = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.value.title,
        event_date: formData.value.event_date,
        event_type: formData.value.event_type,
        number_of_judges: formData.value.number_of_judges,
        description: formData.value.description,
        theme_id: formData.value.theme_id,
        template_id: selectedTemplate.value?.id || null,
        year: new Date(formData.value.event_date).getFullYear(),
        status: 'active'
      })
    });
    
    if (!eventRes.ok) throw new Error('Failed to create event');
    const event = await eventRes.json();

    for (const p of formData.value.participants) {
      if (p.name) {
        await fetch('/api/candidates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_id: event.id,
            number: p.number,
            name: p.name,
            gender: p.gender,
            participant_type: p.gender.toLowerCase(),
            order: p.number
          })
        });
      }
    }
    
    for (const r of formData.value.rounds) {
      await fetch('/api/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          name: r.name,
          spot: r.spot
        })
      });
    }
    
    for (let i = 1; i <= formData.value.number_of_judges; i++) {
      await fetch('/api/judges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          name: `Judge ${i}`,
          chair_number: i,
          status: 'active'
        })
      });
    }
    
    showSuccess('Event created successfully!');
    router.push(`/admin?event_id=${event.id}`);
  } catch (error) {
    showError('Failed to create event');
  } finally {
    creating.value = false;
  }
};
</script>
