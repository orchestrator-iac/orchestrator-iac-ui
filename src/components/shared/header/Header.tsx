// Header.tsx
import React, { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useThemeContext } from "../theme/useThemeContext";
import { useAuth } from "../../../context/AuthContext";
import styles from "./Header.module.css";
import PillToggle from "./PillToggle";

const Header: React.FC = () => {
  const theme = useTheme();
  const { mode, setMode } = useThemeContext();
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
    <AppBar
      position="static"
      className={styles.appBar}
      sx={{
        backgroundImage: "linear-gradient(to left, var(--primary), var(--secondary), var(--bg-color))",
      }}
    >
      <Toolbar className={styles.toolbar}>
        <Typography
          component={Link}
          to="/home"
          className={styles.logo}
          sx={{
            fontSize: "1.5rem",
            textDecoration: "none",
            color: "var(--primary)",
            fontWeight: "bold",
          }}
        >
          <Box
            sx={{
              height: 30,
              width: 60,
              marginRight: 1,
              backgroundImage: "url('/logo.png')",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              backgroundPosition: "center",
            }}
          ></Box>
          Orchestrator
        </Typography>

        <div className={styles.controls}>
          <PillToggle mode={mode} setMode={setMode} />
          {user && (
            <>
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
