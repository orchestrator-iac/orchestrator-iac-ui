import { Switch, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import styles from "./DarkModeSwitch.module.css"; // Your wrapper styles

const ThemeSwitch = styled(Switch)(({ theme }) => ({
  width: 50,
  height: 28,
  padding: 0,
  display: "flex",
  "& .MuiSwitch-switchBase": {
    padding: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(22px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.mode === "dark" ? "#4bb3b3" : "#057474",
        opacity: 1,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    width: 24,
    height: 24,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  },
  "& .MuiSwitch-track": {
    borderRadius: 28 / 2,
    backgroundColor: theme.palette.mode === "dark" ? "#999" : "#ccc",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 300,
    }),
  },
}));

type Props = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

export default function DarkModeSwitch({ mode, toggleTheme }: Props) {
  return (
    <div className={styles.switchContainer}>
      <Typography variant="body1" className={styles.switchLabel}>
        {mode === "dark" ? "Dark Mode" : "Light Mode"}
      </Typography>
      <ThemeSwitch
        checked={mode === "dark"}
        onChange={toggleTheme}
        name="theme-switch"
      />
    </div>
  );
}
