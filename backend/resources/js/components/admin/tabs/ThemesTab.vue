<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">Event Themes</h2>
      <button
        @click="openCreateModal"
        class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Plus :size="16" />
        New Theme
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && themes.length === 0" class="text-center py-4">
      <Palette class="w-8 h-8 text-gray-300 mx-auto mb-2" />
      <p class="text-gray-500">No themes found</p>
      <p class="text-gray-400 text-sm mt-1">Create a theme to get started</p>
    </div>

    <!-- Themes Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="theme in themes"
        :key="theme.id"
        class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      >
        <!-- Color Preview -->
        <div class="h-20 flex">
          <div class="flex-1" :style="{ backgroundColor: theme.primary_color }"></div>
          <div class="flex-1" :style="{ backgroundColor: theme.secondary_color }"></div>
          <div class="flex-1" :style="{ backgroundColor: theme.accent_color }"></div>
        </div>

        <!-- Content -->
        <div class="p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold text-gray-900">{{ theme.name }}</h3>
            <span
              v-if="theme.is_system"
              class="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full"
            >
              System
            </span>
          </div>
          <p class="text-sm text-gray-500 mb-3 line-clamp-2">{{ theme.description || 'No description' }}</p>

          <!-- Color Swatches -->
          <div class="flex items-center gap-2 mb-4">
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded-full border border-gray-200" :style="{ backgroundColor: theme.primary_color }"></div>
              <span class="text-xs text-gray-400">Primary</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded-full border border-gray-200" :style="{ backgroundColor: theme.secondary_color }"></div>
              <span class="text-xs text-gray-400">Secondary</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded-full border border-gray-200" :style="{ backgroundColor: theme.accent_color }"></div>
              <span class="text-xs text-gray-400">Accent</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <button
              @click="editTheme(theme)"
              :disabled="theme.is_system"
              :class="[
                'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                theme.is_system
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              <Edit2 :size="14" class="inline mr-1" />
              Edit
            </button>
            <button
              @click="confirmDelete(theme)"
              :disabled="theme.is_system"
              :class="[
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                theme.is_system
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-red-600 hover:bg-red-50'
              ]"
            >
              <Trash2 :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Plus, Palette, Edit2, Trash2 } from 'lucide-vue-next';
import { showError, showSuccess, showConfirm } from '../../../utils/alerts';
import Swal from 'sweetalert2';

const props = defineProps({
  eventId: [String, Number]
});

const loading = ref(true);
const themes = ref([]);

const loadThemes = async () => {
  loading.value = true;
  try {
    const response = await fetch('/api/event-themes');
    if (response.ok) {
      themes.value = await response.json();
    }
  } catch (error) {
    showError('Failed to load themes');
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  showThemeModal(null);
};

const editTheme = (theme) => {
  showThemeModal(theme);
};

const showThemeModal = (theme) => {
  const isEdit = !!theme;
  const primary = theme?.primary_color || '#4f46e5';
  const secondary = theme?.secondary_color || '#818cf8';
  const accent = theme?.accent_color || '#c7d2fe';
  
  Swal.fire({
    title: isEdit ? 'Edit Theme' : 'Create Theme',
    html: `
      <div class="space-y-4 text-left">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input id="swal-name" type="text" value="${theme?.name || ''}" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            placeholder="Theme name" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="swal-description" rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            placeholder="Theme description">${theme?.description || ''}</textarea>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Primary</label>
            <div class="flex items-center gap-2">
              <input id="swal-primary" type="color" value="${primary}" 
                class="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer" 
                onchange="document.getElementById('swal-primary-text').value = this.value; updatePreview();" />
              <input id="swal-primary-text" type="text" value="${primary}"
                class="flex-1 px-2 py-1 rounded-lg border border-gray-300 text-xs"
                onchange="document.getElementById('swal-primary').value = this.value; updatePreview();" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Secondary</label>
            <div class="flex items-center gap-2">
              <input id="swal-secondary" type="color" value="${secondary}" 
                class="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                onchange="document.getElementById('swal-secondary-text').value = this.value; updatePreview();" />
              <input id="swal-secondary-text" type="text" value="${secondary}"
                class="flex-1 px-2 py-1 rounded-lg border border-gray-300 text-xs"
                onchange="document.getElementById('swal-secondary').value = this.value; updatePreview();" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Accent</label>
            <div class="flex items-center gap-2">
              <input id="swal-accent" type="color" value="${accent}" 
                class="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                onchange="document.getElementById('swal-accent-text').value = this.value; updatePreview();" />
              <input id="swal-accent-text" type="text" value="${accent}"
                class="flex-1 px-2 py-1 rounded-lg border border-gray-300 text-xs"
                onchange="document.getElementById('swal-accent').value = this.value; updatePreview();" />
            </div>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Preview</label>
          <div id="swal-preview" class="h-12 rounded-lg flex overflow-hidden border border-gray-200">
            <div class="flex-1" style="background-color: ${primary}"></div>
            <div class="flex-1" style="background-color: ${secondary}"></div>
            <div class="flex-1" style="background-color: ${accent}"></div>
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: isEdit ? 'Update' : 'Create',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#4f46e5',
    cancelButtonColor: '#6b7280',
    width: '500px',
    customClass: {
      popup: 'rounded-xl',
      title: 'text-lg font-semibold text-gray-900',
      htmlContainer: 'px-2',
      confirmButton: 'rounded-lg',
      cancelButton: 'rounded-lg'
    },
    didOpen: () => {
      // Add preview update function
      window.updatePreview = () => {
        const preview = document.getElementById('swal-preview');
        const p = document.getElementById('swal-primary').value;
        const s = document.getElementById('swal-secondary').value;
        const a = document.getElementById('swal-accent').value;
        preview.innerHTML = `
          <div class="flex-1" style="background-color: ${p}"></div>
          <div class="flex-1" style="background-color: ${s}"></div>
          <div class="flex-1" style="background-color: ${a}"></div>
        `;
      };
    },
    preConfirm: () => {
      const name = document.getElementById('swal-name').value;
      if (!name) {
        Swal.showValidationMessage('Name is required');
        return false;
      }
      return {
        name,
        description: document.getElementById('swal-description').value,
        primary_color: document.getElementById('swal-primary').value,
        secondary_color: document.getElementById('swal-secondary').value,
        accent_color: document.getElementById('swal-accent').value
      };
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      await saveTheme(theme?.id, result.value);
    }
  });
};

const saveTheme = async (themeId, formData) => {
  try {
    const url = themeId
      ? `/api/event-themes/${themeId}`
      : '/api/event-themes';
    const method = themeId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      showSuccess(themeId ? 'Theme updated' : 'Theme created');
      loadThemes();
    } else {
      const data = await response.json();
      showError(data.message || 'Failed to save theme');
    }
  } catch (error) {
    showError('Failed to save theme');
  }
};

const confirmDelete = async (theme) => {
  const confirmed = await showConfirm(
    'Delete Theme',
    `Are you sure you want to delete "${theme.name}"? This cannot be undone.`,
    { confirmColor: '#d33', confirmText: 'Delete' }
  );

  if (confirmed) {
    try {
      const response = await fetch(`/api/event-themes/${theme.id}`, { method: 'DELETE' });
      if (response.ok) {
        showSuccess('Theme deleted');
        loadThemes();
      } else {
        showError('Failed to delete theme');
      }
    } catch (error) {
      showError('Failed to delete theme');
    }
  }
};

onMounted(() => {
  loadThemes();
});
</script>
