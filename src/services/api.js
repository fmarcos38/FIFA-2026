const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '')).replace(/\/$/, '')
const ADMIN_TOKEN_KEY = 'fifa-2026-admin-token'

function hasApi() {
  return Boolean(API_BASE_URL)
}

async function request(path, options = {}) {
  if (!hasApi()) {
    throw new Error('Back no configurado')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Error de conexion con el back')
  }

  return data
}

function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY) || ''
}

export function setAdminToken(token) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

export function getApiBaseUrl() {
  return API_BASE_URL
}

export function getResults() {
  return request('/api/results')
}

export function saveResult(matchId, result) {
  return request(`/api/results/${encodeURIComponent(matchId)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${getAdminToken()}` },
    body: JSON.stringify(result),
  })
}

export function deleteResult(matchId) {
  return request(`/api/results/${encodeURIComponent(matchId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getAdminToken()}` },
  })
}

export function loginAdmin(credentials) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}
