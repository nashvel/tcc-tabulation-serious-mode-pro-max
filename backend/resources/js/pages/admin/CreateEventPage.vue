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
            <p class="text-sm text-gray-500">{{ selectedTemplate ? 'Using template' : 'Step ' + currentStep + ' of 5' }}</p>
          </div>
        </div>
      </div>
    </header>

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
            <div v-if="step.id < 5" :class="['h-0.5 flex-1 transition-colors', currentStep > step.id ? 'bg-indigo-600' : 'bg-gray-200']"></div>
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

        <!-- Important People -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Important People</h2>
              <p class="text-xs text-gray-500">Add key people like Director, Coordinator, etc.</p>
            </div>
            <button @click="addImportantPerson" class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
              <Plus :size="16" /> Add
            </button>
          </div>
          
          <div class="space-y-2">
            <div v-if="!formData.important_people.length" class="py-6 text-center text-sm text-gray-400">
              No important people added (optional)
            </div>
            <div v-for="(person, i) in formData.important_people" :key="i" class="flex items-center gap-3">
              <input v-model="person.position" type="text" placeholder="Position (e.g. Director)"
                class="w-40 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-indigo-500" />
              <input v-model="person.name" type="text" placeholder="Name"
                class="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-indigo-500" />
              <button @click="removeImportantPerson(i)" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Participants -->
      <div v-if="currentStep === 2" class="space-y-6">
        <!-- Custom Categories Manager -->
        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="text-sm font-semibold text-gray-900">Participant Categories</h3>
              <p class="text-xs text-gray-500">Add categories beyond Male/Female (e.g., Gay, Transgender, Mixed)</p>
            </div>
          </div>
          
          <!-- Quick Add Presets -->
          <div class="mb-3">
            <p class="text-xs text-gray-500 mb-2">Quick add:</p>
            <div class="flex flex-wrap gap-1.5">
              <button v-for="preset in categoryPresets" :key="preset"
                @click="addPresetCategory(preset)"
                :disabled="customCategories.includes(preset) || participantTypeOptions.includes(preset)"
                :class="['px-2 py-1 text-xs rounded-lg border transition-colors',
                  customCategories.includes(preset) || participantTypeOptions.includes(preset)
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100']">
                + {{ preset }}
              </button>
            </div>
          </div>
          
          <!-- Custom Input -->
          <div class="flex gap-2 mb-3">
            <input v-model="newCustomCategory" type="text" placeholder="Type custom category name..."
              @keyup.enter="addCustomCategoryFromInput"
              class="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-indigo-500 bg-white" />
            <button @click="addCustomCategoryFromInput" 
              :disabled="!newCustomCategory.trim()"
              class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50">
              <Plus :size="14" />
            </button>
          </div>
          
          <!-- Active Categories -->
          <div class="flex flex-wrap gap-2">
            <span v-for="cat in customCategories" :key="cat" 
              class="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
              {{ cat }}
              <button @click="removeCustomCategory(cat)" class="hover:text-red-600">
                <X :size="12" />
              </button>
            </span>
            <span v-if="!customCategories.length" class="text-xs text-gray-500 italic">No custom categories added</span>
          </div>
        </div>

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
                <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase w-44">Category</th>
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
                  <div class="flex items-center gap-1">
                    <select v-model="p.gender"
                      class="flex-1 px-2 py-1.5 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-indigo-500">
                      <option v-for="opt in participantTypeOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                    <input v-model="p.gender" type="text" placeholder="Custom"
                      class="w-20 px-2 py-1.5 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-indigo-500"
                      title="Type custom category" />
                  </div>
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

      <!-- Step 4: Criteria -->
      <div v-if="currentStep === 4" class="space-y-6">
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Scoring Criteria</h2>
            <p class="text-sm text-gray-500 mt-1">Add criteria with percentage (%) for each round. Total should equal 100%.</p>
          </div>

          <div class="p-6 space-y-6">
            <div v-if="formData.rounds.length === 0" class="py-12 text-center">
              <Layers :size="32" class="text-gray-300 mx-auto mb-2" />
              <p class="text-sm text-gray-500">No rounds added. Go back to add rounds first.</p>
            </div>
            
            <div v-for="(round, ri) in formData.rounds" :key="ri" class="border border-gray-200 rounded-xl overflow-hidden">
              <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600">
                    {{ ri + 1 }}
                  </div>
                  <span class="font-medium text-gray-900">{{ round.name }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span :class="['text-sm font-medium', getTotalPercentage(ri) === 100 ? 'text-green-600' : 'text-orange-500']">
                    Total: {{ getTotalPercentage(ri) }}%
                  </span>
                  <button @click="addCriteria(ri)" class="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                    + Add Criteria
                  </button>
                </div>
              </div>
              
              <div class="p-4 space-y-2">
                <div v-if="!round.criteria?.length" class="py-6 text-center text-sm text-gray-400">
                  No criteria added for this round
                </div>
                <div v-for="(c, ci) in round.criteria" :key="ci" class="flex items-center gap-3">
                  <input v-model="c.name" type="text" placeholder="Criteria name (e.g. Beauty, Talent)"
                    class="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-indigo-500" />
                  <div class="flex items-center gap-1">
                    <input v-model.number="c.points" type="number" min="0" max="100" placeholder="0"
                      class="w-20 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-indigo-500 text-center" />
                    <span class="text-sm text-gray-500">%</span>
                  </div>
                  <button @click="removeCriteria(ri, ci)" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 5: Review -->
      <div v-if="currentStep === 5" class="space-y-6">
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
        
        <button v-if="currentStep < 5" @click="nextStep"
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
  { id: 4, label: 'Criteria' },
  { id: 5, label: 'Review' }
];

const formData = ref({
  title: '',
  event_date: '',
  event_type: 'pageant',
  number_of_judges: 5,
  description: '',
  theme_id: null,
  participants: [],
  rounds: [],
  important_people: []
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

// Custom categories for flexible event types
const customCategories = ref([]);
const newCustomCategory = ref('');

// Category presets for quick add - actual gender/participant types
const categoryPresets = [
  'Gay', 'Transgender', 'Non-Binary', 'LGBTQ+',
  'Mixed', 'Open', 'Junior', 'Senior', 'Kids'
];

// Dynamic participant type options based on event type + custom categories
const participantTypeOptions = computed(() => {
  let baseOptions = [];
  switch (formData.value.event_type) {
    case 'solo_contest': baseOptions = ['Solo']; break;
    case 'group_contest': baseOptions = ['Group']; break;
    case 'pageant': baseOptions = ['Female', 'Male']; break;
    case 'talent_show':
    case 'competition': baseOptions = ['Female', 'Male', 'Solo', 'Group']; break;
    default: baseOptions = ['Female', 'Male', 'Solo', 'Group'];
  }
  // Add custom categories
  return [...baseOptions, ...customCategories.value];
});

// Add a custom category from input
const addCustomCategoryFromInput = () => {
  const name = newCustomCategory.value.trim();
  if (name && !customCategories.value.includes(name)) {
    customCategories.value.push(name);
    newCustomCategory.value = '';
  }
};

// Add a preset category
const addPresetCategory = (preset) => {
  if (!customCategories.value.includes(preset)) {
    customCategories.value.push(preset);
  }
};

// Remove a custom category
const removeCustomCategory = (category) => {
  const index = customCategories.value.indexOf(category);
  if (index > -1) {
    customCategories.value.splice(index, 1);
  }
};

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
  const lowerType = type?.toLowerCase() || '';
  switch (lowerType) {
    case 'female': return 'bg-pink-100 text-pink-700';
    case 'male': return 'bg-blue-100 text-blue-700';
    case 'solo': return 'bg-indigo-100 text-indigo-700';
    case 'group': return 'bg-purple-100 text-purple-700';
    default:
      // Custom categories get different colors based on name
      if (lowerType.includes('gay')) return 'bg-rainbow-100 text-purple-700 bg-gradient-to-r from-pink-100 to-purple-100';
      if (lowerType.includes('miss') || lowerType.includes('ms.')) return 'bg-rose-100 text-rose-700';
      if (lowerType.includes('mr.') || lowerType.includes('mister')) return 'bg-sky-100 text-sky-700';
      if (lowerType.includes('best')) return 'bg-amber-100 text-amber-700';
      if (lowerType.includes('special')) return 'bg-emerald-100 text-emerald-700';
      return 'bg-gray-100 text-gray-700';
  }
};

const goBack = () => router.push('/setup');

const goToStep = (step) => {
  if (step >= 1 && step <= 5) {
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
  if (currentStep.value < 5) {
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
  formData.value.rounds.push({ name: `Round ${nextSpot}`, spot: nextSpot, criteria: [] });
};

const removeRound = (index) => formData.value.rounds.splice(index, 1);

// Criteria management
const addCriteria = (roundIndex) => {
  if (!formData.value.rounds[roundIndex].criteria) {
    formData.value.rounds[roundIndex].criteria = [];
  }
  formData.value.rounds[roundIndex].criteria.push({ name: '', points: 0 });
};

const removeCriteria = (roundIndex, criteriaIndex) => {
  formData.value.rounds[roundIndex].criteria.splice(criteriaIndex, 1);
};

const getTotalPercentage = (roundIndex) => {
  const criteria = formData.value.rounds[roundIndex]?.criteria || [];
  return criteria.reduce((sum, c) => sum + (parseInt(c.points) || 0), 0);
};

// Important people management
const addImportantPerson = () => {
  formData.value.important_people.push({ position: '', name: '' });
};

const removeImportantPerson = (index) => {
  formData.value.important_people.splice(index, 1);
};

const createEvent = async () => {
  if (!formData.value.title || !formData.value.event_date) {
    showError('Please fill in required fields');
    return;
  }
  
  creating.value = true;
  try {
    const eventRes = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
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
    
    if (!eventRes.ok) {
      const errData = await eventRes.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to create event');
    }
    const event = await eventRes.json();

    for (const p of formData.value.participants) {
      if (p.name) {
        await fetch('/api/candidates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
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
      const roundRes = await fetch('/api/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          name: r.name,
          spot: r.spot
        })
      });
      
      if (roundRes.ok && r.criteria?.length > 0) {
        const round = await roundRes.json();
        for (const c of r.criteria) {
          if (c.name) {
            await fetch('/api/criteria', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify({
                round_id: round.id,
                name: c.name,
                points: c.points || 0
              })
            });
          }
        }
      }
    }
    
    // Save important people (if any were added)
    if (formData.value.important_people.length > 0) {
      const validPeople = formData.value.important_people.filter(p => p.position || p.name);
      if (validPeople.length > 0) {
        const draftRes = await fetch('/api/events/save-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            event_id: event.id,
            title: formData.value.title,
            important_people: validPeople
          })
        });
        if (!draftRes.ok) {
          console.warn('Failed to save important people:', await draftRes.text());
        }
      }
    }
    
    for (let i = 1; i <= formData.value.number_of_judges; i++) {
      await fetch('/api/judges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
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
    showError(error.message || 'Failed to create event');
  } finally {
    creating.value = false;
  }
};
</script>
