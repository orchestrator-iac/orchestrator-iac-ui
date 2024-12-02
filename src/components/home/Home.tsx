import React, { useEffect, useState } from "react";
import { useThemeContext } from "./../shared/theme/useThemeContext";
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
  className?: string; // Allow optional className
}

const CardLogo: React.FC<CardLogoProps> = ({ cloudType, className }) => {
  const logoSrc = logoMap[cloudType];

  if (!logoSrc) {
    return <img alt={`${cloudType} logo`} className={className} />;
  }

  return <img src={logoSrc} alt={`${cloudType} logo`} className={className} />;
};


const Home: React.FC = () => {
  const { theme } = useThemeContext();
  const navigate = useNavigate();
  const [customWrappers, setCustomWrappers] = useState<Array<Card>>([]);
  const [allWrappers, setAllWrappers] = useState<Array<Card>>([]);
  const themeClass = theme === 'dark' ? styles.cardListDark : styles.cardListLight;

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
    <>
      <h3 className={`${styles.wrapperHeader} ${themeClass}`}>Recently Worked</h3>
      <div className={`${styles.cardList} ${themeClass}`}>
        {customWrappers.map((card) => (
          <div key={card.template_id} className={styles.card}>
            <CardLogo cloudType={card.cloud_type} className={`${styles.clouldTypeLogo} ${themeClass}`} />
            <img src={card.image} alt={card.label} className={styles.cardImage} />
            <h3 className={styles.cardTitle} onClick={() => navigateOrchestrator(card.template_id, "custom")}>{card.label}</h3>
            <p className={styles.cardDescription}>{card.description}</p>
          </div>
        ))}
      </div>
      <h3 className={`${styles.wrapperHeader} ${themeClass}`}>Templates</h3>
      <div className={`${styles.cardList} ${themeClass}`}>
        <div className={styles.card}>
          <div className={styles.cardBlank}>
            <FontAwesomeIcon icon="plus" size="5x" />
            <p className={styles.cardDescription}>Blank Template</p>
          </div>
        </div>
        {allWrappers.map((card) => (
          <div key={card.template_id} className={styles.card}>
            <CardLogo cloudType={card.cloud_type} className={`${styles.clouldTypeLogo} ${themeClass}`} />
            <img src={card.image} alt={card.label} className={styles.cardImage} />
            <h3 className={styles.cardTitle} onClick={() => navigateOrchestrator(card.template_id, "all")}>{card.label}</h3>
            <p className={styles.cardDescription}>{card.description}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default Home;
