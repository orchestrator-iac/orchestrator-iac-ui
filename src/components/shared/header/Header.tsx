// Header.tsx
import React, { useEffect } from "react";
import { AppBar, Toolbar, Typography, Switch } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { useThemeContext } from "../theme/useThemeContext";
import styles from "./Header.module.css";

const Header: React.FC = () => {
  const { mode, toggleTheme } = useThemeContext();

  useEffect(() => {
    document.body.className = mode;
  }, [mode]);

  return (
    <AppBar position="static" className={styles.appBar}>
      <Toolbar className={styles.toolbar}>
        <Typography component="a" href="/home" className={styles.logo} sx={{ fontSize: "1.5rem" }}>
          <FontAwesomeIcon icon={faLayerGroup} className={styles.logoIcon} />
          Orchestrator
        </Typography>
        <div className={styles.controls}>
          <div className={styles.switchContainer}>
            <label htmlFor="theme-switch" className={styles.switchLabel}>Dark Theme</label>
            <Switch
              checked={mode === 'dark'}
              onChange={toggleTheme}
              name="theme-switch"
              color="default"
            />
          </div>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
