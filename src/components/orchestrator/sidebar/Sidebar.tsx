// Sidebar.tsx
import React from "react";
import {
  Drawer,
  IconButton,
  useTheme,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  InputBase,
  Paper,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Book as BookIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
} from "@mui/icons-material";

const drawerWidth = 240;

interface SidebarProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const theme = useTheme();

  const toggleDrawer = () => setOpen(!open);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon /> },
    { text: "Resources", icon: <BookIcon /> },
    { text: "Users", icon: <PeopleIcon /> },
    { text: "Settings", icon: <SettingsIcon /> },
  ];

  return (
    <>
      <IconButton
        onClick={toggleDrawer}
        sx={{
          position: "fixed",
          top: "110px",
          left: open ? "223px" : "16px",
          zIndex: 1301,
          width: 36,
          height: 36,
          borderRadius: "50%",
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 2,
          color: theme.palette.text.primary,
          transition: 'left 0.3s ease',
          "&:hover": {
            backgroundColor: theme.palette.background.paper,
          },
          "& .MuiSvgIcon-root": {
            fontSize: 24,
          },
        }}
      >
        {open ? <KeyboardArrowLeftIcon /> : <KeyboardArrowRightIcon />}
      </IconButton>

      <Drawer
        anchor="left"
        variant="persistent"
        open={open}
        sx={{
          width: open ? drawerWidth : 0,
          transition: "width 0.3s ease",
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            top: "64px",
            height: "calc(100vh - 64px)",
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            boxSizing: "border-box",
            display: open ? "flex" : "none",
            flexDirection: "column",
            zIndex: 1300,
          },
        }}
      >
        <Box sx={{ mt: 2, px: 2, pb: 1 }}>
          <Paper
            variant="outlined"
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            <SearchIcon fontSize="small" />
            <InputBase
              placeholder="Search..."
              sx={{ ml: 1, flex: 1, fontSize: 14 }}
            />
          </Paper>
        </Box>

        <Divider />

        <List>
          {menuItems.map((item) => (
            <ListItemButton  key={item.text} sx={{ py: 1.5 }}>
              <ListItemIcon sx={{ color: theme.palette.text.primary }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;
