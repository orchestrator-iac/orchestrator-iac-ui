const LOGGED_OUT_AT_KEY = "loggedOutAt";

const getLoggedOutMarker = (): string | null => {
  try {
    return localStorage.getItem(LOGGED_OUT_AT_KEY);
  } catch {
    return null;
  }
};

export const hasLoggedOutMarker = (): boolean => getLoggedOutMarker() !== null;

export const markLoggedOut = (): void => {
  try {
    localStorage.setItem(LOGGED_OUT_AT_KEY, String(Date.now()));
  } catch {
    // Best-effort only: auth state still clears locally even if storage is unavailable.
  }
};

export const clearLoggedOutMarker = (): void => {
  try {
    localStorage.removeItem(LOGGED_OUT_AT_KEY);
  } catch {
    // Best-effort only.
  }
};
