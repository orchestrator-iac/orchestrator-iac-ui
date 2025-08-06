import { Box } from "@mui/material";
import styles from "./PillToggle.module.css";

type Props = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

export default function PillToggle({ mode, toggleTheme }: Props) {
  const isDark = mode === "dark";

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
