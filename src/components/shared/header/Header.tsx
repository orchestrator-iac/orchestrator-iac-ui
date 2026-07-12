// Header.tsx
import React, { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Badge,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  useTheme,
  alpha,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ReplayIcon from "@mui/icons-material/Replay";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import { useThemeContext } from "../theme/useThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { useProductGuidance } from "../guidance/ProductGuidanceProvider";
import styles from "./Header.module.css";
import MinimalThemeToggle from "../theme/MinimalThemeToggle";

const Header: React.FC = () => {
  const theme = useTheme();
  const { mode } = useThemeContext();
  const { user, logout } = useAuth();
  const {
    currentTour,
    unreadAnnouncementCount,
    startCurrentTour,
    openAnnouncements,
  } = useProductGuidance();
  const navigate = useNavigate();
  const hasImage = user?.imageUrl && user?.imageUrl !== "";
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [helpAnchorEl, setHelpAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    document.body.className = mode;
  }, [mode]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleHelpOpen = (event: React.MouseEvent<HTMLElement>) => {
    setHelpAnchorEl(event.currentTarget);
  };

  const handleHelpClose = () => {
    setHelpAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate("/profile");
  };

  const handleLogoutClick = async () => {
    handleMenuClose();
    await logout();
    navigate("/login", { replace: true });
  };

  const handleReplayCurrentTour = () => {
    handleHelpClose();
    startCurrentTour();
  };

  const handleOpenAnnouncements = () => {
    handleHelpClose();
    openAnnouncements();
  };

  const menuSurface = theme.palette.background.paper;
  const brandLogoSrc =
    theme.palette.mode === "dark"
      ? "/dark-luminous.svg"
      : "/full-color.svg";
  const menuPaperSx = {
    mt: 1.5,
    minWidth: 220,
    borderRadius: 2,
    overflow: "visible",
    backgroundColor: menuSurface,
    backgroundImage: "none",
    filter: "drop-shadow(0px 4px 12px rgba(0,0,0,0.15))",
    "& .MuiMenu-list": {
      backgroundColor: menuSurface,
    },
    "&:before": {
      content: '""',
      display: "block",
      position: "absolute",
      top: 0,
      right: 14,
      width: 0,
      height: 0,
      borderLeft: "10px solid transparent",
      borderRight: "10px solid transparent",
      borderBottom: `10px solid ${menuSurface}`,
      transform: "translateY(-100%)",
      zIndex: 0,
    },
  } as const;

  return (
    <AppBar
      position="static"
      elevation={0}
      className={styles.appBar}
      sx={{
        background:
          theme.palette.mode === "dark"
            ? "rgba(18, 18, 18, 0.95)"
            : "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid",
        borderColor:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.common.white, 0.08)
            : alpha(theme.palette.common.black, 0.06),
      }}
    >
      <Toolbar
        className={styles.toolbar}
        sx={{ py: 1.5, minHeight: "72px !important" }}
      >
        <Typography
          component={Link}
          to={user ? "/home" : "/"}
          className={styles.logo}
          sx={{
            fontSize: "1.35rem",
            textDecoration: "none",
            color: theme.palette.primary.main,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            transition: "all 0.2s ease",
            "&:hover": {
              color: theme.palette.secondary.main,
            },
          }}
        >
          <Box
            component="img"
            src={brandLogoSrc}
            alt=""
            sx={{
              height: 56,
              width: 96,
              marginRight: 1.5,
              display: "block",
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
          Orchestrator
        </Typography>

        <div className={styles.controls}>
          <MinimalThemeToggle />
          <Tooltip title="Help and what is new" arrow>
            <IconButton
              onClick={handleHelpOpen}
              size="small"
              aria-label="Open help menu"
              aria-haspopup="true"
              aria-expanded={Boolean(helpAnchorEl)}
              data-tour="guidance-help-menu"
              sx={{
                transition: "all 0.2s ease",
                color: "text.primary",
                "&:hover": {
                  transform: "scale(1.05)",
                },
                "&:focus-visible": {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 3,
                },
              }}
            >
              <Badge
                variant="dot"
                color="secondary"
                invisible={unreadAnnouncementCount === 0}
              >
                <HelpOutlineIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={helpAnchorEl}
            open={Boolean(helpAnchorEl)}
            onClose={handleHelpClose}
            slotProps={{
              paper: {
                elevation: 8,
                sx: menuPaperSx,
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem
              onClick={handleReplayCurrentTour}
              disabled={!currentTour}
              sx={{
                py: 1.25,
                px: 2,
                gap: 1.5,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.tertiary.main, 0.24),
                },
              }}
            >
              <ListItemIcon>
                <ReplayIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={currentTour ? `Replay ${currentTour.title} tour` : "No tour on this page"}
                secondary={currentTour ? "Walk through the current screen again" : "Open a page with a guided tour"}
                slotProps={{
                  primary: { sx: { fontWeight: 600 } },
                  secondary: { sx: { fontSize: "0.78rem" } },
                }}
              />
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              onClick={handleOpenAnnouncements}
              sx={{
                py: 1.25,
                px: 2,
                gap: 1.5,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.tertiary.main, 0.24),
                },
              }}
            >
              <ListItemIcon>
                <CampaignOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="What's new"
                secondary={
                  unreadAnnouncementCount > 0
                    ? `${unreadAnnouncementCount} update${unreadAnnouncementCount === 1 ? "" : "s"} available`
                    : "No unread announcements"
                }
                slotProps={{
                  primary: { sx: { fontWeight: 600 } },
                  secondary: { sx: { fontSize: "0.78rem" } },
                }}
              />
            </MenuItem>
          </Menu>
          {user && (
            <>
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                aria-label={`Open user menu for ${user.firstName}`}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorEl)}
                sx={{
                  transition: "all 0.2s ease",
                  position: "relative",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                  "&:focus-visible": {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 3,
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: -2,
                    borderRadius: "50%",
                    padding: "2px",
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitMask: `linear-gradient(${theme.palette.common.white} 0 0) content-box, linear-gradient(${theme.palette.common.white} 0 0)`,
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                  },
                  "&:hover::before": {
                    opacity: 1,
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.tertiary.main, 0.22)
                        : alpha(theme.palette.tertiary.main, 0.32),
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    width: 40,
                    height: 40,
                    border: "2px solid",
                    borderColor: alpha(theme.palette.tertiary.main, 0.55),
                    transition: "all 0.3s ease",
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
                      ...menuPaperSx,
                      minWidth: 180,
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem
                  onClick={handleProfileClick}
                  sx={{
                    py: 1.25,
                    px: 2,
                    gap: 1.5,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.tertiary.main, 0.24),
                    },
                  }}
                >
                  <FontAwesomeIcon aria-hidden="true" icon="user" style={{ fontSize: "0.9rem" }} />
                  View Profile
                </MenuItem>
                <MenuItem
                  onClick={handleLogoutClick}
                  sx={{
                    py: 1.25,
                    px: 2,
                    gap: 1.5,
                    transition: "all 0.2s ease",
                    color: "error.main",
                    "&:hover": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(244, 67, 54, 0.08)"
                          : "rgba(244, 67, 54, 0.04)",
                    },
                  }}
                >
                  <FontAwesomeIcon
                    aria-hidden="true"
                    icon="sign-out-alt"
                    style={{ fontSize: "0.9rem" }}
                  />
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
