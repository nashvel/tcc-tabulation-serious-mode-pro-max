<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">Scoring Criteria</h2>
      <button
        @click="showAddModal = true"
        class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <Plus :size="16" />
        Add Criteria
      </button>
    </div>

    <!-- Criteria Table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Round</th>
            <th class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase">Max Points</th>
            <th class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="criterion in criteria" :key="criterion.id" class="hover:bg-gray-50">
            <td class="py-3 px-4 text-sm font-medium text-gray-900">{{ criterion.name }}</td>
            <td class="py-3 px-4 text-sm text-gray-600">{{ getRoundName(criterion.round_id) }}</td>
            <td class="py-3 px-4 text-sm text-center text-gray-900">{{ criterion.points }}%</td>
            <td class="py-3 px-4">
              <div class="flex items-center justify-center gap-1">
                <button 
                  @click="editCriteria(criterion)" 
                  class="p-1.5 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Edit"
                >
                  <Pencil :size="16" />
                </button>
                <button 
                  @click="deleteCriteria(criterion.id)" 
                  class="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!criteria?.length">
            <td colspan="4" class="py-8 text-center text-gray-500">No criteria yet</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Plus, Pencil, Trash2 } from 'lucide-vue-next';
import { showError, showSuccess, showConfirm } from '../../../utils/alerts';

const props = defineProps({
  eventId: [String, Number],
  criteria: Array,
  rounds: Array
});

const emit = defineEmits(['refresh']);

const showAddModal = ref(false);

const getRoundName = (roundId) => {
  const round = props.rounds?.find(r => r.id === roundId);
  return round?.name || '-';
};

const editCriteria = (criterion) => {
  console.log('Edit criteria:', criterion);
};

const deleteCriteria = async (id) => {
  const confirmed = await showConfirm('Delete Criteria', 'Are you sure you want to delete this criteria?', {
    confirmText: 'Delete',
    confirmColor: '#dc2626'
  });
  if (!confirmed) return;
  
  try {
    await fetch(`/api/criteria/${id}`, { method: 'DELETE' });
    emit('refresh');
    showSuccess('Criteria deleted successfully');
  } catch (error) {
    showError('Failed to delete criteria');
  }
};
</script>
