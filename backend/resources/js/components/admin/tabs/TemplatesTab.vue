<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-semibold text-gray-900">Event Templates</h2>
        <HelpButton @click="startTour" />
      </div>
      <button
        id="new-template-btn"
        @click="openTypeSelector"
        :disabled="buttonLoading"
        class="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-70"
      >
        <div v-if="buttonLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <Plus v-else :size="16" />
        New Template
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && templates.length === 0" class="text-center py-4">
      <FileText class="w-8 h-8 text-gray-300 mx-auto mb-2" />
      <p class="text-gray-500">No templates found</p>
      <p class="text-gray-400 text-sm mt-1">Create a template to get started</p>
    </div>

    <!-- Templates Grid -->
    <div v-else id="templates-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="template in templates"
        :key="template.id"
        class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div class="h-24 bg-gray-100 relative">
          <img
            v-if="template.header_image || template.lock_screen_image"
            :src="template.header_image || template.lock_screen_image"
            :alt="template.name"
            class="w-full h-full object-cover"
            @error="$event.target.style.display = 'none'"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <FileText class="w-8 h-8 text-gray-300" />
          </div>
          <span v-if="template.is_system" class="absolute top-2 right-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            System
          </span>
          <span v-if="template.event_type === 'candidate'" class="absolute top-2 left-2 px-2 py-0.5 bg-gray-800 text-white text-xs font-medium rounded-full">
            Candidate
          </span>
          <span v-else-if="template.event_type === 'category'" class="absolute top-2 left-2 px-2 py-0.5 bg-gray-800 text-white text-xs font-medium rounded-full">
            Category
          </span>
          <span v-else-if="template.lock_screen_image && !template.header_image" class="absolute top-2 left-2 px-2 py-0.5 bg-gray-800 text-white text-xs font-medium rounded-full">
            Lock Screen
          </span>
          <span v-else-if="template.header_image" class="absolute top-2 left-2 px-2 py-0.5 bg-gray-800 text-white text-xs font-medium rounded-full">
            Header
          </span>
        </div>

        <div class="p-4">
          <h3 class="font-semibold text-gray-900 mb-1">{{ template.name }}</h3>
          <p class="text-sm text-gray-500 mb-3 line-clamp-2">{{ template.description || 'No description' }}</p>
          
          <div class="flex items-center gap-2">
            <button
              @click="editTemplate(template)"
              :disabled="template.is_system"
              :class="['flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors', template.is_system ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
            >
              <Edit2 :size="14" class="inline mr-1" /> Edit
            </button>
            <button
              @click="confirmDelete(template)"
              :disabled="template.is_system"
              :class="['px-3 py-2 text-sm font-medium rounded-lg transition-colors', template.is_system ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100']"
            >
              <Trash2 :size="14" />
            </button>
          </div>
        </div>
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
import { ref, onMounted } from 'vue';
import { Plus, FileText, Edit2, Trash2 } from 'lucide-vue-next';
import { showError, showSuccess, showConfirm } from '../../../utils/alerts';
import { useTour } from '../../../composables/useTour';
import TourTooltip from '../../shared/TourTooltip.vue';
import HelpButton from '../../shared/HelpButton.vue';
import Swal from 'sweetalert2';

const props = defineProps({ eventId: [String, Number] });

// Tour steps for Templates tab
const tourSteps = [
  {
    target: '#new-template-btn',
    title: 'Create Template',
    content: 'Create new templates for headers, lock screens, candidates, or categories. Templates can be reused across events.',
    placement: 'bottom'
  },
  {
    target: '#templates-grid',
    title: 'Template Library',
    content: 'View and manage all your templates. System templates cannot be edited or deleted.',
    placement: 'top'
  }
];

const tour = useTour('templates-tab', tourSteps);

const startTour = () => {
  tour.startTour();
};

const loading = ref(true);
const buttonLoading = ref(false);
const templates = ref([]);
let availableImages = [];

const loadTemplates = async () => {
  loading.value = true;
  try {
    const response = await fetch('/api/event-templates');
    if (response.ok) templates.value = await response.json();
  } catch (error) {
    showError('Failed to load templates');
  } finally {
    loading.value = false;
  }
};

const loadImages = async () => {
  try {
    const response = await fetch('/api/assets/images');
    if (response.ok) {
      const data = await response.json();
      availableImages = data.images || [];
    }
  } catch (error) {
    console.error('Failed to load images');
  }
};

const openTypeSelector = async () => {
  buttonLoading.value = true;
  await loadImages();
  buttonLoading.value = false;
  
  const { value: templateType } = await Swal.fire({
    title: 'Choose Template Type',
    html: `
      <div class="grid grid-cols-2 gap-3 mt-4">
        <button type="button" id="btn-header" class="p-5 rounded-xl border-2 border-gray-200 hover:border-gray-400 transition-all text-center">
          <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
          </div>
          <h3 class="font-semibold text-gray-900 text-sm mb-0.5">Header</h3>
          <p class="text-[10px] text-gray-500">Judge screen headers</p>
        </button>
        <button type="button" id="btn-lock" class="p-5 rounded-xl border-2 border-gray-200 hover:border-gray-400 transition-all text-center">
          <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h3 class="font-semibold text-gray-900 text-sm mb-0.5">Lock Screen</h3>
          <p class="text-[10px] text-gray-500">Custom lock image</p>
        </button>
        <button type="button" id="btn-candidate" class="p-5 rounded-xl border-2 border-gray-200 hover:border-gray-400 transition-all text-center">
          <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h3 class="font-semibold text-gray-900 text-sm mb-0.5">Candidate</h3>
          <p class="text-[10px] text-gray-500">Participant presets</p>
        </button>
        <button type="button" id="btn-category" class="p-5 rounded-xl border-2 border-gray-200 hover:border-gray-400 transition-all text-center">
          <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h3 class="font-semibold text-gray-900 text-sm mb-0.5">Category</h3>
          <p class="text-[10px] text-gray-500">Rounds & criteria</p>
        </button>
      </div>
    `,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: 'Cancel',
    cancelButtonColor: '#6b7280',
    width: '420px',
    customClass: { popup: 'rounded-xl', cancelButton: 'rounded-lg' },
    didOpen: () => {
      document.getElementById('btn-header').addEventListener('click', () => Swal.close({ value: 'header' }));
      document.getElementById('btn-lock').addEventListener('click', () => Swal.close({ value: 'lock' }));
      document.getElementById('btn-candidate').addEventListener('click', () => Swal.close({ value: 'candidate' }));
      document.getElementById('btn-category').addEventListener('click', () => Swal.close({ value: 'category' }));
    },
    preConfirm: () => false
  });

  if (templateType === 'header') showHeaderModal(null);
  else if (templateType === 'lock') showLockModal(null);
  else if (templateType === 'candidate') showCandidateModal(null);
  else if (templateType === 'category') showCategoryModal(null);
};

// File validation constants
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const validateFile = (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Allowed: PNG, JPG, GIF, WEBP, SVG' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 5MB limit' };
  }
  return { valid: true, error: '' };
};

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch('/api/assets/upload', { method: 'POST', body: formData });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message || 'Upload failed');
  return data.path;
};

const buildDropZone = () => {
  return `
    <div id="drop-zone" class="mb-3 p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 transition-all cursor-pointer text-center">
      <input type="file" id="file-input" accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml" class="hidden" />
      <div id="drop-zone-content">
        <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
        <p class="text-sm text-gray-600">Drag & drop image here<br/>or click to browse</p>
      </div>
      <div id="drop-zone-uploading" class="hidden">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
        <p class="text-sm text-gray-600">Uploading...</p>
      </div>
    </div>
    <p id="upload-error" class="text-xs text-red-600 mb-2 hidden"></p>
  `;
};

const setupDropZone = (onUploadSuccess) => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const content = document.getElementById('drop-zone-content');
  const uploading = document.getElementById('drop-zone-uploading');
  const errorEl = document.getElementById('upload-error');
  
  if (!dropZone) return;
  
  const showError = (msg) => { errorEl.textContent = msg; errorEl.classList.remove('hidden'); };
  const hideError = () => { errorEl.classList.add('hidden'); };
  const setUploading = (val) => {
    if (val) { content.classList.add('hidden'); uploading.classList.remove('hidden'); }
    else { content.classList.remove('hidden'); uploading.classList.add('hidden'); }
  };
  
  const handleFile = async (file) => {
    hideError();
    const validation = validateFile(file);
    if (!validation.valid) { showError(validation.error); return; }
    setUploading(true);
    try {
      const path = await uploadFile(file);
      await loadImages(); // Refresh image list
      onUploadSuccess(path);
    } catch (err) { showError(err.message || 'Upload failed'); }
    finally { setUploading(false); }
  };
  
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('border-indigo-500', 'bg-indigo-50'); });
  dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.classList.remove('border-indigo-500', 'bg-indigo-50'); });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-indigo-500', 'bg-indigo-50');
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  });
  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => { if (e.target.files.length > 0) handleFile(e.target.files[0]); });
};

const buildImageGrid = (selected = [], isMultiple = true) => {
  if (availableImages.length === 0) {
    return '<div class="text-center py-8 bg-gray-50 rounded-lg"><p class="text-sm text-gray-500">No images available</p></div>';
  }
  
  const selectedArr = Array.isArray(selected) ? selected : [selected].filter(Boolean);
  let html = `<div class="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">`;
  
  for (const img of availableImages) {
    const isSelected = selectedArr.includes(img.path);
    const checkmark = isSelected ? '<div class="absolute inset-0 bg-gray-900/40 flex items-center justify-center"><svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg></div>' : '';
    const gifBadge = img.type === 'image/gif' ? '<span class="absolute bottom-1 right-1 px-1 py-0.5 bg-black/60 text-white text-[9px] rounded">GIF</span>' : '';
    
    html += `
      <button type="button" data-path="${img.path}" class="img-btn relative aspect-square rounded-lg overflow-hidden border-2 ${isSelected ? 'border-gray-900' : 'border-transparent hover:border-gray-300'} transition-all">
        <img src="${img.path}" alt="${img.name}" class="w-full h-full object-cover" />
        ${checkmark}
        ${gifBadge}
      </button>
    `;
  }
  html += '</div>';
  return html;
};

const showHeaderModal = (template) => {
  // Load existing logos or convert from single header_image
  let selectedLogos = [];
  if (template?.header_logos && Array.isArray(template.header_logos)) {
    selectedLogos = [...template.header_logos].sort((a, b) => a.order - b.order);
  } else if (template?.header_image) {
    selectedLogos = [{ path: template.header_image, order: 0 }];
  }
  
  const buildSelectedLogosPreview = () => {
    if (selectedLogos.length === 0) {
      return '<div class="text-center py-4 bg-gray-50 rounded-lg text-sm text-gray-400">No logos selected. Select from library below.</div>';
    }
    let html = '<div id="logos-preview" class="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg min-h-[80px]">';
    selectedLogos.forEach((logo, idx) => {
      html += `
        <div class="logo-item relative group" data-index="${idx}" draggable="true">
          <img src="${logo.path}" class="w-16 h-16 object-contain rounded-lg border-2 border-gray-200 bg-white cursor-move" />
          <button type="button" class="remove-logo absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity" data-index="${idx}">&times;</button>
          <span class="absolute bottom-0 left-0 right-0 text-center text-[9px] text-gray-500 bg-white/80">${idx + 1}</span>
        </div>
      `;
    });
    html += '</div>';
    html += '<p class="text-[10px] text-gray-400 mt-1">Drag to reorder • Click × to remove</p>';
    return html;
  };
  
  const refreshAll = () => {
    document.getElementById('selected-logos').innerHTML = buildSelectedLogosPreview();
    document.getElementById('image-grid').innerHTML = buildImageGrid(selectedLogos.map(l => l.path), true);
    document.getElementById('selected-count').textContent = `${selectedLogos.length} logo(s) selected`;
    attachListeners();
    attachDragListeners();
  };
  
  const attachListeners = () => {
    document.querySelectorAll('.img-btn').forEach(btn => {
      btn.onclick = () => {
        const path = btn.dataset.path;
        const idx = selectedLogos.findIndex(l => l.path === path);
        if (idx === -1) {
          selectedLogos.push({ path, order: selectedLogos.length });
        } else {
          selectedLogos.splice(idx, 1);
          // Reorder remaining
          selectedLogos.forEach((l, i) => l.order = i);
        }
        refreshAll();
      };
    });
    document.querySelectorAll('.remove-logo').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index);
        selectedLogos.splice(idx, 1);
        selectedLogos.forEach((l, i) => l.order = i);
        refreshAll();
      };
    });
  };
  
  const attachDragListeners = () => {
    const container = document.getElementById('logos-preview');
    if (!container) return;
    
    let draggedIdx = null;
    
    container.querySelectorAll('.logo-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        draggedIdx = parseInt(item.dataset.index);
        item.classList.add('opacity-50');
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('opacity-50');
        draggedIdx = null;
      });
      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        item.classList.add('border-indigo-500');
      });
      item.addEventListener('dragleave', () => {
        item.classList.remove('border-indigo-500');
      });
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        item.classList.remove('border-indigo-500');
        const dropIdx = parseInt(item.dataset.index);
        if (draggedIdx !== null && draggedIdx !== dropIdx) {
          const [moved] = selectedLogos.splice(draggedIdx, 1);
          selectedLogos.splice(dropIdx, 0, moved);
          selectedLogos.forEach((l, i) => l.order = i);
          refreshAll();
        }
      });
    });
  };
  
  Swal.fire({
    title: template ? 'Edit Header Template' : 'Create Header Template',
    html: `
      <div class="space-y-4 text-left">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input id="swal-name" type="text" value="${template?.name || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400" placeholder="Template name" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="swal-desc" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400" placeholder="Optional">${template?.description || ''}</textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Selected Logos (drag to arrange)</label>
          <div id="selected-logos">${buildSelectedLogosPreview()}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Upload New Logo</label>
          ${buildDropZone()}
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Or Select from Library <span class="text-gray-400 font-normal">(click to add)</span></label>
          <div id="image-grid">${buildImageGrid(selectedLogos.map(l => l.path), true)}</div>
          <p id="selected-count" class="text-xs text-gray-500 mt-2">${selectedLogos.length} logo(s) selected</p>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: template ? 'Update' : 'Create',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#1f2937',
    cancelButtonColor: '#6b7280',
    width: '550px',
    customClass: { popup: 'rounded-xl', confirmButton: 'rounded-lg', cancelButton: 'rounded-lg' },
    didOpen: () => {
      attachListeners();
      attachDragListeners();
      setupDropZone((uploadedPath) => {
        if (!selectedLogos.find(l => l.path === uploadedPath)) {
          selectedLogos.push({ path: uploadedPath, order: selectedLogos.length });
        }
        refreshAll();
      });
    },
    preConfirm: () => {
      const name = document.getElementById('swal-name').value;
      if (!name) { Swal.showValidationMessage('Name is required'); return false; }
      return { 
        name, 
        description: document.getElementById('swal-desc').value, 
        header_image: selectedLogos[0]?.path || '', 
        header_logos: selectedLogos,
        lock_screen_image: '', 
        event_type: 'header', 
        default_judges: 5 
      };
    }
  }).then(async (result) => {
    if (result.isConfirmed) await saveTemplate(template?.id, result.value);
  });
};

const showLockModal = (template) => {
  let selectedImage = template?.lock_screen_image || '';
  
  const refreshGrid = () => {
    document.getElementById('image-grid').innerHTML = buildImageGrid(selectedImage, false);
    attachListeners();
  };
  
  const attachListeners = () => {
    document.querySelectorAll('.img-btn').forEach(btn => {
      btn.onclick = () => {
        selectedImage = btn.dataset.path;
        refreshGrid();
      };
    });
  };
  
  Swal.fire({
    title: template ? 'Edit Lock Screen Template' : 'Create Lock Screen Template',
    html: `
      <div class="space-y-4 text-left">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input id="swal-name" type="text" value="${template?.name || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400" placeholder="Template name" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="swal-desc" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400" placeholder="Optional">${template?.description || ''}</textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Upload New Image</label>
          ${buildDropZone()}
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Or Select from Library</label>
          <div id="image-grid">${buildImageGrid(selectedImage, false)}</div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: template ? 'Update' : 'Create',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#1f2937',
    cancelButtonColor: '#6b7280',
    width: '500px',
    customClass: { popup: 'rounded-xl', confirmButton: 'rounded-lg', cancelButton: 'rounded-lg' },
    didOpen: () => {
      attachListeners();
      setupDropZone((uploadedPath) => {
        selectedImage = uploadedPath;
        refreshGrid();
      });
    },
    preConfirm: () => {
      const name = document.getElementById('swal-name').value;
      if (!name) { Swal.showValidationMessage('Name is required'); return false; }
      return { name, description: document.getElementById('swal-desc').value, header_image: '', lock_screen_image: selectedImage, event_type: 'general', default_judges: 5 };
    }
  }).then(async (result) => {
    if (result.isConfirmed) await saveTemplate(template?.id, result.value);
  });
};

const showCandidateModal = (template) => {
  Swal.fire({
    title: template ? 'Edit Candidate Template' : 'Create Candidate Template',
    html: `
      <div class="space-y-4 text-left">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input id="swal-name" type="text" value="${template?.name || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400" placeholder="e.g., Pageant Candidates" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="swal-desc" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400" placeholder="Optional">${template?.description || ''}</textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Default Number of Candidates</label>
          <input id="swal-count" type="number" min="1" max="100" value="${template?.default_judges || 10}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400" />
        </div>
        <p class="text-xs text-gray-400">Candidate templates define preset participant configurations for events.</p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: template ? 'Update' : 'Create',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#1f2937',
    cancelButtonColor: '#6b7280',
    width: '450px',
    customClass: { popup: 'rounded-xl', confirmButton: 'rounded-lg', cancelButton: 'rounded-lg' },
    preConfirm: () => {
      const name = document.getElementById('swal-name').value;
      if (!name) { Swal.showValidationMessage('Name is required'); return false; }
      return { name, description: document.getElementById('swal-desc').value, header_image: '', lock_screen_image: '', event_type: 'candidate', default_judges: parseInt(document.getElementById('swal-count').value) || 10 };
    }
  }).then(async (result) => {
    if (result.isConfirmed) await saveTemplate(template?.id, result.value);
  });
};

const showCategoryModal = (template) => {
  Swal.fire({
    title: template ? 'Edit Category Template' : 'Create Category Template',
    html: `
      <div class="space-y-4 text-left">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input id="swal-name" type="text" value="${template?.name || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400" placeholder="e.g., Talent Show Categories" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="swal-desc" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400" placeholder="Optional">${template?.description || ''}</textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Default Number of Rounds</label>
          <input id="swal-rounds" type="number" min="1" max="20" value="${template?.default_judges || 3}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400" />
        </div>
        <p class="text-xs text-gray-400">Category templates define preset rounds and criteria configurations.</p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: template ? 'Update' : 'Create',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#1f2937',
    cancelButtonColor: '#6b7280',
    width: '450px',
    customClass: { popup: 'rounded-xl', confirmButton: 'rounded-lg', cancelButton: 'rounded-lg' },
    preConfirm: () => {
      const name = document.getElementById('swal-name').value;
      if (!name) { Swal.showValidationMessage('Name is required'); return false; }
      return { name, description: document.getElementById('swal-desc').value, header_image: '', lock_screen_image: '', event_type: 'category', default_judges: parseInt(document.getElementById('swal-rounds').value) || 3 };
    }
  }).then(async (result) => {
    if (result.isConfirmed) await saveTemplate(template?.id, result.value);
  });
};

const editTemplate = async (template) => {
  buttonLoading.value = true;
  await loadImages();
  buttonLoading.value = false;
  
  if (template.event_type === 'candidate') showCandidateModal(template);
  else if (template.event_type === 'category') showCategoryModal(template);
  else if (template.header_image) showHeaderModal(template);
  else showLockModal(template);
};

const saveTemplate = async (templateId, formData) => {
  try {
    const url = templateId ? `/api/event-templates/${templateId}` : '/api/event-templates';
    const method = templateId ? 'PUT' : 'POST';
    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
    if (response.ok) {
      showSuccess(templateId ? 'Template updated' : 'Template created');
      loadTemplates();
    } else {
      const data = await response.json();
      showError(data.message || 'Failed to save template');
    }
  } catch (error) {
    showError('Failed to save template');
  }
};

const confirmDelete = async (template) => {
  const confirmed = await showConfirm('Delete Template', `Delete "${template.name}"? This cannot be undone.`, { confirmColor: '#1f2937', confirmText: 'Delete' });
  if (confirmed) {
    try {
      const response = await fetch(`/api/event-templates/${template.id}`, { method: 'DELETE' });
      if (response.ok) { showSuccess('Template deleted'); loadTemplates(); }
      else showError('Failed to delete template');
    } catch (error) { showError('Failed to delete template'); }
  }
};

onMounted(() => { loadTemplates(); });
</script>
