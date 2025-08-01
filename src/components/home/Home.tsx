import React, { useEffect, useState } from "react";
import { Paper, useTheme } from "@mui/material";
import styles from "./Home.module.css";
import apiService from './../../services/apiService';
import awsLogo from './../../assets/aws_logo.svg';
import azLogo from './../../assets/az_logo.svg';
import gcpLogo from './../../assets/gcp_logo.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from "react-router-dom";

interface Card {
  template_id: string;
  label: string;
  description: string;
  image: string;
  cloud_type: string;
}

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
  const [customWrappers, setCustomWrappers] = useState<Card[]>([]);
  const [allWrappers, setAllWrappers] = useState<Card[]>([]);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme.palette.mode);
  }, [theme.palette.mode]);

  useEffect(() => {
    apiService.get('/wrapper/custom').then((data) => {
      setCustomWrappers(data?.data ?? []);
    });
    apiService.get('/wrapper/all').then((data) => {
      setAllWrappers(data?.data ?? []);
    });
  }, []);

  const navigateOrchestrator = (id: string, type: string) => {
    navigate(`/orchestrator/${id}?&template_type=${type}`);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        m: 4,
        p: 4,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      <h3 className={styles.wrapperHeader}>Recently Worked</h3>
      <div className={styles.cardList}>
        {customWrappers.map((card) => (
          <div key={card.template_id} className={styles.card}>
            <CardLogo cloudType={card.cloud_type} className={styles.clouldTypeLogo} />
            <img src={card.image} alt={card.label} className={styles.cardImage} />
            <h3 className={styles.cardTitle} onClick={() => navigateOrchestrator(card.template_id, "custom")}>{card.label}</h3>
            <p className={styles.cardDescription}>{card.description}</p>
          </div>
        ))}
      </div>

      <h3 className={styles.wrapperHeader}>Templates</h3>
      <div className={styles.cardList}>
        <div className={styles.card}>
          <div className={styles.cardBlank}>
            <FontAwesomeIcon icon="plus" size="5x" />
            <p className={styles.cardDescription}>Blank Template</p>
          </div>
        </div>
        {allWrappers.map((card) => (
          <div key={card.template_id} className={styles.card}>
            <CardLogo cloudType={card.cloud_type} className={styles.clouldTypeLogo} />
            <img src={card.image} alt={card.label} className={styles.cardImage} />
            <h3 className={styles.cardTitle} onClick={() => navigateOrchestrator(card.template_id, "all")}>{card.label}</h3>
            <p className={styles.cardDescription}>{card.description}</p>
          </div>
        ))}
      </div>
    </Paper>
  );
};

export default Home;
