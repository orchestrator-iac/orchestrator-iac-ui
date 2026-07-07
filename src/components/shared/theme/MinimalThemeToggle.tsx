import { IconButton, Tooltip, useMediaQuery } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useThemeContext } from "./useThemeContext";

type Props = Readonly<{
  size?: "small" | "medium";
}>;

export default function MinimalThemeToggle({ size = "small" }: Props) {
  const { mode, setMode } = useThemeContext();
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  let effectiveMode: "light" | "dark";
  if (mode === "system") {
    effectiveMode = prefersDark ? "dark" : "light";
  } else {
    effectiveMode = mode as "light" | "dark";
  }
  const isDark = effectiveMode === "dark";

  const toggle = () => {
    let current: "light" | "dark" | "system" = mode;
    if (current === "system") {
      current = prefersDark ? "dark" : "light";
    }
    const newMode: "light" | "dark" = current === "light" ? "dark" : "light";
    setMode(newMode);
  };

  return (
    <Tooltip title={isDark ? "Switch to light theme" : "Switch to dark theme"}>
      <IconButton
        size={size}
        onClick={toggle}
        aria-label="Toggle theme"
        sx={{
          bgcolor: "transparent",
          color: "text.primary",
          borderRadius: 10,
          px: 0.5,
          py: 0.5,
        }}
      >
        {isDark ? <LightModeIcon fontSize={size} /> : <DarkModeIcon fontSize={size} />}
      </IconButton>
    </Tooltip>
  );
}
