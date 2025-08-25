import { Box, useMediaQuery } from "@mui/material";
import styles from "./PillToggle.module.css";
import { ThemeMode } from "../theme/ThemeContext";

type Props = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

export default function PillToggle({ mode, setMode }: Readonly<Props>) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  let effectiveMode: "light" | "dark";
  if (mode === "system") {
    effectiveMode = prefersDark ? "dark" : "light";
  } else {
    effectiveMode = mode;
  }
  const isDark = effectiveMode === "dark";

  const toggleTheme = () => {
    setMode((prev) => {
      let current = prev;
      if (prev === "system") {
        current = prefersDark ? "dark" : "light";
      }
      return current === "light" ? "dark" : "light";
    });
  };

  return (
    <Box className={styles.toggleWrapper} onClick={toggleTheme}>
      <div
        className={`${styles.toggleTrack} ${
          isDark ? styles.dark : styles.light
        }`}
      >
        <div className={styles.icon}>{isDark ? "🌜" : "🌞"}</div>
      </div>
    </Box>
  );
}
