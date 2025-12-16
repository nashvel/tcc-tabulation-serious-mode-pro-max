<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-semibold text-gray-900">Candidates</h2>
        <HelpButton @click="startTour" />
      </div>
      <button
        id="add-candidate-btn"
        @click="openAddModal"
        class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Plus :size="16" />
        Add Candidate
      </button>
    </div>

    <!-- Candidates Table -->
    <div id="candidates-table" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
            <th id="type-column" class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Team/Dept</th>
            <th id="candidate-actions" class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="candidate in candidates" :key="candidate.id" class="hover:bg-gray-50">
            <td class="py-3 px-4 text-sm text-gray-900">{{ candidate.number }}</td>
            <td class="py-3 px-4 text-sm font-medium text-gray-900">{{ candidate.name }}</td>
            <td class="py-3 px-4">
              <span :class="getTypeBadgeClass(candidate.gender || candidate.participant_type)">
                {{ formatType(candidate.gender || candidate.participant_type) }}
              </span>
            </td>
            <td class="py-3 px-4 text-sm text-gray-600">{{ candidate.team || candidate.department || '-' }}</td>
            <td class="py-3 px-4">
              <div class="flex items-center justify-center gap-1">
                <button 
                  @click="editCandidate(candidate)" 
                  class="p-1.5 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Edit"
                >
                  <Pencil :size="16" />
                </button>
                <button 
                  @click="deleteCandidate(candidate.id)" 
                  class="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!candidates?.length">
            <td colspan="5" class="py-4 text-center text-gray-500 text-sm">No candidates yet</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">{{ editingCandidate ? 'Edit Candidate' : 'Add New Candidate' }}</h2>
        </div>
        <form @submit.prevent="saveCandidate" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Number</label>
              <input 
                v-model="formData.number" 
                type="number" 
                required 
                min="1"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                placeholder="e.g. 1"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select 
                v-model="formData.gender"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Solo">Solo</option>
                <option value="Group">Group</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              v-model="formData.name" 
              type="text" 
              required 
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              placeholder="Enter candidate name"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Team / Department</label>
            <input 
              v-model="formData.department" 
              type="text" 
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              placeholder="Optional"
            />
          </div>
          <div class="flex gap-3 pt-4">
            <button 
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {{ editingCandidate ? 'Update' : 'Add Candidate' }}
            </button>
          </div>
        </form>
      </div>
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
import { ref } from 'vue';
import { Plus, Pencil, Trash2 } from 'lucide-vue-next';
import { showError, showSuccess, showConfirm } from '../../../utils/alerts';
import { useTour } from '../../../composables/useTour';
import TourTooltip from '../../shared/TourTooltip.vue';
import HelpButton from '../../shared/HelpButton.vue';

const props = defineProps({
  eventId: [String, Number],
  candidates: Array
});

const emit = defineEmits(['refresh']);

// Tour steps for Candidates tab
const tourSteps = [
  {
    target: '#add-candidate-btn',
    title: 'Add Candidate',
    content: 'Click here to add a new candidate/participant to your event.',
    placement: 'bottom'
  },
  {
    target: '#candidates-table',
    title: 'Candidates List',
    content: 'All your candidates are displayed here with their number, name, type, and team/department.',
    placement: 'bottom'
  },
  {
    target: '#type-column',
    title: 'Candidate Type',
    content: 'Shows the type of candidate: Female, Male, Solo, or Group. This determines how they are grouped in results.',
    placement: 'bottom'
  },
  {
    target: '#candidate-actions',
    title: 'Edit & Delete',
    content: 'Use these buttons to edit candidate details or remove them from the event.',
    placement: 'left'
  }
];

const tour = useTour('candidates-tab', tourSteps);

const startTour = () => {
  tour.startTour();
};

const showAddModal = ref(false);
const editingCandidate = ref(null);
const formData = ref({ number: '', name: '', gender: 'Female', department: '' });

// Type badge styling - white background for all
const getTypeBadgeClass = (type) => {
  const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';
  switch (type?.toLowerCase()) {
    case 'female':
      return `${baseClass} bg-white border-pink-300 text-pink-600`;
    case 'male':
      return `${baseClass} bg-white border-blue-300 text-blue-600`;
    case 'solo':
    case 'individual':
      return `${baseClass} bg-white border-indigo-300 text-indigo-600`;
    case 'group':
    case 'team':
      return `${baseClass} bg-white border-purple-300 text-purple-600`;
    default:
      return `${baseClass} bg-white border-gray-300 text-gray-600`;
  }
};

const formatType = (type) => {
  if (!type) return '-';
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

const openAddModal = () => {
  editingCandidate.value = null;
  formData.value = { number: '', name: '', gender: 'Female', department: '' };
  showAddModal.value = true;
};

const editCandidate = (candidate) => {
  editingCandidate.value = candidate;
  formData.value = {
    number: candidate.number,
    name: candidate.name,
    gender: candidate.gender || candidate.participant_type || 'Female',
    department: candidate.department || candidate.team || ''
  };
  showAddModal.value = true;
};

const closeModal = () => {
  showAddModal.value = false;
  editingCandidate.value = null;
  formData.value = { number: '', name: '', gender: 'Female', department: '' };
};

const saveCandidate = async () => {
  try {
    const url = editingCandidate.value 
      ? `/api/candidates/${editingCandidate.value.id}` 
      : '/api/candidates';
    const method = editingCandidate.value ? 'PUT' : 'POST';
    
    const body = {
      event_id: props.eventId,
      number: parseInt(formData.value.number),
      name: formData.value.name,
      gender: formData.value.gender,
      participant_type: formData.value.gender.toLowerCase(),
      department: formData.value.department || null,
      order: parseInt(formData.value.number)
    };
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) throw new Error('Failed to save');
    
    showSuccess(editingCandidate.value ? 'Candidate updated' : 'Candidate added');
    closeModal();
    emit('refresh');
  } catch (error) {
    showError('Failed to save candidate');
  }
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
