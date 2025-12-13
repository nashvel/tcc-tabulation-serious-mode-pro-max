<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Admin Login</h1>
        <p class="text-sm text-gray-500">Enter your PIN to access admin panel</p>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-5">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Admin PIN
          </label>
          <input
            type="password"
            v-model="pin"
            placeholder="Enter 6-digit PIN"
            maxlength="6"
            class="w-full px-4 py-3 text-lg text-center tracking-widest font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        <div
          v-if="error"
          class="p-3 mb-5 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm"
        >
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading || pin.length < 4"
          :class="[
            'w-full py-3 rounded-md text-white font-semibold text-base transition-all',
            loading || pin.length < 4
              ? 'bg-red-300 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 cursor-pointer'
          ]"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showError } from '../../utils/alerts';

const router = useRouter();
const route = useRoute();

const pin = ref('');
const error = ref('');
const loading = ref(false);

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
    showError('Invalid PIN or connection error');
    error.value = 'Invalid PIN or connection error';
  } finally {
    loading.value = false;
  }
};
</script>
