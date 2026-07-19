import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Tooltip, useTheme, alpha } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styles from "./Resources.module.css";
import OverflowTooltipText from "../shared/OverflowTooltipText";
import ResourceIconView from "../shared/ResourceIconView";
import awsLogo from "../../assets/aws_logo.svg";
import awsLogoLight from "../../assets/aws_logo_light.svg";
import awsLogoDark from "../../assets/aws_logo_dark.svg";
import azLogo from "../../assets/az_logo.svg";
import gcpLogo from "../../assets/gcp_logo.svg";
import {
  hasRenderableResourceIcon,
  ResourceIconValue,
} from "@/types/resourceIcon";

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
  resourceIcon?: ResourceIconValue;
  resourceId: string;
}

interface ResourceCardProps {
  resource: ResourceItem;
  // Gallery-only derived values (not part of the raw API/ResourceItem
  // shape) so other consumers of ResourceItem, e.g. a resource detail
  // page, aren't coupled to gallery-specific popularity concerns.
  usageCount?: number;
  isPopular?: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  usageCount,
  isPopular,
}) => {
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
      {hasRenderableResourceIcon(resource.resourceIcon) ? (
        <ResourceIconView
          icon={resource.resourceIcon}
          alt={resource.resourceName}
          className={styles.cardImage}
          sx={{
            width: "100%",
            height: "200px"
          }}
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

      {/* Version badge + Popular badge */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
          mt: "auto",
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
            alignSelf: "flex-start",
          }}
        >
          <FontAwesomeIcon icon="tag" style={{ fontSize: "0.7rem" }} />
          v{resource.resourceVersion}
        </Box>

        {isPopular && (
          <Tooltip title={`Used in ${usageCount} orchestrators`} arrow>
            <Box
              aria-label={`Popular: used in ${usageCount} orchestrators`}
              sx={{
                fontSize: "0.8rem",
                color: theme.palette.secondary.main,
                backgroundColor: alpha(theme.palette.secondary.main, 0.14),
                px: 1.5,
                py: 0.75,
                borderRadius: 1,
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                fontWeight: 600,
              }}
            >
              <FontAwesomeIcon aria-hidden="true" icon="fire" style={{ fontSize: "0.7rem" }} />
              Popular
            </Box>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default ResourceCard;
