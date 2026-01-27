import axios from 'axios'

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api', // Vite proxy will forward to http://localhost:8000/api
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on login page and not a login attempt
      const isLoginPage = window.location.pathname === '/login'
      const isLoginRequest = error.config?.url?.includes('/auth/login')
      
      if (!isLoginPage && !isLoginRequest) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('userRole')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Authentication APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
}

// Student APIs
export const studentAPI = {
  getAll: () => api.get('/students/'),
  getById: (id) => api.get(`/students/${id}`),
  create: (studentData) => api.post('/students/', studentData),
  update: (id, studentData) => api.put(`/students/${id}`, studentData),
  delete: (id) => api.delete(`/students/${id}`),
}

// Project APIs
export const projectAPI = {
  getAll: (params) => api.get('/projects/', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (projectData) => api.post('/projects/', projectData),
  update: (id, projectData) => api.put(`/projects/${id}`, projectData),
  delete: (id) => api.delete(`/projects/${id}`),
  uploadStudents: (projectId, students) => 
    api.post(`/projects/${projectId}/upload-students`, { students }),
  getStudents: (projectId) => api.get(`/projects/${projectId}/students`),
  removeStudent: (projectId, studentId) => 
    api.delete(`/projects/${projectId}/students/${studentId}`),
  addPreference: (projectId, studentId, preferenceOrder) =>
    api.post(`/projects/${projectId}/preferences/${studentId}`, {
      preference_order: preferenceOrder,
    }),
}

// Preference APIs
export const preferenceAPI = {
  submitPartnerPreference: (studentId, preferenceData) =>
    api.post(`/preferences/students/${studentId}/partner-preference`, preferenceData),
  getStudentPreferences: (studentId) =>
    api.get(`/preferences/students/${studentId}/preferences`),
}

// Assignment APIs
export const assignmentAPI = {
  getAll: () => api.get('/assignments/'),
  runAlgorithm: () => api.post('/assignments/run-algorithm'),
  getStats: () => api.get('/assignments/stats'),
  clearAll: () => api.delete('/assignments/'),
}

export default api
