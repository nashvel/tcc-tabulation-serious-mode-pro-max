<template>
  <div class="min-h-screen bg-white font-sans antialiased">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <img src="/assets/main-logo.png" alt="Logo" class="h-10 w-auto" />
            <div>
              <h1 class="text-xl font-bold text-gray-900">Event Setup</h1>
              <p class="text-sm text-gray-500">Create or continue with an event</p>
            </div>
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
            class="group p-6 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[140px]"
          >
            <div class="w-12 h-12 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center mb-3 transition-colors">
              <Plus :size="24" class="text-indigo-600" />
            </div>
            <h3 class="text-base font-semibold text-gray-900 mb-1">Create from Scratch</h3>
            <p class="text-xs text-gray-500 text-center">Set up a new competition manually</p>
          </div>

          <!-- Quick Create from Template -->
          <div v-if="templates.length > 0"
            @click="openTemplateModal"
            class="group p-4 rounded-2xl border-2 border-dashed border-green-300 bg-green-50 hover:border-green-400 hover:bg-green-100 transition-all cursor-pointer flex items-center gap-4"
          >
            <div class="w-10 h-10 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
              <FileText :size="20" class="text-green-600" />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-900">Quick Create from Template</h3>
              <p class="text-xs text-gray-500">{{ templates.length }} templates available</p>
            </div>
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
                    <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', 
                      event.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600']">
                      <span :class="['w-1.5 h-1.5 rounded-full', event.status === 'active' ? 'bg-green-500' : 'bg-gray-400']"></span>
                      {{ event.status || 'draft' }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-2 ml-4">
                  <button
                    @click="continueEvent(event)"
                    class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    Continue
                  </button>
                  <button
                    @click="openDeleteModal(event)"
                    class="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
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
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            ]"
          >
            Delete Event
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Create from Template Modal -->
    <div v-if="templateModal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Quick Create from Template</h2>
          <button @click="closeTemplateModal" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
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
              @click="selectTemplate(template)"
              :class="['p-4 rounded-xl border-2 cursor-pointer transition-all',
                templateModal.selected?.id === template.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300']">
              <h4 class="font-semibold text-gray-900 mb-1">{{ template.name }}</h4>
              <p class="text-xs text-gray-500 mb-3">{{ template.description }}</p>
              <div class="flex items-center gap-3 text-xs text-gray-600">
                <span class="flex items-center gap-1"><Users :size="12" /> {{ template.participants?.length || 0 }}</span>
                <span class="flex items-center gap-1"><Layers :size="12" /> {{ template.rounds?.length || 0 }} rounds</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="templateModal.selected" class="p-6 border-t border-gray-200 bg-gray-50">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
              <input v-model="templateModal.title" type="text" 
                class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/50 text-sm"
                placeholder="e.g. Mr. & Ms. TCC 2025" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
              <input v-model="templateModal.date" type="date"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/50 text-sm" />
            </div>
          </div>
          <button @click="createFromTemplate" :disabled="templateModal.creating || !templateModal.title || !templateModal.date"
            class="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            <Loader2 v-if="templateModal.creating" :size="16" class="inline animate-spin mr-2" />
            {{ templateModal.creating ? 'Creating...' : 'Create Event' }}
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

const router = useRouter();
const events = ref([]);
const templates = ref([]);
const deleteModal = ref({ show: false, event: null, confirmText: '' });
const templateModal = ref({ show: false, selected: null, title: '', date: '', creating: false });

const fetchEvents = async () => {
  try {
    const response = await fetch('/api/events');
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
    const res = await fetch('/api/event-templates');
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
    const response = await fetch(`/api/events/${deleteModal.value.event.id}`, { method: 'DELETE' });
    if (response.ok) {
      closeDeleteModal();
      fetchEvents();
      showSuccess('Event deleted successfully');
    } else {
      showError('Failed to delete event');
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
    const res = await fetch(`/api/event-templates/${templateModal.value.selected.id}/create-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: templateModal.value.title,
        event_date: templateModal.value.date,
      })
    });
    if (res.ok) {
      const event = await res.json();
      showSuccess('Event created from template!');
      router.push(`/admin?event_id=${event.id}`);
    } else {
      showError('Failed to create event');
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
