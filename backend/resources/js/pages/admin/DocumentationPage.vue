<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between max-w-6xl mx-auto">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Documentation</h1>
          <p class="text-sm text-gray-500 mt-1">System guide and user manual</p>
        </div>
        <button
          @click="goBack"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span class="material-icons" style="font-size: 18px">arrow_back</span>
          Back to Admin
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-6xl mx-auto px-6 py-8">
      <!-- Quick Start -->
      <section class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span class="material-icons text-indigo-600">rocket_launch</span>
          Quick Start Guide
        </h2>
        <div class="space-y-4 text-gray-600">
          <div class="flex gap-4">
            <span class="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">1</span>
            <div>
              <h3 class="font-medium text-gray-900">Create an Event</h3>
              <p class="text-sm">Start by creating a new event from the Setup page. Enter the event title and year.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <span class="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">2</span>
            <div>
              <h3 class="font-medium text-gray-900">Add Candidates</h3>
              <p class="text-sm">Add contestants with their name, number, gender, and team/department.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <span class="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">3</span>
            <div>
              <h3 class="font-medium text-gray-900">Configure Rounds & Criteria</h3>
              <p class="text-sm">Set up scoring rounds and define criteria with maximum points for each.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <span class="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">4</span>
            <div>
              <h3 class="font-medium text-gray-900">Add Judges</h3>
              <p class="text-sm">Configure judges with chair numbers. Each judge will have their own scoring interface.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <span class="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">5</span>
            <div>
              <h3 class="font-medium text-gray-900">Start Scoring</h3>
              <p class="text-sm">Activate a round and let judges score candidates in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- Admin Panel -->
        <section class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span class="material-icons text-blue-600">admin_panel_settings</span>
            Admin Panel
          </h2>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start gap-2">
              <span class="material-icons text-green-500" style="font-size: 16px">check_circle</span>
              Real-time score monitoring
            </li>
            <li class="flex items-start gap-2">
              <span class="material-icons text-green-500" style="font-size: 16px">check_circle</span>
              Lock/unlock judge screens
            </li>
            <li class="flex items-start gap-2">
              <span class="material-icons text-green-500" style="font-size: 16px">check_circle</span>
              Activate scoring rounds
            </li>
            <li class="flex items-start gap-2">
              <span class="material-icons text-green-500" style="font-size: 16px">check_circle</span>
              View and export results
            </li>
            <li class="flex items-start gap-2">
              <span class="material-icons text-green-500" style="font-size: 16px">check_circle</span>
              Manage candidates, rounds, and criteria
            </li>
          </ul>
        </section>

        <!-- Judge Interface -->
        <section class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span class="material-icons text-purple-600">gavel</span>
            Judge Interface
          </h2>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start gap-2">
              <span class="material-icons text-green-500" style="font-size: 16px">check_circle</span>
              Simple score entry interface
            </li>
            <li class="flex items-start gap-2">
              <span class="material-icons text-green-500" style="font-size: 16px">check_circle</span>
              Auto-save scores in real-time
            </li>
            <li class="flex items-start gap-2">
              <span class="material-icons text-green-500" style="font-size: 16px">check_circle</span>
              Lock screen when admin locks voting
            </li>
            <li class="flex items-start gap-2">
              <span class="material-icons text-green-500" style="font-size: 16px">check_circle</span>
              Automatic round switching
            </li>
            <li class="flex items-start gap-2">
              <span class="material-icons text-green-500" style="font-size: 16px">check_circle</span>
              Score validation (max points limit)
            </li>
          </ul>
        </section>
      </div>

      <!-- Keyboard Shortcuts -->
      <section class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span class="material-icons text-orange-600">keyboard</span>
          Keyboard Shortcuts
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex items-center gap-3">
            <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">E</kbd>
            <span class="text-sm text-gray-600">Toggle sidebar menu</span>
          </div>
          <div class="flex items-center gap-3">
            <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">Esc</kbd>
            <span class="text-sm text-gray-600">Close sidebar/modal</span>
          </div>
        </div>
      </section>

      <!-- Support -->
      <section class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 class="text-lg font-semibold mb-2">Need Help?</h2>
        <p class="text-sm text-indigo-100 mb-4">
          Contact the system administrator for technical support or feature requests.
        </p>
        <div class="flex items-center gap-2 text-sm">
          <span class="material-icons" style="font-size: 18px">email</span>
          <span>support@tabulation.system</span>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const goBack = () => {
  const eventId = route.query.event_id;
  if (eventId) {
    router.push(`/admin?event_id=${eventId}`);
  } else {
    router.push('/setup');
  }
};
</script>
