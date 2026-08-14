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
  (error) => {
    throw error;
  },
);

/** Kicks off a token refresh if one isn't already in flight, and returns the shared promise. */
const ensureTokenRefreshInFlight = (): Promise<string> => {
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
  return refreshPromise as Promise<string>;
};

/** Best-effort redirect to /login; failures here shouldn't mask the original refresh error. */
const redirectToLoginIfNeeded = (): void => {
  try {
    if (globalThis.window === undefined) {
      return;
    }
    if (globalThis.location.pathname !== "/login") {
      console.debug("apiService: refresh failed, redirecting to /login");
      globalThis.location.href = "/login";
    }
  } catch (err) {
    console.debug(
      "apiService: failed to redirect after refresh failure",
      err,
    );
  }
};

/** Token refresh failed: clear the token, force a login redirect, and re-throw. */
const handleRefreshFailure = (e: unknown): never => {
  tokenManager.setAccessToken(null);
  if (!hasLoggedOutMarker()) {
    markLoggedOut();
    redirectToLoginIfNeeded();
  }
  throw e;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: any = error.config;
    const status = error?.response?.status;

    if (status !== 401 || original?._retry) {
      throw error;
    }

    if (hasLoggedOutMarker()) {
      tokenManager.setAccessToken(null);
      throw error;
    }

    original._retry = true;

    try {
      const newToken = await ensureTokenRefreshInFlight();
      if (hasLoggedOutMarker()) {
        tokenManager.setAccessToken(null);
        throw error;
      }
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original); // retry
    } catch (e) {
      handleRefreshFailure(e);
    }
  },
);

// In-flight GET de-duplication: collapses concurrent identical GET requests
// (same url + params) into a single network round trip. This is what fixes
// the common "two components mount at once and both fetch the same list"
// pattern (e.g. a sidebar and a gallery both fetching /configs) product-wide,
// without needing every call site to coordinate. A per-caller AbortSignal is
// intentionally NOT forwarded to the shared network request: one caller
// unmounting/aborting must not cancel the response other callers are still
// waiting on. The entry is removed as soon as the request settles, so it
// only dedupes requests that overlap in time — it is not a response cache.
const inFlightGetRequests = new Map<string, Promise<any>>();

const buildGetKey = (url: string, params?: unknown) =>
  `${url}?${JSON.stringify(params ?? {})}`;

// API service methods
const apiService = {
  // Define `T` as a generic type for each method
  get: async (url: string, config?: AxiosRequestConfig) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- deliberately dropped, see comment above
    const { signal, ...rest } = config ?? {};
    const key = buildGetKey(url, rest.params);

    const existing = inFlightGetRequests.get(key);
    if (existing) return existing;

    const promise = apiClient
      .get(url, rest)
      .then((response) => response.data)
      .finally(() => {
        inFlightGetRequests.delete(key);
      });

    inFlightGetRequests.set(key, promise);
    return promise;
  },

  post: async (url: string, data?: any, config?: AxiosRequestConfig) => {
    const response = await apiClient.post(url, data, config);
    return response.data;
  },

  put: async (url: string, data?: any, config?: AxiosRequestConfig) => {
    const response = await apiClient.put(url, data, config);
    return response.data;
  },

  patch: async (url: string, data?: any, config?: AxiosRequestConfig) => {
    const response = await apiClient.patch(url, data, config);
    return response.data;
  },

  delete: async (url: string, config?: AxiosRequestConfig) => {
    const response = await apiClient.delete(url, config);
    return response.data;
  },
};

export default apiService;
