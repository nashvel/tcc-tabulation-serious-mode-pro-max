import api from './axios';

// Candidates API
export const candidatesAPI = {
  getAll: () => api.get('/candidates'),
  getById: (id) => api.get(`/candidates/${id}`),
  create: (data) => api.post('/candidates', data),
  update: (id, data) => api.put(`/candidates/${id}`, data),
  delete: (id) => api.delete(`/candidates/${id}`),
};

// Rounds API
export const roundsAPI = {
  getAll: () => api.get('/rounds'),
  getById: (id) => api.get(`/rounds/${id}`),
  create: (data) => api.post('/rounds', data),
  update: (id, data) => api.put(`/rounds/${id}`, data),
  delete: (id) => api.delete(`/rounds/${id}`),
};

// Criteria API
export const criteriaAPI = {
  getAll: () => api.get('/criteria'),
  getById: (id) => api.get(`/criteria/${id}`),
  create: (data) => api.post('/criteria', data),
  update: (id, data) => api.put(`/criteria/${id}`, data),
  delete: (id) => api.delete(`/criteria/${id}`),
};

// Points API
export const pointsAPI = {
  getAll: () => api.get('/points'),
  getById: (id) => api.get(`/points/${id}`),
  create: (data) => api.post('/points', data),
  update: (id, data) => api.put(`/points/${id}`, data),
  delete: (id) => api.delete(`/points/${id}`),
  getScoreboard: (params) => api.get('/scoreboard', { params }),
};

// Voting API
export const votingAPI = {
  getState: (data) => api.get('/voting/state', { params: data }),
  start: (data) => api.post('/voting/start', data),
  stop: (data) => api.post('/voting/stop', data),
  activateRound: (data) => api.post('/voting/activate-round', data),
  lock: (data) => api.post('/voting/lock', data),
  unlock: (data) => api.post('/voting/unlock', data),
  getHistory: (data) => api.get('/voting/history', { params: data }),
};

// Event Sequence API
export const eventSequenceAPI = {
  getAll: (params) => api.get('/event-sequence', { params }),
  add: (data) => api.post('/event-sequence', data),
  remove: (id) => api.delete(`/event-sequence/${id}`),
  reorder: (data) => api.post('/event-sequence/reorder', data),
  moveUp: (id) => api.post(`/event-sequence/${id}/move-up`),
  moveDown: (id) => api.post(`/event-sequence/${id}/move-down`),
};
