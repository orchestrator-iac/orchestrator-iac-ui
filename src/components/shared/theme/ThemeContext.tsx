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
  undefined
);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<ThemeMode>("system");
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  let effectiveMode: "light" | "dark";
  if (mode === "system") {
    effectiveMode = prefersDark ? "dark" : "light";
  } else {
    effectiveMode = mode;
  }

  const theme = effectiveMode === "light" ? lightTheme : darkTheme;

  useEffect(() => {
    localStorage.setItem("themePreference", mode);
  }, [mode]);

  useEffect(() => {
    if(user?.themePreference) {
      setMode(user?.themePreference);
    }
  }, [user]);

  useEffect(() => {
    const stored = localStorage.getItem("themePreference") as ThemeMode | null;
    if (stored) setMode(stored);
  }, []);

  const contextValue = useMemo(
    () => ({ mode, setMode }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={theme}>{children}</MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
