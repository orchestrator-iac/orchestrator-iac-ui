import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, useTheme, alpha } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styles from "./Resources.module.css";
import OverflowTooltipText from "../shared/OverflowTooltipText";
import awsLogo from "../../assets/aws_logo.svg";
import awsLogoLight from "../../assets/aws_logo_light.svg";
import awsLogoDark from "../../assets/aws_logo_dark.svg";
import azLogo from "../../assets/az_logo.svg";
import gcpLogo from "../../assets/gcp_logo.svg";

const logoMap: Record<string, { light: string; dark: string; default: string }> = {
  aws: { light: awsLogoLight, dark: awsLogoDark, default: awsLogo },
  azure: { light: azLogo, dark: azLogo, default: azLogo },
  gcp: { light: gcpLogo, dark: gcpLogo, default: gcpLogo },
};

export interface ResourceItem {
  _id: string;
  cloudProvider: string;
  resourceName: string;
  resourceVersion: string;
  resourceDescription: string;
  publishedBy?: string;
  publishedAt?: string;
  resourceIcon?: { id: string; url: string };
  resourceId: string;
}

interface ResourceCardProps {
  resource: ResourceItem;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const logo = logoMap[resource.cloudProvider];
  let logoSrc: string | undefined;
  if (logo) {
    logoSrc = theme.palette.mode === "dark" ? logo.dark : logo.light;
  }

  const handleClick = () => navigate(`/resources/${resource._id}`);

  return (
    <Box
      className={styles.card}
      onClick={handleClick}
      role="article"
      aria-label={`Resource: ${resource.resourceName}`}
      tabIndex={0}
      data-tour="resources-first-card"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
      sx={{
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: theme.palette.primary.main,
          outlineOffset: 2,
        },
      }}
    >
      {/* Cloud logo badge */}
      {logoSrc && (
        <img
          src={logoSrc}
          alt={`${resource.cloudProvider} logo`}
          className={styles.cloudTypeLogo}
        />
      )}

      {/* Resource icon */}
      {resource.resourceIcon?.url ? (
        <img
          src={resource.resourceIcon.url}
          alt={resource.resourceName}
          className={styles.cardImage}
        />
      ) : (
        <Box
          className={styles.cardImage}
          aria-hidden="true"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.5rem",
            color: alpha(theme.palette.secondary.main, 0.82),
            // backgroundColor: alpha(theme.palette.tertiary.main, 0.22),
          }}
        >
          <FontAwesomeIcon icon="cube" />
        </Box>
      )}

      {/* Name */}
      <Typography
        variant="h6"
        className={styles.cardTitle}
        sx={{ fontWeight: 600, fontSize: "1rem", mt: 1.5, mb: 0.5 }}
      >
        {resource.resourceName}
      </Typography>

      {/* Description */}
      <OverflowTooltipText
        text={resource.resourceDescription || "No description"}
        component="p"
        className={styles.cardDescription}
        sx={{
          mb: 1.5,
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 2,
          lineClamp: 2,
          whiteSpace: "normal",
          overflow: "hidden",
          textOverflow: "unset",
        }}
      />

      {/* Version badge */}
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
          alignSelf: "flex-start",
          mt: "auto",
        }}
      >
        <FontAwesomeIcon icon="tag" style={{ fontSize: "0.7rem" }} />
        v{resource.resourceVersion}
      </Box>
    </Box>
  );
};

export default ResourceCard;
