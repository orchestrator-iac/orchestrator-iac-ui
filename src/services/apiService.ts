import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { refreshAccessToken } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create an Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;
const waiters: Array<(t: string) => void> = [];
const onRefreshed = (token: string) =>
  waiters.splice(0).forEach((fn) => fn(token));

// Request interceptor (e.g., for adding Authorization headers)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: any = error.config;
    const status = error?.response?.status;

    if (status === 401 && !original?._retry) {
      original._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = refreshAccessToken()
            .then((newToken) => {
              localStorage.setItem("token", newToken);
              onRefreshed(newToken);
              return newToken;
            })
            .finally(() => {
              isRefreshing = false;
              refreshPromise = null;
            });
        }

        const newToken = await (refreshPromise as Promise<string>);
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original); // retry
      } catch (e) {
        // refresh failed -> clear and bubble up
        localStorage.removeItem("token");
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  },
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
