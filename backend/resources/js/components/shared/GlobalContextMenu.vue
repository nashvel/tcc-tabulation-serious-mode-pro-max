<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="menuRef"
      class="fixed z-[9999] bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px]"
      :style="{ left: `${x}px`, top: `${y}px` }"
      @click.stop
    >
      <!-- Lock/Unlock -->
      <button
        @click="handleLockToggle"
        :disabled="isTogglingLock"
        :class="[
          'w-full px-4 py-2 text-left text-sm flex items-center gap-3 border-b border-gray-200 transition-colors',
          isTogglingLock ? 'opacity-50 cursor-not-allowed text-gray-500' : 'text-gray-700 hover:bg-gray-100'
        ]"
      >
        <span v-if="isTogglingLock" class="animate-spin">⟳</span>
        <component v-else :is="isLocked ? 'LockOpen' : 'Lock'" class="w-4 h-4" />
        {{ isTogglingLock ? 'Toggling...' : isLocked ? 'Unlock Judges' : 'Lock Judges' }}
      </button>

      <!-- Show/Hide Judge Numbers -->
      <button
        @click="handleShowJudgeNumbers"
        :disabled="isShowingNumbers"
        :class="[
          'w-full px-4 py-2 text-left text-sm flex items-center gap-3 border-b border-gray-200 transition-colors',
          isShowingNumbers ? 'opacity-50 cursor-not-allowed text-gray-500' : 'text-gray-700 hover:bg-gray-100'
        ]"
      >
        <span v-if="isShowingNumbers" class="animate-spin">⟳</span>
        <component v-else :is="judgeNumbersVisible ? 'HashOff' : 'Hash'" class="w-4 h-4" />
        {{ isShowingNumbers ? 'Toggling...' : judgeNumbersVisible ? 'Hide Judge Numbers' : 'Show Judge Numbers' }}
      </button>

      <!-- Refresh All Screens -->
      <button
        @click="handleRefreshAllScreens"
        :disabled="isRefreshing"
        :class="[
          'w-full px-4 py-2 text-left text-sm flex items-center gap-3 border-b border-gray-200 transition-colors',
          isRefreshing ? 'opacity-50 cursor-not-allowed text-gray-500' : 'text-gray-700 hover:bg-gray-100'
        ]"
      >
        <span v-if="isRefreshing" class="animate-spin">⟳</span>
        <RefreshCw v-else class="w-4 h-4" />
        {{ isRefreshing ? 'Refreshing...' : 'Refresh All Screens' }}
      </button>

      <!-- Show/Hide IP on Screens -->
      <button
        @click="handleShowIpOnScreens"
        :disabled="isShowingIp"
        :class="[
          'w-full px-4 py-2 text-left text-sm flex items-center gap-3 border-b border-gray-200 transition-colors',
          isShowingIp ? 'opacity-50 cursor-not-allowed text-gray-500' : 'text-gray-700 hover:bg-gray-100'
        ]"
      >
        <span v-if="isShowingIp" class="animate-spin">⟳</span>
        <Wifi v-else class="w-4 h-4" />
        {{ isShowingIp ? 'Broadcasting...' : ipOnScreensVisible ? 'Hide IP on Screens' : 'Show IP on Screens' }}
      </button>

      <!-- Switch Category with Submenu -->
      <div
        v-if="eventSequence.length > 0"
        class="relative"
        @mouseenter="handleCategoryHover"
        @mouseleave="categorySubmenu.visible = false"
      >
        <button
          :disabled="isSwitchingCategory"
          :class="[
            'w-full px-4 py-2 text-left text-sm flex items-center justify-between gap-3 border-b border-gray-200 transition-colors',
            isSwitchingCategory ? 'opacity-50 cursor-not-allowed text-gray-500' : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          <span class="flex items-center gap-3">
            <span v-if="isSwitchingCategory" class="animate-spin">⟳</span>
            <SkipForward v-else class="w-4 h-4" />
            {{ isSwitchingCategory ? 'Switching...' : 'Switch Category' }}
          </span>
          <ChevronRight class="w-3.5 h-3.5" :class="isSwitchingCategory ? 'text-gray-300' : 'text-gray-400'" />
        </button>

        <!-- Category Submenu -->
        <div
          v-if="categorySubmenu.visible"
          :class="[
            'absolute top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[220px] z-50 max-h-[calc(100vh-100px)]',
            categorySubmenu.position === 'left' ? 'right-full mr-1' : 'left-full ml-1'
          ]"
          @click.stop
        >
          <p class="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Available Categories
          </p>
          <div class="overflow-y-auto max-h-[calc(100vh-150px)]" style="scrollbar-width: thin;">
            <button
              v-for="(category, idx) in eventSequence"
              :key="category.id"
              @click="handleSwitchCategory(idx)"
              :disabled="isSwitchingCategory"
              :class="[
                'w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors',
                selectedCategoryIndex === idx ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100',
                isSwitchingCategory ? 'opacity-50 cursor-not-allowed' : ''
              ]"
            >
              <span :class="['w-2 h-2 rounded-full', selectedCategoryIndex === idx ? 'bg-blue-500' : 'bg-gray-300']" />
              {{ category.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Network Info -->
      <button
        @click="handleNetworkInfo"
        class="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-gray-700 hover:bg-gray-100 border-b border-gray-200"
      >
        <Wifi class="w-4 h-4" />
        Network Info
      </button>

      <!-- Copy -->
      <button
        v-if="copyText"
        @click="handleCopy"
        class="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-gray-700 hover:bg-gray-100"
      >
        <Copy class="w-4 h-4" />
        Copy
      </button>
    </div>

    <!-- Network Info Modal -->
    <div
      v-if="networkModalVisible"
      class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50"
      @click.self="networkModalVisible = false"
    >
      <div class="bg-white rounded-xl shadow-2xl w-[400px] max-h-[80vh] overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Wifi class="w-5 h-5" />
            Network Info
          </h3>
          <button @click="networkModalVisible = false" class="text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-5 space-y-4">
          <!-- Local IP -->
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Your IP Address</p>
            <div class="flex items-center justify-between">
              <span class="text-xl font-mono font-semibold text-gray-900">{{ localIp || 'Loading...' }}</span>
              <button 
                v-if="localIp"
                @click="copyIp"
                class="px-3 py-1.5 text-xs bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          <!-- Access URLs -->
          <div v-if="localIp" class="space-y-2">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Access URLs (for other devices)</p>
            <div class="space-y-1.5">
              <div class="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                <span class="text-sm text-gray-600">Admin:</span>
                <code class="text-sm font-mono text-blue-600">http://{{ localIp }}:8000/admin</code>
              </div>
              <div class="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                <span class="text-sm text-gray-600">Judge:</span>
                <code class="text-sm font-mono text-blue-600">http://{{ localIp }}:8000/judge</code>
              </div>
              <div class="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                <span class="text-sm text-gray-600">Setup:</span>
                <code class="text-sm font-mono text-blue-600">http://{{ localIp }}:8000/setup</code>
              </div>
            </div>
          </div>

          <!-- Connected Screens -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Connected Screens</p>
              <button 
                @click="loadRegisteredScreens"
                :disabled="loadingScreens"
                class="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <RefreshCw :class="['w-3 h-3', loadingScreens ? 'animate-spin' : '']" />
                Refresh
              </button>
            </div>
            <div v-if="loadingScreens" class="text-center py-4 text-gray-500 text-sm">
              Loading...
            </div>
            <div v-else-if="registeredScreens.length === 0" class="text-center py-4 text-gray-400 text-sm">
              No screens connected
            </div>
            <div v-else class="space-y-1.5 max-h-[200px] overflow-y-auto">
              <div 
                v-for="screen in registeredScreens" 
                :key="screen.id"
                class="flex items-center justify-between bg-gray-50 rounded px-3 py-2"
              >
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-green-500"></span>
                  <span class="text-sm font-medium text-gray-700">{{ screen.name || `Judge ${screen.judge_id}` }}</span>
                </div>
                <span class="text-xs text-gray-400 font-mono">{{ screen.ip || 'N/A' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Lock, LockOpen, SkipForward, ChevronRight, Copy, Hash, EyeOff as HashOff, RefreshCw, Wifi, X } from 'lucide-vue-next';
import { showSuccess, showError } from '../../utils/alerts';

const props = defineProps({
  visible: Boolean,
  x: Number,
  y: Number,
  eventId: [String, Number],
  eventSequence: { type: Array, default: () => [] },
  activeRound: Object,
  copyText: String
});

const emit = defineEmits(['close', 'lock-change', 'category-change']);

const menuRef = ref(null);
const isLocked = ref(false);
const isTogglingLock = ref(false);
const isShowingNumbers = ref(false);
const judgeNumbersVisible = ref(false); // Track if judge numbers are currently shown
const isRefreshing = ref(false);
const isSwitchingCategory = ref(false);
const selectedCategoryIndex = ref(0);
const categorySubmenu = ref({ visible: false, position: 'right' });

// Network info state
const networkModalVisible = ref(false);
const localIp = ref(null);
const registeredScreens = ref([]);
const loadingScreens = ref(false);
const isShowingIp = ref(false);
const ipOnScreensVisible = ref(false);

// Sync selectedCategoryIndex with activeRound
watch(() => props.activeRound, (newRound) => {
  if (newRound && props.eventSequence.length > 0) {
    const idx = props.eventSequence.findIndex(cat => cat.id === newRound.id);
    if (idx !== -1) selectedCategoryIndex.value = idx;
  }
}, { immediate: true });

// Load lock state and judge numbers state
const loadState = async () => {
  if (!props.eventId) return;
  try {
    const response = await fetch(`/api/voting/state?event_id=${props.eventId}`);
    if (response.ok) {
      const data = await response.json();
      isLocked.value = data.is_locked ?? false;
      judgeNumbersVisible.value = data.show_judge_numbers ?? false;
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }
};

watch(() => props.eventId, loadState, { immediate: true });

// Lock/Unlock handler
const handleLockToggle = async () => {
  if (!props.eventId) {
    showError('Event not loaded yet');
    emit('close');
    return;
  }
  
  isTogglingLock.value = true;
  try {
    const endpoint = isLocked.value ? 'unlock' : 'lock';
    const response = await fetch(`/api/voting/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: props.eventId })
    });

    if (response.ok) {
      isLocked.value = !isLocked.value;
      showSuccess(isLocked.value ? 'Screen Locked!' : 'Screen Unlocked!');
      emit('lock-change', isLocked.value);
    } else {
      showError('Failed to toggle lock');
    }
  } catch (error) {
    showError('Failed to toggle lock');
  } finally {
    isTogglingLock.value = false;
    emit('close');
  }
};

// Show/Hide Judge Numbers handler (toggle)
const handleShowJudgeNumbers = async () => {
  if (!props.eventId) {
    showError('Event not loaded yet');
    emit('close');
    return;
  }
  
  isShowingNumbers.value = true;
  try {
    const endpoint = judgeNumbersVisible.value ? 'hide-judge-numbers' : 'show-judge-numbers';
    const response = await fetch(`/api/voting/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: props.eventId })
    });

    if (response.ok) {
      judgeNumbersVisible.value = !judgeNumbersVisible.value;
      showSuccess(judgeNumbersVisible.value ? 'Showing judge numbers' : 'Hiding judge numbers');
    } else {
      showError('Failed to toggle judge numbers');
    }
  } catch (error) {
    showError('Failed to toggle judge numbers');
  } finally {
    isShowingNumbers.value = false;
    emit('close');
  }
};

// Refresh All Screens handler
const handleRefreshAllScreens = async () => {
  if (!props.eventId) {
    showError('Event not loaded yet');
    emit('close');
    return;
  }
  
  isRefreshing.value = true;
  try {
    const response = await fetch('/api/voting/refresh-screens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: props.eventId,
        judge_ids: [] // Empty means all
      })
    });

    if (response.ok) {
      showSuccess('Refreshing all judge screens');
    } else {
      showError('Failed to refresh screens');
    }
  } catch (error) {
    showError('Failed to refresh screens');
  } finally {
    isRefreshing.value = false;
    emit('close');
  }
};

// Switch category handler
const handleSwitchCategory = async (categoryIndex) => {
  const selectedCategory = props.eventSequence[categoryIndex];
  if (!selectedCategory) return;

  isSwitchingCategory.value = true;
  try {
    const response = await fetch('/api/voting/activate-round', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: props.eventId,
        round_id: selectedCategory.id
      })
    });

    if (response.ok) {
      showSuccess(`Switched to: ${selectedCategory.name}`);
      selectedCategoryIndex.value = categoryIndex;
      emit('category-change', selectedCategory);
    } else {
      const data = await response.json();
      showError(data.message || 'Failed to switch category');
    }
  } catch (error) {
    showError('Failed to switch category');
  } finally {
    isSwitchingCategory.value = false;
    emit('close');
  }
};

// Calculate submenu position
const handleCategoryHover = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const submenuWidth = 240;
  const spaceOnRight = window.innerWidth - rect.right;
  categorySubmenu.value = {
    visible: true,
    position: spaceOnRight < submenuWidth ? 'left' : 'right'
  };
};

// Network Info handler (modal)
const handleNetworkInfo = async () => {
  emit('close');
  networkModalVisible.value = true;
  await getLocalIp();
  await loadRegisteredScreens();
};

// Show/Hide IP on all judge screens (broadcast via WebSocket)
const handleShowIpOnScreens = async () => {
  if (!props.eventId) {
    showError('Event not loaded yet');
    emit('close');
    return;
  }
  
  isShowingIp.value = true;
  try {
    const endpoint = ipOnScreensVisible.value ? 'hide-network-info' : 'show-network-info';
    const response = await fetch(`/api/voting/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: props.eventId })
    });

    if (response.ok) {
      ipOnScreensVisible.value = !ipOnScreensVisible.value;
      showSuccess(ipOnScreensVisible.value ? 'Showing IP on all screens' : 'Hiding IP from screens');
    } else {
      showError('Failed to broadcast');
    }
  } catch (error) {
    showError('Failed to broadcast');
  } finally {
    isShowingIp.value = false;
    emit('close');
  }
};

// Get local IP from server
const getLocalIp = async () => {
  try {
    const response = await fetch('/api/network/local-ip');
    if (response.ok) {
      const data = await response.json();
      localIp.value = data.ip;
    }
  } catch (error) {
    // Fallback: try to get from window location if on same network
    localIp.value = window.location.hostname !== 'localhost' ? window.location.hostname : null;
  }
};

// Load registered screens
const loadRegisteredScreens = async () => {
  if (!props.eventId) return;
  loadingScreens.value = true;
  try {
    const response = await fetch(`/api/voting/state?event_id=${props.eventId}`);
    if (response.ok) {
      const data = await response.json();
      registeredScreens.value = data.registered_screens || [];
    }
  } catch (error) {
    console.error('Error loading screens:', error);
  } finally {
    loadingScreens.value = false;
  }
};

// Copy IP to clipboard
const copyIp = () => {
  if (localIp.value) {
    navigator.clipboard.writeText(localIp.value);
    showSuccess('IP copied!');
  }
};

// Copy handler
const handleCopy = () => {
  if (props.copyText) {
    navigator.clipboard.writeText(props.copyText);
    showSuccess('Copied to clipboard!');
  }
  emit('close');
};

// Close on click outside
const handleClickOutside = (e) => {
  if (!props.visible) return;
  if (menuRef.value && menuRef.value.contains(e.target)) return;
  emit('close');
};

// Close on escape
const handleEscape = (e) => {
  if (e.key === 'Escape' && props.visible) emit('close');
};

// Close on scroll
const handleScroll = () => {
  if (props.visible) emit('close');
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleEscape);
  document.addEventListener('scroll', handleScroll, true);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleEscape);
  document.removeEventListener('scroll', handleScroll, true);
});
</script>
