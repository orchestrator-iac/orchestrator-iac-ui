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
  ToggleButtonGroup,
  ToggleButton,
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
import { useAuth } from "../../context/AuthContext";
import { useGuidedTour } from "../shared/guidance/ProductGuidanceProvider";
import ResourceCard from "./ResourceCard";

type CloudFilter = "all" | "aws" | "azure" | "gcp";

const CLOUD_LABELS: Record<CloudFilter, string> = {
  all: "All",
  aws: "AWS",
  azure: "Azure",
  gcp: "GCP",
};

const ResourcesGallery: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const canCreateResources = hasPermission("create-resources");

  const { data: resources, status } = useSelector(
    (state: RootState) => state.resources,
  );

  const [localSearch, setLocalSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cloudFilter, setCloudFilter] = useState<CloudFilter>("all");
  const [showContent, setShowContent] = useState(false);
  const hasRetriedFailedLoad = useRef(false);

  // Restore body scroll
  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  // Reveal animation
  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(t);
  }, []);

  useGuidedTour(
    "resources",
    showContent && status === "succeeded" && (resources?.length ?? 0) > 0,
  );

  // Fetch resources on first visit and recover once from a stale failed load.
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchResources());
      return;
    }

    if (status === "failed" && !hasRetriedFailedLoad.current) {
      hasRetriedFailedLoad.current = true;
      dispatch(fetchResources());
    }
  }, [dispatch, status]);

  // Debounced search
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    debouncedSearch(val);
  };

  const handleCloudFilterChange = (
    _: React.MouseEvent<HTMLElement>,
    newFilter: CloudFilter,
  ) => {
    if (newFilter) setCloudFilter(newFilter);
  };

  // Client-side filtering
  const filteredResources = useMemo(() => {
    if (!resources) return [];
    return resources.filter((r) => {
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
  }, [resources, searchQuery, cloudFilter]);

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

          <ToggleButtonGroup
            value={cloudFilter}
            exclusive
            onChange={handleCloudFilterChange}
            size="small"
            aria-label="Filter by cloud provider"
            data-tour="resources-cloud-filter"
            sx={{
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontWeight: 600,
                px: 2,
                borderRadius: "10px !important",
                borderColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.common.white, 0.1)
                    : alpha(theme.palette.common.black, 0.12),
                transition: "all 0.2s ease",
                "&:focus-visible": {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2,
                },
              },
              "& .MuiToggleButton-root.Mui-selected": {
                backgroundColor: alpha(theme.palette.secondary.main, 0.16),
                color: theme.palette.secondary.main,
                borderColor: alpha(theme.palette.secondary.main, 0.32),
              },
            }}
          >
            {(["all", "aws", "azure", "gcp"] as CloudFilter[]).map((c) => (
              <ToggleButton
                key={c}
                value={c}
                aria-label={`Filter by ${CLOUD_LABELS[c]}`}
                sx={{ mr: c === "gcp" ? 0 : 0.5 }}
              >
                {CLOUD_LABELS[c]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

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
                  <ResourceCard resource={resource} />
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
