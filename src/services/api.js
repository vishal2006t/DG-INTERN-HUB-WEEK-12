import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dg_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const storedToken = localStorage.getItem('dg_auth_token');
      if (storedToken) {
        localStorage.removeItem('dg_auth_token');
        localStorage.removeItem('dg_user');
      }
    }

    const message =
      error.response?.data?.message ||
      (Array.isArray(error.response?.data?.errors) ? error.response.data.errors.join(', ') : null) ||
      error.message ||
      'An unexpected network error occurred';

    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.errors = error.response?.data?.errors;
    customError.data = error.response?.data;
    return Promise.reject(customError);
  }
);

const api = {
  auth: {
    register: async (userData) => apiClient.post('/auth/register', userData),
    login: async (credentials) => apiClient.post('/auth/login', credentials),
    getMe: async () => apiClient.get('/auth/me'),
    logout: async () => {
      try {
        await apiClient.post('/auth/logout');
      } finally {
        localStorage.removeItem('dg_auth_token');
        localStorage.removeItem('dg_user');
      }
    }
  },

  users: {
    getProfile: async () => apiClient.get('/users/profile'),
    updateProfile: async (profileData) => apiClient.put('/users/profile', profileData),
    deleteProfile: async () => apiClient.delete('/users/profile'),
    getAllAdmin: async (params = {}) => {
      const q = new URLSearchParams();
      if (params.role && params.role !== 'All') q.set('role', params.role);
      if (params.search) q.set('search', params.search);
      if (params.page) q.set('page', params.page);
      if (params.limit) q.set('limit', params.limit);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return apiClient.get(`/users${qs}`);
    },
    updateRoleAdmin: async (id, role) => apiClient.put(`/users/${id}/role`, { role }),
    deleteAdmin: async (id) => apiClient.delete(`/users/${id}`)
  },

  jobs: {
    getFilters: async () => apiClient.get('/jobs/filters'),
    getAll: async (params = {}) => {
      const q = new URLSearchParams();
      if (params.search) q.set('search', params.search);
      if (params.category && params.category !== 'All' && params.category !== 'All Categories') q.set('category', params.category);
      if (params.location && params.location !== 'All' && params.location !== 'all') q.set('location', params.location);
      if (params.workType && params.workType !== 'All' && params.workType !== 'All Modes') q.set('workType', params.workType);
      if (params.type && params.type !== 'All' && params.type !== 'all') q.set('type', params.type);
      if (params.experience && params.experience !== 'All Experience' && params.experience !== 'all') q.set('experience', params.experience);
      if (params.skill && params.skill !== 'All') q.set('skill', params.skill);
      if (params.featured) q.set('featured', params.featured);
      if (params.postedBy) q.set('postedBy', params.postedBy);
      if (params.includeAllStatuses) q.set('includeAllStatuses', String(params.includeAllStatuses));
      if (params.status) q.set('status', params.status);
      if (params.sort) q.set('sort', params.sort);
      if (params.page) q.set('page', params.page);
      if (params.limit) q.set('limit', params.limit);

      const qs = q.toString() ? `?${q.toString()}` : '';
      return apiClient.get(`/jobs${qs}`);
    },
    getById: async (id) => apiClient.get(`/jobs/${id}`),
    create: async (jobData) => apiClient.post('/jobs', jobData),
    update: async (id, jobData) => apiClient.put(`/jobs/${id}`, jobData),
    delete: async (id) => apiClient.delete(`/jobs/${id}`)
  },

  applications: {
    apply: async (applicationData) => apiClient.post('/applications', applicationData),
    getMy: async () => apiClient.get('/applications/my'),
    getById: async (id) => apiClient.get(`/applications/${id}`),
    updateStatus: async (id, statusData) => apiClient.put(`/applications/${id}/status`, statusData),
    delete: async (id) => apiClient.delete(`/applications/${id}`),
    getAllAdmin: async (params = {}) => {
      const q = new URLSearchParams();
      if (params.status && params.status !== 'All' && params.status !== 'all') q.set('status', params.status);
      if (params.search) q.set('search', params.search);
      if (params.page) q.set('page', params.page);
      if (params.limit) q.set('limit', params.limit);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return apiClient.get(`/applications/admin${qs}`);
    },
    getRecruiter: async (params = {}) => {
      const q = new URLSearchParams();
      if (params.jobId) q.set('jobId', params.jobId);
      if (params.status && params.status !== 'All') q.set('status', params.status);
      if (params.search) q.set('search', params.search);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return apiClient.get(`/applications/recruiter${qs}`);
    },
    exportCSV: async () => apiClient.get('/applications/export/csv', { responseType: 'blob' }),
    uploadResume: async (file) => {
      const formData = new FormData();
      formData.append('resume', file);
      return apiClient.post('/applications/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
  },

  notifications: {
    getAll: async () => apiClient.get('/notifications'),
    markAsRead: async (id) => apiClient.put(`/notifications/${id}/read`),
    markAllAsRead: async () => apiClient.put('/notifications/read-all'),
    delete: async (id) => apiClient.delete(`/notifications/${id}`)
  },

  analytics: {
    getPublic: async () => apiClient.get('/analytics/public'),
    getAdmin: async () => apiClient.get('/analytics/admin'),
    getRecruiter: async () => apiClient.get('/analytics/recruiter')
  },

  contact: {
    submit: async (data) => apiClient.post('/contact', data),
    getAllAdmin: async () => apiClient.get('/contact'),
    updateStatusAdmin: async (id, status) => apiClient.patch(`/contact/${id}/status`, { status })
  }
};

export { api };
export default api;
