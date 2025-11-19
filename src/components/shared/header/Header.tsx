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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
      elevation={0}
      className={styles.appBar}
      sx={{
        background: theme.palette.mode === 'dark' 
          ? 'rgba(18, 18, 18, 0.95)' 
          : 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.08)' 
          : 'rgba(0, 0, 0, 0.06)',
      }}
    >
      <Toolbar className={styles.toolbar} sx={{ py: 1.5, minHeight: '72px !important' }}>
        <Typography
          component={Link}
          to="/home"
          className={styles.logo}
          sx={{
            fontSize: "1.35rem",
            textDecoration: "none",
            color: theme.palette.mode === 'dark' ? '#88cfcf' : '#205a5a',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            transition: 'all 0.2s ease',
            '&:hover': {
              color: theme.palette.mode === 'dark' ? '#a5e3e3' : '#4bbebe',
            }
          }}
        >
          <Box
            sx={{
              height: 32,
              width: 64,
              marginRight: 1.5,
              backgroundImage: "url('/landing-zone-orchestrator-ui/logo.png')",
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
              <IconButton 
                onClick={handleMenuOpen} 
                size="small"
                sx={{
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: -2,
                    borderRadius: '50%',
                    padding: '2px',
                    background: `linear-gradient(135deg, ${theme.palette.mode === 'dark' ? '#4bbebe' : '#1a5757'}, ${theme.palette.mode === 'dark' ? '#7dd3d3' : '#3da9a9'})`,
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  },
                  '&:hover::before': {
                    opacity: 1,
                  }
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f0f0f0',
                    color: theme.palette.mode === 'dark' ? '#88cfcf' : '#205a5a',
                    fontWeight: 600,
                    width: 40,
                    height: 40,
                    border: '2px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(136, 207, 207, 0.2)' : 'rgba(32, 90, 90, 0.15)',
                    transition: 'all 0.3s ease',
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
                slotProps={{
                  paper: {
                    elevation: 8,
                    sx: {
                      mt: 1.5,
                      minWidth: 180,
                      borderRadius: 2,
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.15))',
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    }
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem 
                  onClick={handleProfileClick}
                  sx={{
                    py: 1.25,
                    px: 2,
                    gap: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(75, 190, 190, 0.08)' 
                        : 'rgba(26, 87, 87, 0.04)',
                    }
                  }}
                >
                  <FontAwesomeIcon icon="user" style={{ fontSize: '0.9rem' }} />
                  View Profile
                </MenuItem>
                <MenuItem 
                  onClick={handleLogoutClick}
                  sx={{
                    py: 1.25,
                    px: 2,
                    gap: 1.5,
                    transition: 'all 0.2s ease',
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(244, 67, 54, 0.08)' 
                        : 'rgba(244, 67, 54, 0.04)',
                    }
                  }}
                >
                  <FontAwesomeIcon icon="sign-out-alt" style={{ fontSize: '0.9rem' }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
