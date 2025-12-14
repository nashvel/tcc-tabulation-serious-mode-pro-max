<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button @click="goBack" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft :size="20" class="text-gray-600" />
            </button>
            <div>
              <h1 class="text-xl font-bold text-gray-900">Configure Judges</h1>
              <p class="text-sm text-gray-500">{{ eventTitle || 'Loading...' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button 
              @click="isSwapMode = !isSwapMode"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                isSwapMode 
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              <ArrowLeftRight :size="16" />
              {{ isSwapMode ? 'Swapping Mode' : 'Swap Chairs' }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Swap Mode Banner -->
    <div v-if="isSwapMode" class="bg-amber-50 border-b border-amber-200">
      <div class="max-w-5xl mx-auto px-6 py-3">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-amber-100 rounded-full">
            <ArrowLeftRight :size="16" class="text-amber-600" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-amber-800">
              {{ swapSelection.first ? `Selected: Judge ${swapSelection.first.chair_number} (${swapSelection.first.name}) - Click another judge to swap` : 'Click on a judge to select for swapping' }}
            </p>
          </div>
          <button 
            v-if="swapSelection.first"
            @click="cancelSwap"
            class="text-sm text-amber-700 hover:text-amber-900 underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-6 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <Loader2 :size="32" class="text-indigo-500 animate-spin" />
      </div>

      <!-- Judges Visual Display -->
      <div v-else>
        <!-- Judge Login Mode Card -->
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          <div class="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <h3 class="text-xs font-semibold text-gray-600 uppercase">Judge Login Mode</h3>
          </div>
          <div class="p-4">
            <div class="flex flex-col sm:flex-row gap-3">
              <!-- Auto-Assign Mode -->
              <button
                @click="setLoginMode('auto')"
                :class="[
                  'flex-1 flex items-center gap-3 p-4 rounded-lg border text-left transition-all',
                  displaySettings.judge_login_mode === 'auto' 
                    ? 'border-gray-300 bg-white shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                ]"
              >
                <div :class="[
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  displaySettings.judge_login_mode === 'auto' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                ]">
                  <Zap :size="20" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="font-medium text-gray-900">Auto-Assign</p>
                    <span class="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Recommended</span>
                  </div>
                  <p class="text-sm text-gray-500 mt-0.5">Judges automatically get a number when they connect</p>
                </div>
                <CheckCircle v-if="displaySettings.judge_login_mode === 'auto'" :size="20" class="text-indigo-600 flex-shrink-0" />
              </button>

              <!-- Manual Mode -->
              <button
                @click="setLoginMode('manual')"
                :class="[
                  'flex-1 flex items-center gap-3 p-4 rounded-lg border text-left transition-all',
                  displaySettings.judge_login_mode === 'manual' 
                    ? 'border-gray-300 bg-white shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                ]"
              >
                <div :class="[
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  displaySettings.judge_login_mode === 'manual' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                ]">
                  <UserCheck :size="20" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900">Manual Selection</p>
                  <p class="text-sm text-gray-500 mt-0.5">Judges select their number from a list</p>
                </div>
                <CheckCircle v-if="displaySettings.judge_login_mode === 'manual'" :size="20" class="text-indigo-600 flex-shrink-0" />
              </button>
            </div>
          </div>
        </div>
        <!-- Macbook Visual Grid -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-medium text-gray-500 uppercase tracking-wider">Judge Stations</h2>
            <span class="text-xs text-gray-400">{{ judges.length }} judge{{ judges.length !== 1 ? 's' : '' }}</span>
          </div>
          
          <!-- Macbook Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            <div 
              v-for="judge in sortedJudges" 
              :key="'mac-' + judge.id"
              @click="handleJudgeClick(judge)"
              class="relative group transition-all duration-300 cursor-pointer"
              :class="[
                isSwapMode && swapSelection.first?.id === judge.id ? 'scale-105' : 'hover:scale-105'
              ]"
              :style="{ width: getMacbookSize + 'px' }"
            >
              <!-- Macbook Image -->
              <img 
                src="/assets/macbook.png" 
                :alt="'Judge ' + judge.chair_number"
                class="w-full h-auto transition-all"
                :class="[
                  isSwapMode && swapSelection.first?.id === judge.id 
                    ? 'drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]' 
                    : 'drop-shadow-lg group-hover:drop-shadow-xl'
                ]"
              />
              
              <!-- Judge Info Overlay on Screen -->
              <div 
                class="absolute flex flex-col items-center justify-center text-center"
                :style="getScreenPosition"
              >
                <!-- Chair Number -->
                <div class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-2 bg-white border-2 border-gray-300 text-gray-900">
                  {{ judge.chair_number }}
                </div>
                
                <!-- Judge Name -->
                <p class="text-sm font-medium text-gray-700 truncate max-w-[90%]">
                  {{ judge.name }}
                </p>
                
                <!-- Status Dot -->
                <div class="flex items-center gap-1.5 mt-1">
                  <span 
                    :class="[
                      'w-2 h-2 rounded-full',
                      judge.status === 'active' ? 'bg-gray-900' :
                      judge.status === 'locked' ? 'bg-gray-400' :
                      'bg-gray-300'
                    ]"
                  ></span>
                  <span class="text-xs text-gray-500 uppercase">{{ judge.status }}</span>
                </div>
              </div>
              
              <!-- Selection Ring for Swap Mode -->
              <div 
                v-if="isSwapMode && swapSelection.first?.id === judge.id"
                class="absolute inset-0 border-4 border-amber-500 rounded-lg pointer-events-none"
              ></div>
            </div>
            
            <!-- Add New Judge Macbook -->
            <div 
              v-if="!isSwapMode"
              @click="openJudgeModal()"
              class="relative group cursor-pointer transition-all duration-300 hover:scale-105 opacity-50 hover:opacity-100"
              :style="{ width: getMacbookSize + 'px' }"
            >
              <img 
                src="/assets/macbook.png" 
                alt="Add Judge"
                class="w-full h-auto grayscale group-hover:grayscale-0 transition-all drop-shadow-lg"
              />
              <div 
                class="absolute flex flex-col items-center justify-center"
                :style="getScreenPosition"
              >
                <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-2 group-hover:bg-gray-900 transition-colors">
                  <Plus :size="20" class="text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <p class="text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors">Add Judge</p>
              </div>
            </div>
          </div>
        </div>


      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, ArrowLeftRight, Plus, Pencil, Trash2, Loader2, Zap, UserCheck, CheckCircle } from 'lucide-vue-next';
import Swal from 'sweetalert2';
import { showSuccess, showError, showConfirm, showFormModal } from '../../utils/alerts';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const judges = ref([]);
const eventId = ref(null);
const eventTitle = ref('');
const isSwapMode = ref(false);
const swapSelection = ref({ first: null, second: null });

// Display settings for judge login mode
const displaySettings = ref({
  judge_login_mode: 'auto',
  show_candidate_name: true,
  show_team_department: true,
});


const sortedJudges = computed(() => {
  return [...judges.value].sort((a, b) => a.chair_number - b.chair_number);
});

// Fixed macbook size - bigger for 3 per row layout
const getMacbookSize = computed(() => {
  return 280; // Fixed larger size
});

// Position for content inside macbook screen
const getScreenPosition = computed(() => {
  const size = getMacbookSize.value;
  // Screen is roughly at top 15% and takes about 60% of height
  const top = size * 0.18;
  const left = size * 0.15;
  const width = size * 0.7;
  const height = size * 0.45;
  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`
  };
});

const goBack = () => {
  if (eventId.value) {
    router.push(`/admin?event_id=${eventId.value}`);
  } else {
    router.push('/setup');
  }
};

const fetchJudges = async () => {
  if (!eventId.value) return;
  
  try {
    const response = await fetch(`/api/judges?event_id=${eventId.value}`);
    judges.value = await response.json();
  } catch (error) {
    showError('Failed to load judges');
  }
};

const fetchEvent = async () => {
  if (!eventId.value) return;
  
  try {
    const response = await fetch(`/api/events/${eventId.value}`);
    const event = await response.json();
    eventTitle.value = event.title;
  } catch (error) {
    console.error('Failed to load event');
  }
};

const handleJudgeClick = async (judge) => {
  if (isSwapMode.value) {
    if (!swapSelection.value.first) {
      swapSelection.value.first = judge;
    } else if (swapSelection.value.first.id === judge.id) {
      // Clicked same judge, deselect
      swapSelection.value.first = null;
    } else {
      // Swap the chair numbers
      await performSwap(swapSelection.value.first, judge);
    }
  } else {
    // Show judge info modal
    showJudgeInfoModal(judge);
  }
};

const getInfoContent = (judge) => {
  const statusColor = judge.status === 'active' ? '#111827' : judge.status === 'locked' ? '#9ca3af' : '#d1d5db';
  const statusLabel = judge.status.charAt(0).toUpperCase() + judge.status.slice(1);
  
  return `
    <div style="width: 70px; height: 70px; border-radius: 50%; background: white; border: 4px solid #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; color: #111827; margin-bottom: 8px;">
      ${judge.chair_number}
    </div>
    <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 6px;">${judge.name}</h2>
    <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 9999px; background: #f3f4f6; font-size: 12px; margin-bottom: 6px;">
      <span style="width: 6px; height: 6px; border-radius: 50%; background-color: ${statusColor};"></span>
      <span style="color: #4b5563; text-transform: uppercase;">${statusLabel}</span>
    </div>
    <p style="font-size: 11px; color: #9ca3af; margin: 0 0 12px;">ID: ${judge.id}</p>
    
    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; padding-top: 8px; justify-content: center;">
      <button id="swal-live-btn" style="padding: 8px 20px; background: #111827; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        Live View
      </button>
      <button id="swal-edit-btn" style="padding: 8px 20px; background: white; color: #111827; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer;">Edit</button>
      <button id="swal-delete-btn" style="padding: 8px 20px; background: white; color: #111827; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer;">Delete</button>
      <button id="swal-close-btn" style="padding: 8px 20px; background: white; color: #111827; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer;">Close</button>
    </div>
  `;
};

const getEditContent = (judge) => {
  return `
    <div style="width: 100%; text-align: left;">
      <h3 style="font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 12px; text-align: center;">Edit Judge</h3>
      
      <div style="margin-bottom: 10px;">
        <label style="display: block; font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 4px;">Name</label>
        <input id="edit-name" type="text" value="${judge.name}" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" />
      </div>
      
      <div style="margin-bottom: 10px;">
        <label style="display: block; font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 4px;">Chair Number</label>
        <input id="edit-chair" type="number" value="${judge.chair_number}" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" />
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="display: block; font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 4px;">Status</label>
        <select id="edit-status" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
          <option value="active" ${judge.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="idle" ${judge.status === 'idle' ? 'selected' : ''}>Idle</option>
          <option value="locked" ${judge.status === 'locked' ? 'selected' : ''}>Locked</option>
        </select>
      </div>
      
      <div style="display: flex; gap: 8px; justify-content: center; padding-top: 8px;">
        <button id="swal-save-btn" style="padding: 8px 20px; background: white; color: #111827; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer;">Save</button>
        <button id="swal-back-btn" style="padding: 8px 20px; background: white; color: #111827; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer;">Back</button>
      </div>
    </div>
  `;
};

const switchToEditMode = (judge) => {
  const contentEl = document.getElementById('modal-content');
  if (!contentEl) return;
  
  contentEl.innerHTML = getEditContent(judge);
  
  // Attach edit mode handlers
  document.getElementById('swal-save-btn').addEventListener('click', async () => {
    const name = document.getElementById('edit-name').value;
    const chair_number = parseInt(document.getElementById('edit-chair').value);
    const status = document.getElementById('edit-status').value;
    
    try {
      await fetch(`/api/judges/${judge.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, chair_number, status, event_id: eventId.value })
      });
      await fetchJudges();
      const updatedJudge = judges.value.find(j => j.id === judge.id);
      if (updatedJudge) {
        switchToInfoMode(updatedJudge);
      }
      showSuccess('Judge updated');
    } catch (error) {
      showError('Failed to update judge');
    }
  });
  
  document.getElementById('swal-back-btn').addEventListener('click', () => {
    switchToInfoMode(judge);
  });
};

const switchToInfoMode = (judge) => {
  const contentEl = document.getElementById('modal-content');
  if (!contentEl) return;
  
  contentEl.innerHTML = getInfoContent(judge);
  
  // Attach info mode handlers
  document.getElementById('swal-live-btn').addEventListener('click', () => {
    switchToLiveMode(judge);
  });
  
  document.getElementById('swal-edit-btn').addEventListener('click', () => {
    switchToEditMode(judge);
  });
  
  document.getElementById('swal-delete-btn').addEventListener('click', () => {
    showDeleteConfirmModal(judge);
  });
  
  document.getElementById('swal-close-btn').addEventListener('click', () => {
    Swal.close();
  });
};

const showJudgeInfoModal = (judge) => {
  Swal.fire({
    html: `
      <div style="position: relative; width: 100%; max-width: 650px; margin: 0 auto;">
        <img src="/assets/macbook(white).png" alt="Judge Station" style="width: 100%; height: auto; filter: drop-shadow(0 25px 40px rgba(0,0,0,0.2));" />
        <div id="modal-content" style="position: absolute; top: 6%; left: 12%; width: 76%; height: 58%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 12px; box-sizing: border-box;">
          ${getInfoContent(judge)}
        </div>
      </div>
    `,
    showConfirmButton: false,
    showCancelButton: false,
    showDenyButton: false,
    width: 720,
    padding: '1rem',
    background: 'transparent',
    customClass: {
      popup: 'bg-transparent shadow-none'
    },
    didOpen: () => {
      // Attach info mode handlers
      document.getElementById('swal-live-btn').addEventListener('click', () => {
        switchToLiveMode(judge);
      });
      
      document.getElementById('swal-edit-btn').addEventListener('click', () => {
        switchToEditMode(judge);
      });
      
      document.getElementById('swal-delete-btn').addEventListener('click', () => {
        showDeleteConfirmModal(judge);
      });
      
      document.getElementById('swal-close-btn').addEventListener('click', () => {
        Swal.close();
      });
    }
  });
};

const switchToLiveMode = (judge) => {
  const contentEl = document.getElementById('modal-content');
  if (!contentEl) return;
  
  contentEl.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
      <div style="flex: 1; overflow: hidden; border-radius: 4px; background: #f9fafb; position: relative;">
        <iframe 
          src="/judge?event_id=${eventId.value}&judge_id=${judge.id}&preview=true"
          style="width: 200%; height: 200%; border: none; transform: scale(0.5); transform-origin: top left;"
        ></iframe>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 8px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e; animation: pulse 2s infinite;"></span>
          <span style="font-size: 12px; color: #6b7280;">Live - Judge ${judge.chair_number}</span>
        </div>
        <button id="swal-back-live-btn" style="padding: 6px 16px; background: white; color: #111827; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;">Back</button>
      </div>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    </style>
  `;
  
  document.getElementById('swal-back-live-btn').addEventListener('click', () => {
    switchToInfoMode(judge);
  });
};

const showDeleteConfirmModal = (judge) => {
  Swal.fire({
    html: `
      <div style="position: relative; width: 100%; max-width: 650px; margin: 0 auto;">
        <img src="/assets/macbook(white).png" alt="Delete Confirmation" style="width: 100%; height: auto; filter: drop-shadow(0 25px 40px rgba(0,0,0,0.2));" />
        <div style="position: absolute; top: 6%; left: 12%; width: 76%; height: 58%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 12px; box-sizing: border-box;">
          <div style="width: 60px; height: 60px; border-radius: 50%; background: #fef2f2; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </div>
          <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 8px;">Delete Judge?</h2>
          <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px;">Are you sure you want to delete</p>
          <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 16px;">${judge.name} (Chair ${judge.chair_number})</p>
          <p style="font-size: 12px; color: #9ca3af; margin: 0 0 16px;">This action cannot be undone.</p>
          
          <div style="display: flex; gap: 10px;">
            <button id="swal-confirm-delete" style="padding: 10px 24px; background: #dc2626; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">Delete</button>
            <button id="swal-cancel-delete" style="padding: 10px 24px; background: #6b7280; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">Cancel</button>
          </div>
        </div>
      </div>
    `,
    showConfirmButton: false,
    showCancelButton: false,
    width: 720,
    padding: '1rem',
    background: 'transparent',
    customClass: {
      popup: 'bg-transparent shadow-none'
    },
    didOpen: () => {
      document.getElementById('swal-confirm-delete').addEventListener('click', async () => {
        try {
          await fetch(`/api/judges/${judge.id}`, { method: 'DELETE' });
          showSuccess('Judge deleted');
          await fetchJudges();
          Swal.close();
        } catch (error) {
          showError('Failed to delete judge');
        }
      });
      
      document.getElementById('swal-cancel-delete').addEventListener('click', () => {
        showJudgeInfoModal(judge);
      });
    }
  });
};

const performSwap = async (judge1, judge2) => {
  try {
    const chair1 = judge1.chair_number;
    const chair2 = judge2.chair_number;
    
    // Use atomic swap endpoint
    const response = await fetch('/api/judges/swap-chairs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        judge1_id: judge1.id,
        judge2_id: judge2.id
      })
    });
    
    if (!response.ok) throw new Error('Swap failed');
    
    showSuccess(`Swapped chairs: ${judge1.name} (now Chair ${chair2}) ↔ ${judge2.name} (now Chair ${chair1})`);
    
    // Reset and refresh
    swapSelection.value = { first: null, second: null };
    isSwapMode.value = false;
    await fetchJudges();
  } catch (error) {
    showError('Failed to swap chairs');
  }
};

const cancelSwap = () => {
  swapSelection.value = { first: null, second: null };
};

const openJudgeModal = async (judge = null) => {
  const isEdit = !!judge;
  const nextChairNumber = judges.value.length > 0 
    ? Math.max(...judges.value.map(j => j.chair_number)) + 1 
    : 1;
  
  const result = await showFormModal(
    isEdit ? 'Edit Judge' : 'Add New Judge',
    {
      name: {
        label: 'Judge Name',
        type: 'text',
        value: judge?.name || '',
        placeholder: 'Enter judge name'
      },
      chair_number: {
        label: 'Chair Number',
        type: 'number',
        value: judge?.chair_number || nextChairNumber,
        placeholder: 'e.g. 1'
      },
      status: {
        label: 'Status',
        type: 'select',
        value: judge?.status || 'active',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'idle', label: 'Idle' },
          { value: 'locked', label: 'Locked' }
        ]
      }
    },
    { confirmText: isEdit ? 'Update' : 'Add Judge' }
  );
  
  if (!result) return;
  
  try {
    const url = isEdit ? `/api/judges/${judge.id}` : '/api/judges';
    const method = isEdit ? 'PUT' : 'POST';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: result.name,
        chair_number: parseInt(result.chair_number),
        status: result.status,
        event_id: eventId.value
      })
    });
    
    showSuccess(isEdit ? 'Judge updated' : 'Judge added');
    await fetchJudges();
  } catch (error) {
    showError('Failed to save judge');
  }
};

const editJudge = (judge) => {
  openJudgeModal(judge);
};

const deleteJudge = async (judge) => {
  const confirmed = await showConfirm(
    'Delete Judge',
    `Are you sure you want to delete ${judge.name}?`,
    { confirmText: 'Delete', confirmColor: '#dc2626' }
  );
  
  if (!confirmed) return;
  
  try {
    await fetch(`/api/judges/${judge.id}`, { method: 'DELETE' });
    showSuccess('Judge deleted successfully');
    await fetchJudges();
  } catch (error) {
    showError('Failed to delete judge');
  }
};

// Load display settings
const loadDisplaySettings = async () => {
  if (!eventId.value) return;
  
  try {
    const response = await fetch(`/api/voting/display-settings?event_id=${eventId.value}`);
    const data = await response.json();
    if (data?.display_settings) {
      displaySettings.value = data.display_settings;
    }
  } catch (error) {
    console.error('Failed to load display settings:', error);
  }
};

// Set login mode
const setLoginMode = async (mode) => {
  if (displaySettings.value.judge_login_mode === mode) return;
  displaySettings.value.judge_login_mode = mode;
  
  try {
    const response = await fetch('/api/voting/display-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: eventId.value,
        ...displaySettings.value
      })
    });
    
    if (response.ok) {
      showSuccess(`Login mode set to ${mode === 'auto' ? 'Auto-Assign' : 'Manual Selection'}`);
    } else {
      showError('Failed to save settings');
    }
  } catch (error) {
    showError('Failed to save settings');
  }
};

onMounted(async () => {
  eventId.value = route.query.event_id;
  
  if (!eventId.value) {
    router.push('/setup');
    return;
  }
  
  await Promise.all([fetchEvent(), fetchJudges(), loadDisplaySettings()]);
  loading.value = false;
});
</script>
