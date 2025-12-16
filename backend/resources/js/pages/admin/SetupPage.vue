<template>
  <div class="min-h-screen bg-white font-sans antialiased">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold text-gray-900">Event Setup</h1>
            <p class="text-sm text-gray-500">Create or continue with an event</p>
          </div>
          <div class="flex items-center gap-2">
            <button @click="goToDocumentation" class="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Documentation">
              <BookOpen :size="20" class="text-gray-600" />
            </button>
            <button @click="logout" class="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Logout">
              <LogOut :size="20" class="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-5xl mx-auto px-6 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Create New Event Card -->
        <div class="space-y-4">
          <div
            @click="goToCreateEvent"
            class="group p-6 rounded-2xl border-2 border-dashed border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[140px]"
          >
            <div class="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center mb-3 transition-colors">
              <Plus :size="24" class="text-gray-600" />
            </div>
            <h3 class="text-base font-semibold text-gray-900 mb-1">Create Event</h3>
            <p class="text-xs text-gray-500 text-center">Set up a new event or competition</p>
          </div>
        </div>

        <!-- Existing Events Card -->
        <div class="p-6 rounded-2xl border border-gray-200 bg-white">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Existing Events</h3>
          
          <div class="space-y-3 max-h-[400px] overflow-y-auto">
            <template v-if="events.length > 0">
              <div
                v-for="event in events"
                :key="event.id"
                class="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-gray-900 truncate">{{ event.title }}</h4>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs text-gray-500">{{ event.year }}</span>
                    <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white border border-gray-300 text-gray-600">
                      <span :class="['w-1.5 h-1.5 rounded-full', event.status === 'active' ? 'bg-green-500' : 'bg-gray-400']"></span>
                      {{ event.status || 'draft' }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-2 ml-4">
                  <button
                    @click="continueEvent(event)"
                    class="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Continue
                  </button>
                  <button
                    @click="openDeleteModal(event)"
                    class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Trash2 :size="18" />
                  </button>
                </div>
              </div>
            </template>
            <div v-else class="py-12 text-center">
              <Calendar :size="40" class="text-gray-300 mx-auto mb-3" />
              <p class="text-sm text-gray-500">No events created yet</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
      <div class="max-w-5xl mx-auto px-6 py-3 text-center">
        <p class="text-xs text-gray-400">© Tabulation System Nacht. All rights reserved.</p>
      </div>
    </footer>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteModal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Delete Event</h2>
        </div>
        <div class="p-6">
          <p class="text-sm text-gray-600 mb-4">
            Type <span class="font-semibold text-gray-900">{{ deleteModal.event?.title }}</span> to confirm deletion.
          </p>
          <input
            v-model="deleteModal.confirmText"
            type="text"
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-400/50 focus:border-gray-400"
            placeholder="Type event title to confirm"
          />
        </div>
        <div class="flex gap-3 p-6 pt-0">
          <button
            @click="closeDeleteModal"
            class="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            :disabled="deleteModal.confirmText !== deleteModal.event?.title"
            :class="[
              'flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
              deleteModal.confirmText === deleteModal.event?.title
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            ]"
          >
            Delete Event
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Trash2, Calendar, BookOpen, LogOut, X, FileText, Users, Layers, Loader2 } from 'lucide-vue-next';
import { showError, showSuccess } from '../../utils/alerts';
import { apiGet, apiPost, apiDelete } from '../../utils/api';

const router = useRouter();
const events = ref([]);
const templates = ref([]);
const deleteModal = ref({ show: false, event: null, confirmText: '' });
const templateModal = ref({ show: false, selected: null, title: '', date: '', creating: false });

const fetchEvents = async () => {
  try {
    const response = await apiGet('/api/events', false); // Public route
    if (!response.ok) {
      showError('Failed to fetch events');
      return;
    }
    const data = await response.json();
    events.value = Array.isArray(data) ? data : [];
  } catch (error) {
    showError('Error fetching events');
  }
};

const fetchTemplates = async () => {
  try {
    const res = await apiGet('/api/event-templates', false); // Public route
    if (res.ok) templates.value = await res.json();
  } catch (e) { console.error('Failed to fetch templates', e); }
};

const goToCreateEvent = () => router.push('/create-event');
const goToDocumentation = () => router.push('/admin/documentation');
const logout = () => {
  localStorage.removeItem('isAdmin');
  router.push('/admin/login');
};

const continueEvent = (event) => router.push(`/admin?event_id=${event.id}`);
const openDeleteModal = (event) => { deleteModal.value = { show: true, event, confirmText: '' }; };
const closeDeleteModal = () => { deleteModal.value = { show: false, event: null, confirmText: '' }; };

const confirmDelete = async () => {
  if (deleteModal.value.confirmText !== deleteModal.value.event?.title) return;
  try {
    const response = await apiDelete(`/api/events/${deleteModal.value.event.id}`);
    if (response.ok) {
      closeDeleteModal();
      fetchEvents();
      showSuccess('Event deleted successfully');
    } else {
      const data = await response.json();
      showError(data.message || 'Failed to delete event');
    }
  } catch (error) {
    showError('Error deleting event');
  }
};

// Template modal functions
const openTemplateModal = () => { templateModal.value = { show: true, selected: null, title: '', date: '', creating: false }; };
const closeTemplateModal = () => { templateModal.value = { show: false, selected: null, title: '', date: '', creating: false }; };
const selectTemplate = (template) => { templateModal.value.selected = template; };

const createFromTemplate = async () => {
  if (!templateModal.value.selected || !templateModal.value.title || !templateModal.value.date) return;
  templateModal.value.creating = true;
  try {
    const res = await apiPost(`/api/event-templates/${templateModal.value.selected.id}/create-event`, {
      title: templateModal.value.title,
      event_date: templateModal.value.date,
    });
    if (res.ok) {
      const event = await res.json();
      showSuccess('Event created from template!');
      router.push(`/admin?event_id=${event.id}`);
    } else {
      const data = await res.json();
      showError(data.message || 'Failed to create event');
    }
  } catch (e) {
    showError('Error creating event');
  } finally {
    templateModal.value.creating = false;
  }
};

onMounted(() => {
  const isAdmin = localStorage.getItem('isAdmin');
  if (!isAdmin) {
    router.push('/admin/login');
    return;
  }
  fetchEvents();
  fetchTemplates();
});
</script>
