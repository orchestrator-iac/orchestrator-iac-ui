import React, { useEffect, useMemo, useState } from "react";
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
import Fuse from "fuse.js"; // NEW ✅

import { useDnD } from "./DnDContext";
import { RootState, AppDispatch } from "../../../store";
import { fetchResources } from "../../../store/resourcesSlice";
import { CloudProvider } from "../../../types/clouds-info";

const API_HOST_URL = import.meta.env.VITE_API_HOST_URL;
const drawerWidth = 240;

interface SidebarProps {
  open: boolean;
  cloudProvider: CloudProvider;
  setOpen: (value: boolean) => void;
}

/**
 * Sidebar shows provider-scoped resources and supports fuzzy search via Fuse.js.
 * Search matches across name, description, version, and tags with weighted relevance.
 */
const Sidebar: React.FC<SidebarProps> = ({ open, setOpen, cloudProvider }) => {
  const theme = useTheme();
  const toggleDrawer = () => setOpen(!open);

  const dispatch = useDispatch<AppDispatch>();
  const { data: resources, status: resourcesStatus } = useSelector(
    (state: RootState) => state.resources
  );

  // --- local state for search ---
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Keep DnD id hookup
  const [, setId] = useDnD();

  /**
   * Handle drag start for a resource card.
   *
   * @param event - Drag event from the resource item.
   * @param resourceId - Unique identifier of the resource.
   */
  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    resourceId: string
  ) => {
    setId(resourceId);
    event.dataTransfer.effectAllowed = "move";
  };

  // Fetch once when idle/empty
  useEffect(() => {
    if (resourcesStatus === "idle" || resources.length === 0) {
      dispatch(fetchResources());
    }
  }, [dispatch, resourcesStatus, resources.length]);

  // Debounce search input for smoother typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 160);
    return () => clearTimeout(t);
  }, [searchTerm]);

  /**
   * Provider-scoped resources computed once per changes to source or provider.
   * This preserves your original filter by cloudProvider. :contentReference[oaicite:1]{index=1}
   */
  const providerScoped = useMemo(() => {
    return (resources || []).filter(
      (r: any) => r?.cloudProvider === cloudProvider
    );
  }, [resources, cloudProvider]);

  /**
   * Build Fuse index for fuzzy matching.
   * - Weighted keys favor the resource name, then description, then version/tags.
   */
  const fuse = useMemo(() => {
    return new Fuse(providerScoped, {
      includeScore: true,
      threshold: 0.36, // lower = stricter; tweak between 0.3–0.5
      ignoreLocation: true,
      minMatchCharLength: 2,
      keys: [
        { name: "resourceName", weight: 0.55 },
        { name: "resourceDescription", weight: 0.3 },
        { name: "resourceVersion", weight: 0.1 },
        { name: "tags", weight: 0.05 }, // optional if you have tags array
      ],
    });
  }, [providerScoped]);

  /**
   * Final list shown: fuzzy-searched if query present, otherwise providerScoped.
   */
  const visibleResources = useMemo(() => {
    if (!debouncedSearch) return providerScoped;
    const results = fuse.search(debouncedSearch);
    return results.map((r) => r.item);
  }, [debouncedSearch, fuse, providerScoped]);

  return (
    <>
      <IconButton
        onClick={toggleDrawer}
        sx={{
          position: "fixed",
          top: "110px",
          left: open ? "223px" : "16px",
          zIndex: 101,
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
            zIndex: 100,
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
              placeholder="Search name, description, version…"
              sx={{ ml: 1, flex: 1, fontSize: 14 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              inputProps={{ "aria-label": "Sidebar fuzzy search" }}
            />
          </Paper>
        </Box>

        <Divider />

        <List>
          {visibleResources.map((resource: any) => (
            <ListItemButton
              key={resource._id}
              sx={{ alignItems: "center", py: 1.5 }}
              className="dndnode"
              onDragStart={(event) => onDragStart(event, resource._id)}
              draggable
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
                slotProps={{
                  primary: {
                    sx: {
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                    },
                  },
                  secondary: {
                    noWrap: true,
                    sx: {
                      fontSize: "0.85rem",
                      color: theme.palette.text.secondary,
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                    },
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
