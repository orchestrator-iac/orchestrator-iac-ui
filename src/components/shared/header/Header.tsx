// Header.tsx
import React, { useEffect } from "react";
import { AppBar, Toolbar, Typography, Select, MenuItem, FormControl, InputLabel, Switch } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { useThemeContext } from "./../theme/useThemeContext"; // Import the hook
import styles from "./Header.module.css";

const Header: React.FC = () => {
  const { theme, cloudProvider, toggleTheme, setCloudProvider } = useThemeContext();

  // Update the page theme based on the selected value
  useEffect(() => {
    document.body.className = theme; // Apply theme globally
  }, [theme]);

  return (
    <AppBar position="static" className={styles.appBar}>
      <Toolbar className={styles.toolbar}>
        <Typography component="a" href="/home" className={styles.logo} sx={{ fontSize: "1.5rem" }}>
          <FontAwesomeIcon icon={faLayerGroup} className={styles.logoIcon} />
          Orchestrator
        </Typography>
        <div className={styles.controls}>
          <FormControl variant="filled" className={styles.controlItem}>
            <InputLabel>Cloud Provider</InputLabel>
            <Select
              value={cloudProvider}
              onChange={(e) => setCloudProvider(e.target.value as "aws" | "azure" | "google")}
              label="Cloud Provider"
            >
              <MenuItem value="aws">AWS</MenuItem>
              <MenuItem value="azure">Azure</MenuItem>
              <MenuItem value="google">Google Cloud</MenuItem>
            </Select>
          </FormControl>
          <div className={styles.switchContainer}>
            <label htmlFor="theme-switch" className={styles.switchLabel}>Dark Theme</label>
            <Switch
              checked={theme === 'dark'}
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
