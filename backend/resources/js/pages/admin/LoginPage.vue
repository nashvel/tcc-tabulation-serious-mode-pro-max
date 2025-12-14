<template>
  <div class="min-h-screen bg-white font-sans antialiased flex flex-col">
    <!-- Header -->
    <header class="h-12 px-6 flex items-center justify-between border-b border-gray-200">
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 border border-gray-300 rounded flex items-center justify-center">
          <LayoutGrid :size="14" class="text-gray-800" />
        </div>
        <span class="text-sm font-semibold text-gray-900 tracking-tight">Podium Ledger</span>
      </div>
      
      <!-- Tab Toggle (Login / Judge) -->
      <div class="relative">
        <div 
          class="flex border rounded transition-all"
          :class="showServerHint ? 'border-gray-900 border-2' : 'border-gray-300'"
        >
          <button
            @click="selectedTab = 'login'"
            :class="[
              'px-3 py-1.5 text-xs font-medium transition-colors rounded-l',
              selectedTab === 'login' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Login
          </button>
          <div class="w-px bg-gray-300"></div>
          <button
            @click="selectedTab = 'judge'; showServerHint = false"
            :class="[
              'px-3 py-1.5 text-xs font-medium transition-colors rounded-r',
              selectedTab === 'judge' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700',
              showServerHint ? 'bg-gray-50' : ''
            ]"
          >
            Judge
          </button>
        </div>
        
        <!-- Server Hint Tooltip -->
        <div 
          v-if="showServerHint" 
          class="absolute top-10 right-0 z-50"
        >
          <div class="flex flex-col items-end">
            <div class="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-transparent border-b-gray-900 mr-6"></div>
            <div class="bg-gray-900 text-white px-3 py-2 rounded text-xs flex items-center gap-2">
              <Info :size="14" />
              <span>Go to Judge page to score</span>
              <button 
                @click="goToJudge"
                class="bg-white text-gray-900 px-2 py-0.5 rounded text-[10px] font-semibold hover:bg-gray-100"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 relative overflow-hidden flex items-center justify-center">
      <!-- Background Text (only show on login tab) -->
      <div v-if="selectedTab === 'login'" class="absolute bottom-10 left-0 right-0 text-center pointer-events-none select-none">
        <span class="text-7xl font-semibold text-gray-900 tracking-tight" style="font-family: 'Playfair Display', serif;">
          PodiumLed<span class="inline-block animate-bounce-letter-1">g</span><span class="inline-block animate-bounce-letter-2">e</span><span class="inline-block animate-bounce-letter-3 text-8xl">r</span>
        </span>
      </div>

      <!-- Login Tab Content -->
      <div v-if="selectedTab === 'login'" class="relative animate-fade-in-scale">
        <img src="/assets/macbook.png" alt="Macbook" class="w-[650px] h-auto" />
        
        <!-- Login Form Inside Screen -->
        <div class="absolute top-[100px] left-1/2 -translate-x-1/2 w-[240px]">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Admin PIN</label>
              <input
                type="password"
                v-model="pin"
                placeholder="Enter 6-digit PIN"
                maxlength="6"
                inputmode="numeric"
                pattern="[0-9]*"
                class="w-full px-3 py-2 text-sm text-center tracking-[0.3em] font-mono border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                required
              />
            </div>

            <div v-if="error" class="p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs text-center">
              {{ error }}
            </div>

            <button
              type="submit"
              :disabled="loading || pin.length < 4"
              :class="[
                'w-full py-2 rounded text-white text-xs font-medium transition-all',
                loading || pin.length < 4
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gray-900 hover:bg-gray-800 cursor-pointer'
              ]"
            >
              <Loader2 v-if="loading" :size="14" class="animate-spin mx-auto" />
              <span v-else>Login</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Judge Tab Content -->
      <div v-else class="w-full max-w-md px-6">
        <div class="text-center mb-8">
          <Gavel :size="48" class="text-gray-300 mx-auto mb-4" />
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Judge Portal</h2>
          <p class="text-sm text-gray-500">Access the scoring interface for judges</p>
        </div>
        
        <button
          @click="goToJudge"
          class="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>Open Judge Interface</span>
          <ArrowRight :size="16" />
        </button>
        
        <p class="text-xs text-gray-400 text-center mt-4">
          Judges can access the scoring page without admin login
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { LayoutGrid, Loader2, Info, Gavel, ArrowRight } from 'lucide-vue-next';
import { showError } from '../../utils/alerts';

const router = useRouter();
const route = useRoute();

const pin = ref('');
const error = ref('');
const loading = ref(false);
const selectedTab = ref('login');
const showServerHint = ref(false);

// Check if already logged in
onMounted(() => {
  const token = localStorage.getItem('adminToken');
  const storedPin = localStorage.getItem('adminPin');
  if (token && storedPin) {
    router.push('/setup');
  }
});

// Get CSRF token from cookie
const getCsrfToken = () => {
  const name = 'XSRF-TOKEN=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return '';
};

const goToJudge = () => {
  router.push('/judge');
};

const showServerHintTooltip = () => {
  showServerHint.value = true;
  // Auto-hide after 5 seconds
  setTimeout(() => {
    showServerHint.value = false;
  }, 5000);
};

const handleSubmit = async () => {
  error.value = '';
  loading.value = true;

  try {
    // First, get CSRF cookie
    await fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' });
    
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-XSRF-TOKEN': getCsrfToken()
      },
      credentials: 'same-origin',
      body: JSON.stringify({ pin: pin.value })
    });

    const data = await response.json();

    if (data.token) {
      // Store authentication data
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminPin', pin.value);
      localStorage.setItem('isAdmin', 'true');

      // Redirect to setup
      router.push('/setup');
    } else {
      error.value = data.message || 'Invalid PIN';
    }
  } catch (err) {
    // Check if it's a connection error - show hint to go to judge page
    const message = err.message?.toLowerCase() || '';
    if (message.includes('connect') || message.includes('network') || message.includes('fetch')) {
      showServerHintTooltip();
    }
    showError('Invalid PIN or connection error');
    error.value = 'Invalid PIN or connection error';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&display=swap');

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounceLetter {
  0% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
  100% { transform: translateY(0); }
}

.animate-fade-in-scale {
  animation: fadeInScale 0.6s ease-out forwards;
}

.animate-bounce-letter-1 {
  animation: bounceLetter 0.5s ease-out forwards;
  animation-delay: 0.5s;
}

.animate-bounce-letter-2 {
  animation: bounceLetter 0.5s ease-out forwards;
  animation-delay: 0.65s;
}

.animate-bounce-letter-3 {
  animation: bounceLetter 0.5s ease-out forwards;
  animation-delay: 0.8s;
}
</style>
