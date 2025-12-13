<template>
  <!-- Backdrop -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/10 z-50 backdrop-blur-sm"
    @click="$emit('close')"
  />

  <!-- Sidebar -->
  <aside
    :class="[
      'fixed top-0 left-0 h-full min-h-screen w-72 flex-col gap-4 border-r border-white/30 bg-white/70 p-4 text-gray-800 shadow-xl backdrop-blur-2xl z-50 transition-transform duration-300',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    ]"
  >
    <!-- Close Button -->
    <button
      @click="$emit('close')"
      class="absolute top-3 right-3 w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center group shadow-sm"
    >
      <span class="material-icons text-red-900 opacity-0 group-hover:opacity-100 transition-opacity" style="font-size: 10px">close</span>
    </button>

    <!-- Search Bar -->
    <div class="relative mt-4">
      <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" style="font-size: 18px">search</span>
      <input
        class="w-full h-10 bg-white/50 border border-gray-300/50 rounded-lg pl-10 pr-4 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        placeholder="Search"
        type="search"
      />
    </div>

    <!-- Navigation -->
    <nav class="flex flex-1 flex-col gap-6 mt-2 overflow-y-auto">
      <!-- Event Management -->
      <div class="flex flex-col gap-1">
        <h4 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Management</h4>
        <NavItem
          icon="event"
          label="Manage Event Details"
          :isActive="activeItem === 'event-details'"
          @click="handleNavigation('event-details-modal', 'event-details')"
        />
        <NavItem
          icon="groups"
          label="Update Contestants"
          :isActive="activeItem === 'contestants'"
          @click="handleNavigation('candidates', 'contestants')"
        />
        <NavItem
          icon="folder"
          label="Adjust Scoring Criteria"
          :isActive="activeItem === 'criteria'"
          @click="handleNavigation('categories', 'criteria')"
        />
        <NavItem
          icon="layers"
          label="Manage Rounds"
          :isActive="activeItem === 'rounds'"
          @click="handleNavigation('rounds', 'rounds')"
        />
      </div>

      <!-- User Management -->
      <div class="flex flex-col gap-1">
        <h4 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User Management</h4>
        <NavItem
          icon="person"
          label="Configure Judges"
          :isActive="activeItem === 'judges-modal'"
          @click="handleNavigation('judges-modal', 'judges-modal')"
        />
        <NavItem
          icon="shield"
          label="Manage Admin Users"
          :isActive="activeItem === 'admin-users'"
          @click="handleNavigation(null, 'admin-users')"
        />
      </div>

      <!-- Reports -->
      <div class="flex flex-col gap-1">
        <h4 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reports</h4>
        <NavItem
          icon="bar_chart"
          label="Live Results"
          :isActive="activeItem === 'results'"
          @click="handleNavigation('results', 'results')"
        />
        <NavItem
          icon="download"
          label="Export All Scores"
          :isActive="activeItem === 'export'"
          @click="handleNavigation(null, 'export')"
        />
        <NavItem
          icon="emoji_events"
          label="Review Certificates"
          :isActive="activeItem === 'certificates'"
          @click="handleNavigation('/admin/certificates', 'certificates')"
        />
      </div>

      <!-- System Settings -->
      <div class="flex flex-col gap-1">
        <h4 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">System Settings</h4>
        <NavItem
          icon="settings"
          label="General Settings"
          :isActive="activeItem === 'settings'"
          @click="handleNavigation('settings-modal', 'settings')"
        />
        <NavItem
          icon="palette"
          label="Theme Preferences"
          :isActive="activeItem === 'theme'"
          @click="handleNavigation('theme-modal', 'theme')"
        />
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import NavItem from './NavItem.vue';

const props = defineProps({
  isOpen: Boolean,
  continuingEvent: Object
});

const emit = defineEmits(['close', 'navigate']);

const activeItem = ref('criteria');

const handleNavigation = (path, itemId) => {
  activeItem.value = itemId;
  emit('navigate', path || itemId);
  
  // Don't close sidebar when opening modals
  if (!['judges-modal', 'event-details', 'theme', 'settings'].includes(itemId)) {
    emit('close');
  }
};
</script>
