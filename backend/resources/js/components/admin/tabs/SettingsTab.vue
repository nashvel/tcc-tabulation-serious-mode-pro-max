<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-semibold text-gray-900">Settings</h2>
        <HelpButton @click="startTour" />
      </div>
    </div>

    <!-- Judge Screen Display -->
    <div id="display-settings" class="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
      <div class="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <h3 class="text-xs font-semibold text-gray-600 uppercase">Judge Screen Display</h3>
      </div>
      <div class="divide-y divide-gray-100">
        <!-- Show Candidate Name Toggle -->
        <div class="flex items-center justify-between px-4 py-4">
          <div>
            <p class="font-medium text-gray-900">Show Candidate Name</p>
            <p class="text-sm text-gray-500">Display the candidate's name on judge screens</p>
          </div>
          <button
            @click="toggleSetting('show_candidate_name')"
            :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              displaySettings.show_candidate_name ? 'bg-indigo-600' : 'bg-gray-200'
            ]"
          >
            <span
              :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow',
                displaySettings.show_candidate_name ? 'translate-x-6' : 'translate-x-1'
              ]"
            />
          </button>
        </div>

        <!-- Show Team/Department Toggle -->
        <div class="flex items-center justify-between px-4 py-4">
          <div>
            <p class="font-medium text-gray-900">Show Team / Department</p>
            <p class="text-sm text-gray-500">Display the candidate's team or department</p>
          </div>
          <button
            @click="toggleSetting('show_team_department')"
            :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              displaySettings.show_team_department ? 'bg-indigo-600' : 'bg-gray-200'
            ]"
          >
            <span
              :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow',
                displaySettings.show_team_department ? 'translate-x-6' : 'translate-x-1'
              ]"
            />
          </button>
        </div>
      </div>
      
      <!-- Preview -->
      <div class="px-4 py-4 bg-gray-50 border-t border-gray-200">
        <p class="text-xs text-gray-500 uppercase tracking-wide mb-2">Preview</p>
        <div class="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
          <div class="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            01
          </div>
          <div v-if="displaySettings.show_candidate_name || displaySettings.show_team_department">
            <p v-if="displaySettings.show_candidate_name" class="font-medium text-gray-900">Sample Candidate</p>
            <p v-if="displaySettings.show_team_department" class="text-xs text-gray-500">College of Engineering</p>
          </div>
          <p v-else class="text-sm text-gray-400 italic">Only candidate number visible</p>
        </div>
      </div>
    </div>

    <!-- Registered Screens -->
    <div id="registered-screens" class="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
      <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h3 class="text-xs font-semibold text-gray-600 uppercase">Registered Screens</h3>
          <span v-if="isLive" class="flex items-center gap-1 text-xs text-green-600">
            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="registeredScreens.length >= 2"
            @click="openSwapModal"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftRight :size="14" />
            Swap
          </button>
          <button
            v-if="registeredScreens.length > 0"
            @click="clearAllScreens"
            :disabled="clearingScreens"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 :size="14" />
            Reset
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="registeredScreens.length === 0" class="text-center py-4">
        <Monitor class="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p class="text-gray-500 text-sm">No screens registered yet</p>
        <p class="text-gray-400 text-xs mt-1">Screens will appear here when judges connect</p>
      </div>

      <!-- Screens Table -->
      <table v-else class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Screen</th>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Judge</th>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">IP Address</th>
            <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Connected</th>
            <th class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr 
            v-for="screen in registeredScreens" 
            :key="screen.screen_number"
            class="hover:bg-gray-50"
          >
            <td class="py-3 px-4">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-700 font-bold text-sm">
                {{ screen.screen_number }}
              </span>
            </td>
            <td class="py-3 px-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Judge {{ screen.chair_number || screen.judge_id }}
              </span>
            </td>
            <td class="py-3 px-4">
              <span class="text-sm text-gray-600 font-mono">{{ screen.ip_address || 'Unknown' }}</span>
            </td>
            <td class="py-3 px-4">
              <span class="text-sm text-gray-500">{{ formatConnectedAt(screen.connected_at) }}</span>
            </td>
            <td class="py-3 px-4">
              <div class="flex items-center justify-center">
                <button
                  @click="kickScreen(screen)"
                  :disabled="kickingScreen === screen.screen_number"
                  class="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Remove"
                >
                  <UserX :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Available Slots Info -->
      <div v-if="availableSlots > 0 && registeredScreens.length > 0" class="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <p class="text-sm text-gray-500">
          {{ availableSlots }} judge position{{ availableSlots > 1 ? 's' : '' }} available
        </p>
      </div>
    </div>

    <!-- Status Indicator -->
    <div v-if="saving" class="flex items-center gap-2 text-sm text-gray-500">
      <div class="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      Saving...
    </div>
    <div v-else-if="lastSaved" class="flex items-center gap-2 text-sm text-green-600">
      <Check :size="16" />
      Settings saved
    </div>

    <!-- Swap Judges Modal -->
    <div v-if="showSwapModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Swap Judge Assignments</h2>
        </div>
        
        <div class="p-6 space-y-4">
          <p class="text-sm text-gray-500">
            Select two screens to swap their judge assignments.
          </p>
          
          <!-- Screen 1 Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First Screen</label>
            <select 
              v-model="swapScreen1" 
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            >
              <option :value="null">Select a screen...</option>
              <option 
                v-for="screen in registeredScreens" 
                :key="screen.screen_number" 
                :value="screen.screen_number"
                :disabled="screen.screen_number === swapScreen2"
              >
                Screen {{ screen.screen_number }} → Judge {{ screen.chair_number || screen.judge_id }}
              </option>
            </select>
          </div>
          
          <!-- Swap Icon -->
          <div class="flex justify-center">
            <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <ArrowLeftRight :size="20" />
            </div>
          </div>
          
          <!-- Screen 2 Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Second Screen</label>
            <select 
              v-model="swapScreen2" 
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            >
              <option :value="null">Select a screen...</option>
              <option 
                v-for="screen in registeredScreens" 
                :key="screen.screen_number" 
                :value="screen.screen_number"
                :disabled="screen.screen_number === swapScreen1"
              >
                Screen {{ screen.screen_number }} → Judge {{ screen.chair_number || screen.judge_id }}
              </option>
            </select>
          </div>
          
          <!-- Preview -->
          <div v-if="swapScreen1 && swapScreen2" class="p-3 bg-indigo-50 rounded-lg">
            <p class="text-sm text-indigo-700">
              Screen {{ swapScreen1 }} ↔ Screen {{ swapScreen2 }}
            </p>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button 
            @click="closeSwapModal" 
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="performSwap"
            :disabled="!swapScreen1 || !swapScreen2 || swappingScreens"
            class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div v-if="swappingScreens" class="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
            <ArrowLeftRight v-else :size="16" />
            Swap
          </button>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Check, CheckCircle, Info, Monitor, Trash2, UserX, ArrowLeftRight, X } from 'lucide-vue-next';
import { showError, showSuccess } from '../../../utils/alerts';
import { useTour } from '../../../composables/useTour';
import Swal from 'sweetalert2';
import TourTooltip from '../../shared/TourTooltip.vue';
import HelpButton from '../../shared/HelpButton.vue';

const props = defineProps({
  eventId: [String, Number]
});

// Tour steps for Settings tab
const tourSteps = [
  {
    target: '#display-settings',
    title: 'Display Settings',
    content: 'Control what information judges see on their screens. Toggle candidate names and team/department visibility.',
    placement: 'bottom'
  },
  {
    target: '#registered-screens',
    title: 'Registered Screens',
    content: 'View all connected judge screens. You can swap judge assignments, kick individual screens, or reset all connections.',
    placement: 'top'
  }
];

const tour = useTour('settings-tab', tourSteps);

const startTour = () => {
  tour.startTour();
};

const displaySettings = ref({
  show_candidate_name: true,
  show_team_department: true,
  judge_login_mode: 'auto',
});

const saving = ref(false);
const lastSaved = ref(false);

// Registered screens state
const registeredScreens = ref([]);
const maxJudges = ref(0);
const isLive = ref(false);
const clearingScreens = ref(false);
const kickingScreen = ref(null);

// Swap modal state
const showSwapModal = ref(false);
const swapScreen1 = ref(null);
const swapScreen2 = ref(null);
const swappingScreens = ref(false);

const availableSlots = computed(() => maxJudges.value - registeredScreens.value.length);

const loadSettings = async () => {
  if (!props.eventId) return;
  
  try {
    const response = await fetch(`/api/voting/display-settings?event_id=${props.eventId}`);
    const data = await response.json();
    if (data?.display_settings) {
      displaySettings.value = data.display_settings;
    }
  } catch (error) {
    console.error('Failed to load display settings:', error);
  }
};

const toggleSetting = async (key) => {
  displaySettings.value[key] = !displaySettings.value[key];
  await saveSettings();
};



const saveSettings = async () => {
  if (!props.eventId) return;
  
  saving.value = true;
  lastSaved.value = false;
  
  try {
    const response = await fetch('/api/voting/display-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: props.eventId,
        ...displaySettings.value
      })
    });
    
    if (response.ok) {
      lastSaved.value = true;
      setTimeout(() => { lastSaved.value = false; }, 3000);
    } else {
      showError('Failed to save settings');
    }
  } catch (error) {
    showError('Failed to save settings');
  } finally {
    saving.value = false;
  }
};

// Load registered screens
const loadRegisteredScreens = async () => {
  if (!props.eventId) return;
  
  try {
    const response = await fetch(`/api/judge/registered-screens?event_id=${props.eventId}`);
    const data = await response.json();
    
    registeredScreens.value = data.registered_screens || [];
    maxJudges.value = data.max_judges || 0;
  } catch (error) {
    console.error('Failed to load registered screens:', error);
  }
};

// Kick/remove a specific screen
const kickScreen = async (screen) => {
  if (!props.eventId) return;
  
  // Fetch score count for this judge
  let scoreCount = 0;
  try {
    const judgeId = screen.judge_id;
    if (judgeId) {
      const countRes = await fetch(`/api/points?event_id=${props.eventId}&judge_id=${judgeId}`);
      if (countRes.ok) {
        const scores = await countRes.json();
        scoreCount = Array.isArray(scores) ? scores.length : 0;
      }
    }
  } catch (e) {
    console.error('Failed to fetch score count', e);
  }
  
  // Build confirmation message
  const scoreWarning = scoreCount > 0 
    ? `<p class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"><strong> Warning:</strong> This judge has entered <strong>${scoreCount}</strong> score(s) that will be permanently deleted.</p>`
    : '<p class="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm">This judge has not entered any scores yet.</p>';
  
  // Show confirmation dialog using Swal directly for HTML support
  const result = await Swal.fire({
    title: 'Remove Judge Screen',
    html: `<p>Are you sure you want to remove Screen ${screen.screen_number} (Judge #${screen.chair_number || screen.judge_id})?</p>${scoreWarning}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280',
    confirmButtonText: scoreCount > 0 ? `Remove & Delete ${scoreCount} Scores` : 'Remove Screen',
    cancelButtonText: 'Cancel'
  });
  
  if (!result.isConfirmed) return;
  
  kickingScreen.value = screen.screen_number;
  
  try {
    const response = await fetch('/api/judge/unregister-screen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: props.eventId,
        screen_number: screen.screen_number
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      const scoresMsg = data.scores_cleared > 0 ? ` and ${data.scores_cleared} scores cleared` : '';
      showSuccess(`Screen ${screen.screen_number} removed${scoresMsg}`);
      // The WebSocket will update the list, but we can also update locally
      registeredScreens.value = registeredScreens.value.filter(
        s => s.screen_number !== screen.screen_number
      );
    } else {
      showError('Failed to remove screen');
    }
  } catch (error) {
    showError('Failed to remove screen');
  } finally {
    kickingScreen.value = null;
  }
};

// Clear all registered screens
const clearAllScreens = async () => {
  if (!props.eventId) return;
  
  if (!confirm('Are you sure you want to remove all registered screens? All judges will need to reconnect.')) {
    return;
  }
  
  clearingScreens.value = true;
  
  try {
    const response = await fetch('/api/judge/clear-screens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: props.eventId
      })
    });
    
    if (response.ok) {
      showSuccess('All screens reset - judges will need to reconnect');
      registeredScreens.value = [];
    } else {
      showError('Failed to reset screens');
    }
  } catch (error) {
    showError('Failed to reset screens');
  } finally {
    clearingScreens.value = false;
  }
};

// Format connected_at timestamp
const formatConnectedAt = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Unknown';
  }
};

// Swap judges functionality
const openSwapModal = () => {
  swapScreen1.value = null;
  swapScreen2.value = null;
  showSwapModal.value = true;
};

const closeSwapModal = () => {
  showSwapModal.value = false;
  swapScreen1.value = null;
  swapScreen2.value = null;
};

const getScreenJudge = (screenNumber) => {
  const screen = registeredScreens.value.find(s => s.screen_number === screenNumber);
  return screen ? (screen.chair_number || screen.judge_id) : '?';
};

const performSwap = async () => {
  if (!props.eventId || !swapScreen1.value || !swapScreen2.value) return;
  
  swappingScreens.value = true;
  
  try {
    const response = await fetch('/api/judge/swap-screens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: props.eventId,
        screen_number_1: swapScreen1.value,
        screen_number_2: swapScreen2.value
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      showSuccess(`Judge assignments swapped between Screen ${swapScreen1.value} and Screen ${swapScreen2.value}`);
      // Update local state with the new screens data
      if (data.registered_screens) {
        registeredScreens.value = data.registered_screens;
      }
      closeSwapModal();
    } else {
      showError(data.error || data.message || 'Failed to swap judges');
    }
  } catch (error) {
    console.error('Error swapping screens:', error);
    showError('Failed to swap judges');
  } finally {
    swappingScreens.value = false;
  }
};

// Handle WebSocket screen registration updates
const handleScreenRegistrationChange = (data) => {
  console.log('[WebSocket] Screen registration update:', data);
  
  if (data.registered_screens) {
    registeredScreens.value = data.registered_screens;
  }
};

// Setup WebSocket connection for real-time updates
let currentChannel = null;

const setupWebSocket = () => {
  if (!props.eventId || !window.Echo) return;
  
  const channelName = `voting.${props.eventId}`;
  console.log('[WebSocket] SettingsTab: Connecting to channel:', channelName);
  
  const channel = window.Echo.channel(channelName);
  
  channel.subscribed(() => {
    console.log('[WebSocket] SettingsTab: Subscribed to channel:', channelName);
    isLive.value = true;
  });
  
  channel.listen('.ScreenRegistrationChanged', (data) => {
    handleScreenRegistrationChange(data);
  });
  
  currentChannel = channelName;
};

const cleanupWebSocket = () => {
  if (currentChannel && window.Echo) {
    window.Echo.leave(currentChannel);
    console.log('🔌 SettingsTab: Left channel:', currentChannel);
    currentChannel = null;
  }
  isLive.value = false;
};

onMounted(() => {
  loadSettings();
  loadRegisteredScreens();
  setupWebSocket();
});

onUnmounted(() => {
  cleanupWebSocket();
});

// Re-setup WebSocket if eventId changes
watch(() => props.eventId, (newEventId, oldEventId) => {
  if (newEventId !== oldEventId) {
    cleanupWebSocket();
    loadSettings();
    loadRegisteredScreens();
    setupWebSocket();
  }
});
</script>
