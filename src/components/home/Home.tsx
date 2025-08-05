import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Paper, useTheme } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import {
  fetchAllWrappers,
  fetchCustomWrappers,
  fetchResources,
} from "../../store/homeSlice";

import styles from "./Home.module.css";
// import apiService from "./../../services/apiService";
import awsLogo from "./../../assets/aws_logo.svg";
import azLogo from "./../../assets/az_logo.svg";
import gcpLogo from "./../../assets/gcp_logo.svg";

// interface Card {
//   template_id: string;
//   label: string;
//   description: string;
//   image: string;
//   cloud_type: string;
// }

// interface Resources {
//   _id: string;
//   cloudProvider: string;
//   resourceName: string;
//   resourceVersion: string;
//   resourceDescription: string;
//   publishedBy: string;
//   publishedAt: string;
// }

const logoMap: Record<string, string> = {
  aws: awsLogo,
  az: azLogo,
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
  // const [customWrappers, setCustomWrappers] = useState<Card[]>([]);
  // const [allWrappers, setAllWrappers] = useState<Card[]>([]);
  // const [resources, setResources] = useState<Resources[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const { customWrappers, allWrappers, resources } = useSelector(
    (state: RootState) => state.home
  );

  useEffect(() => {
    dispatch(fetchCustomWrappers());
    dispatch(fetchAllWrappers());
    dispatch(fetchResources());
  }, [dispatch]);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme.palette.mode);
  }, [theme.palette.mode]);

  // useEffect(() => {
  //   apiService.get("/wrapper/custom").then((data) => {
  //     setCustomWrappers(data?.data ?? []);
  //   });
  //   apiService.get("/wrapper/all").then((data) => {
  //     setAllWrappers(data?.data ?? []);
  //   });
  //   apiService
  //     .get(
  //       "/configs?fields=_id,cloudProvider,resourceName,resourceVersion,resourceDescription,publishedBy,publishedAt"
  //     )
  //     .then((data) => {
  //       setResources(data ?? []);
  //     });
  // }, []);

  const navigateResource = () => {
    navigate("/resources/new");
  };

  const navigateTemplates = () => {
    navigate("/orchestrator/new");
  };

  return (
    <Box m={4}>
      <h3 className={styles.wrapperHeader}>Recently Worked</h3>
      <div className={styles.cardList}>
        {customWrappers.map((card) => (
          <div key={card.template_id} className={styles.card}>
            <CardLogo
              cloudType={card.cloud_type}
              className={styles.clouldTypeLogo}
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
          </div>
        ))}
      </div>

      <h3 className={styles.wrapperHeader}>Templates</h3>
      <div className={styles.cardList}>
        <Box className={styles.card} onClick={navigateTemplates}>
          <div className={styles.cardBlank}>
            <FontAwesomeIcon icon="plus" size="5x" />
            <p className={styles.cardDescription}>Blank Template</p>
          </div>
        </Box>
        {allWrappers.map((card) => (
          <div key={card.template_id} className={styles.card}>
            <CardLogo
              cloudType={card.cloud_type}
              className={styles.clouldTypeLogo}
            />
            <img
              src={card.image}
              alt={card.label}
              className={styles.cardImage}
            />
            <h3 className={styles.cardTitle}>
              <Link
                to={`/orchestrator/${card.template_id}?&template_type=all`}
                style={{ textDecoration: "none", color: "inherit" }}
                aria-label={`View details for ${card.label}`}
              >
                {card.label}
              </Link>
            </h3>
            <p className={styles.cardDescription}>{card.description}</p>
          </div>
        ))}
      </div>

      <h3 className={styles.wrapperHeader}>Resource</h3>
      <div className={styles.cardList}>
        <Box className={styles.card} onClick={navigateResource}>
          <div className={styles.cardBlank}>
            <FontAwesomeIcon icon="plus" size="5x" />
            <p className={styles.cardDescription}>New Resource</p>
          </div>
        </Box>
        {resources.map((resource) => (
          <div key={resource._id} className={styles.card}>
            <CardLogo
              cloudType={resource.cloudProvider}
              className={styles.clouldTypeLogo}
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
          </div>
        ))}
      </div>
    </Box>
  );
};

export default Home;
