import React, { useEffect, useMemo, useRef, useState } from "react";
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
import Fuse from "fuse.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useDnD } from "./DnDContext";
import { RootState, AppDispatch } from "../../../store";
import { fetchResources } from "../../../store/resourcesSlice";
import { fetchTopResources } from "../../../store/resourceAnalyticsSlice";
import { CloudProvider } from "../../../types/clouds-info";
import ResourceIconView from "@/components/shared/ResourceIconView";
import OverflowTooltipText from "@/components/shared/OverflowTooltipText";
import styles from "../Orchestrator.module.css";

const drawerWidth = 240;

// Matches the "Popular" badge threshold on the Resources gallery
// (ResourcesGallery.tsx) — a resource must have been used in at least this
// many orchestrators to be considered popular.
const POPULAR_USAGE_THRESHOLD = 3;

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
    (state: RootState) => state.resources,
  );
  const { byId: usageById, status: analyticsStatus } = useSelector(
    (state: RootState) => state.resourceAnalytics,
  );

  // --- local state for search ---
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const hasRetriedAnalyticsLoad = useRef(false);

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
    resourceId: string,
  ) => {
    setId(resourceId);
    event.dataTransfer.effectAllowed = "move";
  };

  // Fetch once when idle. AbortController cancels the inflight request on
  // StrictMode's double-invoke so we don't leave a stale request running.
  useEffect(() => {
    if (resourcesStatus !== "idle") return;
    const promise = dispatch(fetchResources());
    return () => promise.abort();
  }, [dispatch, resourcesStatus]);

  // Best-effort popularity data, fetched independently — a failure or
  // empty/missing cache here must never block or error the sidebar, it
  // just leaves every resource at usage count 0 (original-order fallback).
  useEffect(() => {
    if (analyticsStatus === "idle") {
      const promise = dispatch(fetchTopResources());
      return () => promise.abort();
    }

    if (analyticsStatus === "failed" && !hasRetriedAnalyticsLoad.current) {
      hasRetriedAnalyticsLoad.current = true;
      const promise = dispatch(fetchTopResources());
      return () => promise.abort();
    }
  }, [analyticsStatus, dispatch]);

  // Debounce search input for smoother typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 160);
    return () => clearTimeout(t);
  }, [searchTerm]);

  /**
   * Provider-scoped resources, sorted by popularity (usage count desc, then
   * alphabetical) so the most-used resources for this cloud surface first —
   * same comparator as the Resources gallery's default "Popular" sort.
   */
  const providerScoped = useMemo(() => {
    const scoped = (resources || []).filter(
      (r: any) => r?.cloudProvider === cloudProvider,
    );
    return [...scoped].sort((a: any, b: any) => {
      const ac = usageById[a.resourceId] || 0;
      const bc = usageById[b.resourceId] || 0;
      return (
        bc - ac || (a.resourceName || "").localeCompare(b.resourceName || "")
      );
    });
  }, [resources, cloudProvider, usageById]);

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
        className={[styles.sidebarToggle, open && styles.sidebarToggleOpen]
          .filter(Boolean)
          .join(" ")}
        onClick={toggleDrawer}
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
            top: "72px",
            height: "calc(100vh - 72px)",
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            boxSizing: "border-box",
            display: open ? "flex" : "none",
            flexDirection: "column",
            zIndex: 100,
          },
        }}
        slotProps={{ paper: { className: styles.sidebarDrawer } }}
      >
        <Box sx={{ mt: 2, px: 2, pb: 1, flexShrink: 0 }}>
          <Paper
            variant="outlined"
            data-tour="orchestrator-sidebar-search"
            className={styles.sidebarSearch}
            sx={{ display: "flex", alignItems: "center", px: 1, py: 0.5 }}
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

        <Divider sx={{ flexShrink: 0 }} />

        <List sx={{ flex: 1, overflowY: "auto" }}>
          {visibleResources.map((resource: any) => (
            <ListItemButton
              key={resource._id}
              sx={{ alignItems: "center" }}
              className={[styles.sidebarResourceItem, "dndnode"].join(" ")}
              onDragStart={(event) => onDragStart(event, resource.resourceId)}
              draggable
            >
              <ResourceIconView
                icon={resource?.resourceIcon}
                alt={resource.resourceName}
                sx={{
                  width: 40,
                  height: 40,
                  mr: 2,
                  objectFit: "contain",
                }}
              />
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      minWidth: 0,
                    }}
                  >
                    <OverflowTooltipText
                      text={resource.resourceName}
                      component="span"
                      tooltipPlacement="right"
                      sx={{
                        maxWidth: 130,
                        minWidth: 0,
                        flexShrink: 1,
                      }}
                    />
                    {(usageById[resource.resourceId] || 0) >=
                      POPULAR_USAGE_THRESHOLD && (
                      <FontAwesomeIcon
                        icon="fire"
                        aria-label="Popular"
                        title="Popular"
                        style={{
                          fontSize: "0.75rem",
                          color: theme.palette.secondary.main,
                        }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <OverflowTooltipText
                    text={resource.resourceDescription}
                    component="span"
                    tooltipPlacement="right"
                    sx={{
                      maxWidth: "100%",
                      minWidth: 0,
                      flexShrink: 1,
                    }}
                  />
                }
                slotProps={{
                  primary: {
                    sx: {
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                    },
                  },
                  secondary: {
                    sx: {
                      fontSize: "0.85rem",
                      color: theme.palette.text.secondary,
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
