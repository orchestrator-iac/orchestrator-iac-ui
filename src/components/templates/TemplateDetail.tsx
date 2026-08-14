import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Skeleton,
  Fade,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DOMPurify from "dompurify";
import { useAuth } from "../../context/AuthContext";
import { templateService } from "../../services/templateService";
import { TemplateDetail as ITemplateDetail } from "../../types/template";
import styles from "./Templates.module.css";
import awsLogo from "../../assets/aws_logo.svg";
import awsLogoLight from "./../../assets/aws_logo_light.svg";
import awsLogoDark from "./../../assets/aws_logo_dark.svg";
import azLogo from "../../assets/az_logo.svg";
import gcpLogo from "../../assets/gcp_logo.svg";
import PublishTemplateDialog from "../orchestrator/publish-template/PublishTemplateDialog";


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

// ── Pure helpers extracted from the main component to keep its cognitive
// complexity down and to avoid nested ternaries inline in JSX/sx props. ──

const getLikeTooltip = (hasUser: boolean, liked: boolean): string => {
  if (!hasUser) return "Login to like";
  return liked ? "Unlike" : "Like this template";
};

const getLikeAriaLabel = (hasUser: boolean, liked: boolean): string => {
  if (!hasUser) return "Login to like this template";
  return liked ? "Unlike this template" : "Like this template";
};

const getLikeBorderColor = (liked: boolean, isDarkMode: boolean): string => {
  if (!liked) return "divider";
  return isDarkMode ? "rgba(255,100,120,0.5)" : "rgba(220,50,80,0.4)";
};

// ── Small presentational subcomponents extracted from TemplateDetail's JSX.
// Each keeps its own (small) branching logic in its own function scope. ──

interface TemplateMetaRowProps {
  template: ITemplateDetail;
}

const TemplateMetaRow: React.FC<TemplateMetaRowProps> = ({ template }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {template.cloud &&
        <CardLogo cloudType={template.cloud} mode={theme.palette.mode} className={styles.cloudLogo} />
      }
      {template.cloud && (
        <Box component="span" sx={{ color: "text.disabled" }}>
          .
        </Box>
      )}
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          fontSize: "1rem",
        }}
      >
        {template.nodeCount ?? 0} Resources
      </Typography>
      {template.authorName && (
        <>
          <Box component="span" sx={{ color: "text.disabled" }}>
            .
          </Box>
          <Typography
            variant="caption"
            component="span"
            onClick={() =>
              navigate(`/templates?author=${template.userId}`)
            }
            sx={{
              color: "text.secondary",
              cursor: "pointer",
              "&:hover": { color: "text.primary" },
            }}
          >
            by <strong>{template.authorName}</strong>
          </Typography>
        </>
      )}
    </Box>
  );
};

interface TemplateStatsRowProps {
  template: ITemplateDetail;
  likeCount: number;
}

const TemplateStatsRow: React.FC<TemplateStatsRowProps> = ({
  template,
  likeCount,
}) => (
  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
    {[
      {
        icon: "eye",
        val: template.analytics?.viewCount ?? 0,
        label: "views",
      },
      { icon: "heart", val: likeCount, label: "likes" },
      {
        icon: "copy",
        val: template.analytics?.usageCount ?? 0,
        label: "uses",
      },
    ].map(({ icon, val, label }) => (
      <Box
        key={label}
        aria-label={`${val} ${label}`}
        sx={{
          textAlign: "center",
          px: 2,
          py: 1.25,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          minWidth: 68,
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            lineHeight: 1,
            fontSize: "1.5rem",
            letterSpacing: "-0.02em",
          }}
        >
          {val}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
            mt: 0.5,
          }}
        >
          <FontAwesomeIcon
            icon={icon as any}
            aria-hidden="true"
            style={{ fontSize: "0.6rem" }}
          />
          {label}
        </Typography>
      </Box>
    ))}
  </Box>
);

interface TemplateLikeButtonProps {
  liked: boolean;
  likeLoading: boolean;
  onLike: () => void;
}

const TemplateLikeButton: React.FC<TemplateLikeButtonProps> = ({
  liked,
  likeLoading,
  onLike,
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const hasUser = !!user;
  const likeTooltip = getLikeTooltip(hasUser, liked);
  const likeAriaLabel = getLikeAriaLabel(hasUser, liked);

  return (
    <Tooltip title={likeTooltip}>
      <span>
        <IconButton
          onClick={onLike}
          disabled={likeLoading}
          aria-label={likeAriaLabel}
          aria-pressed={liked}
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: getLikeBorderColor(liked, theme.palette.mode === "dark"),
            color: liked ? "error.main" : "text.secondary",
            backgroundColor: liked
              ? alpha(theme.palette.error.main, 0.06)
              : "transparent",
            gap: 0.75,
            px: 1.5,
            py: 0.85,
            transition: "all 0.2s",
            "&:hover": {
              color: "error.main",
              borderColor: "error.main",
              backgroundColor: alpha(theme.palette.error.main, 0.06),
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
            icon={liked ? "heart" : (["far", "heart"] as any)}
          />
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, fontSize: "0.8rem" }}
          >
            {liked ? "Liked" : "Like"}
          </Typography>
        </IconButton>
      </span>
    </Tooltip>
  );
};

interface TemplateUseButtonProps {
  useLoading: boolean;
  templateName: string;
  onUseTemplate: () => void;
}

const TemplateUseButton: React.FC<TemplateUseButtonProps> = ({
  useLoading,
  templateName,
  onUseTemplate,
}) => {
  const theme = useTheme();
  return (
    <Tooltip title="Creates your own editable copy" arrow>
      <span>
        <Button
          variant="contained"
          size="large"
          onClick={onUseTemplate}
          disabled={useLoading}
          aria-label={
            useLoading
              ? "Forking template, please wait"
              : `Use template: ${templateName}`
          }
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            textTransform: "none",
            px: 3,
            py: 1.1,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
              boxShadow: `0 6px 22px ${alpha(theme.palette.primary.main, 0.5)}`,
              transform: "translateY(-1px)",
            },
            "&:focus-visible": {
              outline: "2px solid",
              outlineColor: theme.palette.primary.main,
              outlineOffset: 3,
            },
          }}
        >
          {useLoading ? (
            <FontAwesomeIcon
              aria-hidden="true"
              icon="spinner"
              spin
              style={{ marginRight: 8 }}
            />
          ) : (
            <FontAwesomeIcon
              aria-hidden="true"
              icon="copy"
              style={{ marginRight: 8 }}
            />
          )}
          {useLoading ? "Forking..." : "Use Template"}
        </Button>
      </span>
    </Tooltip>
  );
};

interface TemplateOwnerActionsProps {
  onEditClick: () => void;
  onUnpublishClick: () => void;
}

const TemplateOwnerActions: React.FC<TemplateOwnerActionsProps> = ({
  onEditClick,
  onUnpublishClick,
}) => (
  <Box sx={{ display: "flex", gap: 1 }}>
    <Button
      variant="outlined"
      size="small"
      startIcon={
        <FontAwesomeIcon icon="pen" style={{ fontSize: "0.75rem" }} />
      }
      onClick={onEditClick}
      sx={{
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 600,
      }}
    >
      Edit
    </Button>
    <Button
      variant="outlined"
      color="error"
      size="small"
      startIcon={
        <FontAwesomeIcon icon="eye-slash" style={{ fontSize: "0.75rem" }} />
      }
      onClick={onUnpublishClick}
      sx={{
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 600,
      }}
    >
      Unpublish
    </Button>
  </Box>
);

interface TemplateCanvasPreviewProps {
  template: ITemplateDetail;
  onOpenPreview: () => void;
}

const TemplateCanvasPreview: React.FC<TemplateCanvasPreviewProps> = ({
  template,
  onOpenPreview,
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const isDark = theme.palette.mode === "dark";

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 5,
            height: 28,
            borderRadius: 2,
            background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.25)})`,
            flexShrink: 0,
          }}
        />
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            color: theme.palette.primary.main,
            textTransform: "uppercase",
            fontSize: "0.78rem",
            letterSpacing: "0.14em",
          }}
        >
          Canvas Preview
        </Typography>
      </Box>
      <Box
        sx={{
          mb: 4,
          position: "relative",
          minHeight: 480,
          maxHeight: 620,
          borderRadius: 4,
          overflow: "hidden",
          background: isDark
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
          border: "1.5px solid",
          borderColor: alpha(theme.palette.primary.main, 0.25),
          boxShadow: isDark
            ? `0 0 0 1px ${alpha(theme.palette.primary.main, 0.08)}, 0 24px 60px rgba(0,0,0,0.35)`
            : `0 0 0 1px ${alpha(theme.palette.primary.main, 0.06)}, 0 20px 50px rgba(0,0,0,0.1)`,

          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Preview image */}
        {template.previewImageUrl ? (
          <Box
            component="img"
            src={template.previewImageUrl}
            alt="Canvas preview"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.5,
              opacity: 0.35,
            }}
          >
            <FontAwesomeIcon
              icon="sitemap"
              aria-hidden="true"
              style={{
                fontSize: "3.5rem",
                color: theme.palette.primary.main,
              }}
            />
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontWeight: 500 }}
            >
              {template.nodeCount
                ? `${template.nodeCount} nodes`
                : "No preview available"}
            </Typography>
          </Box>
        )}

        {/* Gradient overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: isDark
              ? "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.82) 100%)"
              : "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.52) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Open button */}
        <Box
          sx={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <Button
            variant="contained"
            size="medium"
            onClick={onOpenPreview}
            startIcon={
              <FontAwesomeIcon
                icon="up-right-from-square"
                style={{ fontSize: "0.8rem" }}
              />
            }
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              px: 3.5,
              py: 1.1,
              fontSize: "0.9rem",
              backgroundColor: isDark
                ? alpha(theme.palette.primary.main, 0.18)
                : alpha(theme.palette.primary.main, 0.75),
              backdropFilter: "blur(12px)",
              color: theme.palette.common.white,
              border: "1px solid",
              borderColor: isDark
                ? alpha(theme.palette.primary.main, 0.4)
                : alpha(theme.palette.common.white, 0.25),
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: isDark
                  ? alpha(theme.palette.primary.main, 0.32)
                  : alpha(theme.palette.primary.main, 0.92),
                boxShadow: "0 6px 28px rgba(0,0,0,0.4)",
                transform: "translateY(-1px)",
              },
            }}
          >
            {user ? "Preview (Read Only)" : "Login to Preview"}
          </Button>
        </Box>
      </Box>
    </>
  );
};

interface TemplateReadmeSectionProps {
  readme?: string;
}

const TemplateReadmeSection: React.FC<TemplateReadmeSectionProps> = ({
  readme,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 5,
            height: 28,
            borderRadius: 2,
            background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.25)})`,
            flexShrink: 0,
          }}
        />
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            color: theme.palette.primary.main,
            textTransform: "uppercase",
            fontSize: "0.78rem",
            letterSpacing: "0.14em",
          }}
        >
          README
        </Typography>
      </Box>
      <Box
        className={styles.readmeContent}
        sx={{
          background: isDark
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, rgba(0,0,0,0) 60%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.025)} 0%, ${alpha(theme.palette.common.white, 0)} 60%)`,
          border: "1.5px solid",
          borderColor: alpha(theme.palette.primary.main, isDark ? 0.15 : 0.1),
          borderRadius: 4,
          p: { xs: 3, sm: 4 },
          minHeight: 220,
          mb: 4,
          boxShadow: `inset 0 1px 0 ${alpha(theme.palette.primary.main, 0.08)}`,
        }}
      >
        {readme ? (
          <Box
            className="note-rich-editor note-readonly"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(readme),
            }}
            sx={{
              fontSize: "0.95rem",
              lineHeight: 1.75,
              wordBreak: "break-word",
            }}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 160,
              gap: 1,
              opacity: 0.45,
            }}
          >
            <FontAwesomeIcon
              icon="file-lines"
              aria-hidden="true"
              style={{ fontSize: "2rem", color: theme.palette.primary.main }}
            />
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontStyle: "italic" }}
            >
              No readme provided.
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
};

const TemplateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const theme = useTheme();

  const [template, setTemplate] = useState<ITemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [useLoading, setUseLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);
  const [unpublishLoading, setUnpublishLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Restore body scroll (Orchestrator page sets overflow:hidden)
  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  // SEO — update meta tags whenever template data loads (or route changes)
  useEffect(() => {
    const prevTitle = document.title;

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

    if (template) {
      const title = `${template.templateName} | Orchestrator`;
      const desc =
        (template.description || "").slice(0, 160) ||
        `A ${(template.cloud || "cloud").toUpperCase()} infrastructure template on Orchestrator.`;
      const url = `https://orchestrator.next-zen.dev/templates/${template.id}`;

      document.title = title;
      set('meta[name="description"]', "content", desc);
      set('meta[name="robots"]', "content", "index, follow");
      set('meta[property="og:title"]', "content", title);
      set('meta[property="og:description"]', "content", desc);
      set('meta[property="og:url"]', "content", url);
      set('meta[property="og:type"]', "content", "article");
      set('link[rel="canonical"]', "href", url);
    } else {
      document.title = "Template | Orchestrator";
      set('meta[name="robots"]', "content", "index, follow");
    }

    return () => {
      document.title = prevTitle;
    };
  }, [template]);

  // Fetch template — one call per mount. AbortController cleanup cancels the
  // inflight request on StrictMode's double-invoke so viewCount increments once.
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setShowContent(false);
    templateService
      .getTemplate(id, controller.signal)
      .then((data) => {
        setTemplate(data);
        setLiked(data.analytics?.isLikedByMe ?? false);
        setLikeCount(data.analytics?.likeCount ?? 0);
        setLoading(false);
        setTimeout(() => setShowContent(true), 50);
      })
      .catch((err: any) => {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED")
          return;
        setError("Failed to load template. It may have been removed.");
        setLoading(false);
      });
    return () => controller.abort();
  }, [id, refreshKey]);

  const handleLike = async () => {
    if (!user) {
      navigate("/login", { state: { redirect: location.pathname } });
      return;
    }
    if (!id || likeLoading) return;
    setLikeLoading(true);
    const optimisticLiked = !liked;
    setLiked(optimisticLiked);
    setLikeCount((prev) => prev + (optimisticLiked ? 1 : -1));
    try {
      const res = await templateService.toggleLike(id);
      setLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch {
      // rollback
      setLiked(!optimisticLiked);
      setLikeCount((prev) => prev + (optimisticLiked ? -1 : 1));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleUseTemplate = async () => {
    if (!user) {
      navigate("/login", { state: { redirect: location.pathname } });
      return;
    }
    if (!id || useLoading) return;
    setUseLoading(true);
    try {
      const res = await templateService.useTemplate(id);
      navigate(`/orchestrator/${res.orchestratorId}?template_type=custom`);
    } catch {
      setUseLoading(false);
    }
  };

  const handleViewInCanvas = () => {
    if (!template) return;
    const dest = `/orchestrator/${template.orchestratorId}?template_type=template`;
    if (!user) {
      navigate("/login", { state: { redirect: dest } });
      return;
    }
    navigate(dest);
  };

  const handleUnpublish = async () => {
    if (!template || unpublishLoading) return;
    setUnpublishLoading(true);
    try {
      await templateService.deleteTemplate(template.id);
      navigate("/templates");
    } catch {
      setUnpublishLoading(false);
      setUnpublishDialogOpen(false);
    }
  };

  const isOwner = !!(
    user &&
    template &&
    user._id &&
    user._id === template.userId
  );

  if (loading) {
    return (
      <Box
        role="status"
        aria-label="Loading template"
        aria-busy="true"
        sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}
      >
        <Skeleton variant="text" width="55%" height={48} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="75%" height={28} sx={{ mb: 1 }} />
        <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
          <Skeleton variant="rounded" width={80} height={24} />
          <Skeleton variant="rounded" width={80} height={24} />
        </Box>
        <Skeleton
          variant="rectangular"
          height={520}
          sx={{ borderRadius: 3, mb: 3 }}
        />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (error || !template) {
    return (
      <Box sx={{ maxWidth: 900, mx: "auto", px: 3, py: 6 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error || "Template not found"}
        </Alert>
        <Button
          startIcon={<FontAwesomeIcon icon="arrow-left" />}
          onClick={() => navigate("/templates")}
          sx={{ mt: 2 }}
        >
          Back to Templates
        </Button>
      </Box>
    );
  }

  return (
    <Fade in={showContent} timeout={600}>
      <Box
        sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: 4 }}
      >
        {/* Header: title + meta LEFT — stats + actions RIGHT */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 3,
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          {/* Left: title + description */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Breadcrumb */}
            <Box
              component="nav"
              aria-label="Breadcrumb"
              sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 2 }}
            >
              <Button
                size="small"
                variant="text"
                onClick={() => navigate("/templates")}
                startIcon={
                  <FontAwesomeIcon
                    icon="arrow-left"
                    aria-hidden="true"
                    style={{ fontSize: "0.7rem" }}
                  />
                }
                sx={{
                  color: "text.secondary",
                  textTransform: "none",
                  p: 0.5,
                  borderRadius: 1.5,
                  fontWeight: 500,
                  "&:hover": { color: "text.primary" },
                  "&:focus-visible": {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 2,
                  },
                }}
              >
                Templates
              </Button>
              <FontAwesomeIcon
                icon="chevron-right"
                aria-hidden="true"
                style={{ fontSize: "0.6rem", opacity: 0.4 }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  mb: 0.5,
                  lineHeight: 1.15,
                  fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
                }}
              >
                {template.templateName}
              </Typography>
            </Box>

            {/* Meta row */}
            <TemplateMetaRow template={template} />

            <Typography
              variant="body1"
              sx={{ color: "text.secondary", mb: 1.5 }}
            >
              {template.description}
            </Typography>
          </Box>

          {/* Right: meta + stats + like + use template + owner actions */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            {/* Stats row */}
            <TemplateStatsRow template={template} likeCount={likeCount} />

            {/* Like + Use Template */}
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <TemplateLikeButton
                liked={liked}
                likeLoading={likeLoading}
                onLike={handleLike}
              />
              <TemplateUseButton
                useLoading={useLoading}
                templateName={template.templateName}
                onUseTemplate={handleUseTemplate}
              />
            </Box>

            {/* Owner actions */}
            {isOwner && (
              <TemplateOwnerActions
                onEditClick={() => setEditDialogOpen(true)}
                onUnpublishClick={() => setUnpublishDialogOpen(true)}
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Canvas Preview — static image + open button */}
        <TemplateCanvasPreview
          template={template}
          onOpenPreview={handleViewInCanvas}
        />

        <Divider sx={{ mb: 3 }} />

        {/* README — full width */}
        <TemplateReadmeSection readme={template.readme} />

        {/* Edit dialog (owner only) */}
        {isOwner && editDialogOpen && (
          <PublishTemplateDialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            orchestratorId={template.orchestratorId}
            existingTemplate={template}
            onSuccess={(templateId) => {
              setEditDialogOpen(false);
              if (templateId) {
                setRefreshKey((k) => k + 1);
              } else {
                navigate("/templates");
              }
            }}
          />
        )}

        {/* Unpublish confirmation dialog */}
        <Dialog
          open={unpublishDialogOpen}
          onClose={() => !unpublishLoading && setUnpublishDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: 3 } } }}
        >
          <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
            Unpublish Template?
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              This will remove <strong>{template.templateName}</strong> from the
              public gallery. Your orchestrator won't be affected — you can
              re-publish it any time.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setUnpublishDialogOpen(false)}
              disabled={unpublishLoading}
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleUnpublish}
              disabled={unpublishLoading}
              startIcon={
                unpublishLoading ? (
                  <FontAwesomeIcon
                    icon="spinner"
                    spin
                    style={{ fontSize: "0.75rem" }}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon="trash"
                    style={{ fontSize: "0.75rem" }}
                  />
                )
              }
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
            >
              {unpublishLoading ? "Removing..." : "Yes, Unpublish"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default TemplateDetail;
