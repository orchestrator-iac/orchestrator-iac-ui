import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Skeleton,
  Fade,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  alpha,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector, useDispatch } from "react-redux";
import { useDebouncedCallback } from "use-debounce";

import { RootState, AppDispatch } from "../../store";
import {
  fetchTemplates,
  setSearchQuery,
  setSortBy,
  resetTemplates,
} from "../../store/templatesSlice";
import TemplateCard from "./TemplateCard";

const PAGE_SIZE = 20;

const TemplatesGallery: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [localSearch, setLocalSearch] = useState("");
  const [showContent, setShowContent] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { items, status, hasMore, page, searchQuery, sortBy } = useSelector(
    (state: RootState) => state.templates,
  );

  // Restore body scroll (Orchestrator page sets overflow:hidden)
  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  // SEO — keep meta tags in sync when navigating client-side
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Infrastructure Templates | Orchestrator";

    const set = (sel: string, attr: string, val: string) => {
      let el = document.querySelector<HTMLMetaElement | HTMLLinkElement>(sel);
      if (!el) {
        el = document.createElement(sel.startsWith("link") ? "link" : "meta") as any;
        document.head.appendChild(el!);
      }
      el!.setAttribute(attr, val);
    };

    const desc =
      "Browse community infrastructure templates for AWS, Azure, and GCP. Deploy production-ready cloud architectures in one click.";
    const url = "https://orchestrator.next-zen.dev/templates";

    set('meta[name="description"]', "content", desc);
    set('meta[name="robots"]', "content", "index, follow");
    set('meta[property="og:title"]', "content", "Infrastructure Templates | Orchestrator");
    set('meta[property="og:description"]', "content", desc);
    set('meta[property="og:url"]', "content", url);
    set('meta[property="og:type"]', "content", "website");
    set('link[rel="canonical"]', "href", url);

    return () => { document.title = prevTitle; };
  }, []);

  // Reveal animation
  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Initial load
  useEffect(() => {
    dispatch(resetTemplates());
    dispatch(
      fetchTemplates({ page: 1, size: PAGE_SIZE, sort: "popularity" }),
    );
  }, []);

  // Debounced search — resets to page 1
  const debouncedSearch = useDebouncedCallback((value: string) => {
    dispatch(setSearchQuery(value));
    dispatch(
      fetchTemplates({ page: 1, size: PAGE_SIZE, search: value || undefined, sort: sortBy }),
    );
  }, 400);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    debouncedSearch(val);
  };

  const handleSortChange = (
    _: React.MouseEvent<HTMLElement>,
    newSort: "popularity" | "newest",
  ) => {
    if (!newSort) return;
    dispatch(setSortBy(newSort));
    dispatch(
      fetchTemplates({
        page: 1,
        size: PAGE_SIZE,
        search: searchQuery || undefined,
        sort: newSort,
      }),
    );
  };

  // Infinite scroll via IntersectionObserver
  const loadMore = useCallback(() => {
    if (status !== "loading" && hasMore) {
      dispatch(
        fetchTemplates({
          page: page + 1,
          size: PAGE_SIZE,
          search: searchQuery || undefined,
          sort: sortBy,
          append: true,
        }),
      );
    }
  }, [dispatch, status, hasMore, page, searchQuery, sortBy]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const isLoading = status === "loading" && items.length === 0;

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
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.02em",
              fontSize: { xs: "1.75rem", md: "2.25rem" },
              mb: 0.75,
              color:
                theme.palette.mode === "dark" ? "#88cfcf" : "#205a5a",
            }}
          >
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: 2,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? alpha("#4bbebe", 0.12)
                    : alpha("#1a5757", 0.08),
                color:
                  theme.palette.mode === "dark" ? "#7dd3d3" : "#1a5757",
                mr: 1.5,
                fontSize: "1.1rem",
                verticalAlign: "middle",
              }}
            >
              <FontAwesomeIcon icon="layer-group" />
            </Box>
            Templates
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", ml: 7.5, fontSize: "0.925rem" }}
          >
            Ready-made infrastructure blueprints. Fork any template to start
            building.
          </Typography>
        </Box>
      </Fade>

      {/* Search + Sort bar */}
      <Fade in={showContent} timeout={700}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 4,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            placeholder="Search templates..."
            value={localSearch}
            onChange={handleSearchChange}
            size="small"
            sx={{ flexGrow: 1, minWidth: 240, maxWidth: 480 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <FontAwesomeIcon icon="search" style={{ fontSize: "0.9rem", opacity: 0.5 }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <ToggleButtonGroup
            value={sortBy}
            exclusive
            onChange={handleSortChange}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontWeight: 500,
                px: 2,
                borderColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.12)",
              },
              "& .MuiToggleButton-root.Mui-selected": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(136, 207, 207, 0.15)"
                    : "rgba(32, 90, 90, 0.08)",
                color:
                  theme.palette.mode === "dark" ? "#88cfcf" : "#205a5a",
              },
            }}
          >
            <ToggleButton value="popularity">
              <FontAwesomeIcon
                icon="fire"
                style={{ marginRight: 6, fontSize: "0.8rem" }}
              />
              Popular
            </ToggleButton>
            <ToggleButton value="newest">
              <FontAwesomeIcon
                icon="clock"
                style={{ marginRight: 6, fontSize: "0.8rem" }}
              />
              Newest
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Fade>

      {/* Grid */}
      <Grid
        container
        columns={{ xs: 4, sm: 8, md: 12 }}
        spacing={{ xs: 2, sm: 2.5, md: 3 }}
        alignItems="stretch"
      >
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Grid key={`sk-${i}`} size={{ xs: 12, sm: 6, md: 4, lg: 3 }} display="flex">
                <Box sx={{ width: "100%", p: 2.5, borderRadius: 3 }}>
                  <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2, mb: 1.5 }} />
                  <Skeleton variant="text" width="75%" height={24} sx={{ mb: 0.75 }} />
                  <Skeleton variant="text" width="100%" height={16} />
                  <Skeleton variant="text" width="60%" height={16} sx={{ mb: 1.5 }} />
                  <Skeleton variant="rounded" width={110} height={28} />
                </Box>
              </Grid>
            ))
          : items.length === 0 && status === "succeeded"
            ? (
              <Grid size={12}>
                <Fade in timeout={800}>
                  <Box
                    sx={{
                      p: 8,
                      textAlign: "center",
                      color: "text.secondary",
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? alpha("#fff", 0.02)
                          : alpha("#000", 0.02),
                      borderRadius: 3,
                      border: "1px dashed",
                      borderColor:
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.1)",
                    }}
                  >
                    <FontAwesomeIcon
                      icon="layer-group"
                      size="3x"
                      style={{
                        opacity: 0.3,
                        marginBottom: 16,
                        color: theme.palette.mode === "dark" ? "#88cfcf" : "#4bbebe",
                      }}
                    />
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                      {localSearch ? "No templates found" : "No templates yet"}
                    </Typography>
                    <Typography variant="body2">
                      {localSearch
                        ? "Try a different search term"
                        : "Be the first to publish a template from your orchestrator!"}
                    </Typography>
                  </Box>
                </Fade>
              </Grid>
            )
            : items.map((template, index) => (
              <Grid
                key={template.id}
                size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                display="flex"
              >
                <Fade in={showContent} timeout={800 + index * 60}>
                  <Box sx={{ width: "100%" }}>
                    <TemplateCard template={template} />
                  </Box>
                </Fade>
              </Grid>
            ))}

        {/* Infinite scroll loading indicator */}
        {status === "loading" && items.length > 0 &&
          Array.from({ length: 4 }).map((_, i) => (
            <Grid key={`sk-more-${i}`} size={{ xs: 12, sm: 6, md: 4, lg: 3 }} display="flex">
              <Box sx={{ width: "100%", p: 2.5, borderRadius: 3 }}>
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2, mb: 1.5 }} />
                <Skeleton variant="text" width="75%" height={24} sx={{ mb: 0.75 }} />
                <Skeleton variant="text" width="100%" height={16} />
              </Box>
            </Grid>
          ))}
      </Grid>

      {/* Sentinel div for IntersectionObserver */}
      <Box ref={sentinelRef} sx={{ height: 40, mt: 2 }} />
    </Box>
  );
};

export default TemplatesGallery;
