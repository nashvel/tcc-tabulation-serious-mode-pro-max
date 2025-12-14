<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Activity Logs</h2>
        <p class="text-sm text-gray-500">Monitor judge scoring activity in real-time</p>
      </div>
      <div class="flex items-center gap-3">
        <button 
          @click="fetchLogs" 
          :disabled="loading"
          class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw :size="16" :class="loading ? 'animate-spin' : ''" />
          Refresh
        </button>
        <button 
          @click="toggleAutoRefresh"
          :class="[
            'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            autoRefresh ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          ]"
        >
          <Radio :size="16" />
          {{ autoRefresh ? 'Live' : 'Auto' }}
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Activity :size="20" class="text-blue-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total_logs || 0 }}</p>
            <p class="text-xs text-gray-500">Total Actions</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle :size="20" class="text-green-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.scores_entered || 0 }}</p>
            <p class="text-xs text-gray-500">Scores Entered</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <Edit :size="20" class="text-amber-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.scores_updated || 0 }}</p>
            <p class="text-xs text-gray-500">Scores Updated</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Users :size="20" class="text-purple-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.judge_logins || 0 }}</p>
            <p class="text-xs text-gray-500">Judge Logins</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-4 mb-4">
      <select 
        v-model="filterJudge" 
        @change="fetchLogs"
        class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/50"
      >
        <option value="">All Judges</option>
        <option v-for="judge in judges" :key="judge.id" :value="judge.id">
          Judge #{{ judge.chair_number }} - {{ judge.name }}
        </option>
      </select>
      <select 
        v-model="filterAction" 
        @change="fetchLogs"
        class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/50"
      >
        <option value="">All Actions</option>
        <option value="score_entered">Score Entered</option>
        <option value="score_updated">Score Updated</option>
        <option value="judge_login">Judge Login</option>
        <option value="judge_logout">Judge Logout</option>
      </select>
    </div>

    <!-- Logs List -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="max-h-[500px] overflow-y-auto">
        <div v-if="loading && logs.length === 0" class="py-12 text-center">
          <Loader2 :size="32" class="text-gray-300 mx-auto mb-3 animate-spin" />
          <p class="text-sm text-gray-500">Loading activity logs...</p>
        </div>
        <div v-else-if="logs.length === 0" class="py-12 text-center">
          <Activity :size="40" class="text-gray-300 mx-auto mb-3" />
          <p class="text-sm text-gray-500">No activity logs yet</p>
        </div>
        <div v-else class="divide-y divide-gray-100">
          <div 
            v-for="log in logs" 
            :key="log.id"
            class="flex items-start gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <!-- Icon -->
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', getActionIconClass(log.action)]">
              <component :is="getActionIcon(log.action)" :size="14" class="text-white" />
            </div>
            
            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900">{{ log.description }}</p>
              <div class="flex items-center gap-3 mt-1">
                <span v-if="log.judge_number" class="text-xs text-gray-500">
                  Judge #{{ log.judge_number }}
                </span>
                <span class="text-xs text-gray-400">{{ log.time_ago }}</span>
                <span v-if="log.ip_address" class="text-xs text-gray-400">
                  IP: {{ log.ip_address }}
                </span>
              </div>
            </div>

            <!-- Score Badge (if applicable) -->
            <div v-if="log.details?.points !== undefined" class="flex-shrink-0">
              <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                {{ log.details.points }} pts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { RefreshCw, Radio, Activity, CheckCircle, Edit, Users, Loader2, LogIn, LogOut, Play, Lock, Unlock, Trash2 } from 'lucide-vue-next';

const props = defineProps({
  eventId: [String, Number]
});

const logs = ref([]);
const stats = ref({});
const judges = ref([]);
const loading = ref(false);
const autoRefresh = ref(false);
const filterJudge = ref('');
const filterAction = ref('');

let refreshInterval = null;

const fetchLogs = async () => {
  if (!props.eventId) return;
  loading.value = true;
  
  try {
    let url = `/api/activity-logs?event_id=${props.eventId}&limit=100`;
    if (filterJudge.value) url += `&judge_id=${filterJudge.value}`;
    if (filterAction.value) url += `&action=${filterAction.value}`;
    
    const [logsRes, statsRes] = await Promise.all([
      fetch(url).then(r => r.json()),
      fetch(`/api/activity-logs/stats?event_id=${props.eventId}`).then(r => r.json())
    ]);
    
    logs.value = logsRes;
    stats.value = statsRes;
  } catch (e) {
    console.error('Failed to fetch logs', e);
  } finally {
    loading.value = false;
  }
};

const fetchJudges = async () => {
  if (!props.eventId) return;
  try {
    const res = await fetch(`/api/judges?event_id=${props.eventId}`);
    judges.value = await res.json();
  } catch (e) {
    console.error('Failed to fetch judges', e);
  }
};

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;
  if (autoRefresh.value) {
    refreshInterval = setInterval(fetchLogs, 3000);
  } else {
    clearInterval(refreshInterval);
  }
};

const getActionIcon = (action) => {
  switch (action) {
    case 'score_entered': return CheckCircle;
    case 'score_updated': return Edit;
    case 'judge_login': return LogIn;
    case 'judge_logout': return LogOut;
    case 'round_activated': return Play;
    case 'voting_locked': return Lock;
    case 'voting_unlocked': return Unlock;
    case 'scores_cleared': return Trash2;
    default: return Activity;
  }
};

const getActionIconClass = (action) => {
  switch (action) {
    case 'score_entered': return 'bg-green-500';
    case 'score_updated': return 'bg-amber-500';
    case 'judge_login': return 'bg-blue-500';
    case 'judge_logout': return 'bg-gray-500';
    case 'round_activated': return 'bg-purple-500';
    case 'voting_locked': return 'bg-red-500';
    case 'voting_unlocked': return 'bg-green-500';
    case 'scores_cleared': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

onMounted(() => {
  fetchLogs();
  fetchJudges();
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});
</script>
