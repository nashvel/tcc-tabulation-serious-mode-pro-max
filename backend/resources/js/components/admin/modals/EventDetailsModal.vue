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
import { ref, watch } from 'vue';
import { showSuccess, showError } from '../../../utils/alerts';

const props = defineProps({
  isOpen: Boolean,
  eventId: [String, Number]
});

const emit = defineEmits(['close']);

const event = ref(null);
const loading = ref(true);
const formData = ref({ title: '', event_date: '', description: '', event_type: 'pageant', number_of_judges: '' });

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
        number_of_judges: judgesCount || data.number_of_judges || ''
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
    const actualEventId = event.value.unique_id || event.value.id;
    const response = await fetch(`/api/events/${actualEventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.value.title,
        event_date: formData.value.event_date,
        description: formData.value.description,
        event_type: formData.value.event_type,
        number_of_judges: parseInt(formData.value.number_of_judges)
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
