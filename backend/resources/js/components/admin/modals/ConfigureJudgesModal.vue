<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div class="w-full max-w-2xl flex flex-col bg-white/90 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
      <!-- Header -->
      <header class="flex items-center justify-between p-4 border-b border-gray-200">
        <div class="flex items-center gap-2">
          <span class="material-icons text-gray-500" style="font-size: 20px">person</span>
          <h2 class="text-lg font-semibold text-gray-900 tracking-tight">Configure Judges</h2>
        </div>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-900 transition-colors rounded-full p-1 hover:bg-gray-100">
          <span class="material-icons" style="font-size: 20px">close</span>
        </button>
      </header>

      <!-- Main Content -->
      <main class="p-6 flex-grow overflow-y-auto">
        <div class="space-y-6">
          <!-- Add/Edit Toggle -->
          <div v-if="!isAdding" class="flex justify-between items-center">
            <h3 class="text-base font-semibold text-gray-900">Current Judges</h3>
            <button @click="isAdding = true" class="h-9 px-4 flex items-center gap-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm">
              <span class="material-icons" style="font-size: 18px">add</span>
              <span>Add New Judge</span>
            </button>
          </div>
          <div v-else class="flex justify-between items-center">
            <h3 class="text-base font-semibold text-gray-900">{{ editingId ? 'Edit Judge' : 'Add New Judge' }}</h3>
            <button @click="resetForm" class="text-sm text-gray-500 hover:text-gray-900 underline">Cancel</button>
          </div>

          <!-- Add/Edit Form -->
          <form v-if="isAdding" @submit.prevent="handleSubmit" class="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Judge Name</label>
                <input v-model="formData.name" type="text" required class="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="Enter judge name" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Chair Number</label>
                <input v-model="formData.chair_number" type="number" required class="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="e.g. 1" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select v-model="formData.status" class="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                  <option value="active">Active</option>
                  <option value="idle">Idle</option>
                  <option value="locked">Locked</option>
                </select>
              </div>
            </div>
            <div class="flex justify-end pt-2">
              <button type="submit" class="h-9 px-5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm">
                {{ editingId ? 'Update Judge' : 'Save Judge' }}
              </button>
            </div>
          </form>

          <!-- Judges Table -->
          <div class="overflow-x-auto border border-gray-200 rounded-xl bg-white">
            <table class="w-full text-sm text-left">
              <thead class="text-gray-500 uppercase text-xs bg-gray-50">
                <tr>
                  <th class="px-6 py-3 font-semibold tracking-wider">Chair #</th>
                  <th class="px-6 py-3 font-semibold tracking-wider">Judge Name</th>
                  <th class="px-6 py-3 font-semibold tracking-wider">Status</th>
                  <th class="px-6 py-3 font-semibold tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="text-gray-900 divide-y divide-gray-200">
                <tr v-if="isLoading">
                  <td colspan="4" class="px-6 py-8 text-center text-gray-500">Loading judges...</td>
                </tr>
                <tr v-else-if="judges.length === 0">
                  <td colspan="4" class="px-6 py-8 text-center text-gray-500">No judges found. Add one to get started.</td>
                </tr>
                <tr v-else v-for="judge in judges" :key="judge.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 text-gray-500 font-medium">#{{ judge.chair_number }}</td>
                  <td class="px-6 py-4 font-medium">{{ judge.name }}</td>
                  <td class="px-6 py-4">
                    <span :class="['inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium', getStatusClass(judge.status)]">
                      <span :class="['size-1.5 rounded-full', getStatusDotClass(judge.status)]"></span>
                      {{ judge.status.charAt(0).toUpperCase() + judge.status.slice(1) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button @click="startEdit(judge)" class="p-1 text-gray-400 hover:text-indigo-600 transition-colors" title="Edit">
                        <span class="material-icons" style="font-size: 18px">edit</span>
                      </button>
                      <button @click="confirmDelete(judge)" class="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                        <span class="material-icons" style="font-size: 18px">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="flex justify-end items-center gap-3 p-4 bg-gray-50 border-t border-gray-200">
        <button @click="$emit('close')" class="h-9 px-4 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
          Close
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { showSuccess, showError, showConfirm } from '../../../utils/alerts';

const props = defineProps({
  isOpen: Boolean,
  eventId: [String, Number]
});

const emit = defineEmits(['close']);

const judges = ref([]);
const isLoading = ref(false);
const isAdding = ref(false);
const editingId = ref(null);
const formData = ref({ name: '', chair_number: '', status: 'active' });

const getStatusClass = (status) => {
  if (status === 'active') return 'bg-green-100 text-green-700';
  if (status === 'locked') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
};

const getStatusDotClass = (status) => {
  if (status === 'active') return 'bg-green-500';
  if (status === 'locked') return 'bg-red-500';
  return 'bg-gray-500';
};

const fetchJudges = async () => {
  if (!props.eventId) return;
  isLoading.value = true;
  try {
    const response = await fetch(`/api/judges?event_id=${props.eventId}`);
    if (!response.ok) throw new Error('Failed to fetch judges');
    judges.value = await response.json();
  } catch (error) {
    console.error('Error fetching judges:', error);
    showError('Failed to load judges');
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    const url = editingId.value ? `/api/judges/${editingId.value}` : '/api/judges';
    const method = editingId.value ? 'PUT' : 'POST';
    const body = { ...formData.value, event_id: props.eventId, chair_number: parseInt(formData.value.chair_number) || (judges.value.length + 1) };

    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error('Failed to save judge');

    showSuccess(editingId.value ? 'Judge updated successfully' : 'Judge added successfully');
    fetchJudges();
    resetForm();
  } catch (error) {
    console.error('Error saving judge:', error);
    showError('Failed to save judge');
  }
};

const confirmDelete = async (judge) => {
  const confirmed = await showConfirm('Delete Judge', `Are you sure you want to delete ${judge.name}? This action cannot be undone.`, { confirmColor: '#d33', confirmText: 'Delete' });
  if (confirmed) {
    try {
      const response = await fetch(`/api/judges/${judge.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete judge');
      showSuccess('Judge deleted successfully');
      fetchJudges();
    } catch (error) {
      console.error('Error deleting judge:', error);
      showError('Failed to delete judge');
    }
  }
};

const startEdit = (judge) => {
  formData.value = { name: judge.name, chair_number: judge.chair_number, status: judge.status };
  editingId.value = judge.id;
  isAdding.value = true;
};

const resetForm = () => {
  formData.value = { name: '', chair_number: '', status: 'active' };
  editingId.value = null;
  isAdding.value = false;
};

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.eventId) fetchJudges();
});
</script>
