import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { lightTheme, darkTheme } from "./theme";
import { useAuth } from "../../../context/AuthContext";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);

const getStoredThemeMode = (): ThemeMode | null => {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem("themePreference");
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : null;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<ThemeMode>(
    () => getStoredThemeMode() ?? "system",
  );
  const [hasStoredPreference] = useState(
    () => getStoredThemeMode() !== null,
  );
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  let effectiveMode: "light" | "dark";
  if (mode === "system") {
    effectiveMode = prefersDark ? "dark" : "light";
  } else {
    effectiveMode = mode;
  }

  const theme = effectiveMode === "light" ? lightTheme : darkTheme;

  // Keep data-theme in sync globally so CSS variables (--card-bg, --text1, etc.) work on every page
  useEffect(() => {
    document.body.dataset.theme = effectiveMode;
  }, [effectiveMode]);

  useEffect(() => {
    localStorage.setItem("themePreference", mode);
  }, [mode]);

  useEffect(() => {
    if (!hasStoredPreference && user?.themePreference) {
      setMode(user?.themePreference);
    }
  }, [hasStoredPreference, user]);

  const contextValue = useMemo(() => ({ mode, setMode }), [mode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={theme}>{children}</MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
