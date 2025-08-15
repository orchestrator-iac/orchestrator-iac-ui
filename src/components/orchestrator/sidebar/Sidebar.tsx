import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Drawer,
  IconButton,
  useTheme,
  Box,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  InputBase,
  Paper,
} from "@mui/material";
import {
  Search as SearchIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
} from "@mui/icons-material";

import { RootState, AppDispatch } from "../../../store";
import { fetchResources } from "../../../store/homeSlice";

const API_HOST_URL = import.meta.env.VITE_API_HOST_URL;

const drawerWidth = 240;

interface SidebarProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const theme = useTheme();

  const toggleDrawer = () => setOpen(!open);
  const dispatch = useDispatch<AppDispatch>();
  const { resources } = useSelector((state: RootState) => state.home);

  useEffect(() => {
    dispatch(fetchResources());
  }, [dispatch]);

  useEffect(() => {
    console.log(resources);
  }, [resources]);

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
          transition: "left 0.3s ease",
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
          {resources.map((resource) => (
            <ListItemButton
              key={resource.resourceName}
              sx={{ alignItems: "flex-start", py: 1.5 }}
            >
              <Box
                component="img"
                src={`${API_HOST_URL}${resource?.resourceIcon?.url}`}
                alt={resource.resourceName}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "8px",
                  mr: 2,
                  objectFit: "contain",
                  boxShadow: `0 0 2px ${theme.palette.secondary.main}`,
                }}
              />
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span>{resource.resourceName}</span>
                    <Box
                      component="span"
                      sx={{
                        fontSize: "0.8rem",
                        color: theme.palette.text.secondary,
                        backgroundColor: theme.palette.action.hover,
                        px: 0.6,
                        py: 0.1,
                        borderRadius: "4px",
                      }}
                    >
                      v{resource.resourceVersion}
                    </Box>
                  </Box>
                }
                secondary={resource.resourceDescription}
                primaryTypographyProps={{
                  sx: {
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                  },
                }}
                secondaryTypographyProps={{
                  sx: {
                    fontSize: "0.85rem",
                    color: theme.palette.text.secondary,
                  },
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;
