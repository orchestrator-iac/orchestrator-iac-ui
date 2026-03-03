import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Tooltip, useTheme } from "@mui/material";
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
    <Box className={styles.card} onClick={handleClick}>
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
          alt={template.templateName}
          className={styles.templateCardImage}
        />
      ) : (
        <Box
          className={styles.templateCardImage}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.5rem",
            color:
              theme.palette.mode === "dark"
                ? "rgba(136, 207, 207, 0.5)"
                : "rgba(32, 90, 90, 0.4)",
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(136, 207, 207, 0.05)"
                : "rgba(32, 90, 90, 0.03)",
          }}
        >
          <FontAwesomeIcon icon="sitemap" />
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
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.8rem",
              color: "text.secondary",
            }}
          >
            <FontAwesomeIcon icon="eye" style={{ fontSize: "0.75rem" }} />
            {template.analytics.viewCount}
          </Box>
        </Tooltip>
        <Tooltip title="Likes" arrow>
          <Box
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
            <FontAwesomeIcon icon="heart" style={{ fontSize: "0.75rem" }} />
            {template.analytics.likeCount}
          </Box>
        </Tooltip>
        <Tooltip title="Times used" arrow>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.8rem",
              color: "text.secondary",
            }}
          >
            <FontAwesomeIcon icon="copy" style={{ fontSize: "0.75rem" }} />
            {template.analytics.usageCount}
          </Box>
        </Tooltip>
        <Box
          component="code"
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
        sx={{
          borderColor:
            theme.palette.mode === "dark"
              ? "rgba(136, 207, 207, 0.5)"
              : "rgba(32, 90, 90, 0.4)",
          color:
            theme.palette.mode === "dark" ? "#88cfcf" : "#205a5a",
          "&:hover": {
            borderColor:
              theme.palette.mode === "dark" ? "#88cfcf" : "#205a5a",
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(136, 207, 207, 0.1)"
                : "rgba(32, 90, 90, 0.05)",
          },
          textTransform: "none",
          fontWeight: 500,
          alignSelf: "flex-start",
        }}
      >
        Use Template
      </Button>
    </Box>
  );
};

export default TemplateCard;
