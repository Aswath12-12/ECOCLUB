import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
  requestPasswordReset: (data) => api.post('/auth/request-password-reset', data)
};

export const studentService = {
  getStudents: (params) => api.get('/students', { params }),
  getStudentById: (id) => api.get(`/students/${id}`),
  createStudent: (studentData) => api.post('/students', studentData),
  updateStudent: (id, studentData) => api.put(`/students/${id}`, studentData),
  toggleStudentStatus: (id) => api.delete(`/students/${id}`),
  assignHouse: (id, houseId) => api.patch(`/students/${id}/house`, { houseId }),
  bulkAssignHouse: (studentIds, houseId) => api.post('/students/bulk-assign-house', { studentIds, houseId }),
  previewCSV: (formData) => api.post('/students/import/csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  previewExcel: (formData) => api.post('/students/import/excel', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  confirmImport: (students) => api.post('/students/import/confirm', { students })
};

export const houseService = {
  getHouses: () => api.get('/houses'),
  updateHouse: (id, houseData) => api.put(`/houses/${id}`, houseData),
  getOverallRanking: () => api.get('/houses/ranking'),
  getWeeklyRanking: (weekNumber) => api.get(`/houses/ranking/weekly/${weekNumber}`)
};

export const activityService = {
  getActivities: (params) => api.get('/activities', { params }),
  createActivity: (activityData) => api.post('/activities', activityData),
  updateActivity: (id, activityData) => api.put(`/activities/${id}`, activityData),
  deleteActivity: (id) => api.delete(`/activities/${id}`)
};

export const markService = {
  getGradingSheet: (params) => api.get('/marks/grading-sheet', { params }),
  saveMarks: (markPayload) => api.post('/marks', markPayload),
  getMyMarks: (params) => api.get('/marks/my-marks', { params }),
  getStudentMarks: (studentId) => api.get(`/marks/student/${studentId}`)
};

export const reportService = {
  getDashboardStats: () => api.get('/reports/dashboard'),
  getHousePerformance: () => api.get('/reports/house-performance'),
  getStudentPerformance: () => api.get('/reports/student-performance')
};

export const passwordResetService = {
  getResetRequests: (params) => api.get('/password-resets', { params }),
  resetPassword: (requestId) => api.post(`/password-resets/${requestId}/reset`),
  rejectRequest: (requestId, notes) => api.post(`/password-resets/${requestId}/reject`, { notes })
};
