import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

// Attach admin JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('adminToken');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

// Public endpoints
export const submitPrediction = (data) => API.post('/predictions', data);
export const checkDuplicate = (phone) => API.get(`/predictions/check/${phone}`);
export const getPublicStats = () => API.get('/predictions/stats');
export const getLeaderboard = () => API.get('/leaderboard');

// Auth endpoints
export const adminLogin = (data) => API.post('/auth/login', data);
export const verifyToken = () => API.get('/auth/verify');

// Admin endpoints
export const getDashboardStats = () => API.get('/admin/stats');
export const getAdminPredictions = (params) => API.get('/admin/predictions', { params });
export const deletePrediction = (id) => API.delete(`/admin/predictions/${id}`);
export const getBloodDonors = (params) => API.get('/admin/donors', { params });
export const saveOfficialResult = (data) => API.post('/admin/result', data);
export const calculateResults = () => API.post('/admin/calculate');
export const toggleLeaderboard = (data) => API.post('/admin/leaderboard/toggle', data);
export const toggleSubmissions = (data) => API.post('/admin/submissions/toggle', data);
export const updateSettings = (data) => API.post('/admin/settings', data);
export const resetCompetition = () => API.post('/admin/reset');
export const exportPredictionsExcel = () =>
  API.get('/admin/export/predictions', { responseType: 'blob' });
export const exportDonorsExcel = () =>
  API.get('/admin/export/donors', { responseType: 'blob' });
export const exportLeaderboardExcel = () =>
  API.get('/admin/export/leaderboard', { responseType: 'blob' });

export default API;
