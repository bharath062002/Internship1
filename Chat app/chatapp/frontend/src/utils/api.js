import axios from 'axios'
import { useAuthStore } from '../store'

const AUTH_ROUTES = new Set([
  '/auth/register',
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
])

function isAuthRoute(url = '') {
  return [...AUTH_ROUTES].some((route) => url.endsWith(route))
}

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token && !isAuthRoute(config.url)) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (!original || isAuthRoute(original.url)) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = useAuthStore.getState().refreshToken
        if (refreshToken) {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken })
          useAuthStore.getState().setAuth(data.user, data.accessToken, data.refreshToken)
          original.headers = original.headers ?? {}
          original.headers.Authorization = `Bearer ${data.accessToken}`
          return api(original)
        }
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
}

export const userApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  getUser: (id) => api.get(`/users/${id}`),
  search: (q) => api.get('/users/search', { params: { q } }),
  getConversations: () => api.get('/users/conversations'),
  updateStatus: (status) => api.post('/users/status', null, { params: { status } }),
}

export const messageApi = {
  send: (data) => api.post('/messages/send', data),
  getPrivate: (receiverId, page = 0, size = 50) =>
    api.get(`/messages/private/${receiverId}`, { params: { page, size } }),
  getGroup: (groupId, page = 0, size = 50) =>
    api.get(`/messages/group/${groupId}`, { params: { page, size } }),
  markRead: (senderId) => api.post(`/messages/read/${senderId}`),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
}

export const groupApi = {
  create: (data) => api.post('/groups', data),
  getGroup: (id) => api.get(`/groups/${id}`),
  getMyGroups: () => api.get('/groups/my'),
  addMember: (groupId, memberId) => api.post(`/groups/${groupId}/members/${memberId}`),
  removeMember: (groupId, memberId) => api.delete(`/groups/${groupId}/members/${memberId}`),
}

export const notificationApi = {
  getAll: (page = 0) => api.get('/notifications', { params: { page } }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAllRead: () => api.post('/notifications/mark-all-read'),
}

export default api
