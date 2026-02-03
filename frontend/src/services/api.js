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
  updateProfile: (userData) => api.put('/auth/me', userData),
  signupRequest: (data) => api.post('/auth/signup-request', data),
  completePassword: (data) => api.post('/auth/complete-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

// Student APIs
export const studentAPI = {
  getAll: () => api.get('/students/'),
  getById: (id) => api.get(`/students/${id}`),
  getProfile: () => api.get('/students/me/profile'),
  updateProfile: (studentData) => api.put('/students/me/profile', studentData),
  getMyAssignments: () => api.get('/students/me/assignments'),
  create: (studentData) => api.post('/students/', studentData),
  update: (id, studentData) => api.put(`/students/${id}`, studentData),
  delete: (id) => api.delete(`/students/${id}`),
}

// Project APIs
export const projectAPI = {
  getAll: (params) => api.get('/projects/', { params }),
  getMyProjects: () => api.get('/projects/me/my-projects'),
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

// Teacher APIs
export const teacherAPI = {
  getAll: () => api.get('/teachers/'),
  getById: (id) => api.get(`/teachers/${id}`),
  getProfile: () => api.get('/teachers/me/profile'),
  updateProfile: (teacherData) => api.put('/teachers/me/profile', teacherData),
}

// Destination APIs (for exchange programs)
export const destinationAPI = {
  getByProject: (projectId) => api.get(`/destinations/${projectId}`),
  create: (projectId, data) => api.post(`/destinations/${projectId}`, data),
  update: (destinationId, data) => api.put(`/destinations/${destinationId}`, data),
  delete: (destinationId) => api.delete(`/destinations/${destinationId}`),
  uploadDestinations: (projectId, destinations) =>
    api.post(`/destinations/${projectId}/bulk`, { destinations }),
}

// Exchange Program APIs
export const exchangeAPI = {
  // Launch exchange program
  launch: (projectId) => api.post(`/exchange/projects/${projectId}/launch`),
  
  // Close preferences period (auto-fill missing with F)
  closePreferences: (projectId, autoFillMissing = true) => 
    api.post(`/exchange/projects/${projectId}/close-preferences?auto_fill_missing=${autoFillMissing}`),
  
  // Preview students with missing preferences
  previewMissingPreferences: (projectId) => 
    api.post(`/exchange/projects/${projectId}/preview-missing-preferences`),
  
  // Get students preferences status
  getStudentsStatus: (projectId) => 
    api.get(`/exchange/projects/${projectId}/students-status`),
  
  // Run optimization algorithm
  runOptimization: (projectId, algorithm = 'greedy', respectConstraints = true) => 
    api.post(`/exchange/projects/${projectId}/run-optimization?algorithm=${algorithm}&respect_constraints=${respectConstraints}`),
  
  // Get project statistics
  getStatistics: (projectId) => 
    api.get(`/exchange/projects/${projectId}/statistics`),
}

// Student Destination Preferences APIs
export const destinationPreferenceAPI = {
  // Submit preferences (A-F grades)
  submit: (data) => api.post('/destinations/preferences', data),
  
  // Get my preferences for a project
  getMyPreferences: (projectId) => api.get(`/destinations/preferences/${projectId}`),
  
  // Get all preferences for a project (teacher only)
  getProjectPreferences: (projectId) => api.get(`/destinations/${projectId}/preferences`),
}

// Preference APIs
export const preferenceAPI = {
  submitPartnerPreference: (studentId, preferenceData) =>
    api.post(`/preferences/students/${studentId}/partner-preference`, preferenceData),
  getStudentPreferences: (studentId) =>
    api.get(`/preferences/students/${studentId}/preferences`),
  submitPreferences: (studentId, preferencesData) =>
    api.post(`/preferences/students/${studentId}/preferences`, preferencesData),
  updatePreferences: (studentId, preferencesData) =>
    api.put(`/preferences/students/${studentId}/preferences`, preferencesData),
  deletePreferences: (studentId) =>
    api.delete(`/preferences/students/${studentId}/preferences`),
  getProjectPreferences: (projectId) =>
    api.get(`/preferences/projects/${projectId}/preferences`),
  getPreferencesStats: () =>
    api.get('/preferences/preferences/stats'),
  // Teacher endpoint to get all preferences for a project (includes partner info)
  getProjectPreferencesDetailed: (projectId) =>
    api.get(`/preferences/projects/${projectId}/preferences`),
}

// Assignment APIs
export const assignmentAPI = {
  getByProject: (projectId) => api.get(`/assignments/?project_id=${projectId}`),
  runAlgorithm: (projectId) => api.post('/assignments/run-algorithm', { project_id: projectId }),
  getStats: (projectId) => api.get(`/assignments/?project_id=${projectId}`),
  validate: (assignmentId) => api.post(`/assignments/${assignmentId}/validate`),
  deleteByProject: (projectId) => api.delete(`/assignments/?project_id=${projectId}`),
}

// Form APIs
export const formAPI = {
  getQuestions: (projectId) => api.get(`/forms/projects/${projectId}/forms`),
  createQuestion: (projectId, questionData) =>
    api.post(`/forms/projects/${projectId}/forms`, questionData),
  updateQuestion: (projectId, questionId, questionData) =>
    api.put(`/forms/projects/${projectId}/forms/${questionId}`, questionData),
  deleteQuestion: (projectId, questionId) => api.delete(`/forms/projects/${projectId}/forms/${questionId}`),
  submitResponse: (studentId, responseData) =>
    api.post(`/forms/students/${studentId}/responses`, responseData),
  getStudentResponses: (studentId) => api.get(`/forms/students/${studentId}/responses`),
  getProjectResponses: (projectId) => api.get(`/forms/projects/${projectId}/responses`),
}

export default api
