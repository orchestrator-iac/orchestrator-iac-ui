import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Skeleton,
  Fade,
  Chip,
  Button,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector, useDispatch } from "react-redux";
import { useDebouncedCallback } from "use-debounce";
import { useNavigate } from "react-router-dom";

import { RootState, AppDispatch } from "../../store";
import { fetchResources } from "../../store/resourcesSlice";
import { fetchTopResources } from "../../store/resourceAnalyticsSlice";
import { useAuth } from "../../context/AuthContext";
import { useGuidedTour } from "../shared/guidance/ProductGuidanceProvider";
import ResourceCard, { type ResourceItem } from "./ResourceCard";
import {
  resolveResourceIcon,
  shouldResolveResourceIcon,
} from "@/services/resourceIconResolver";
import { type ResourceIconValue } from "@/types/resourceIcon";

type CloudFilter = "all" | "aws" | "azure" | "gcp";

const CLOUD_LABELS: Record<CloudFilter, string> = {
  all: "All",
  aws: "AWS",
  azure: "Azure",
  gcp: "GCP",
};

type ResourceSortBy = "popular" | "newest" | "az";

const SORT_OPTIONS: { value: ResourceSortBy; label: string; icon: string }[] = [
  { value: "popular", label: "Popular", icon: "fire" },
  { value: "newest", label: "Newest", icon: "clock" },
  { value: "az", label: "A-Z", icon: "arrow-down-a-z" },
];

// A resource must have been used in at least this many orchestrators to
// earn the "Popular" badge — a raw usage floor rather than a fixed top-N,
// so the badge count grows/shrinks with real usage instead of always
// spotlighting a fixed number of cards.
const POPULAR_USAGE_THRESHOLD = 3;

const ResourcesGallery: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const canCreateResources = hasPermission("create-resources");

  const { data: resources, status } = useSelector(
    (state: RootState) => state.resources,
  );
  const { byId: usageById } = useSelector(
    (state: RootState) => state.resourceAnalytics,
  );

  const [localSearch, setLocalSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cloudFilter, setCloudFilter] = useState<CloudFilter>("all");
  const [sortBy, setSortBy] = useState<ResourceSortBy>("popular");
  const [showContent, setShowContent] = useState(false);
  const hasRetriedFailedLoad = useRef(false);
  const [resolvedIcons, setResolvedIcons] = useState<
    Record<string, ResourceIconValue>
  >({});

  // Restore body scroll
  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  // Reveal animation
  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (status !== "succeeded" || !resources?.length) {
      return;
    }

    const targets = resources.filter(
      (resource: ResourceItem) =>
        shouldResolveResourceIcon(resource.resourceIcon) &&
        !resolvedIcons[resource._id],
    );

    if (targets.length === 0) {
      return;
    }

    let cancelled = false;

    const loadResolvedIcons = async () => {
      const entries = await Promise.all(
        targets.map(async (resource: ResourceItem) => [
          resource._id,
          await resolveResourceIcon(resource),
        ] as const),
      );

      if (cancelled) {
        return;
      }

      const nextIcons = entries.reduce<Record<string, ResourceIconValue>>(
        (accumulator, [resourceId, icon]) => {
          if (icon) {
            accumulator[resourceId] = icon;
          }
          return accumulator;
        },
        {},
      );

      if (Object.keys(nextIcons).length > 0) {
        setResolvedIcons((current) => ({ ...current, ...nextIcons }));
      }
    };

    void loadResolvedIcons();

    return () => {
      cancelled = true;
    };
  }, [resources, resolvedIcons, status]);

  useGuidedTour(
    "resources",
    showContent && status === "succeeded" && (resources?.length ?? 0) > 0,
  );

  // Fetch resources on first visit and recover once from a stale failed
  // load. AbortController cancels the inflight request on StrictMode's
  // double-invoke so we don't leave a stale request running.
  useEffect(() => {
    if (status === "idle") {
      const promise = dispatch(fetchResources());
      return () => promise.abort();
    }

    if (status === "failed" && !hasRetriedFailedLoad.current) {
      hasRetriedFailedLoad.current = true;
      const promise = dispatch(fetchResources());
      return () => promise.abort();
    }
  }, [dispatch, status]);

  // Best-effort popularity data, fetched independently — a failure or
  // empty/missing cache here must never block or error the main gallery,
  // it just leaves every resource at usage count 0 (alphabetical fallback).
  useEffect(() => {
    const promise = dispatch(fetchTopResources());
    return () => promise.abort();
  }, [dispatch]);


  // Debounced search
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    debouncedSearch(val);
  };

  // Client-side filtering, then sorting
  const filteredResources = useMemo(() => {
    if (!resources) return [];
    const filtered = resources.filter((r) => {
      const matchesCloud =
        cloudFilter === "all" || r.cloudProvider === cloudFilter;
      const term = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !term ||
        (r.resourceName || "").toLowerCase().includes(term) ||
        (r.resourceDescription || "").toLowerCase().includes(term) ||
        (r.resourceId || "").toLowerCase().includes(term);
      return matchesCloud && matchesSearch;
    });

    const byName = (a: ResourceItem, b: ResourceItem) =>
      (a.resourceName || "").localeCompare(b.resourceName || "");

    if (sortBy === "az") {
      return [...filtered].sort(byName);
    }

    if (sortBy === "newest") {
      return [...filtered].sort((a, b) => {
        const at = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const bt = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return bt - at || byName(a, b);
      });
    }

    // "popular": usage count descending, alphabetical tiebreak. Resources
    // with no usage data (count 0) simply interleave alphabetically among
    // other unused resources instead of being frozen at the bottom.
    return [...filtered].sort((a, b) => {
      const ac = usageById[a.resourceId] || 0;
      const bc = usageById[b.resourceId] || 0;
      return bc - ac || byName(a, b);
    });
  }, [resources, searchQuery, cloudFilter, sortBy, usageById]);

  const isLoading = status === "loading";
  const isError = status === "failed";
  const isEmpty = status === "succeeded" && filteredResources.length === 0;

  return (
    <Box
      sx={{
        maxWidth: "1600px",
        margin: "0 auto",
        px: { xs: 2, sm: 3, md: 4 },
        py: 4,
      }}
    >
      {/* Page header */}
      <Fade in={showContent} timeout={600}>
        <Box
          component="section"
          aria-labelledby="resources-gallery-heading"
          sx={{
            mb: 4,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              id="resources-gallery-heading"
              variant="h4"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.025em",
                fontSize: { xs: "1.75rem", md: "2.25rem" },
                mb: 0.75,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                color: theme.palette.primary.main,
              }}
            >
              <Box
                aria-hidden="true"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.18)}, ${alpha(theme.palette.tertiary.main, 0.22)})`,
                  color: theme.palette.secondary.main,
                  border: `1px solid ${alpha(theme.palette.tertiary.main, 0.45)}`,
                  flexShrink: 0,
                  fontSize: "1.1rem",
                }}
              >
                <FontAwesomeIcon icon="cube" />
              </Box>
              Resources
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                ml: 7.5,
                fontSize: "0.925rem",
                letterSpacing: "0.01em",
              }}
            >
              Cloud resource definitions and Terraform templates for AWS, Azure,
              and GCP.
            </Typography>
          </Box>

          {canCreateResources && (
            <Button
              variant="contained"
              onClick={() => navigate("/resources/new")}
              startIcon={
                <FontAwesomeIcon icon="plus" style={{ fontSize: "0.8rem" }} />
              }
              data-tour="resources-new-resource"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 2.5,
                alignSelf: "center",
              }}
            >
              New Resource
            </Button>
          )}
        </Box>
      </Fade>

      {/* Search + Cloud filter bar */}
      <Fade in={showContent} timeout={700}>
        <Box
          component="search"
          aria-label="Filter resources"
          sx={{
            display: "flex",
            gap: 2,
            mb: 4,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            placeholder="Search resources…"
            value={localSearch}
            onChange={handleSearchChange}
            size="small"
            data-tour="resources-search"
            sx={{
              flexGrow: 1,
              minWidth: 240,
              maxWidth: 480,
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.common.white, 0.03)
                    : alpha(theme.palette.common.black, 0.02),
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.common.white, 0.05)
                      : alpha(theme.palette.common.black, 0.04),
                },
                "&.Mui-focused": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.common.white, 0.07)
                      : theme.palette.common.white,
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
                },
              },
            }}
            slotProps={{
              htmlInput: { "aria-label": "Search resources" },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <FontAwesomeIcon
                      icon="search"
                      aria-hidden="true"
                      style={{ fontSize: "0.9rem", opacity: 0.45 }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Select
            value={cloudFilter}
            onChange={(e) => setCloudFilter(e.target.value as CloudFilter)}
            size="small"
            aria-label="Filter by cloud provider"
            data-tour="resources-cloud-filter"
            sx={{
              minWidth: 120,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              "& .MuiOutlinedInput-root": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.common.white, 0.03)
                    : alpha(theme.palette.common.white, 0.5),
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.common.white, 0.05)
                      : alpha(theme.palette.common.white, 0.7),
                },
                "&.Mui-focused": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.common.white, 0.07)
                      : theme.palette.common.white,
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
                },
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.common.white, 0.1)
                    : alpha(theme.palette.common.black, 0.12),
              },
            }}
          >
            {(["all", "aws", "azure", "gcp"] as CloudFilter[]).map((c) => (
              <MenuItem key={c} value={c}>
                {CLOUD_LABELS[c]}
              </MenuItem>
            ))}
          </Select>

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ResourceSortBy)}
            size="small"
            aria-label="Sort resources"
            data-tour="resources-sort"
            sx={{
              minWidth: 140,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              "& .MuiOutlinedInput-root": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.common.white, 0.03)
                    : alpha(theme.palette.common.white, 0.5),
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.common.white, 0.05)
                      : alpha(theme.palette.common.white, 0.7),
                },
                "&.Mui-focused": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.common.white, 0.07)
                      : theme.palette.common.white,
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
                },
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.common.white, 0.1)
                    : alpha(theme.palette.common.black, 0.12),
              },
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                <FontAwesomeIcon icon={opt.icon} style={{ fontSize: "0.75rem", marginRight: "0.5rem" }} />
                {opt.label}
              </MenuItem>
            ))}
          </Select>

          {status === "succeeded" && (
            <Chip
              label={`${filteredResources.length} resource${filteredResources.length === 1 ? "" : "s"}`}
              size="small"
              sx={{
                fontWeight: 600,
                backgroundColor: alpha(theme.palette.tertiary.main, 0.24),
                color: theme.palette.secondary.main,
                border: `1px solid ${alpha(theme.palette.tertiary.main, 0.48)}`,
              }}
            />
          )}
        </Box>
      </Fade>

      {/* Grid */}
      <Grid
        container
        columns={{ xs: 4, sm: 8, md: 12 }}
        spacing={{ xs: 2, sm: 2.5, md: 3 }}
        alignItems="stretch"
      >
        {isLoading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <Grid
              key={`sk-${i}`}
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              display="flex"
            >
              <Box
                sx={{
                  width: "100%",
                  borderRadius: "12px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.common.white, 0.03)
                      : theme.palette.common.white,
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
                  border: `1px solid ${
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.common.white, 0.06)
                      : alpha(theme.palette.common.black, 0.06)
                  }`,
                  animation: `sk-rise 0.5s ease ${i * 50}ms both`,
                  "@keyframes sk-rise": {
                    from: { opacity: 0, transform: "translateY(14px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  height={140}
                  sx={{ borderRadius: "8px", mb: 1.5 }}
                />
                <Skeleton
                  variant="text"
                  animation="wave"
                  width="70%"
                  sx={{ fontSize: "1rem", mb: 0.5 }}
                />
                <Skeleton
                  variant="text"
                  animation="wave"
                  width="100%"
                  sx={{ fontSize: "0.875rem" }}
                />
                <Skeleton
                  variant="text"
                  animation="wave"
                  width="85%"
                  sx={{ fontSize: "0.875rem", mb: 1.5 }}
                />
                <Skeleton
                  variant="rounded"
                  animation="wave"
                  width={80}
                  height={28}
                  sx={{ borderRadius: 1 }}
                />
              </Box>
            </Grid>
          ))
        ) : isError ? (
          <Grid size={12}>
            <Fade in timeout={800}>
              <Box
                role="alert"
                aria-live="polite"
                sx={{
                  p: { xs: 5, sm: 8 },
                  textAlign: "center",
                  borderRadius: 3,
                  border: "1px dashed",
                  borderColor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.error.main, 0.35)
                      : alpha(theme.palette.error.main, 0.25),
                  backgroundColor: alpha(theme.palette.error.main, 0.04),
                }}
              >
                <Box sx={{ maxWidth: 520, mx: "auto" }}>
                  <Alert
                    severity="error"
                    variant="outlined"
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      textAlign: "left",
                      alignItems: "center",
                    }}
                  >
                    We couldn't load the resources right now.
                  </Alert>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
                    Resource gallery unavailable
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", lineHeight: 1.6, mb: 3 }}
                  >
                    Try again. If this keeps happening, the backend may still
                    be warming up or your session may need to be refreshed.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => dispatch(fetchResources())}
                    startIcon={
                      <FontAwesomeIcon
                        icon="arrow-rotate-right"
                        style={{ fontSize: "0.8rem" }}
                      />
                    }
                    sx={{ borderRadius: 2, textTransform: "none" }}
                  >
                    Retry loading
                  </Button>
                </Box>
              </Box>
            </Fade>
          </Grid>
        ) : isEmpty ? (
          <Grid size={12}>
            <Fade in timeout={800}>
              <Box
                role="status"
                aria-live="polite"
                sx={{
                  p: { xs: 5, sm: 8 },
                  textAlign: "center",
                  borderRadius: 3,
                  border: "1px dashed",
                  borderColor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.common.white, 0.1)
                      : alpha(theme.palette.common.black, 0.1),
                }}
              >
                <Box
                  aria-hidden="true"
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    mx: "auto",
                    mb: 2.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    fontSize: "1.75rem",
                  }}
                >
                  <FontAwesomeIcon icon={localSearch ? "search" : "cube"} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
                  {localSearch
                    ? `No results for "${localSearch}"`
                    : "No resources found"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", lineHeight: 1.6, mb: 2 }}
                >
                  {localSearch && "Try adjusting your search or cloud filter."}
                  {!localSearch && canCreateResources && "Create the first resource to get started."}
                  {!localSearch && !canCreateResources && "No resources are available yet."}
                </Typography>
                {localSearch && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setLocalSearch("");
                      setSearchQuery("");
                      setCloudFilter("all");
                    }}
                    sx={{ borderRadius: 2, textTransform: "none" }}
                  >
                    Clear filters
                  </Button>
                )}
              </Box>
            </Fade>
          </Grid>
        ) : (
          filteredResources.map((resource, index) => (
            <Grid
              key={resource._id}
              size={{ xs: 12, sm: 6, md: 4, lg: 2 }}
              display="flex"
            >
              <Fade in={showContent} timeout={600 + index * 50}>
                <Box sx={{ width: "100%", display: "flex" }}>
                  <ResourceCard
                    resource={resource}
                    usageCount={usageById[resource.resourceId] || 0}
                    isPopular={
                      (usageById[resource.resourceId] || 0) >=
                      POPULAR_USAGE_THRESHOLD
                    }
                  />
                </Box>
              </Fade>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default ResourcesGallery;
