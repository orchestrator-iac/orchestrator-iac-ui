// Header.tsx
import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Switch,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { useThemeContext } from "../theme/useThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

const Header: React.FC = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeContext();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const hasImage = user?.imageUrl && user?.imageUrl !== "";
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    document.body.className = mode;
  }, [mode]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate("/profile");
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    logout();
    navigate("/login");
  };

  return (
    <AppBar className={styles.appBar} position="static">
      <Toolbar className={styles.toolbar}>
        <Typography
          component="a"
          href="/home"
          className={styles.logo}
          sx={{ fontSize: "1.5rem" }}
        >
          <FontAwesomeIcon icon={faLayerGroup} className={styles.logoIcon} />
          Orchestrator
        </Typography>

        <div className={styles.controls}>
          <div className={styles.switchContainer}>
            <label htmlFor="theme-switch" className={styles.switchLabel}>
              Dark Theme
            </label>
            <Switch
              checked={mode === "dark"}
              onChange={toggleTheme}
              name="theme-switch"
              color="default"
            />
          </div>
          {user && (
            <>
              {/* <Box
                component="img"
                onClick={handleMenuOpen}
                src={
                  user.imageUrl ??
                  `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&bold=true&color=${theme.palette.primary.main}&background=${theme.palette.background.default}`
                }
                alt="Profile"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                }}
              /> */}
              <IconButton onClick={handleMenuOpen} size="small">
                <Avatar
                  sx={{
                    bgcolor: theme.palette.background.default,
                    color: theme.palette.primary.main,
                    fontWeight: "bold",
                  }}
                  alt={user.firstName}
                  src={hasImage ? user.imageUrl : undefined}
                >
                  {!hasImage && user.firstName.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleProfileClick}>View Profile</MenuItem>
                <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
