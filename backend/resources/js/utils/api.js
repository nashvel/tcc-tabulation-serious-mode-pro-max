/**
 * API utility for making authenticated requests
 */

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

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('adminToken');
};

// Build headers for API requests
const buildHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-XSRF-TOKEN': getCsrfToken()
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

/**
 * Make an authenticated API request
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @param {boolean} requireAuth - Whether to include auth token (default: true)
 * @returns {Promise<Response>}
 */
export const apiRequest = async (url, options = {}, requireAuth = true) => {
  const headers = buildHeaders(requireAuth);
  
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    },
    credentials: 'same-origin'
  });
};

/**
 * GET request
 */
export const apiGet = (url, requireAuth = true) => {
  return apiRequest(url, { method: 'GET' }, requireAuth);
};

/**
 * POST request
 */
export const apiPost = (url, data, requireAuth = true) => {
  return apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data)
  }, requireAuth);
};

/**
 * PUT request
 */
export const apiPut = (url, data, requireAuth = true) => {
  return apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  }, requireAuth);
};

/**
 * DELETE request
 */
export const apiDelete = (url, requireAuth = true) => {
  return apiRequest(url, { method: 'DELETE' }, requireAuth);
};

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
  request: apiRequest
};
