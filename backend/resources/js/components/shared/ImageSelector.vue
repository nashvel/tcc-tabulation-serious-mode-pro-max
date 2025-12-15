<template>
  <div class="image-selector">
    <label v-if="label" class="block text-xs font-medium text-gray-700 mb-2">{{ label }}</label>
    
    <!-- Current Selection Preview -->
    <div v-if="modelValue" class="mb-3 relative group">
      <div class="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
        <img 
          :src="modelValue" 
          :alt="label || 'Selected image'"
          class="w-full h-32 object-contain"
          @error="handlePreviewError"
        />
        <button 
          @click="clearSelection"
          class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          title="Remove image"
        >
          <span class="material-icons" style="font-size: 16px">close</span>
        </button>
      </div>
      <p class="text-xs text-gray-500 mt-1 truncate">{{ modelValue }}</p>
    </div>

    <!-- Drop Zone (when allowUpload is enabled) -->
    <div 
      v-if="allowUpload"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      :class="[
        'relative mb-3 p-4 rounded-lg border-2 border-dashed transition-all cursor-pointer',
        isDragging 
          ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' 
          : uploadError 
            ? 'border-red-400 bg-red-50' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
      ]"
      @click="triggerFileInput"
    >
      <!-- Hidden file input -->
      <input 
        ref="fileInput"
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
        class="hidden"
        @change="handleFileSelect"
      />
      
      <!-- Uploading State -->
      <div v-if="isUploading" class="flex flex-col items-center justify-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
        <p class="text-sm text-gray-600">Uploading...</p>
      </div>

      <!-- Default/Drag State -->
      <div v-else class="flex flex-col items-center justify-center py-4">
        <span class="material-icons text-gray-400 mb-2" style="font-size: 32px">
          {{ isDragging ? 'file_download' : 'cloud_upload' }}
        </span>
        <p class="text-sm text-gray-600 text-center">
          <span v-if="isDragging">Drop image here</span>
          <span v-else>Drag & drop image here<br/>or click to browse</span>
        </p>
      </div>

      <!-- Error Message -->
      <div v-if="uploadError && !isUploading" class="mt-2 text-center">
        <p class="text-xs text-red-600">{{ uploadError }}</p>
        <button 
          @click.stop="clearError"
          class="mt-1 text-xs text-indigo-600 hover:text-indigo-800 underline"
        >
          Dismiss
        </button>
      </div>
    </div>

    <!-- Browse Library Button -->
    <button 
      type="button"
      @click="openSelector"
      class="w-full h-10 px-4 flex items-center justify-center gap-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <span class="material-icons" style="font-size: 18px">photo_library</span>
      <span>{{ modelValue ? 'Browse Library' : (placeholder || 'Browse Library') }}</span>
    </button>

    <!-- Modal -->
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="w-full max-w-3xl flex flex-col bg-white/90 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl overflow-hidden max-h-[80vh]">
        <!-- Header -->
        <header class="flex items-center justify-between p-4 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <span class="material-icons text-gray-500" style="font-size: 20px">photo_library</span>
            <h2 class="text-lg font-semibold text-gray-900 tracking-tight">Select Image</h2>
          </div>
          <button @click="closeSelector" class="text-gray-500 hover:text-gray-900 transition-colors rounded-full p-1 hover:bg-gray-100">
            <span class="material-icons" style="font-size: 20px">close</span>
          </button>
        </header>

        <!-- Main Content -->
        <main class="p-4 flex-grow overflow-y-auto">
          <!-- Loading State -->
          <div v-if="isLoading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>

          <!-- Empty State -->
          <div v-else-if="images.length === 0" class="text-center py-12">
            <span class="material-icons text-gray-300" style="font-size: 48px">image_not_supported</span>
            <p class="mt-2 text-gray-500">No images available</p>
            <p class="text-xs text-gray-400 mt-1">Add images to the public/assets directory</p>
          </div>

          <!-- Image Grid -->
          <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            <button
              v-for="image in images"
              :key="image.path"
              type="button"
              @click="selectImage(image)"
              :class="[
                'relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
                selectedImage?.path === image.path ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <img 
                :src="image.path" 
                :alt="image.name"
                class="w-full h-full object-cover"
                @error="handleThumbnailError($event, image)"
              />
              <div v-if="selectedImage?.path === image.path" class="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                <span class="material-icons text-white drop-shadow-lg" style="font-size: 24px">check_circle</span>
              </div>
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                <p class="text-xs text-white truncate">{{ image.name }}</p>
              </div>
            </button>
          </div>
        </main>

        <!-- Footer -->
        <footer class="flex justify-end items-center gap-3 p-4 bg-gray-50 border-t border-gray-200">
          <button 
            @click="closeSelector" 
            class="h-9 px-4 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button 
            @click="confirmSelection"
            :disabled="!selectedImage"
            :class="[
              'h-9 px-5 rounded-lg text-sm font-semibold transition-colors shadow-sm',
              selectedImage 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            ]"
          >
            Select
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, watch } from 'vue';

// Validation constants
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select Image'
  },
  allowUpload: {
    type: Boolean,
    default: true
  },
  maxFileSize: {
    type: Number,
    default: DEFAULT_MAX_FILE_SIZE
  }
});

const emit = defineEmits(['update:modelValue']);

// Modal state
const isOpen = ref(false);
const isLoading = ref(false);
const images = ref([]);
const selectedImage = ref(null);

// Drag-and-drop state (Requirements 1.1, 1.4)
const isDragging = ref(false);
const isUploading = ref(false);
const uploadError = ref('');
const fileInput = ref(null);

/**
 * Validates a file for upload
 * @param {File} file - The file to validate
 * @returns {{ valid: boolean, error: string }} Validation result
 * Requirements: 1.2, 1.3, 4.4
 */
const validateFile = (file) => {
  // Check MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Allowed: PNG, JPG, GIF, WEBP, SVG'
    };
  }
  
  // Check file size
  if (file.size > props.maxFileSize) {
    const maxSizeMB = (props.maxFileSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`
    };
  }
  
  return { valid: true, error: '' };
};


/**
 * Uploads a file to the server
 * @param {File} file - The file to upload
 * Requirements: 4.1, 4.3
 */
const uploadFile = async (file) => {
  isUploading.value = true;
  uploadError.value = '';
  
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/assets/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Upload failed. Please try again.');
    }
    
    // Update the model value with the uploaded image path
    emit('update:modelValue', data.path);
  } catch (error) {
    uploadError.value = error.message || 'Upload failed. Please try again.';
    console.error('Upload error:', error);
  } finally {
    isUploading.value = false;
  }
};

/**
 * Handles drag over event
 * Requirements: 1.1
 */
const handleDragOver = (event) => {
  event.dataTransfer.dropEffect = 'copy';
  isDragging.value = true;
};

/**
 * Handles drag leave event
 */
const handleDragLeave = (event) => {
  isDragging.value = false;
};

/**
 * Handles file drop event
 * Requirements: 1.1, 1.4
 */
const handleDrop = async (event) => {
  isDragging.value = false;
  uploadError.value = '';
  
  const files = event.dataTransfer.files;
  if (!files || files.length === 0) return;
  
  // Process only the first valid image file (Requirement 1.4)
  const file = files[0];
  
  const validation = validateFile(file);
  if (!validation.valid) {
    uploadError.value = validation.error;
    return;
  }
  
  await uploadFile(file);
};

/**
 * Triggers the hidden file input
 */
const triggerFileInput = () => {
  if (!isUploading.value && fileInput.value) {
    fileInput.value.click();
  }
};

/**
 * Handles file selection from input
 */
const handleFileSelect = async (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  
  const file = files[0];
  
  const validation = validateFile(file);
  if (!validation.valid) {
    uploadError.value = validation.error;
    return;
  }
  
  await uploadFile(file);
  
  // Reset the input so the same file can be selected again
  event.target.value = '';
};

/**
 * Clears the upload error
 */
const clearError = () => {
  uploadError.value = '';
};


// Modal functions
const fetchImages = async () => {
  isLoading.value = true;
  try {
    const response = await fetch('/api/assets/images');
    if (!response.ok) throw new Error('Failed to fetch images');
    const data = await response.json();
    images.value = data.images || [];
  } catch (error) {
    console.error('Error fetching images:', error);
    images.value = [];
  } finally {
    isLoading.value = false;
  }
};

const openSelector = () => {
  isOpen.value = true;
  selectedImage.value = props.modelValue ? { path: props.modelValue } : null;
  fetchImages();
};

const closeSelector = () => {
  isOpen.value = false;
  selectedImage.value = null;
};

const selectImage = (image) => {
  selectedImage.value = image;
};

const confirmSelection = () => {
  if (selectedImage.value) {
    emit('update:modelValue', selectedImage.value.path);
    closeSelector();
  }
};

const clearSelection = () => {
  emit('update:modelValue', '');
};

const handlePreviewError = (event) => {
  event.target.style.display = 'none';
};

const handleThumbnailError = (event, image) => {
  // Replace with a placeholder on error
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="12" x="50" y="50" text-anchor="middle" dy=".3em"%3EError%3C/text%3E%3C/svg%3E';
};

// Expose validateFile for testing
defineExpose({
  validateFile,
  ALLOWED_TYPES,
  DEFAULT_MAX_FILE_SIZE
});
</script>

<style scoped>
.image-selector {
  width: 100%;
}
</style>
