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
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Lock, LockOpen, SkipForward, ChevronRight, Copy, Hash, EyeOff as HashOff, RefreshCw } from 'lucide-vue-next';
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
