import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
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
import azLogo from "../../assets/az_logo.svg";
import gcpLogo from "../../assets/gcp_logo.svg";
import PublishTemplateDialog from "../orchestrator/publish-template/PublishTemplateDialog";

const logoMap: Record<string, string> = {
  aws: awsLogo,
  azure: azLogo,
  gcp: gcpLogo,
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
        el = document.createElement(sel.startsWith("link") ? "link" : "meta") as any;
        document.head.appendChild(el!);
      }
      el!.setAttribute(attr, val);
    };

    if (template) {
      const title = `${template.templateName} | Orchestrator`;
      const desc = (template.description || "").slice(0, 160) ||
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

    return () => { document.title = prevTitle; };
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
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
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

  const isOwner = !!(user && template && user._id && user._id === template.userId);
  const logoSrc = template ? logoMap[template.cloud || ""] : null;

  if (loading) {
    return (
      <Box
        role="status"
        aria-label="Loading template"
        aria-busy="true"
        sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}
      >
        <Skeleton variant="text" width={300} height={48} sx={{ mb: 2 }} />
        <Skeleton variant="text" width={500} height={28} sx={{ mb: 1 }} />
        <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
          <Skeleton variant="rounded" width={80} height={24} />
          <Skeleton variant="rounded" width={80} height={24} />
        </Box>
        <Skeleton variant="rectangular" height={520} sx={{ borderRadius: 3, mb: 3 }} />
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
      <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
        {/* Breadcrumb */}
        <Box
          component="nav"
          aria-label="Breadcrumb"
          sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 3 }}
        >
          <Button
            size="small"
            variant="text"
            onClick={() => navigate("/templates")}
            startIcon={<FontAwesomeIcon icon="arrow-left" aria-hidden="true" style={{ fontSize: "0.7rem" }} />}
            sx={{
              color: "text.secondary",
              textTransform: "none",
              p: 0.5,
              borderRadius: 1.5,
              fontWeight: 500,
              "&:hover": { color: "text.primary" },
              "&:focus-visible": {
                outline: `2px solid ${theme.palette.mode === "dark" ? "#7dd3d3" : "#1a5757"}`,
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
          <Typography variant="body2" noWrap sx={{ maxWidth: 300, color: "text.primary", fontWeight: 500 }}>
            {template.templateName}
          </Typography>
        </Box>

        {/* Header: title + meta LEFT — stats + actions RIGHT */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3, mb: 3, flexWrap: "wrap" }}>
          {/* Left: title, description, chips */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, letterSpacing: "-0.03em", mb: 0.5, lineHeight: 1.2 }}
            >
              {template.templateName}
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", mb: 1.5 }}>
              {template.description}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
              {logoSrc && (
                <Chip
                  icon={<img src={logoSrc} alt="" style={{ width: 16, height: 16, borderRadius: 2 }} />}
                  label={template.cloud?.toUpperCase()}
                  size="small"
                  variant="outlined"
                  sx={{ textTransform: "uppercase", fontSize: "0.7rem" }}
                />
              )}
              <Chip
                icon={<FontAwesomeIcon icon="circle-nodes" style={{ fontSize: "0.65rem" }} />}
                label={`${template.nodeCount ?? 0} nodes`}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem" }}
              />
              {template.authorName && (
                <Typography variant="caption" sx={{ color: "text.secondary", ml: 0.5 }}>
                  by <strong>{template.authorName}</strong>
                </Typography>
              )}
            </Box>
          </Box>

          {/* Right: stats + like + use template + owner actions */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1.5, flexShrink: 0 }}>
            {/* Stats row */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {[
                { icon: "eye", val: template.analytics?.viewCount ?? 0, label: "views" },
                { icon: "heart", val: likeCount, label: "likes" },
                { icon: "copy", val: template.analytics?.usageCount ?? 0, label: "uses" },
              ].map(({ icon, val, label }) => (
                <Box
                  key={label}
                  aria-label={`${val} ${label}`}
                  sx={{
                    textAlign: "center",
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? alpha("#fff", 0.04)
                        : alpha("#000", 0.03),
                    minWidth: 56,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, fontSize: "1.1rem" }}>
                    {val}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mt: 0.25 }}
                  >
                    <FontAwesomeIcon icon={icon as any} aria-hidden="true" style={{ fontSize: "0.6rem" }} />
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Like + Use Template */}
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              {(() => {
                const likeTooltip = user ? (liked ? "Unlike" : "Like this template") : "Login to like";
                const likeAriaLabel = user
                  ? liked ? "Unlike this template" : "Like this template"
                  : "Login to like this template";
                return (
                  <Tooltip title={likeTooltip}>
                    <span>
                      <IconButton
                        onClick={handleLike}
                        disabled={likeLoading}
                        aria-label={likeAriaLabel}
                    aria-pressed={liked}
                    sx={{
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: liked
                        ? (theme.palette.mode === "dark" ? "rgba(255,100,120,0.5)" : "rgba(220,50,80,0.4)")
                        : "divider",
                      color: liked ? "error.main" : "text.secondary",
                      backgroundColor: liked ? alpha(theme.palette.error.main, 0.06) : "transparent",
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
                    <FontAwesomeIcon aria-hidden="true" icon={liked ? "heart" : ["far", "heart"] as any} />
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                      {liked ? "Liked" : "Like"}
                    </Typography>
                  </IconButton>
                </span>
              </Tooltip>
                );
              })()}

              <Button
                variant="contained"
                size="large"
                onClick={handleUseTemplate}
                disabled={useLoading}
                aria-label={useLoading ? "Forking template, please wait" : `Use template: ${template.templateName}`}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: "none",
                  px: 3,
                  backgroundColor: theme.palette.mode === "dark" ? "#4bbebe" : "#1a5757",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: theme.palette.mode === "dark" ? "#6dd0d0" : "#256969",
                  },
                  "&:focus-visible": {
                    outline: "2px solid",
                    outlineColor: theme.palette.mode === "dark" ? "#7dd3d3" : "#1a5757",
                    outlineOffset: 3,
                  },
                }}
              >
                {useLoading
                  ? <FontAwesomeIcon aria-hidden="true" icon="spinner" spin style={{ marginRight: 8 }} />
                  : <FontAwesomeIcon aria-hidden="true" icon="copy" style={{ marginRight: 8 }} />}
                {useLoading ? "Forking..." : "Use Template"}
              </Button>
            </Box>

            {/* Owner actions */}
            {isOwner && (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FontAwesomeIcon icon="pen" style={{ fontSize: "0.75rem" }} />}
                  onClick={() => setEditDialogOpen(true)}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<FontAwesomeIcon icon="eye-slash" style={{ fontSize: "0.75rem" }} />}
                  onClick={() => setUnpublishDialogOpen(true)}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                >
                  Unpublish
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Canvas Preview — static image + open button */}
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, mb: 1.5, color: "text.secondary", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.08em" }}
        >
          Canvas Preview
        </Typography>
        <Box
          sx={{
            mb: 3,
            position: "relative",
            height: `calc(100vh * 0.8)`,
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: theme.palette.mode === "dark" ? alpha("#fff", 0.02) : alpha("#000", 0.015),
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
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.4 }}>
              {template.nodeCount
                ? `${template.nodeCount} node${template.nodeCount !== 1 ? "s" : ""}${template.edgeCount ? `, ${template.edgeCount} connection${template.edgeCount !== 1 ? "s" : ""}` : ""}`
                : "No preview available"}
            </Typography>
          )}

          {/* Gradient overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                theme.palette.mode === "dark"
                  ? "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.72) 100%)"
                  : "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.45) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Open button */}
          <Box
            sx={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <Button
              variant="contained"
              size="medium"
              onClick={handleViewInCanvas}
              startIcon={<FontAwesomeIcon icon="up-right-from-square" style={{ fontSize: "0.8rem" }} />}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.55)",
                backdropFilter: "blur(8px)",
                color: "#fff",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.72)",
                  boxShadow: "none",
                },
              }}
            >
              {user ? "Open in Canvas" : "Login to View"}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* README — full width */}
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, mb: 1.5, color: "text.secondary", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.08em" }}
        >
          README
        </Typography>
        <Box
          className={styles.readmeContent}
          sx={{
            backgroundColor: theme.palette.mode === "dark" ? alpha("#fff", 0.03) : alpha("#000", 0.015),
            border: "1px solid",
            borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
            borderRadius: 3,
            p: { xs: 2.5, sm: 3.5 },
            minHeight: 220,
            mb: 4,
          }}
        >
          {template.readme ? (
            <Box
              className="note-rich-editor note-readonly"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(template.readme) }}
              sx={{ fontSize: "0.95rem", lineHeight: 1.75, wordBreak: "break-word" }}
            />
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
              No readme provided.
            </Typography>
          )}
        </Box>

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
              This will remove <strong>{template.templateName}</strong> from the public gallery.
              Your orchestrator won't be affected — you can re-publish it any time.
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
                unpublishLoading
                  ? <FontAwesomeIcon icon="spinner" spin style={{ fontSize: "0.75rem" }} />
                  : <FontAwesomeIcon icon="trash" style={{ fontSize: "0.75rem" }} />
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
