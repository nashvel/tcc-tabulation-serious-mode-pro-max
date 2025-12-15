<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-semibold text-gray-900">Scoring Criteria</h2>
        <HelpButton @click="startTour" />
      </div>
      <button
        id="add-criteria-btn"
        @click="addCriteria"
        class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Plus :size="16" />
        Add Criteria
      </button>
    </div>

    <!-- Grouped by Round -->
    <div id="criteria-rounds-list" class="space-y-3">
      <div 
        v-for="(round, index) in rounds" 
        :key="round.id"
        :id="index === 0 ? 'first-round-group' : undefined"
        class="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <!-- Round Header (Clickable) -->
        <button
          @click="toggleRound(round.id)"
          :id="index === 0 ? 'round-header-btn' : undefined"
          class="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-center gap-3">
            <ChevronDown 
              :size="18" 
              class="text-gray-500 transition-transform"
              :class="{ '-rotate-90': !expandedRounds[round.id] }"
            />
            <span class="font-medium text-gray-900">{{ round.name }}</span>
            <span class="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
              {{ getCriteriaForRound(round.id).length }} criteria
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span 
              :id="index === 0 ? 'round-total-badge' : undefined"
              :class="[
                'text-sm font-medium px-2 py-0.5 rounded',
                getRoundTotal(round.id) === 100 
                  ? 'text-green-700 bg-green-100' 
                  : 'text-red-700 bg-red-100'
              ]"
            >
              {{ getRoundTotal(round.id) }}%
            </span>
          </div>
        </button>

        <!-- Criteria List (Collapsible) -->
        <div v-show="expandedRounds[round.id]" class="divide-y divide-gray-100">
          <div 
            v-for="criterion in getCriteriaForRound(round.id)" 
            :key="criterion.id"
            class="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-900">{{ criterion.name }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-600">{{ criterion.points }}%</span>
              <div class="flex items-center gap-1">
                <button 
                  @click.stop="editCriteria(criterion)" 
                  class="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Edit"
                >
                  <Pencil :size="14" />
                </button>
                <button 
                  @click.stop="deleteCriteria(criterion.id)" 
                  class="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
          </div>
          
          <!-- Empty state for round -->
          <div v-if="getCriteriaForRound(round.id).length === 0" class="px-4 py-3 text-center text-gray-400 text-sm">
            No criteria for this round
          </div>
        </div>
      </div>

      <!-- No rounds message -->
      <div v-if="!rounds?.length" class="text-center py-8 text-gray-500">
        No rounds available. Add rounds first.
      </div>
    </div>

    <!-- Tour Tooltip -->
    <TourTooltip
      :isActive="tour.isActive.value"
      :currentStep="tour.currentStep.value"
      :totalSteps="tourSteps.length"
      :step="tourSteps[tour.currentStep.value] || {}"
      :tooltipStyle="tour.tooltipStyle"
      :arrowStyle="tour.arrowStyle"
      :placement="tour.placement.value"
      @next="tour.nextStep"
      @prev="tour.prevStep"
      @skip="tour.endTour(false)"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Plus, Pencil, Trash2, ChevronDown } from 'lucide-vue-next';
import { showError, showSuccess, showConfirm, showFormModal } from '../../../utils/alerts';
import { useTour } from '../../../composables/useTour';
import TourTooltip from '../../shared/TourTooltip.vue';
import HelpButton from '../../shared/HelpButton.vue';

const props = defineProps({
  eventId: [String, Number],
  criteria: Array,
  rounds: Array
});

const emit = defineEmits(['refresh']);

// Tour steps for Criteria tab
const tourSteps = [
  {
    target: '#add-criteria-btn',
    title: 'Add Criteria',
    content: 'Click here to add new scoring criteria. Each criteria has a name and point value.',
    placement: 'bottom'
  },
  {
    target: '#first-round-group',
    title: 'Criteria by Round',
    content: 'Criteria are grouped by round. Each round shows its criteria in a collapsible section.',
    placement: 'bottom'
  },
  {
    target: '#round-header-btn',
    title: 'Expand/Collapse',
    content: 'Click on a round header to expand or collapse its criteria list.',
    placement: 'bottom'
  },
  {
    target: '#round-total-badge',
    title: 'Total Percentage',
    content: 'This badge shows the total points for the round. Green means 100% (correct), red means it needs adjustment.',
    placement: 'left'
  }
];

const tour = useTour('criteria-tab', tourSteps);

const startTour = () => {
  tour.startTour();
};

// Track which rounds are expanded (all open by default)
const expandedRounds = reactive({});

// Initialize all rounds as expanded
onMounted(() => {
  (props.rounds || []).forEach(round => {
    expandedRounds[round.id] = true;
  });
});

const toggleRound = (roundId) => {
  expandedRounds[roundId] = !expandedRounds[roundId];
};

const getCriteriaForRound = (roundId) => {
  return (props.criteria || []).filter(c => c.round_id === roundId);
};

const getRoundTotal = (roundId) => {
  return getCriteriaForRound(roundId).reduce((sum, c) => sum + (parseInt(c.points) || 0), 0);
};

const getRoundName = (roundId) => {
  const round = props.rounds?.find(r => r.id === roundId);
  return round?.name || '-';
};

const addCriteria = async () => {
  const roundOptions = (props.rounds || []).map(r => ({ value: r.id, label: r.name }));
  
  const result = await showFormModal('Add Criteria', {
    name: { label: 'Criteria Name', type: 'text', placeholder: 'e.g. Poise and Bearing' },
    points: { label: 'Max Points (%)', type: 'number', value: 25, placeholder: '25' },
    round_id: { 
      label: 'Round', 
      type: 'select', 
      options: roundOptions,
      value: roundOptions[0]?.value || ''
    }
  }, { confirmText: 'Add Criteria' });
  
  if (!result) return;
  if (!result.name?.trim()) {
    showError('Criteria name is required');
    return;
  }
  
  try {
    const response = await fetch('/api/criteria', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: props.eventId,
        round_id: parseInt(result.round_id),
        name: result.name.trim(),
        points: parseInt(result.points) || 25
      })
    });
    
    if (!response.ok) throw new Error('Failed to add criteria');
    
    emit('refresh');
    showSuccess('Criteria added successfully');
  } catch (error) {
    showError('Failed to add criteria');
  }
};

const editCriteria = async (criterion) => {
  const roundOptions = (props.rounds || []).map(r => ({ value: r.id, label: r.name }));
  
  const result = await showFormModal('Edit Criteria', {
    name: { label: 'Criteria Name', type: 'text', value: criterion.name },
    points: { label: 'Max Points (%)', type: 'number', value: criterion.points },
    round_id: { 
      label: 'Round', 
      type: 'select', 
      options: roundOptions,
      value: criterion.round_id
    }
  }, { confirmText: 'Save Changes' });
  
  if (!result) return;
  if (!result.name?.trim()) {
    showError('Criteria name is required');
    return;
  }
  
  try {
    const response = await fetch(`/api/criteria/${criterion.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        round_id: parseInt(result.round_id),
        name: result.name.trim(),
        points: parseInt(result.points) || 25
      })
    });
    
    if (!response.ok) throw new Error('Failed to update criteria');
    
    emit('refresh');
    showSuccess('Criteria updated successfully');
  } catch (error) {
    showError('Failed to update criteria');
  }
};

const deleteCriteria = async (id) => {
  const confirmed = await showConfirm('Delete Criteria', 'Are you sure you want to delete this criteria?', {
    confirmText: 'Delete',
    confirmColor: '#dc2626'
  });
  if (!confirmed) return;
  
  try {
    const response = await fetch(`/api/criteria/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete criteria');
    
    emit('refresh');
    showSuccess('Criteria deleted successfully');
  } catch (error) {
    showError('Failed to delete criteria');
  }
};
</script>
