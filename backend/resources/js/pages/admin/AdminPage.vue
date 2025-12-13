<template>
  <!-- Preloader -->
  <Preloader v-if="loading" />

  <!-- Main Admin Interface -->
  <div v-else class="min-h-screen bg-white relative" data-global-context-menu="true">
    <!-- Admin Sidebar -->
    <AdminSidebar
      :isOpen="isSidebarOpen"
      :continuingEvent="continuingEvent"
      @close="isSidebarOpen = false"
      @navigate="handleSidebarNavigation"
    />

    <div class="flex-1 flex flex-col h-screen overflow-hidden relative z-0">
      <div class="flex-1 overflow-y-auto bg-gray-50">
        <!-- Fixed Header -->
        <FixedHeader
          :activeCategory="activeCategory"
          :continuingEvent="continuingEvent"
          :judges="judges"
          @edit-click="isSidebarOpen = true"
        />

        <!-- Main Content -->
        <div class="pb-10">
          <!-- Tab Navigation -->
          <div class="bg-white border-b border-gray-200">
            <nav class="flex gap-4 px-4">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'py-3 px-1 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                {{ tab.label }}
              </button>
            </nav>
          </div>

          <!-- Tab Content - Full Width -->
          <div class="bg-white">
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
          </div>

          <!-- PodiumLedger Footer -->
          <PodiumLedgerFooter />
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
import ConfigureJudgesModal from '../../components/admin/modals/ConfigureJudgesModal.vue';
import EventDetailsModal from '../../components/admin/modals/EventDetailsModal.vue';
import { useGlobalContextMenu } from '../../composables/useGlobalContextMenu';

const route = useRoute();
const router = useRouter();

// Global Context Menu
const { contextMenu: globalContextMenu, closeContextMenu: closeGlobalContextMenu, setupGlobalContextMenu, cleanupGlobalContextMenu } = useGlobalContextMenu();

// State
const loading = ref(true);
const isSidebarOpen = ref(false);
const activeTab = ref('judges');
const continuingEvent = ref(null);
const activeCategory = ref(null);
const isJudgesModalOpen = ref(false);
const isEventDetailsModalOpen = ref(false);

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
  { id: 'bestin', label: 'Best In' }
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
      console.log(`✅ Event ${eventId} set as active for judging`);
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

  // Check URL params for activeTab
  const tabParam = route.query.activeTab;
  if (tabParam) {
    activeTab.value = tabParam;
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
  if (event.key === 'Escape' && isSidebarOpen.value) {
    isSidebarOpen.value = false;
  }
};

// Add keyboard listener in the main onMounted (already exists above)
// We need to add it there, so let's use onMounted here for keyboard only
onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
});

// Cleanup
onUnmounted(() => {
  cleanupGlobalContextMenu();
  window.removeEventListener('keydown', handleKeyPress);
});
</script>
