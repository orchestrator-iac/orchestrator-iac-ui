import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { refreshAccessToken } from "./auth";
import { hasLoggedOutMarker, markLoggedOut } from "./sessionState";
import tokenManager from "./tokenManager";

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
    const token = tokenManager.getAccessToken();
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
      if (hasLoggedOutMarker()) {
        tokenManager.setAccessToken(null);
        return Promise.reject(error);
      }

      original._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = refreshAccessToken()
            .then((newToken) => {
              if (hasLoggedOutMarker()) {
                throw new Error("Session was explicitly logged out");
              }
              tokenManager.setAccessToken(newToken);
              onRefreshed(newToken);
              return newToken;
            })
            .finally(() => {
              isRefreshing = false;
              refreshPromise = null;
            });
        }

        const newToken = await (refreshPromise as Promise<string>);
        if (hasLoggedOutMarker()) {
          tokenManager.setAccessToken(null);
          return Promise.reject(error);
        }
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original); // retry
      } catch (e) {
        // refresh failed -> clear token and force login (avoid reload loop)
        tokenManager.setAccessToken(null);
        if (!hasLoggedOutMarker()) {
          markLoggedOut();
          try {
            if (globalThis.window !== undefined) {
              if (globalThis.location.pathname !== "/login") {
                console.debug(
                  "apiService: refresh failed, redirecting to /login",
                );
                globalThis.location.href = "/login";
              }
            }
          } catch (err) {
            console.debug(
              "apiService: failed to redirect after refresh failure",
              err,
            );
          }
        }
        throw e;
      }
    }

    throw error;
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
