<template>
  <!-- Preloader -->
  <Preloader v-if="loading" />

  <!-- Main Admin Interface -->
  <div v-else class="min-h-screen bg-white relative" data-global-context-menu="true">
    <!-- Admin Sidebar (hidden in focus mode) -->
    <AdminSidebar
      v-if="!focusMode"
      :isOpen="isSidebarOpen"
      :continuingEvent="continuingEvent"
      @close="isSidebarOpen = false"
      @navigate="handleSidebarNavigation"
    />

    <div class="flex-1 flex flex-col h-screen overflow-hidden relative z-0">
      <div class="flex-1 overflow-y-auto bg-gray-50">
        <!-- Fixed Header (hidden in focus mode) -->
        <FixedHeader
          v-if="!focusMode"
          :activeCategory="activeCategory"
          :continuingEvent="continuingEvent"
          :judges="judges"
          @edit-click="isSidebarOpen = true"
        />

        <!-- Main Content -->
        <div class="pb-10">
          <!-- Tab Navigation (hidden in focus mode) -->
          <div v-if="!focusMode" class="bg-white border-b border-gray-200" data-has-context-menu="true">
            <nav class="flex gap-1 px-4 py-1">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="switchTab(tab.id)"
                @contextmenu.prevent.stop="openTabContextMenu($event, tab)"
                :class="[
                  'py-2 px-3 text-sm font-medium rounded-md transition-colors',
                  activeTab === tab.id
                    ? (tabAccentColor === 'white' ? 'text-gray-700' : 'text-white')
                    : 'text-gray-600 hover:bg-gray-100'
                ]"
                :style="activeTab === tab.id ? { backgroundColor: tabColors[tabAccentColor] } : {}"
              >
                {{ tab.label }}
              </button>
            </nav>
          </div>
          
          <!-- Focus Mode Header (minimal, shows tab name and exit button) -->
          <div v-if="focusMode" class="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">{{ tabs.find(t => t.id === activeTab)?.label }}</span>
            <a 
              :href="`/admin?event_id=${continuingEvent?.id}`"
              class="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Exit Focus
            </a>
          </div>

          <!-- Tab Context Menu -->
          <div
            v-if="tabContextMenu.visible"
            class="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[180px]"
            :style="{ left: tabContextMenu.x + 'px', top: tabContextMenu.y + 'px' }"
          >
            <button
              @click="openTabInNewWindow"
              class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in New Tab
            </button>
            <div class="border-t border-gray-100 my-1"></div>
            <div class="px-4 py-2">
              <span class="text-xs text-gray-500 uppercase font-medium">Accent Color</span>
              <div class="flex gap-2 mt-2">
                <button
                  v-for="color in accentColors"
                  :key="color.name"
                  @click="setTabAccentColor(color.name)"
                  class="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                  :class="[
                    tabAccentColor === color.name ? 'border-gray-800 scale-110' : '',
                    color.isWhite ? 'border-gray-300 bg-white' : 'border-transparent'
                  ]"
                  :style="color.isWhite ? {} : { backgroundColor: color.value }"
                  :title="color.name"
                ></button>
              </div>
            </div>
          </div>

          <!-- Tab Content - Full Width -->
          <div class="bg-white relative">
              <!-- Tab Loading Overlay -->
              <div v-if="tabLoading" class="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <div class="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              </div>

              <!-- Judges Tab -->
              <div v-if="activeTab === 'judges'">
                <JudgesScoringTab
                  :eventId="continuingEvent?.id"
                  :judges="judges"
                  :rounds="rounds"
                  :candidates="candidates"
                  :criteria="criteria"
                />
              </div>

              <!-- Candidates Tab -->
              <div v-else-if="activeTab === 'candidates'">
                <CandidatesTab
                  :eventId="continuingEvent?.id"
                  :candidates="candidates"
                  @refresh="loadData"
                />
              </div>

              <!-- Rounds Tab -->
              <div v-else-if="activeTab === 'rounds'">
                <RoundsTab
                  :eventId="continuingEvent?.id"
                  :rounds="rounds"
                  @refresh="loadData"
                />
              </div>

              <!-- Criteria Tab -->
              <div v-else-if="activeTab === 'categories'">
                <CriteriaTab
                  :eventId="continuingEvent?.id"
                  :criteria="criteria"
                  :rounds="rounds"
                  @refresh="loadData"
                />
              </div>

              <!-- Results Tab -->
              <div v-else-if="activeTab === 'results'">
                <ResultsTab
                  :eventId="continuingEvent?.id"
                  :candidates="candidates"
                  :rounds="rounds"
                  :criteria="criteria"
                />
              </div>

              <!-- Best In Tab -->
              <div v-else-if="activeTab === 'bestin'">
                <BestInTab
                  :eventId="continuingEvent?.id"
                  :candidates="candidates"
                  :criteria="criteria"
                />
              </div>

              <!-- Templates Tab -->
              <div v-else-if="activeTab === 'templates'">
                <TemplatesTab
                  :eventId="continuingEvent?.id"
                />
              </div>

              <!-- Themes Tab -->
              <div v-else-if="activeTab === 'themes'">
                <ThemesTab
                  :eventId="continuingEvent?.id"
                />
              </div>

              <!-- Activity Logs Tab -->
              <div v-else-if="activeTab === 'logs'">
                <ActivityLogsTab
                  :eventId="continuingEvent?.id"
                />
              </div>

              <!-- Settings Tab -->
              <div v-else-if="activeTab === 'settings'">
                <SettingsTab
                  :eventId="continuingEvent?.id"
                />
              </div>
          </div>

          <!-- PodiumLedger Footer (hidden in focus mode) -->
          <PodiumLedgerFooter v-if="!focusMode" />
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ConfigureJudgesModal
      :isOpen="isJudgesModalOpen"
      :eventId="continuingEvent?.id"
      @close="isJudgesModalOpen = false"
    />

    <EventDetailsModal
      :isOpen="isEventDetailsModalOpen"
      :eventId="continuingEvent?.id"
      @close="isEventDetailsModalOpen = false"
    />

    <!-- Global Context Menu -->
    <GlobalContextMenu
      :visible="globalContextMenu.visible"
      :x="globalContextMenu.x"
      :y="globalContextMenu.y"
      :eventId="continuingEvent?.id"
      :eventSequence="rounds"
      :activeRound="activeCategory"
      @close="closeGlobalContextMenu"
      @category-change="handleCategoryChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showError } from '../../utils/alerts';
import Preloader from '../../components/shared/Preloader.vue';
import GlobalContextMenu from '../../components/shared/GlobalContextMenu.vue';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
import FixedHeader from '../../components/admin/FixedHeader.vue';
import PodiumLedgerFooter from '../../components/admin/PodiumLedgerFooter.vue';
import JudgesScoringTab from '../../components/admin/tabs/JudgesScoringTab.vue';
import CandidatesTab from '../../components/admin/tabs/CandidatesTab.vue';
import RoundsTab from '../../components/admin/tabs/RoundsTab.vue';
import CriteriaTab from '../../components/admin/tabs/CriteriaTab.vue';
import ResultsTab from '../../components/admin/tabs/ResultsTab.vue';
import BestInTab from '../../components/admin/tabs/BestInTab.vue';
import ActivityLogsTab from '../../components/admin/tabs/ActivityLogsTab.vue';
import SettingsTab from '../../components/admin/tabs/SettingsTab.vue';
import TemplatesTab from '../../components/admin/tabs/TemplatesTab.vue';
import ThemesTab from '../../components/admin/tabs/ThemesTab.vue';
import ConfigureJudgesModal from '../../components/admin/modals/ConfigureJudgesModal.vue';
import EventDetailsModal from '../../components/admin/modals/EventDetailsModal.vue';
import { useGlobalContextMenu } from '../../composables/useGlobalContextMenu';

const route = useRoute();
const router = useRouter();

// Global Context Menu
const { contextMenu: globalContextMenu, closeContextMenu: closeGlobalContextMenu, setupGlobalContextMenu, cleanupGlobalContextMenu } = useGlobalContextMenu();

// State
const loading = ref(true);
const tabLoading = ref(false);
const isSidebarOpen = ref(false);
const activeTab = ref('judges');
const continuingEvent = ref(null);
const activeCategory = ref(null);
const isJudgesModalOpen = ref(false);
const isEventDetailsModalOpen = ref(false);
const focusMode = ref(false); // Hide header/tabs when opened in new tab

// Tab Context Menu State
const tabContextMenu = ref({ visible: false, x: 0, y: 0, tab: null });
const tabAccentColor = ref('indigo');

// Color palette options
const accentColors = [
  { name: 'white', value: '#f3f4f6', isWhite: true }, // gray-100 for bg
  { name: 'indigo', value: '#4f46e5' },
  { name: 'blue', value: '#2563eb' },
  { name: 'emerald', value: '#059669' },
  { name: 'amber', value: '#d97706' },
  { name: 'rose', value: '#e11d48' },
  { name: 'purple', value: '#7c3aed' },
  { name: 'gray', value: '#4b5563' }
];

// Color values for inline styles
const tabColors = {
  white: '#f3f4f6', // gray-100 - light bg with dark text
  indigo: '#4f46e5',
  blue: '#2563eb',
  emerald: '#059669',
  amber: '#d97706',
  rose: '#e11d48',
  purple: '#7c3aed',
  gray: '#4b5563'
};

// Switch tab with loading indicator
const switchTab = async (tabId) => {
  if (activeTab.value === tabId) return;
  tabLoading.value = true;
  activeTab.value = tabId;
  // Small delay for visual feedback
  await new Promise(resolve => setTimeout(resolve, 150));
  tabLoading.value = false;
};

// Tab Context Menu Methods
const openTabContextMenu = (event, tab) => {
  // Close global context menu if open
  closeGlobalContextMenu();
  window.dispatchEvent(new CustomEvent('closeAllContextMenus'));
  
  tabContextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    tab: tab
  };
};

const closeTabContextMenu = () => {
  tabContextMenu.value.visible = false;
};

const openTabInNewWindow = () => {
  const tab = tabContextMenu.value.tab;
  if (tab && continuingEvent.value?.id) {
    const url = `/admin?event_id=${continuingEvent.value.id}&activeTab=${tab.id}&focus=true`;
    window.open(url, '_blank');
  }
  closeTabContextMenu();
};

const setTabAccentColor = (color) => {
  tabAccentColor.value = color;
  localStorage.setItem('tabAccentColor', color);
  closeTabContextMenu();
};

// Handle category change from context menu
const handleCategoryChange = (category) => {
  activeCategory.value = category;
};

// Data
const candidates = ref([]);
const rounds = ref([]);
const criteria = ref([]);
const judges = ref([]);

// Tabs configuration
const tabs = [
  { id: 'judges', label: 'Judges Scoring' },
  { id: 'candidates', label: 'Candidates' },
  { id: 'rounds', label: 'Rounds' },
  { id: 'categories', label: 'Criteria' },
  { id: 'results', label: 'Results' },
  { id: 'bestin', label: 'Best In' },
  { id: 'templates', label: 'Templates' },
  { id: 'themes', label: 'Themes' },
  { id: 'logs', label: 'Activity Logs' },
  { id: 'settings', label: 'Settings' }
];

// Methods
const handleSidebarNavigation = (tabOrPath) => {
  if (tabOrPath === 'judges-modal') {
    isJudgesModalOpen.value = true;
  } else if (tabOrPath === 'event-details-modal') {
    isEventDetailsModalOpen.value = true;
  } else if (tabOrPath === 'theme-modal') {
    // TODO: Open theme modal
  } else if (tabOrPath === 'settings-modal') {
    // TODO: Open settings modal
  } else if (tabOrPath?.startsWith('/')) {
    router.push(tabOrPath);
    isSidebarOpen.value = false;
  } else {
    activeTab.value = tabOrPath;
    isSidebarOpen.value = false;
  }
};

const loadData = async () => {
  if (!continuingEvent.value?.id) return;
  
  const eventId = continuingEvent.value.id;
  
  try {
    const [candidatesRes, roundsRes, criteriaRes, judgesRes] = await Promise.all([
      fetch(`/api/candidates?event_id=${eventId}`).then(r => r.json()),
      fetch(`/api/rounds?event_id=${eventId}`).then(r => r.json()),
      fetch(`/api/criteria?event_id=${eventId}`).then(r => r.json()),
      fetch(`/api/judges?event_id=${eventId}`).then(r => r.json())
    ]);

    candidates.value = Array.isArray(candidatesRes) ? candidatesRes : candidatesRes.data || [];
    rounds.value = Array.isArray(roundsRes) ? roundsRes : roundsRes.data || [];
    criteria.value = Array.isArray(criteriaRes) ? criteriaRes : criteriaRes.data || [];
    judges.value = Array.isArray(judgesRes) ? judgesRes : judgesRes.data || [];
  } catch (error) {
    showError('Failed to load event data');
  }
};

const loadVotingState = async () => {
  if (!continuingEvent.value?.id) return;
  
  try {
    const response = await fetch(`/api/voting/state?event_id=${continuingEvent.value.id}`);
    const data = await response.json();
    
    if (data?.active_round) {
      activeCategory.value = data.active_round;
    }
  } catch (error) {
    showError('Failed to load voting state');
  }
};

// Activate this event for judging (clears other events)
const activateEventForJudging = async (eventId) => {
  try {
    // Call the new endpoint that sets this event as active for judging
    // This clears all other events' active rounds and makes this one the active one
    const response = await fetch(`/api/events/${eventId}/set-active-for-judging`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      console.log(`Event ${eventId} set as active for judging`);
    } else {
      console.error('Failed to set event as active for judging');
    }
  } catch (error) {
    console.error('Failed to activate event for judging:', error);
  }
};

// Initialize
onMounted(async () => {
  // Setup global context menu
  setupGlobalContextMenu();
  
  // Get event_id from URL parameter (primary method)
  const eventId = route.query.event_id;
  
  if (eventId) {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (response.ok) {
        continuingEvent.value = await response.json();
      }
    } catch (error) {
      showError('Failed to fetch event');
    }
  }

  // Redirect to setup if no event_id in URL
  if (!continuingEvent.value) {
    router.push('/setup');
    return;
  }

  // Check URL params for activeTab and focus mode
  const tabParam = route.query.activeTab;
  if (tabParam) {
    activeTab.value = tabParam;
  }
  
  // Enable focus mode if URL has focus=true (hides header/tabs)
  if (route.query.focus === 'true') {
    focusMode.value = true;
  }

  await loadData();
  await loadVotingState();
  
  // Auto-activate this event for judging when admin loads it
  await activateEventForJudging(continuingEvent.value.id);

  loading.value = false;
});

// Keyboard shortcut: Press 'E' to toggle sidebar
const handleKeyPress = (event) => {
  if (event.key === 'e' || event.key === 'E') {
    if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
      isSidebarOpen.value = !isSidebarOpen.value;
    }
  }
  if (event.key === 'Escape') {
    if (isSidebarOpen.value) isSidebarOpen.value = false;
    if (tabContextMenu.value.visible) closeTabContextMenu();
  }
};

// Close tab context menu on click outside
const handleClickOutside = (event) => {
  if (tabContextMenu.value.visible) {
    closeTabContextMenu();
  }
};

// Add keyboard listener in the main onMounted (already exists above)
// We need to add it there, so let's use onMounted here for keyboard only
onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
  window.addEventListener('click', handleClickOutside);
  
  // Load saved accent color
  const savedColor = localStorage.getItem('tabAccentColor');
  if (savedColor && tabColors[savedColor]) {
    tabAccentColor.value = savedColor;
  }
});

// Cleanup
onUnmounted(() => {
  cleanupGlobalContextMenu();
  window.removeEventListener('keydown', handleKeyPress);
  window.removeEventListener('click', handleClickOutside);
});
</script>
