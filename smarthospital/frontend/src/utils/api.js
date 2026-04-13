import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sh_token');
      localStorage.removeItem('sh_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const doctorsAPI = {
  getAll: (page = 0, size = 10, search = '') =>
    api.get(`/doctors?page=${page}&size=${size}&search=${search}`),
  getById: (id) => api.get(`/doctors/${id}`),
  createProfile: (data) => api.post('/doctors/profile', data),
  toggleAvailability: (id, available) => api.put(`/doctors/${id}/availability`, { available }),
};

export const appointmentsAPI = {
  book: (data) => api.post('/appointments/book', data),
  cancel: (id, reason) => api.put(`/appointments/${id}/cancel`, { reason }),
  getMyAppointments: (page = 0, size = 10) => api.get(`/appointments/my?page=${page}&size=${size}`),
  getDoctorAppointments: (page = 0, size = 10) => api.get(`/appointments/doctor?page=${page}&size=${size}`),
  getQueue: (doctorId, date) => api.get(`/appointments/queue/${doctorId}?date=${date}`),
  updateStatus: (id, status, notes) => api.put(`/appointments/${id}/status`, { status, notes }),
};

export const notificationsAPI = {
  getAll: (page = 0, size = 10) => api.get(`/notifications?page=${page}&size=${size}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (page = 0, size = 10) => api.get(`/admin/users?page=${page}&size=${size}`),
  getDoctors: (page = 0, size = 10) => api.get(`/admin/doctors?page=${page}&size=${size}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteDoctor: (id) => api.delete(`/admin/doctors/${id}`),
};
