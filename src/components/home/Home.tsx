import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";

import { fetchCustomWrappers } from "../../store/customWrappersSlice";
import { fetchWrappersTemplate } from "../../store/wrappersTemplateSlice";
import { fetchResources } from "../../store/resourcesSlice";

import styles from "./Home.module.css";
import awsLogo from "./../../assets/aws_logo.svg";
import azLogo from "./../../assets/az_logo.svg";
import gcpLogo from "./../../assets/gcp_logo.svg";

const API_HOST_URL = import.meta.env.VITE_API_HOST_URL;

const logoMap: Record<string, string> = {
  aws: awsLogo,
  azure: azLogo,
  gcp: gcpLogo,
};

interface CardLogoProps {
  cloudType: string;
  className?: string;
}

const CardLogo: React.FC<CardLogoProps> = ({ cloudType, className }) => {
  const logoSrc = logoMap[cloudType];
  return <img src={logoSrc} alt={`${cloudType} logo`} className={className} />;
};

const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { data: customWrappers, status: customWrappersStatus } = useSelector(
    (state: RootState) => state.customWrappers
  );
  const { data: wrappersTemplate, status: wrappersTemplateStatus } = useSelector(
    (state: RootState) => state.wrappersTemplate
  );
  const { data: resources, status: resourcesStatus } = useSelector(
    (state: RootState) => state.resources
  );

  useEffect(() => {
    if (customWrappersStatus === "idle") dispatch(fetchCustomWrappers());
    if (wrappersTemplateStatus === "idle") dispatch(fetchWrappersTemplate());
    if (resourcesStatus === "idle") dispatch(fetchResources());
  }, [dispatch, customWrappersStatus, wrappersTemplateStatus, resourcesStatus]);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme.palette.mode);
  }, [theme.palette.mode]);

  const navigateResource = (resourceId: string | undefined) => {
    navigate(`/resources/${resourceId ?? "new"}`);
  };

  const navigateTemplates = (templateID: string | undefined) => {
    navigate(`/orchestrator/${templateID ?? "new"}`);
  };

  return (
    <Box m={4}>
      {/* ===== RECENTLY WORKED ===== */}
      {customWrappers?.length > 0 && (
        <>
          <h3 className={styles.wrapperHeader}>Recently Worked</h3>
          <Grid
            container
            columns={{ xs: 4, sm: 8, md: 12 }}
            spacing={1}
            alignItems="stretch"
          >
            {customWrappers.map((card) => (
              <Grid
                key={card.template_id}
                size={{ xs: 12, sm: 6, md: 4, lg: 2 }}
                display="flex"
              >
                <Box className={styles.card}>
                  <CardLogo
                    cloudType={card.cloud_type}
                    className={styles.cloudTypeLogo}
                  />
                  <img
                    src={card.image}
                    alt={card.label}
                    className={styles.cardImage}
                  />
                  <h3 className={styles.cardTitle}>
                    <Link
                      to={`/orchestrator/${card.template_id}?&template_type=custom`}
                      style={{ textDecoration: "none", color: "inherit" }}
                      aria-label={`View details for ${card.label}`}
                    >
                      {card.label}
                    </Link>
                  </h3>
                  <p className={styles.cardDescription}>{card.description}</p>
                </Box>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* ===== TEMPLATES ===== */}
      <h3 className={styles.wrapperHeader}>Templates</h3>
      <Grid
        container
        columns={{ xs: 4, sm: 8, md: 12 }}
        spacing={1}
        alignItems="stretch"
      >
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} display="flex">
          <Box className={styles.card} onClick={() => navigateTemplates(undefined)}>
            <div className={styles.cardBlank}>
              <FontAwesomeIcon icon="plus" size="5x" />
              <p className={styles.cardDescription}>Blank Template</p>
            </div>
          </Box>
        </Grid>

        {wrappersTemplate.map((card) => (
          <Grid
            key={card._id}
            size={{ xs: 12, sm: 6, md: 4, lg: 2 }}
            display="flex"
          >
            <Box className={styles.card} onClick={() => navigateTemplates(card._id)}>
              <CardLogo
                cloudType={card.cloud_type}
                className={styles.cloudTypeLogo}
              />
              <img
                src={card?.resourceIcon?.url}
                alt={card.label}
                className={styles.cardImage}
              />
              <h3 className={styles.cardTitle}>{card.label}</h3>
              <p className={styles.cardDescription}>{card.description}</p>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* ===== RESOURCES ===== */}
      <h3 className={styles.wrapperHeader}>Resources</h3>
      <Grid
        container
        columns={{ xs: 4, sm: 8, md: 12 }}
        spacing={1}
        alignItems="stretch"
        sx={{ pb: 4 }}
      >
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} display="flex">
          <Box className={styles.card} onClick={() => navigateResource(undefined)}>
            <div className={styles.cardBlank}>
              <FontAwesomeIcon icon="plus" size="5x" />
              <p className={styles.cardDescription}>New Resource</p>
            </div>
          </Box>
        </Grid>

        {resources.map((resource) => (
          <Grid
            key={resource._id}
            size={{ xs: 12, sm: 6, md: 4, lg: 2 }}
            display="flex"
          >
            <Box
              className={styles.card}
              onClick={() => navigateResource(resource._id)}
            >
              <CardLogo
                cloudType={resource.cloudProvider}
                className={styles.cloudTypeLogo}
              />
              <img
                src={`${API_HOST_URL}${resource?.resourceIcon?.url}`}
                alt={resource.resourceName}
                className={styles.cardImage}
              />
              <h2 className={styles.cardTitle}>
                <Link
                  to={`/resources/${resource._id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                  aria-label={`View details for ${resource.resourceName}`}
                >
                  {resource.resourceName}
                </Link>
              </h2>
              <p className={styles.cardDescription}>
                {resource.resourceDescription}
              </p>
              <code>Version - {resource.resourceVersion}</code>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;
