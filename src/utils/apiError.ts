// Axios surfaces failed requests as a generic "Request failed with status
// code 500"-style message, which is meaningless to end users and looks like
// a raw error dump when shown in a toast/banner. Prefer the backend's own
// error body (FastAPI's `detail` field) when present, and otherwise fall
// back to a friendly, status-aware message instead of the axios default.
type ApiErrorShape = {
  response?: { data?: { detail?: string }; status?: number };
  message?: string;
  code?: string;
};

const STATUS_MESSAGES: Record<number, string> = {
  400: "That request couldn't be processed. Please check your input and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  408: "That request took too long and timed out. Please try again.",
  409: "That change conflicts with the current state. Please refresh and try again.",
  413: "That request is too large. Please try with less data.",
  429: "Too many requests right now. Please wait a moment and try again.",
  500: "Something went wrong on our end. Please try again.",
  502: "We're having trouble reaching the server. Please try again in a moment.",
  503: "The service is temporarily unavailable. Please try again in a moment.",
  504: "The server took too long to respond. Please try again.",
};

/**
 * Turn an unknown thrown error (typically an Axios error) into a message
 * that's safe and useful to show directly to a user.
 *
 * @param error the caught error
 * @param fallback shown when nothing more specific can be determined
 */
export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  const apiError = error as ApiErrorShape | undefined;

  const detail = apiError?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  const status = apiError?.response?.status;
  if (status && STATUS_MESSAGES[status]) {
    return STATUS_MESSAGES[status];
  }

  if (apiError?.code === "ECONNABORTED" || apiError?.message?.includes("timeout")) {
    return "That request took too long and timed out. Please try again.";
  }

  if (apiError && !apiError.response && apiError.message) {
    // Axios sets no `response` on network failures (offline, CORS, DNS, etc.)
    return "We couldn't reach the server. Please check your connection and try again.";
  }

  // Don't let axios's raw "Request failed with status code N" leak through.
  const isGenericAxiosMessage =
    typeof apiError?.message === "string" &&
    /^Request failed with status code \d+$/.test(apiError.message);
  if (isGenericAxiosMessage) {
    return fallback;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};
