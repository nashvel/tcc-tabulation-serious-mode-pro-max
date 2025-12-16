<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
    <div class="w-full max-w-3xl flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden" style="max-height: calc(100vh - 80px)">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200">
        <div class="flex items-center gap-2">
          <button @click="$emit('close')" class="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors group relative mr-4" title="Close">
            <span class="material-icons absolute inset-0 m-auto text-red-900 opacity-0 group-hover:opacity-100" style="font-size: 8px">close</span>
          </button>
          <span class="material-icons text-gray-600" style="font-size: 18px">info</span>
          <h2 class="text-sm font-semibold text-gray-900">Event Details</h2>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-grow overflow-y-auto bg-white">
        <div v-if="loading" class="flex flex-col items-center justify-center py-20">
          <div class="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <p class="mt-4 text-sm text-gray-600">Loading...</p>
        </div>

        <div v-else-if="!event" class="flex flex-col items-center justify-center py-20">
          <span class="material-icons text-gray-300 mb-4" style="font-size: 48px">info</span>
          <p class="text-sm text-gray-600">Event not found</p>
        </div>

        <div v-else class="p-6 space-y-6">
          <!-- Event Metadata -->
          <div class="flex items-center gap-6 px-4 py-3 bg-blue-50 rounded-lg text-sm">
            <div class="flex items-center gap-2">
              <span class="text-gray-600">ID</span>
              <span class="font-medium text-gray-900">{{ event.id }}</span>
            </div>
            <div class="w-px h-4 bg-gray-300"></div>
            <div class="flex items-center gap-2">
              <span class="text-gray-600">Year</span>
              <span class="font-medium text-gray-900">{{ event.year }}</span>
            </div>
            <div class="w-px h-4 bg-gray-300"></div>
            <div class="flex items-center gap-2">
              <span class="text-gray-600">Status</span>
              <span :class="['inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium', event.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800']">
                <span :class="['w-1.5 h-1.5 rounded-full', event.status === 'active' ? 'bg-green-500' : 'bg-yellow-500']"></span>
                {{ event.status }}
              </span>
            </div>
          </div>

          <!-- Form -->
          <div class="space-y-5">
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">General Information</div>

            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">Event Title</label>
              <input v-model="formData.title" type="text" class="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter event title" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">
                  <span class="material-icons inline mr-1 mb-0.5" style="font-size: 14px">calendar_today</span>
                  Event Date
                </label>
                <input v-model="formData.event_date" type="date" class="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">Event Type</label>
                <select v-model="formData.event_type" class="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize">
                  <option value="pageant">Pageant (Male/Female)</option>
                  <option value="solo_contest">Solo Contest</option>
                  <option value="group_contest">Group/Team Contest</option>
                  <option value="talent_show">Talent Show</option>
                  <option value="competition">Competition</option>
                </select>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">Number of Judges</label>
              <input v-model="formData.number_of_judges" type="number" min="1" max="20" class="w-32 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <textarea v-model="formData.description" rows="4" class="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" placeholder="Enter event description..."></textarea>
            </div>

            <!-- Visual Settings Section -->
            <div class="pt-4 border-t border-gray-200">
              <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Visual Settings</div>
              
              <!-- Header Logos (Multiple) -->
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-sm font-medium text-gray-700">Header Logos</label>
                  <button 
                    v-if="headerTemplates.length > 0"
                    @click="showHeaderTemplateSelector = true" 
                    class="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Use Template
                  </button>
                </div>
                <p class="text-xs text-gray-400 mb-2">Select multiple logos to display in the judge header. Drag to reorder.</p>
                
                <!-- Selected Logos Preview -->
                <div v-if="formData.header_logos && formData.header_logos.length > 0" class="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg mb-2">
                  <div 
                    v-for="(logo, idx) in formData.header_logos" 
                    :key="idx"
                    class="relative group"
                    draggable="true"
                    @dragstart="dragStart(idx)"
                    @dragover.prevent="dragOver(idx)"
                    @drop="drop(idx)"
                  >
                    <img :src="logo.path" class="w-14 h-14 object-contain rounded-lg border-2 border-gray-200 bg-white cursor-move" />
                    <button 
                      @click="removeLogo(idx)" 
                      class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >&times;</button>
                    <span class="absolute bottom-0 left-0 right-0 text-center text-[9px] text-gray-500 bg-white/80 rounded-b">{{ idx + 1 }}</span>
                  </div>
                </div>
                <div v-else class="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-400 mb-2">
                  No logos selected
                </div>
                
                <!-- Add Logo Button -->
                <button @click="showLogoSelector = true" class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  + Add Logo
                </button>
              </div>
              
              <!-- Lock Screen -->
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-sm font-medium text-gray-700">Lock Screen Image</label>
                  <button 
                    v-if="lockScreenTemplates.length > 0"
                    @click="showLockScreenTemplateSelector = true" 
                    class="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Use Template
                  </button>
                </div>
                <div v-if="formData.lock_screen_image" class="mb-2">
                  <div class="relative inline-block group">
                    <img :src="formData.lock_screen_image" class="h-20 w-auto object-contain rounded-lg border border-gray-200" />
                    <button 
                      @click="formData.lock_screen_image = ''" 
                      class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >&times;</button>
                  </div>
                </div>
                <ImageSelector
                  v-model="formData.lock_screen_image"
                  label=""
                  placeholder="Select lock screen"
                />
                <p class="text-xs text-gray-400 mt-1">Shown when voting is locked (supports GIFs)</p>
              </div>
            </div>
            
            <!-- Header Template Selector Modal -->
            <div v-if="showHeaderTemplateSelector" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/30" @click.self="showHeaderTemplateSelector = false">
              <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-5">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-semibold text-gray-900">Select Header Template</h3>
                  <button @click="showHeaderTemplateSelector = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                </div>
                <div v-if="headerTemplates.length === 0" class="text-center py-8 text-gray-400">
                  No header templates available. Create one in Templates tab.
                </div>
                <div v-else class="space-y-2 max-h-64 overflow-y-auto">
                  <button 
                    v-for="template in headerTemplates" 
                    :key="template.id"
                    @click="applyHeaderTemplate(template)"
                    class="w-full p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left flex items-center gap-3"
                  >
                    <div class="flex -space-x-2">
                      <img 
                        v-for="(logo, idx) in (template.header_logos || []).slice(0, 3)" 
                        :key="idx"
                        :src="logo.path" 
                        class="w-10 h-10 object-contain rounded border border-white bg-gray-100"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-gray-900 truncate">{{ template.name }}</p>
                      <p class="text-xs text-gray-500">{{ (template.header_logos || []).length }} logo(s)</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Lock Screen Template Selector Modal -->
            <div v-if="showLockScreenTemplateSelector" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/30" @click.self="showLockScreenTemplateSelector = false">
              <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-5">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-semibold text-gray-900">Select Lock Screen Template</h3>
                  <button @click="showLockScreenTemplateSelector = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                </div>
                <div v-if="lockScreenTemplates.length === 0" class="text-center py-8 text-gray-400">
                  No lock screen templates available. Create one in Templates tab.
                </div>
                <div v-else class="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  <button 
                    v-for="template in lockScreenTemplates" 
                    :key="template.id"
                    @click="applyLockScreenTemplate(template)"
                    class="p-2 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                  >
                    <img 
                      :src="template.lock_screen_image" 
                      class="w-full h-20 object-contain rounded mb-2 bg-gray-100"
                    />
                    <p class="text-xs font-medium text-gray-900 truncate">{{ template.name }}</p>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Logo Selector Modal -->
            <div v-if="showLogoSelector" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/30" @click.self="showLogoSelector = false">
              <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-5">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-semibold text-gray-900">Select Logo</h3>
                  <button @click="showLogoSelector = false" class="text-gray-400 hover:text-gray-600">&times;</button>
                </div>
                <div v-if="availableImages.length === 0" class="text-center py-8 text-gray-400">
                  No images available. Upload images in Templates tab.
                </div>
                <div v-else class="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  <button 
                    v-for="img in availableImages" 
                    :key="img.path"
                    @click="addLogo(img.path)"
                    class="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
                  >
                    <img :src="img.path" class="w-full h-full object-cover" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="text-xs text-gray-500">{{ event ? `Last modified: ${new Date().toLocaleDateString()}` : '' }}</div>
        <div class="flex items-center gap-3">
          <button @click="$emit('close')" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button @click="handleSave" class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2">
            <span class="material-icons" style="font-size: 14px">save</span>
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { showSuccess, showError } from '../../../utils/alerts';
import ImageSelector from '../../shared/ImageSelector.vue';

const props = defineProps({
  isOpen: Boolean,
  eventId: [String, Number]
});

const emit = defineEmits(['close']);

const event = ref(null);
const loading = ref(true);
const formData = ref({ title: '', event_date: '', description: '', event_type: 'pageant', number_of_judges: '', header_image: '', header_logos: [], lock_screen_image: '' });
const showLogoSelector = ref(false);
const showHeaderTemplateSelector = ref(false);
const showLockScreenTemplateSelector = ref(false);
const availableImages = ref([]);
const templates = ref([]);
let draggedIdx = null;

// Computed: Header templates (has header_logos or header_image)
const headerTemplates = computed(() => 
  templates.value.filter(t => (t.header_logos && t.header_logos.length > 0) || t.header_image)
);

// Computed: Lock screen templates (has lock_screen_image)
const lockScreenTemplates = computed(() => 
  templates.value.filter(t => t.lock_screen_image)
);

// Load available images
const loadImages = async () => {
  try {
    const response = await fetch('/api/assets/images');
    if (response.ok) {
      const data = await response.json();
      availableImages.value = data.images || [];
    }
  } catch (error) {
    console.error('Failed to load images');
  }
};

// Load templates
const loadTemplates = async () => {
  try {
    const response = await fetch('/api/event-templates');
    if (response.ok) {
      templates.value = await response.json();
    }
  } catch (error) {
    console.error('Failed to load templates');
  }
};

// Apply header template
const applyHeaderTemplate = (template) => {
  if (template.header_logos && template.header_logos.length > 0) {
    formData.value.header_logos = [...template.header_logos];
  } else if (template.header_image) {
    formData.value.header_logos = [{ path: template.header_image, order: 0 }];
  }
  showHeaderTemplateSelector.value = false;
};

// Apply lock screen template
const applyLockScreenTemplate = (template) => {
  formData.value.lock_screen_image = template.lock_screen_image;
  showLockScreenTemplateSelector.value = false;
};

// Add logo
const addLogo = (path) => {
  if (!formData.value.header_logos) formData.value.header_logos = [];
  if (!formData.value.header_logos.find(l => l.path === path)) {
    formData.value.header_logos.push({ path, order: formData.value.header_logos.length });
  }
  showLogoSelector.value = false;
};

// Remove logo
const removeLogo = (idx) => {
  formData.value.header_logos.splice(idx, 1);
  formData.value.header_logos.forEach((l, i) => l.order = i);
};

// Drag and drop
const dragStart = (idx) => { draggedIdx = idx; };
const dragOver = (idx) => {};
const drop = (idx) => {
  if (draggedIdx !== null && draggedIdx !== idx) {
    const [moved] = formData.value.header_logos.splice(draggedIdx, 1);
    formData.value.header_logos.splice(idx, 0, moved);
    formData.value.header_logos.forEach((l, i) => l.order = i);
  }
  draggedIdx = null;
};

onMounted(() => { 
  loadImages(); 
  loadTemplates();
});

const loadEventDetails = async () => {
  if (!props.eventId) return;
  loading.value = true;
  try {
    const [eventRes, judgesRes] = await Promise.all([
      fetch(`/api/events/${props.eventId}`),
      fetch(`/api/judges?event_id=${props.eventId}`)
    ]);

    if (eventRes.ok) {
      const data = await eventRes.json();
      event.value = data;

      let judgesCount = '';
      if (judgesRes.ok) {
        const judgesData = await judgesRes.json();
        judgesCount = judgesData.length;
      }

      let formattedDate = '';
      if (data.event_date) {
        formattedDate = new Date(data.event_date).toISOString().split('T')[0];
      }

      formData.value = {
        title: data.title || '',
        event_date: formattedDate,
        description: data.description || '',
        event_type: data.event_type ?? 'pageant',
        number_of_judges: judgesCount || data.number_of_judges || '',
        header_image: data.header_image || '',
        header_logos: data.header_logos || [],
        lock_screen_image: data.lock_screen_image || ''
      };
    } else {
      showError('Failed to load event details');
    }
  } catch (error) {
    console.error('Error loading event:', error);
    showError('Error loading event details');
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  try {
    const actualEventId = event.value.id; // Use numeric ID, not unique_id
    const response = await fetch(`/api/events/${actualEventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.value.title,
        event_date: formData.value.event_date,
        description: formData.value.description,
        event_type: formData.value.event_type,
        number_of_judges: parseInt(formData.value.number_of_judges),
        header_image: formData.value.header_logos?.[0]?.path || formData.value.header_image,
        header_logos: formData.value.header_logos,
        lock_screen_image: formData.value.lock_screen_image
      })
    });

    if (response.ok) {
      showSuccess('Event updated successfully');
      loadEventDetails();
    } else {
      const errorData = await response.json();
      showError(errorData.message || 'Failed to update event');
    }
  } catch (error) {
    console.error('Error saving event:', error);
    showError('Error updating event');
  }
};

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.eventId) loadEventDetails();
});
</script>
