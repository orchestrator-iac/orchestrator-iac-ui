import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  useTheme,
  Typography,
  Skeleton,
  Fade,
  Chip,
  InputAdornment,
  TextField,
  alpha,
  Tooltip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";

import { fetchOrchestrators } from "../../store/orchestratorsSlice";
import { templateService } from "../../services/templateService";
import apiService from "../../services/apiService";
import PublishTemplateDialog from "../orchestrator/publish-template/PublishTemplateDialog";
import { useAuth } from "../../context/AuthContext";

import styles from "./Home.module.css";
import awsLogo from "./../../assets/aws_logo.svg";
import awsLogoLight from "./../../assets/aws_logo_light.svg";
import awsLogoDark from "./../../assets/aws_logo_dark.svg";
import azLogo from "./../../assets/az_logo.svg";
import gcpLogo from "./../../assets/gcp_logo.svg";

const logoMap: Record<
  string,
  { light: string; dark: string; default: string }
> = {
  aws: {
    light: awsLogoLight,
    dark: awsLogoDark,
    default: awsLogo,
  },
  azure: {
    light: azLogo,
    dark: azLogo,
    default: azLogo,
  },
  gcp: {
    light: gcpLogo,
    dark: gcpLogo,
    default: gcpLogo,
  },
};

interface CardLogoProps {
  cloudType: string;
  className?: string;
  mode: "light" | "dark";
}

const CardLogo: React.FC<CardLogoProps> = ({ cloudType, className, mode }) => {
  const logoSrc =
    logoMap[cloudType]?.[mode] || logoMap[cloudType]?.default || awsLogo;
  return <img src={logoSrc} alt={`${cloudType} logo`} className={className} />;
};

const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { hasPermission } = useAuth();
  const canViewOrchestrators = hasPermission("view-orchestrators");
  const canViewResources = hasPermission("view-resources");
  const canCreateOrchestrators = hasPermission("create-orchestrators");
  const [searchQuery, setSearchQuery] = useState("");
  const [showContent, setShowContent] = useState(false);
  const [publishTarget, setPublishTarget] = useState<{
    orchestratorId: string;
    orchestratorName?: string;
    templateId?: string;
  } | null>(null);
  const [unpublishTarget, setUnpublishTarget] = useState<{
    templateId: string;
    name: string;
  } | null>(null);
  const [unpublishLoading, setUnpublishLoading] = useState(false);
  const [topTemplates, setTopTemplates] = useState<any[]>([]);
  const [topResources, setTopResources] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Carousel refs / state for INSIGHTS lists (templates + resources)
  const templatesRef = useRef<HTMLDivElement | null>(null);
  const resourcesRef = useRef<HTMLDivElement | null>(null);
  const [tmplCanLeft, setTmplCanLeft] = useState(false);
  const [tmplCanRight, setTmplCanRight] = useState(false);
  const [resCanLeft, setResCanLeft] = useState(false);
  const [resCanRight, setResCanRight] = useState(false);

  const { data: orchestrators, status: orchestratorsStatus } = useSelector(
    (state: RootState) => state.orchestrators,
  );

  useEffect(() => {
    if (orchestratorsStatus === "idle" && canViewOrchestrators)
      dispatch(fetchOrchestrators({}));
  }, [dispatch, orchestratorsStatus, canViewOrchestrators]);

  useEffect(() => {
    document.body.dataset.theme = theme.palette.mode;
    // Restore body scroll for Home page
    document.body.style.overflow = "auto";
  }, [theme.palette.mode]);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadInsights = async () => {
      setLoadingInsights(true);
      try {
        if (canViewOrchestrators) {
          const tplResp = await templateService.listTemplates({
            page: 1,
            size: 10,
            sort: "popularity",
          });
          if (mounted) setTopTemplates(tplResp.templates || []);
        }
        if (canViewResources) {
          const res = await apiService.get(
            `/orchestrators/analytics/top-resources?size=10`,
          );
          if (mounted) setTopResources(res || []);
        }
      } catch (err) {
        console.error("Failed to load insights:", err);
      } finally {
        if (mounted) setLoadingInsights(false);
      }
    };

    if (canViewOrchestrators || canViewResources) {
      loadInsights();
    }

    return () => {
      mounted = false;
    };
  }, [canViewOrchestrators, canViewResources]);

  // Watch templates scroll state
  useEffect(() => {
    const el = templatesRef.current;
    if (!el) {
      setTmplCanLeft(false);
      setTmplCanRight(false);
      return;
    }
    const update = () => {
      setTmplCanLeft(el.scrollLeft > 0);
      setTmplCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [topTemplates, loadingInsights]);

  // Watch resources scroll state
  useEffect(() => {
    const el = resourcesRef.current;
    if (!el) {
      setResCanLeft(false);
      setResCanRight(false);
      return;
    }
    const update = () => {
      setResCanLeft(el.scrollLeft > 0);
      setResCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [topResources, loadingInsights]);

  const scrollTemplatesByPage = (dir: number) => {
    const el = templatesRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  const scrollResourcesByPage = (dir: number) => {
    const el = resourcesRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  // Filter function
  const filteredOrchestrators = useMemo(() => {
    if (!orchestrators) return [];
    if (!searchQuery) return orchestrators;
    return orchestrators.filter(
      (o) =>
        o.templateInfo?.templateName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        o.templateInfo?.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );
  }, [orchestrators, searchQuery]);

  const navigateOrchestrator = (orchestratorId: string | undefined) => {
    navigate(`/orchestrator/${orchestratorId ?? "new"}?template_type=custom`);
  };

  const handleUnpublishConfirm = async () => {
    if (!unpublishTarget || unpublishLoading) return;
    setUnpublishLoading(true);
    try {
      await templateService.deleteTemplate(unpublishTarget.templateId);
      setUnpublishTarget(null);
      dispatch(fetchOrchestrators({}));
    } catch {
      // keep dialog open on error
    } finally {
      setUnpublishLoading(false);
    }
  };

  const isLoading = orchestratorsStatus === "loading";

  return (
    <Box
      sx={{
        maxWidth: "1600px",
        margin: "0 auto",
        px: { xs: 2, sm: 3, md: 4 },
        py: 4,
      }}
    >
      {/* Search and Stats Bar */}
      <Fade in={showContent} timeout={600}>
        <Box
          component="search"
          aria-label="Search orchestrators"
          sx={{
            mb: 4,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "space-between",
          }}
        >
          <TextField
            placeholder="Search orchestrators…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              flex: { xs: "1", md: "0 1 420px" },
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
              htmlInput: {
                "aria-label": "Search orchestrators",
              },
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
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            {canViewOrchestrators && (
              <Chip
                icon={
                  <FontAwesomeIcon
                    icon="sitemap"
                    aria-hidden="true"
                    style={{ fontSize: "0.85rem" }}
                  />
                }
                label={`${filteredOrchestrators.length} Orchestrators`}
                size="small"
                sx={{
                  fontWeight: 600,
                  px: 0.5,
                  letterSpacing: "0.01em",
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              />
            )}
            {canViewResources && (
              <Chip
                icon={
                  <FontAwesomeIcon
                    icon="cube"
                    aria-hidden="true"
                    style={{ fontSize: "0.85rem" }}
                  />
                }
                label="Resources"
                size="small"
                onClick={() => navigate("/resources")}
                sx={{
                  fontWeight: 600,
                  px: 0.5,
                  letterSpacing: "0.01em",
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  cursor: "pointer",
                }}
              />
            )}
          </Box>
        </Box>
      </Fade>

      {/* ===== INSIGHTS (Top Templates / Top Resources) ===== */}
      {(canViewOrchestrators || canViewResources) &&
        (loadingInsights ||
          topTemplates.length > 0 ||
          topResources.length > 0) && (
          <Fade in={showContent} timeout={700}>
            <Box component="section" sx={{ mb: 3 }}>
              <Grid container columns={{ xs: 4, sm: 8, md: 12 }} spacing={2}>
                {(loadingInsights || topTemplates.length > 0) && (
                  <Grid>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      Top Templates
                    </Typography>
                    <Box sx={{ position: "relative" }}>
                      {!loadingInsights && topTemplates.length > 4 && (
                        <IconButton
                          aria-label="Previous templates"
                          size="small"
                          onClick={() => scrollTemplatesByPage(-1)}
                          disabled={!tmplCanLeft}
                          sx={{
                            position: "absolute",
                            left: 6,
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 10,
                            boxShadow: 1,
                            p: 0.6,
                            height: 50,
                            width: 50,
                            opacity: 0.9,
                            backgroundColor: theme.palette.background.paper,
                            "&:hover": {
                              opacity: 1,
                              backgroundColor: theme.palette.background.paper,
                            },
                          }}
                        >
                          <FontAwesomeIcon
                            icon="chevron-left"
                            style={{ fontSize: "1.5rem" }}
                          />
                        </IconButton>
                      )}
                      {!loadingInsights && topTemplates.length > 4 && (
                        <IconButton
                          aria-label="Next templates"
                          size="small"
                          onClick={() => scrollTemplatesByPage(1)}
                          disabled={!tmplCanRight}
                          sx={{
                            position: "absolute",
                            right: 6,
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 10,
                            boxShadow: 1,
                            p: 0.6,
                            height: 50,
                            width: 50,
                            opacity: 0.9,
                            backgroundColor: theme.palette.background.paper,
                            "&:hover": {
                              opacity: 1,
                              backgroundColor: theme.palette.background.paper,
                            },
                          }}
                        >
                          <FontAwesomeIcon
                            icon="chevron-right"
                            style={{ fontSize: "1.5rem" }}
                          />
                        </IconButton>
                      )}

                      <Box
                        ref={templatesRef}
                        sx={{
                          display: "flex",
                          gap: 1,
                          overflowX: "auto",
                          scrollBehavior: "smooth",
                          pb: 0.5,
                          "&::-webkit-scrollbar": { display: "none" },
                          msOverflowStyle: "none",
                          scrollbarWidth: "none",
                        }}
                      >
                        {loadingInsights
                          ? Array.from({ length: 5 }).map((_, i) => (
                              <Box
                                key={`tmpl-skel-${i}`}
                                sx={{ width: 250, p: 1 }}
                              >
                                <Skeleton variant="rectangular" height={150} />
                                <Skeleton variant="text" />
                                <Skeleton variant="text" />
                              </Box>
                            ))
                          : topTemplates.map((t) => (
                              <Box
                                key={t.id}
                                onClick={() => navigate(`/templates/${t.id}`)}
                                sx={{
                                  minWidth: 250,
                                  p: 1,
                                  borderRadius: 2,
                                  border: "1px solid",
                                  borderColor: "divider",
                                  cursor: "pointer",
                                  transition:
                                    "box-shadow 0.2s ease, border-color 0.2s ease",
                                  "&:hover": {
                                    borderColor: "primary.main",
                                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                                  },
                                }}
                              >
                                <img
                                  src={t.previewImageUrl}
                                  alt={t.templateName}
                                  style={{
                                    width: "100%",
                                    height: 150,
                                    objectFit: "cover",
                                    borderRadius: 6,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{ mt: 1, fontWeight: 600 }}
                                >
                                  {t.templateName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "text.secondary" }}
                                >
                                  {t.analytics?.usageCount ||
                                    t.analytics?.viewCount ||
                                    0}{" "}
                                  uses
                                </Typography>
                              </Box>
                            ))}
                      </Box>
                    </Box>
                  </Grid>
                )}
                {(loadingInsights || topResources.length > 6) && (
                  <Grid>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      Top Resources
                    </Typography>
                    <Box sx={{ position: "relative" }}>
                      {!loadingInsights && topResources.length > 0 && (
                        <IconButton
                          aria-label="Previous resources"
                          size="small"
                          onClick={() => scrollResourcesByPage(-1)}
                          disabled={!resCanLeft}
                          sx={{
                            position: "absolute",
                            left: 6,
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 10,
                            boxShadow: 1,
                            p: 0.6,
                            height: 50,
                            width: 50,
                            opacity: 0.9,
                            backgroundColor: theme.palette.background.paper,
                            "&:hover": {
                              opacity: 1,
                              backgroundColor: theme.palette.background.paper,
                            },
                          }}
                        >
                          <FontAwesomeIcon
                            icon="chevron-left"
                            style={{ fontSize: "1.5rem" }}
                          />
                        </IconButton>
                      )}
                      {!loadingInsights && topResources.length > 6 && (
                        <IconButton
                          aria-label="Next resources"
                          size="small"
                          onClick={() => scrollResourcesByPage(1)}
                          disabled={!resCanRight}
                          sx={{
                            position: "absolute",
                            right: 6,
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 10,
                            boxShadow: 1,
                            p: 0.6,
                            height: 50,
                            width: 50,
                            opacity: 0.9,
                            backgroundColor: theme.palette.background.paper,
                            "&:hover": {
                              opacity: 1,
                              backgroundColor: theme.palette.background.paper,
                            },
                          }}
                        >
                          <FontAwesomeIcon
                            icon="chevron-right"
                            style={{ fontSize: "1.5rem" }}
                          />
                        </IconButton>
                      )}

                      <Box
                        ref={resourcesRef}
                        sx={{
                          display: "flex",
                          gap: 1,
                          overflowX: "auto",
                          scrollBehavior: "smooth",
                          pb: 0.5,
                          "&::-webkit-scrollbar": { display: "none" },
                          msOverflowStyle: "none",
                          scrollbarWidth: "none",
                        }}
                      >
                        {loadingInsights
                          ? Array.from({ length: 5 }).map((_, i) => (
                              <Box
                                key={`res-skel-${i}`}
                                sx={{ width: 250, p: 1 }}
                              >
                                <Skeleton variant="rectangular" height={150} />
                                <Skeleton variant="text" />
                                <Skeleton variant="text" />
                              </Box>
                            ))
                          : topResources.map((r) => (
                              <Box
                                key={r.resourceId}
                                onClick={() =>
                                  navigate(
                                    `/resources/${r._id || r.resourceId}`,
                                  )
                                }
                                sx={{
                                  minWidth: 200,
                                  p: 1,
                                  borderRadius: 2,
                                  border: "1px solid",
                                  borderColor: "divider",
                                  cursor: "pointer",
                                  transition:
                                    "box-shadow 0.2s ease, border-color 0.2s ease",
                                  "&:hover": {
                                    borderColor: "primary.main",
                                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                                  },
                                }}
                              >
                                {r.resourceIcon?.url ? (
                                  <img
                                    src={r.resourceIcon.url}
                                    alt={r.resourceName || r.resourceId}
                                    style={{
                                      width: "100%",
                                      height: 150,
                                      objectFit: "cover",
                                      borderRadius: 6,
                                    }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      width: "100%",
                                      height: 150,
                                      backgroundColor: "divider",
                                      borderRadius: 1,
                                    }}
                                  />
                                )}
                                <Typography
                                  variant="body2"
                                  sx={{ mt: 1, fontWeight: 600 }}
                                >
                                  {r.resourceName || r.resourceId}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "text.secondary" }}
                                >
                                  {r.count} uses
                                </Typography>
                              </Box>
                            ))}
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Fade>
        )}

      {/* ===== ORCHESTRATORS ===== */}
      {canViewOrchestrators && (
        <>
          <Fade in={showContent} timeout={800}>
            <Box
              component="section"
              aria-labelledby="orchestrators-heading"
              sx={{ mb: 3 }}
            >
              <Typography
                id="orchestrators-heading"
                variant="h4"
                className={styles.wrapperHeader}
                sx={{
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  fontWeight: 700,
                  letterSpacing: "-0.025em",
                  mb: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Box
                  aria-hidden="true"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.main, 0.08)})`,
                    color: theme.palette.primary.main,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  <FontAwesomeIcon
                    icon="sitemap"
                    style={{ fontSize: "1rem" }}
                  />
                </Box>
                Orchestrators
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.925rem",
                  ml: 7.25,
                  letterSpacing: "0.01em",
                }}
              >
                Manage your infrastructure orchestration workflows
              </Typography>
            </Box>
          </Fade>
          <Grid
            container
            columns={{ xs: 4, sm: 8, md: 12 }}
            spacing={{ xs: 2, sm: 2.5, md: 3 }}
            alignItems="stretch"
          >
            {isLoading ? (
              // Loading Skeletons
              Array.from({ length: 4 }).map((_, index) => (
                <Grid
                  key={`skeleton-orch-${index}`}
                  size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                  display="flex"
                >
                  <Box sx={{ width: "100%", p: 2.5, borderRadius: 3 }}>
                    <Skeleton
                      variant="rectangular"
                      height={160}
                      sx={{ borderRadius: 2, mb: 2 }}
                    />
                    <Skeleton
                      variant="text"
                      width="70%"
                      height={32}
                      sx={{ mb: 1 }}
                    />
                    <Skeleton variant="text" width="100%" height={20} />
                    <Skeleton
                      variant="text"
                      width="90%"
                      height={20}
                      sx={{ mb: 1.5 }}
                    />
                    <Skeleton variant="rounded" width={150} height={28} />
                  </Box>
                </Grid>
              ))
            ) : (
              <>
                {canCreateOrchestrators && (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} display="flex">
                    <Fade in={showContent} timeout={1000}>
                      <Box
                        className={styles.card}
                        onClick={() => navigateOrchestrator("new")}
                        sx={{
                          border: "2px dashed",
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          backgroundColor: "transparent !important",
                          "&:hover": {
                            borderColor: alpha(theme.palette.primary.main, 0.6),
                            backgroundColor: `${alpha(theme.palette.primary.main, 0.04)} !important`,
                          },
                        }}
                      >
                        <div className={styles.cardBlank}>
                          <FontAwesomeIcon
                            icon="plus"
                            size="3x"
                            style={{
                              color: theme.palette.primary.main,
                              opacity: 0.7,
                            }}
                          />
                          <Typography
                            sx={{
                              mt: 2,
                              fontWeight: 500,
                              color: "text.secondary",
                              fontSize: "0.95rem",
                            }}
                          >
                            New Orchestrator
                          </Typography>
                        </div>
                      </Box>
                    </Fade>
                  </Grid>
                )}

                {filteredOrchestrators && filteredOrchestrators.length > 0 ? (
                  filteredOrchestrators.map((orchestrator, index) => (
                    <Grid
                      key={orchestrator._id}
                      size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                      display="flex"
                    >
                      <Fade in={showContent} timeout={1000 + index * 100}>
                        <Box
                          className={styles.card}
                          onClick={() => navigateOrchestrator(orchestrator._id)}
                        >
                          <CardLogo
                            cloudType={
                              orchestrator.templateInfo?.cloud || "aws"
                            }
                            className={styles.cloudTypeLogo}
                            mode={theme.palette.mode}
                          />
                          {orchestrator.previewImageUrl ? (
                            <img
                              src={orchestrator.previewImageUrl}
                              alt={
                                orchestrator.templateInfo?.templateName ||
                                "Orchestrator"
                              }
                              className={styles.orchestratorCardImage}
                            />
                          ) : (
                            <Box
                              className={styles.orchestratorCardImage}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "2.5rem",
                                color: alpha(theme.palette.primary.main, 0.5),
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.04,
                                ),
                              }}
                            >
                              <FontAwesomeIcon icon="sitemap" />
                            </Box>
                          )}
                          <Typography
                            variant="h6"
                            className={styles.cardTitle}
                            sx={{
                              fontWeight: 600,
                              fontSize: "1.1rem",
                              mt: 1.5,
                              mb: 0.75,
                            }}
                          >
                            <Link
                              to={`/orchestrator/${orchestrator._id}`}
                              style={{
                                textDecoration: "none",
                                color: "inherit",
                              }}
                              aria-label={`View orchestrator ${orchestrator.templateInfo?.templateName || "Orchestrator"}`}
                            >
                              {orchestrator.templateInfo?.templateName ||
                                "Unnamed Orchestrator"}
                            </Link>
                          </Typography>
                          <Typography
                            variant="body2"
                            className={styles.cardDescription}
                            sx={{ mb: 1.5, lineHeight: 1.5 }}
                          >
                            {orchestrator.templateInfo?.description ||
                              "No description"}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              alignItems: "center",
                              flexWrap: "wrap",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box
                              component="code"
                              sx={{
                                fontSize: "0.8rem",
                                color: "text.secondary",
                                backgroundColor:
                                  theme.palette.mode === "dark"
                                    ? "rgba(255, 255, 255, 0.05)"
                                    : "rgba(0, 0, 0, 0.04)",
                                px: 1.5,
                                py: 0.75,
                                borderRadius: 1,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <FontAwesomeIcon
                                icon="circle-nodes"
                                style={{ fontSize: "0.75rem" }}
                              />
                              {orchestrator.nodeCount} nodes •{" "}
                              {orchestrator.edgeCount} connections
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 0.5,
                                alignItems: "center",
                              }}
                            >
                              <Tooltip
                                title={
                                  orchestrator.templateId
                                    ? "Manage Template"
                                    : "Publish as Template"
                                }
                              >
                                <span>
                                  <IconButton
                                    size="small"
                                    aria-label={
                                      orchestrator.templateId
                                        ? `Manage template for ${orchestrator.templateInfo?.templateName || "orchestrator"}`
                                        : `Publish ${orchestrator.templateInfo?.templateName || "orchestrator"} as template`
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPublishTarget({
                                        orchestratorId: orchestrator._id || "",
                                        orchestratorName:
                                          orchestrator.templateInfo
                                            ?.templateName,
                                        templateId: orchestrator.templateId,
                                      });
                                    }}
                                    sx={{
                                      color: orchestrator.templateId
                                        ? theme.palette.primary.main
                                        : "text.secondary",
                                      fontSize: "0.8rem",
                                      p: 0.5,
                                      borderRadius: 1.5,
                                      opacity: orchestrator.templateId
                                        ? 1
                                        : 0.55,
                                      backgroundColor: alpha(
                                        theme.palette.primary.main,
                                        0.1,
                                      ),
                                      transition: "all 0.2s ease",
                                      "&:hover": {
                                        opacity: 1,
                                        backgroundColor: alpha(
                                          theme.palette.primary.main,
                                          0.2,
                                        ),
                                      },
                                      "&:focus-visible": {
                                        outline: `2px solid ${theme.palette.primary.main}`,
                                        outlineOffset: 2,
                                      },
                                    }}
                                  >
                                    <FontAwesomeIcon
                                      aria-hidden="true"
                                      icon={
                                        orchestrator.templateId
                                          ? "pen"
                                          : "layer-group"
                                      }
                                    />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              {orchestrator.templateId && (
                                <Tooltip title="Unpublish Template">
                                  <span>
                                    <IconButton
                                      size="small"
                                      aria-label={`Unpublish template for ${orchestrator.templateInfo?.templateName || "orchestrator"}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setUnpublishTarget({
                                          templateId: orchestrator.templateId!,
                                          name:
                                            orchestrator.templateInfo
                                              ?.templateName || "this template",
                                        });
                                      }}
                                      sx={{
                                        color: "text.secondary",
                                        fontSize: "0.8rem",
                                        p: 0.5,
                                        borderRadius: 1.5,
                                        opacity: 0.5,
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                          opacity: 1,
                                          color: "error.main",
                                          backgroundColor: alpha(
                                            theme.palette.error.main,
                                            0.08,
                                          ),
                                        },
                                        "&:focus-visible": {
                                          outline: "2px solid",
                                          outlineColor: "error.main",
                                          outlineOffset: 2,
                                        },
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        aria-hidden="true"
                                        icon="eye-slash"
                                      />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Fade>
                    </Grid>
                  ))
                ) : (
                  <Grid size={12}>
                    <Fade in={showContent} timeout={1200}>
                      <Box
                        role="status"
                        aria-live="polite"
                        sx={{
                          p: { xs: 5, sm: 7 },
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
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <FontAwesomeIcon
                          icon="sitemap"
                          size="3x"
                          aria-hidden="true"
                          style={{
                            opacity: 0.25,
                            marginBottom: "16px",
                            color: theme.palette.primary.main,
                          }}
                        />
                        <Typography
                          variant="h6"
                          sx={{ mb: 1, fontWeight: 600 }}
                        >
                          {searchQuery
                            ? "No orchestrators found"
                            : "No orchestrators yet"}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ maxWidth: 360, mx: "auto", lineHeight: 1.6 }}
                        >
                          {searchQuery
                            ? "Try adjusting your search query"
                            : 'Click "New Orchestrator" to create your first infrastructure workflow!'}
                        </Typography>
                      </Box>
                    </Fade>
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </>
      )}

      {/* Publish as Template dialog */}
      {publishTarget && (
        <PublishTemplateDialog
          open={!!publishTarget}
          onClose={() => setPublishTarget(null)}
          orchestratorId={publishTarget.orchestratorId}
          orchestratorName={publishTarget.orchestratorName}
          onSuccess={() => setPublishTarget(null)}
        />
      )}

      {/* Unpublish confirmation dialog */}
      <Dialog
        open={!!unpublishTarget}
        onClose={() => !unpublishLoading && setUnpublishTarget(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
          Unpublish Template?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            This will remove <strong>{unpublishTarget?.name}</strong> from the
            public gallery. Your orchestrator won't be affected — you can
            re-publish it any time.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setUnpublishTarget(null)}
            disabled={unpublishLoading}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleUnpublishConfirm}
            disabled={unpublishLoading}
            startIcon={
              unpublishLoading ? (
                <FontAwesomeIcon
                  icon="spinner"
                  spin
                  style={{ fontSize: "0.75rem" }}
                />
              ) : (
                <FontAwesomeIcon icon="trash" style={{ fontSize: "0.75rem" }} />
              )
            }
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
          >
            {unpublishLoading ? "Removing..." : "Yes, Unpublish"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Home;
