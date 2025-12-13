<template>
  <!-- Gradient Background -->
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    <div class="flex min-h-screen items-center justify-center px-4 py-12">
      <div class="w-full max-w-5xl">

        <!-- Header -->
        <div class="mb-8 text-center">
          <img
            src="/assets/main-logo.png"
            alt="Logo"
            class="mx-auto h-20 w-auto"
          />
          <h2 class="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Event Setup
          </h2>
          <p class="mt-2 text-sm text-gray-500">
            Create a new event or continue with an existing one.
          </p>
        </div>

        <!-- Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

          <!-- Create New Event Card -->
          <div
            class="flex flex-col items-center justify-center rounded-3xl border border-white/30 bg-white/50 p-8 text-center shadow-lg backdrop-blur-xl transition-all hover:shadow-xl"
          >
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-500">
              <span class="material-icons" style="font-size: 32px">add</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Create New Event</h3>
            <p class="mt-1 mb-6 text-sm text-gray-500">
              Set up a new competition from scratch.
            </p>
            <button
              @click="goToCreateEvent"
              class="w-full rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            >
              Create Event
            </button>
          </div>

          <!-- Select Existing Event Card -->
          <div
            class="flex flex-col rounded-3xl border border-white/30 bg-white/50 p-8 shadow-lg backdrop-blur-xl"
          >
            <h3 class="mb-4 text-lg font-semibold text-gray-900">Select Existing Event</h3>

            <div class="flex flex-col gap-4">
              <template v-if="events.length > 0">
                <div
                  v-for="event in events"
                  :key="event.id"
                  class="rounded-xl border border-gray-200 bg-white/60 p-4 transition-all hover:border-gray-300 hover:bg-white/80"
                >
                  <div class="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h4 class="font-semibold text-gray-900">{{ event.title }}</h4>
                      <p class="text-sm text-gray-500">{{ event.year }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <button
                        @click="continueEvent(event)"
                        class="rounded-md bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-200"
                      >
                        Continue
                      </button>
                      <button
                        @click="openDeleteModal(event)"
                        class="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-100"
                      >
                        <span class="material-icons" style="font-size: 16px">close</span>
                      </button>
                    </div>
                  </div>
                </div>
              </template>
              <div v-else class="py-10 text-center text-gray-400">
                <p class="text-sm">No events created yet</p>
              </div>
            </div>
          </div>
        </div>

        <p class="mt-4 text-center text-sm text-gray-500">
          © Tabulation System Nacht. All rights reserved.
        </p>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="deleteModal.show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="closeDeleteModal"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 class="text-lg font-semibold text-gray-900">Delete Event</h3>
        <p class="mt-2 text-sm text-gray-500">
          Type <strong>{{ deleteModal.event?.title }}</strong> to confirm deletion.
        </p>
        <input
          v-model="deleteModal.confirmText"
          type="text"
          class="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          placeholder="Type event title to confirm"
        />
        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="closeDeleteModal"
            class="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            :disabled="deleteModal.confirmText !== deleteModal.event?.title"
            :class="[
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              deleteModal.confirmText === deleteModal.event?.title
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            ]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showError, showSuccess } from '../../utils/alerts';

const router = useRouter();

const events = ref([]);
const deleteModal = ref({ show: false, event: null, confirmText: '' });

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

const goToCreateEvent = () => {
  router.push('/create-event');
};

const continueEvent = (event) => {
  // Use only URL parameter, no localStorage
  router.push(`/admin?event_id=${event.id}`);
};

const openDeleteModal = (event) => {
  deleteModal.value = { show: true, event, confirmText: '' };
};

const closeDeleteModal = () => {
  deleteModal.value = { show: false, event: null, confirmText: '' };
};

const confirmDelete = async () => {
  if (deleteModal.value.confirmText !== deleteModal.value.event?.title) return;

  try {
    const response = await fetch(`/api/events/${deleteModal.value.event.id}`, {
      method: 'DELETE'
    });

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

onMounted(() => {
  // Check if admin is logged in
  const isAdmin = localStorage.getItem('isAdmin');
  if (!isAdmin) {
    router.push('/admin/login');
    return;
  }
  
  fetchEvents();
});
</script>
