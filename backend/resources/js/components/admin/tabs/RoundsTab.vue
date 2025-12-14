<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">Rounds</h2>
      <button
        @click="showAddModal = true"
        class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <Plus :size="16" />
        Add Round
      </button>
    </div>

    <!-- Rounds Table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Order</th>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
            <th class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="round in rounds" :key="round.id" class="hover:bg-gray-50">
            <td class="py-3 px-4 text-sm text-gray-900">{{ round.order || round.spot || round.id }}</td>
            <td class="py-3 px-4 text-sm font-medium text-gray-900">{{ round.name }}</td>
            <td class="py-3 px-4">
              <span v-if="activeRoundId === round.id" class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Active
              </span>
              <span v-else class="text-sm text-gray-400">-</span>
            </td>
            <td class="py-3 px-4">
              <div class="flex items-center justify-center gap-1">
                <button 
                  v-if="activeRoundId !== round.id"
                  @click="activateRound(round)" 
                  class="p-1.5 rounded-md text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                  title="Activate Round"
                >
                  <Play :size="16" />
                </button>
                <button 
                  @click="editRound(round)" 
                  class="p-1.5 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Edit"
                >
                  <Pencil :size="16" />
                </button>
                <button 
                  @click="deleteRound(round.id)" 
                  class="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!rounds?.length">
            <td colspan="4" class="py-8 text-center text-gray-500">No rounds yet</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Plus, Pencil, Trash2, Play } from 'lucide-vue-next';
import { showError, showSuccess, showConfirm } from '../../../utils/alerts';

const props = defineProps({
  eventId: [String, Number],
  rounds: Array
});

const emit = defineEmits(['refresh']);

const showAddModal = ref(false);
const activeRoundId = ref(null);

const loadVotingState = async () => {
  if (!props.eventId) return;
  try {
    const response = await fetch(`/api/voting/state?event_id=${props.eventId}`);
    const data = await response.json();
    activeRoundId.value = data.active_round_id || data.active_round?.id || null;
  } catch (error) {
    console.error('Failed to load voting state:', error);
  }
};

const activateRound = async (round) => {
  try {
    const response = await fetch('/api/voting/activate-round', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: props.eventId,
        round_id: round.id
      })
    });
    
    if (!response.ok) throw new Error('Failed to activate round');
    
    activeRoundId.value = round.id;
    showSuccess(`Round "${round.name}" activated for judging`);
    emit('refresh');
  } catch (error) {
    showError('Failed to activate round');
  }
};

const editRound = (round) => {
  console.log('Edit round:', round);
};

const deleteRound = async (id) => {
  const confirmed = await showConfirm('Delete Round', 'Are you sure you want to delete this round?', {
    confirmText: 'Delete',
    confirmColor: '#dc2626'
  });
  if (!confirmed) return;
  
  try {
    await fetch(`/api/rounds/${id}`, { method: 'DELETE' });
    emit('refresh');
    showSuccess('Round deleted successfully');
  } catch (error) {
    showError('Failed to delete round');
  }
};

onMounted(() => {
  loadVotingState();
});
</script>
