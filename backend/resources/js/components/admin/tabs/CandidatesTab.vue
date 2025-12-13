<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">Candidates</h2>
      <button
        @click="showAddModal = true"
        class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Add Candidate
      </button>
    </div>

    <!-- Candidates Table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Gender</th>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Team/Dept</th>
            <th class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="candidate in candidates" :key="candidate.id" class="hover:bg-gray-50">
            <td class="py-3 px-4 text-sm text-gray-900">{{ candidate.number }}</td>
            <td class="py-3 px-4 text-sm font-medium text-gray-900">{{ candidate.name }}</td>
            <td class="py-3 px-4 text-sm text-gray-600">{{ candidate.gender }}</td>
            <td class="py-3 px-4 text-sm text-gray-600">{{ candidate.team || candidate.department || '-' }}</td>
            <td class="py-3 px-4 text-center">
              <button @click="editCandidate(candidate)" class="text-indigo-600 hover:text-indigo-800 text-sm mr-2">Edit</button>
              <button @click="deleteCandidate(candidate.id)" class="text-red-600 hover:text-red-800 text-sm">Delete</button>
            </td>
          </tr>
          <tr v-if="!candidates?.length">
            <td colspan="5" class="py-8 text-center text-gray-500">No candidates yet</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { showError, showSuccess, showConfirm } from '../../../utils/alerts';

const props = defineProps({
  eventId: [String, Number],
  candidates: Array
});

const emit = defineEmits(['refresh']);

const showAddModal = ref(false);

const editCandidate = (candidate) => {
  // TODO: Implement edit modal
  console.log('Edit candidate:', candidate);
};

const deleteCandidate = async (id) => {
  const confirmed = await showConfirm('Delete Candidate', 'Are you sure you want to delete this candidate?', {
    confirmText: 'Delete',
    confirmColor: '#dc2626'
  });
  if (!confirmed) return;
  
  try {
    await fetch(`/api/candidates/${id}`, { method: 'DELETE' });
    emit('refresh');
    showSuccess('Candidate deleted successfully');
  } catch (error) {
    showError('Failed to delete candidate');
  }
};
</script>
