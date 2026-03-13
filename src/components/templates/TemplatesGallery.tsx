import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Skeleton,
  Fade,
  Chip,
  Button,
  Stack,
  Collapse,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  alpha,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector, useDispatch } from "react-redux";
import { useDebouncedCallback } from "use-debounce";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState("");
  const [showContent, setShowContent] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { items, status, hasMore, page, searchQuery, sortBy } = useSelector(
    (state: RootState) => state.templates,
  );

  // Restore body scroll (Orchestrator page sets overflow:hidden)
  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  // First-visit welcome banner
  useEffect(() => {
    const seen = localStorage.getItem("orchestrator-templates-visited");
    if (!seen) {
      setShowWelcome(true);
      localStorage.setItem("orchestrator-templates-visited", "1");
    }
  }, []);

  // SEO — keep meta tags in sync when navigating client-side
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Infrastructure Templates | Orchestrator";

    const set = (sel: string, attr: string, val: string) => {
      let el = document.querySelector<HTMLMetaElement | HTMLLinkElement>(sel);
      if (!el) {
        el = document.createElement(
          sel.startsWith("link") ? "link" : "meta",
        ) as any;
        document.head.appendChild(el!);
      }
      el!.setAttribute(attr, val);
    };

    const desc =
      "Browse community infrastructure templates for AWS, Azure, and GCP. Deploy production-ready cloud architectures in one click.";
    const url = "https://orchestrator.next-zen.dev/templates";

    set('meta[name="description"]', "content", desc);
    set('meta[name="robots"]', "content", "index, follow");
    set(
      'meta[property="og:title"]',
      "content",
      "Infrastructure Templates | Orchestrator",
    );
    set('meta[property="og:description"]', "content", desc);
    set('meta[property="og:url"]', "content", url);
    set('meta[property="og:type"]', "content", "website");
    set('link[rel="canonical"]', "href", url);

    return () => {
      document.title = prevTitle;
    };
  }, []);

  // Reveal animation
  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Initial load
  useEffect(() => {
    dispatch(resetTemplates());
    dispatch(fetchTemplates({ page: 1, size: PAGE_SIZE, sort: "popularity" }));
  }, []);

  // Debounced search — resets to page 1
  const debouncedSearch = useDebouncedCallback((value: string) => {
    dispatch(setSearchQuery(value));
    dispatch(
      fetchTemplates({
        page: 1,
        size: PAGE_SIZE,
        search: value || undefined,
        sort: sortBy,
      }),
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

  const handleQuickSearch = (term: string) => {
    setLocalSearch(term);
    debouncedSearch(term);
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
        <Box
          component="section"
          aria-labelledby="templates-heading"
          sx={{ mb: 4 }}
        >
          <Typography
            id="templates-heading"
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
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.main, 0.08)})`,
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                flexShrink: 0,
                fontSize: "1.1rem",
              }}
            >
              <FontAwesomeIcon icon="layer-group" />
            </Box>
            Templates
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
            Ready-made infrastructure blueprints. Fork any template to start
            building.
          </Typography>
        </Box>
      </Fade>

      {/* First-visit Welcome Banner */}
      <Collapse in={showWelcome} timeout={500}>
        <Box
          sx={{
            mb: 4,
            borderRadius: 3,
            overflow: "hidden",
            position: "relative",
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            p: { xs: 3, sm: 4 },
          }}
        >
          {/* Decorative background orb */}
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              right: -50,
              top: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: alpha(theme.palette.primary.main, 0.06),
              pointerEvents: "none",
            }}
          />

          <IconButton
            aria-label="Dismiss welcome banner"
            size="small"
            onClick={() => setShowWelcome(false)}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              opacity: 0.45,
              transition: "opacity 0.2s",
              "&:hover": { opacity: 1 },
            }}
          >
            <FontAwesomeIcon icon="xmark" style={{ fontSize: "0.8rem" }} />
          </IconButton>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            {/* Icon */}
            <Box
              aria-hidden="true"
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2.5,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.28)}, ${alpha(theme.palette.primary.main, 0.1)})`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                fontSize: "1.4rem",
                color: theme.palette.primary.main,
              }}
            >
              <FontAwesomeIcon icon="rocket" />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  color: theme.palette.primary.main,
                }}
              >
                Welcome to Templates
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mb: 2, lineHeight: 1.65 }}
              >
                Community-built infrastructure blueprints for AWS, Azure, and
                GCP. Fork any template to start building — no setup required.
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {(
                  [
                    { icon: "search", label: "Browse patterns" },
                    { icon: "code-branch", label: "Fork & customise" },
                    { icon: "layer-group", label: "Deploy anywhere" },
                  ] as const
                ).map(({ icon, label }) => (
                  <Stack
                    key={label}
                    direction="row"
                    spacing={0.75}
                    alignItems="center"
                    sx={{
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 2,
                      background: alpha(theme.palette.primary.main, 0.06),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={icon}
                      aria-hidden="true"
                      style={{
                        fontSize: "0.7rem",
                        color: theme.palette.primary.main,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                      }}
                    >
                      {label}
                    </Typography>
                  </Stack>
                ))}
              </Box>
            </Box>
          </Stack>
        </Box>
      </Collapse>

      {/* Search + Sort bar */}
      <Fade in={showContent} timeout={700}>
        <Box
          component="search"
          aria-label="Filter templates"
          sx={{
            display: "flex",
            gap: 2,
            mb: 4,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            placeholder="Search templates…"
            value={localSearch}
            onChange={handleSearchChange}
            size="small"
            inputProps={{ "aria-label": "Search templates" }}
            sx={{
              flexGrow: 1,
              minWidth: 240,
              maxWidth: 480,
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? alpha("#fff", 0.03)
                    : alpha("#000", 0.02),
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? alpha("#fff", 0.05)
                      : alpha("#000", 0.04),
                },
                "&.Mui-focused": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? alpha("#fff", 0.07)
                      : alpha("#fff", 1),
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
                },
              },
            }}
            slotProps={{
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
            value={sortBy}
            exclusive
            onChange={handleSortChange}
            size="small"
            aria-label="Sort templates"
            sx={{
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontWeight: 600,
                px: 2,
                borderRadius: "10px !important",
                borderColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.12)",
                transition: "all 0.2s ease",
                "&:focus-visible": {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2,
                },
              },
              "& .MuiToggleButton-root.Mui-selected": {
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                borderColor: alpha(theme.palette.primary.main, 0.25),
              },
            }}
          >
            <ToggleButton
              value="popularity"
              aria-label="Sort by popularity"
              sx={{
                marginRight: 1,
              }}
            >
              <FontAwesomeIcon
                icon="fire"
                aria-hidden="true"
                style={{ marginRight: 6, fontSize: "0.8rem" }}
              />
              Popular
            </ToggleButton>
            <ToggleButton value="newest" aria-label="Sort by newest">
              <FontAwesomeIcon
                icon="clock"
                aria-hidden="true"
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
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
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
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.03)"
                      : "#fff",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
                  border: `1px solid ${
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.06)"
                  }`,
                  animation: `sk-rise 0.5s ease ${i * 70}ms both`,
                  "@keyframes sk-rise": {
                    from: { opacity: 0, transform: "translateY(14px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                {/* Cloud logo badge placeholder */}
                <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    width: 40,
                    height: 40,
                    borderRadius: "8px",
                    flexShrink: 0,
                  }}
                />

                {/* Preview image */}
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  height={140}
                  sx={{ borderRadius: "8px", mb: 1.5, flexShrink: 0 }}
                />

                {/* Title */}
                <Skeleton
                  variant="text"
                  animation="wave"
                  width="68%"
                  sx={{ fontSize: "1.05rem", mb: 0.5 }}
                />

                {/* Description — 2 lines */}
                <Skeleton
                  variant="text"
                  animation="wave"
                  width="100%"
                  sx={{ fontSize: "0.875rem" }}
                />
                <Skeleton
                  variant="text"
                  animation="wave"
                  width="82%"
                  sx={{ fontSize: "0.875rem", mb: 1 }}
                />

                {/* Author */}
                <Skeleton
                  variant="text"
                  animation="wave"
                  width="42%"
                  sx={{ fontSize: "0.75rem", mb: 1.5 }}
                />

                {/* Analytics row: views / likes / uses / nodes badge */}
                <Box sx={{ display: "flex", gap: 1.5, mb: 1.5, flexWrap: "wrap" }}>
                  <Skeleton variant="rounded" animation="wave" width={34} height={18} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rounded" animation="wave" width={26} height={18} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rounded" animation="wave" width={26} height={18} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rounded" animation="wave" width={68} height={18} sx={{ borderRadius: 1 }} />
                </Box>

                {/* Use Template button */}
                <Skeleton
                  variant="rounded"
                  animation="wave"
                  width={112}
                  height={30}
                  sx={{ borderRadius: 1, mt: "auto" }}
                />
              </Box>
            </Grid>
          ))
        ) : items.length === 0 && status === "succeeded" ? (
          <Grid size={12}>
            <Fade in timeout={800}>
              {localSearch ? (
                /* ── Search empty state ───────────────────────────────── */
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
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.1)",
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
                    <FontAwesomeIcon icon="search" />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
                    No results for &ldquo;{localSearch}&rdquo;
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mb: 3, lineHeight: 1.6 }}
                  >
                    Try a cloud service, pattern, or architecture keyword.
                  </Typography>

                  <Typography
                    variant="overline"
                    sx={{
                      color: "text.disabled",
                      letterSpacing: "0.1em",
                      display: "block",
                      mb: 1.5,
                      fontSize: "0.68rem",
                    }}
                  >
                    Popular searches
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: 1,
                      mb: 3,
                      maxWidth: 480,
                      mx: "auto",
                    }}
                  >
                    {[
                      "VPC",
                      "EKS",
                      "Lambda",
                      "S3",
                      "Aurora",
                      "Redis",
                      "Terraform",
                      "Azure",
                    ].map((term) => (
                      <Chip
                        key={term}
                        label={term}
                        size="small"
                        onClick={() => handleQuickSearch(term)}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 600,
                          cursor: "pointer",
                          bgcolor: alpha(theme.palette.primary.main, 0.06),
                          color: theme.palette.primary.main,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.15),
                          },
                        }}
                      />
                    ))}
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleQuickSearch("")}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 2,
                      borderColor: alpha(theme.palette.primary.main, 0.28),
                      color: theme.palette.primary.main,
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                        background: alpha(theme.palette.primary.main, 0.06),
                      },
                    }}
                  >
                    Clear search
                  </Button>
                </Box>
              ) : (
                /* ── No templates yet — onboarding empty state ─────────── */
                <Box
                  role="status"
                  aria-live="polite"
                  sx={{ p: { xs: 4, sm: 6 }, textAlign: "center" }}
                >
                  <Box
                    aria-hidden="true"
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      mx: "auto",
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.16)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      color: theme.palette.primary.main,
                      fontSize: "2rem",
                    }}
                  >
                    <FontAwesomeIcon icon="layer-group" />
                  </Box>

                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                    No templates yet — be the first!
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      mb: 5,
                      maxWidth: 440,
                      mx: "auto",
                      lineHeight: 1.65,
                    }}
                  >
                    Design your cloud architecture on the canvas, then publish
                    it as a reusable template for the whole community.
                  </Typography>

                  {/* 3-step guide */}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    justifyContent="center"
                    sx={{ mb: 5, maxWidth: 680, mx: "auto" }}
                  >
                    {(
                      [
                        {
                          num: "01",
                          icon: "layer-group",
                          title: "Design",
                          desc: "Build your architecture visually on the canvas",
                        },
                        {
                          num: "02",
                          icon: "code-branch",
                          title: "Publish",
                          desc: "Share it as a community template in one click",
                        },
                        {
                          num: "03",
                          icon: "rocket",
                          title: "Impact",
                          desc: "Others fork and deploy your pattern instantly",
                        },
                      ] as const
                    ).map(({ num, icon, title, desc }) => (
                      <Box
                        key={num}
                        sx={{
                          flex: 1,
                          p: 2.5,
                          borderRadius: 3,
                          textAlign: "left",
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                          background: alpha(theme.palette.primary.main, 0.04),
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <Typography
                          aria-hidden="true"
                          sx={{
                            position: "absolute",
                            top: 6,
                            right: 10,
                            fontWeight: 900,
                            fontSize: "2.4rem",
                            lineHeight: 1,
                            color: alpha(theme.palette.primary.main, 0.08),
                            userSelect: "none",
                          }}
                        >
                          {num}
                        </Typography>

                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 1.5,
                            background: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontSize: "0.9rem",
                          }}
                        >
                          <FontAwesomeIcon icon={icon} aria-hidden="true" />
                        </Box>

                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, mb: 0.5 }}
                        >
                          {title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            lineHeight: 1.5,
                            display: "block",
                          }}
                        >
                          {desc}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/home")}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 3,
                      px: 5,
                      py: 1.5,
                      fontSize: "1rem",
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.35)}`,
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.5)}`,
                      },
                      transition: "all 0.25s ease",
                    }}
                  >
                    Start Building Free
                  </Button>
                </Box>
              )}
            </Fade>
          </Grid>
        ) : (
          items.map((template, index) => (
            <Grid
              key={template.id}
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              display="flex"
            >
              <Box
                sx={{
                  width: "100%",
                  animation: `card-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${Math.min(index * 55, 550)}ms both`,
                  "@keyframes card-enter": {
                    from: { opacity: 0, transform: "translateY(18px) scale(0.97)" },
                    to: { opacity: 1, transform: "translateY(0) scale(1)" },
                  },
                }}
              >
                <TemplateCard template={template} />
              </Box>
            </Grid>
          ))
        )}

        {/* Infinite scroll loading indicator */}
        {status === "loading" &&
          items.length > 0 &&
          Array.from({ length: 4 }).map((_, i) => (
            <Grid
              key={`sk-more-${i}`}
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              display="flex"
            >
              <Box
                sx={{
                  width: "100%",
                  borderRadius: "12px",
                  padding: "20px",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.03)"
                      : "#fff",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
                  border: `1px solid ${
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.06)"
                  }`,
                  animation: `sk-rise 0.4s ease ${i * 60}ms both`,
                }}
              >
                <Skeleton
                  variant="rounded"
                  animation="wave"
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    width: 40,
                    height: 40,
                    borderRadius: "8px",
                  }}
                />
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  height={140}
                  sx={{ borderRadius: "8px", mb: 1.5, flexShrink: 0 }}
                />
                <Skeleton variant="text" animation="wave" width="68%" sx={{ fontSize: "1.05rem", mb: 0.5 }} />
                <Skeleton variant="text" animation="wave" width="100%" sx={{ fontSize: "0.875rem" }} />
                <Skeleton variant="text" animation="wave" width="75%" sx={{ fontSize: "0.875rem", mb: 1 }} />
                <Skeleton variant="text" animation="wave" width="42%" sx={{ fontSize: "0.75rem", mb: 1.5 }} />
                <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
                  <Skeleton variant="rounded" animation="wave" width={34} height={18} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rounded" animation="wave" width={26} height={18} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rounded" animation="wave" width={68} height={18} sx={{ borderRadius: 1 }} />
                </Box>
                <Skeleton variant="rounded" animation="wave" width={112} height={30} sx={{ borderRadius: 1 }} />
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
