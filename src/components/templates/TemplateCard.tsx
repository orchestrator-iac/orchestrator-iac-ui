import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Tooltip, useTheme, alpha } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { TemplateListItem } from "../../types/template";
import styles from "./Templates.module.css";
import awsLogo from "../../assets/aws_logo.svg";
import azLogo from "../../assets/az_logo.svg";
import gcpLogo from "../../assets/gcp_logo.svg";

const logoMap: Record<string, string> = {
  aws: awsLogo,
  azure: azLogo,
  gcp: gcpLogo,
};

interface TemplateCardProps {
  template: TemplateListItem;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const logoSrc = logoMap[template.cloud || "aws"];

  const handleClick = () => {
    navigate(`/templates/${template.id}`);
  };

  const handleUseTemplate = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/templates/${template.id}`);
  };

  return (
    <Box
      className={styles.card}
      onClick={handleClick}
      role="article"
      aria-label={`Template: ${template.templateName}`}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(); }}
      sx={{ "&:focus-visible": { outline: "2px solid", outlineColor: theme.palette.primary.main, outlineOffset: 2 } }}
    >
      {/* Cloud logo badge */}
      {logoSrc && (
        <img
          src={logoSrc}
          alt={`${template.cloud} logo`}
          className={styles.cloudTypeLogo}
        />
      )}

      {/* Preview image */}
      {template.previewImageUrl ? (
        <img
          src={template.previewImageUrl}
          alt={`Preview of ${template.templateName}`}
          className={styles.templateCardImage}
        />
      ) : (
        <Box
          className={styles.templateCardImage}
          aria-hidden="true"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.5rem",
            color: alpha(theme.palette.primary.main, 0.5),
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <FontAwesomeIcon aria-hidden="true" icon="sitemap" />
        </Box>
      )}

      {/* Title */}
      <Typography
        variant="h6"
        className={styles.cardTitle}
        sx={{ fontWeight: 600, fontSize: "1.05rem", mt: 1, mb: 0.5 }}
      >
        {template.templateName}
      </Typography>

      {/* Description */}
      <Typography
        variant="body2"
        className={styles.cardDescription}
        sx={{ mb: 1.5, flexGrow: 1 }}
      >
        {template.description || "No description"}
      </Typography>

      {/* Author */}
      {template.authorName && (
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", mb: 1, display: "block" }}
        >
          by {template.authorName}
        </Typography>
      )}

      {/* Analytics row */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          alignItems: "center",
          mb: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Tooltip title="Views" arrow>
          <Box
            aria-label={`${template.analytics.viewCount} views`}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.8rem",
              color: "text.secondary",
            }}
          >
            <FontAwesomeIcon aria-hidden="true" icon="eye" style={{ fontSize: "0.75rem" }} />
            {template.analytics.viewCount}
          </Box>
        </Tooltip>
        <Tooltip title="Likes" arrow>
          <Box
            aria-label={`${template.analytics.likeCount} likes`}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.8rem",
              color: template.analytics.isLikedByMe
                ? theme.palette.error.main
                : "text.secondary",
            }}
          >
            <FontAwesomeIcon aria-hidden="true" icon="heart" style={{ fontSize: "0.75rem" }} />
            {template.analytics.likeCount}
          </Box>
        </Tooltip>
        <Tooltip title="Times used" arrow>
          <Box
            aria-label={`Used ${template.analytics.usageCount} times`}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.8rem",
              color: "text.secondary",
            }}
          >
            <FontAwesomeIcon aria-hidden="true" icon="copy" style={{ fontSize: "0.75rem" }} />
            {template.analytics.usageCount}
          </Box>
        </Tooltip>
        <Box
          component="span"
          aria-label={`${template.nodeCount} nodes`}
          sx={{
            fontSize: "0.75rem",
            color: "text.secondary",
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.04)",
            px: 1,
            py: 0.5,
            borderRadius: 1,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <FontAwesomeIcon
            aria-hidden="true"
            icon="circle-nodes"
            style={{ fontSize: "0.7rem" }}
          />
          {template.nodeCount} nodes
        </Box>
      </Box>

      {/* Use Template button */}
      <Button
        variant="outlined"
        size="small"
        onClick={handleUseTemplate}
        aria-label={`View details for template: ${template.templateName}`}
        sx={{
          borderColor: alpha(theme.palette.primary.main, 0.5),
          color: theme.palette.primary.main,
          "&:hover": {
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
          textTransform: "none",
          fontWeight: 500,
          alignSelf: "flex-start",
        }}
      >
        View Details
      </Button>
    </Box>
  );
};

export default TemplateCard;
