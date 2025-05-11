import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && API_BASE_URL.includes('localhost')) {
  console.warn('Warning: Using localhost URL in production environment');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login/json', credentials),
  logout: () => api.post('/auth/logout'),
  resetPassword: (email: string) => api.post('/auth/reset-password', { email }),
};

export const userAPI = {
  getUsers: () => api.get('/users'),
  getUser: (id: number) => api.get(`/users/${id}`),
  updateUser: (id: number, userData: any) => api.put(`/users/${id}`, userData),
  deleteUser: (id: number) => api.delete(`/users/${id}`),
};

export const customerAPI = {
  getCustomers: (params?: any) => api.get('/customers', { params }),
  getCustomer: (id: number) => api.get(`/customers/${id}`),
  createCustomer: (customerData: any) => api.post('/customers', customerData),
  updateCustomer: (id: number, customerData: any) => api.put(`/customers/${id}`, customerData),
  deleteCustomer: (id: number) => api.delete(`/customers/${id}`),
  getCustomerActivities: (id: number) => api.get(`/customers/${id}/activities`),
  addCustomerActivity: (id: number, activityData: any) => api.post(`/customers/${id}/activities`, activityData),
  exportCustomers: () => api.get('/customers/export'),
};

export const externalAPI = {
  lookupPostalCode: (postalCode: string) => api.get(`/external/postal-code/${postalCode}`),
  lookupPhoneNumber: (phoneNumber: string) => api.get(`/external/phone-number/${phoneNumber}`),
  registryLibraryLogin: () => api.post('/external/registry-library/login'),
  registryLibrarySearch: (params: any) => api.post('/external/registry-library/search', params),
  getRegistryDetails: (registryId: string) => api.get(`/external/registry-library/details/${registryId}`),
};

export const analyticsAPI = {
  getDashboardData: () => api.get('/analytics/dashboard'),
  getStatusData: () => api.get('/analytics/status'),
  getSalesData: () => api.get('/analytics/sales'),
};

export default api;
