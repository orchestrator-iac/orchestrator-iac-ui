import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Create an Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:9001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (e.g., for adding Authorization headers)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (e.g., for error handling)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized. Redirecting to login...');
    }
    return Promise.reject(error);
  }
);

// API service methods
const apiService = {
  // Define `T` as a generic type for each method
  get: async (url: string, config?: AxiosRequestConfig) => {
    const response = await apiClient.get(url, config);
    return response.data;
  },

  post: async (url: string, data?: any, config?: AxiosRequestConfig) => {
    const response = await apiClient.post(url, data, config);
    return response.data;
  },

  put: async (url: string, data?: any, config?: AxiosRequestConfig) => {
    const response = await apiClient.put(url, data, config);
    return response.data;
  },

  delete: async (url: string, config?: AxiosRequestConfig) => {
    const response = await apiClient.delete(url, config);
    return response.data;
  },
};

export default apiService;
