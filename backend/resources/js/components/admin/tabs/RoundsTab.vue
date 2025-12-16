<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-semibold text-gray-900">Rounds</h2>
        <HelpButton @click="startTour" />
      </div>
      <button
        id="add-round-btn"
        @click="addRound"
        class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Plus :size="16" />
        Add Round
      </button>
    </div>

    <!-- Rounds Table -->
    <div id="rounds-table" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Order</th>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
            <th id="status-column" class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
            <th id="actions-column" class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
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
            <td colspan="4" class="py-4 text-center text-gray-500 text-sm">No rounds yet</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>

  <!-- Tour Tooltip (teleported to body) -->
  <Teleport to="body">
    <TourTooltip
      :isActive="tour.isActive.value"
      :currentStep="tour.currentStep.value"
      :totalSteps="tourSteps.length"
      :step="tourSteps[tour.currentStep.value] || {}"
      :tooltipStyle="tour.tooltipStyle.value"
      :arrowStyle="tour.arrowStyle.value"
      :placement="tour.placement.value"
      @next="tour.nextStep"
      @prev="tour.prevStep"
      @skip="tour.endTour(false)"
    />
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Plus, Pencil, Trash2, Play } from 'lucide-vue-next';
import { showError, showSuccess, showConfirm, showFormModal } from '../../../utils/alerts';
import { useTour } from '../../../composables/useTour';
import TourTooltip from '../../shared/TourTooltip.vue';
import HelpButton from '../../shared/HelpButton.vue';

const props = defineProps({
  eventId: [String, Number],
  rounds: Array
});

const emit = defineEmits(['refresh']);

const showAddModal = ref(false);
const activeRoundId = ref(null);

// Tour steps for Rounds tab
const tourSteps = [
  {
    target: '#add-round-btn',
    title: 'Add Round',
    content: 'Click here to create a new round. Rounds represent different stages of your event (e.g., Sports Attire, Talent, Q&A).',
    placement: 'bottom'
  },
  {
    target: '#rounds-table',
    title: 'Rounds List',
    content: 'All your rounds are displayed here with their order, name, and current status.',
    placement: 'bottom'
  },
  {
    target: '#status-column',
    title: 'Active Status',
    content: 'Shows which round is currently active for judging. Only one round can be active at a time.',
    placement: 'bottom'
  },
  {
    target: '#actions-column',
    title: 'Round Actions',
    content: 'Use these buttons to activate a round for judging (play icon), edit its details, or delete it.',
    placement: 'left'
  }
];

const tour = useTour('rounds-tab', tourSteps);

const startTour = () => {
  tour.startTour();
};

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

const addRound = async () => {
  const result = await showFormModal('Add Round', {
    name: { label: 'Round Name', type: 'text', placeholder: 'e.g. Sports Attire' },
    spot: { label: 'Order', type: 'number', value: (props.rounds?.length || 0) + 1 }
  }, { confirmText: 'Add Round' });
  
  if (!result) return;
  if (!result.name?.trim()) {
    showError('Round name is required');
    return;
  }
  
  try {
    const response = await fetch('/api/rounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: props.eventId,
        name: result.name.trim(),
        spot: parseInt(result.spot) || 1
      })
    });
    
    if (!response.ok) throw new Error('Failed to add round');
    
    emit('refresh');
    showSuccess('Round added successfully');
  } catch (error) {
    showError('Failed to add round');
  }
};

const editRound = async (round) => {
  const result = await showFormModal('Edit Round', {
    name: { label: 'Round Name', type: 'text', value: round.name },
    spot: { label: 'Order', type: 'number', value: round.spot || round.order || 1 }
  }, { confirmText: 'Save Changes' });
  
  if (!result) return;
  if (!result.name?.trim()) {
    showError('Round name is required');
    return;
  }
  
  try {
    const response = await fetch(`/api/rounds/${round.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: result.name.trim(),
        spot: parseInt(result.spot) || 1
      })
    });
    
    if (!response.ok) throw new Error('Failed to update round');
    
    emit('refresh');
    showSuccess('Round updated successfully');
  } catch (error) {
    showError('Failed to update round');
  }
};

const deleteRound = async (id) => {
  const confirmed = await showConfirm('Delete Round', 'Are you sure you want to delete this round? This will also delete all criteria and scores for this round.', {
    confirmText: 'Delete',
    confirmColor: '#dc2626'
  });
  if (!confirmed) return;
  
  try {
    const response = await fetch(`/api/rounds/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete round');
    
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
