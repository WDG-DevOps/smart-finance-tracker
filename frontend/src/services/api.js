import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL+'/api' || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
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

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  setAppLockPin: (data) => api.post('/auth/app-lock/pin', data),
  verifyAppLockPin: (data) => api.post('/auth/app-lock/verify', data),
  togglePrivacyMode: () => api.post('/auth/privacy-mode/toggle')
};

// Wallet API
export const walletAPI = {
  create: (data) => api.post('/wallets', data),
  getAll: () => api.get('/wallets'),
  update: (id, data) => api.put(`/wallets/${id}`, data),
  delete: (id) => api.delete(`/wallets/${id}`),
  getBalance: (id) => api.get(`/wallets/${id}/balance`)
};

// Transaction API
export const transactionAPI = {
  create: (data, file) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    if (file) {
      formData.append('receipt', file);
    }
    return api.post('/transactions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getAll: (params) => api.get('/transactions', { params }),
  update: (id, data, file) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    if (file) {
      formData.append('receipt', file);
    }
    return api.put(`/transactions/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => api.delete(`/transactions/${id}`)
};

// Budget API
export const budgetAPI = {
  create: (data) => api.post('/budgets', data),
  getAll: () => api.get('/budgets'),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`)
};

// Goal API
export const goalAPI = {
  create: (data) => api.post('/goals', data),
  getAll: () => api.get('/goals'),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  addAmount: (id, amount) => api.post(`/goals/${id}/add`, { amount })
};

// Debt API
export const debtAPI = {
  create: (data) => api.post('/debts', data),
  getAll: (params) => api.get('/debts', { params }),
  getUpcoming: (days) => api.get('/debts/upcoming', { params: { days } }),
  update: (id, data) => api.put(`/debts/${id}`, data),
  delete: (id) => api.delete(`/debts/${id}`)
};

// Recurring API
export const recurringAPI = {
  create: (data) => api.post('/recurring', data),
  getAll: () => api.get('/recurring'),
  update: (id, data) => api.put(`/recurring/${id}`, data),
  delete: (id) => api.delete(`/recurring/${id}`)
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getCashFlow: (params) => api.get('/analytics/cash-flow', { params }),
  getCategoryReport: (params) => api.get('/analytics/category-report', { params })
};

export default api;
