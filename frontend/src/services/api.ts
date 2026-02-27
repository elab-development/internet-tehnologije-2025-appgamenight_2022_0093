import axios, { AxiosError } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me')
};

// Events API
export const eventsAPI = {
  getAll: (params?: { search?: string }) =>
    api.get('/events', { params }),
  getById: (id: number) => api.get(`/events/${id}`),
  create: (data: any) => api.post('/events', data),
  update: (id: number, data: any) => api.put(`/events/${id}`, data),
  delete: (id: number) => api.delete(`/events/${id}`),
  register: (id: number) => api.post(`/events/${id}/register`),
  unregister: (id: number) => api.delete(`/events/${id}/register`)
};

// Games API
export const gamesAPI = {
  getAll: () => api.get('/games'),
  getById: (id: number) => api.get(`/games/${id}`),
  create: (data: any) => api.post('/games', data),
  update: (id: number, data: any) => api.put(`/games/${id}`, data),
  delete: (id: number) => api.delete(`/games/${id}`)
};

// Matches API
export const matchesAPI = {
  getAll: (params?: { eventId?: number; gameId?: number; limit?: number }) =>
    api.get('/matches', { params }),
  getById: (id: number) => api.get(`/matches/${id}`),
  create: (data: any) => api.post('/matches', data),
  update: (id: number, data: any) => api.put(`/matches/${id}`, data),
  delete: (id: number) => api.delete(`/matches/${id}`),
  getLeaderboard: (limit?: number) =>
    api.get('/matches/leaderboard', { params: { limit } })
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: any) => api.put('/users/me', data),
  getStats: () => api.get('/users/me/stats'),
  getAll: () => api.get('/users')
};

// External API
export const externalAPI = {
  searchBGG: (query: string) =>
    api.get('/external/bgg/search', { params: { query } }),
  getBGGDetails: (id: string) =>
    api.get(`/external/bgg/${id}`),
  getWeather: (city: string) =>
    api.get('/external/weather', { params: { city } })
};

export default api;
