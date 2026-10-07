import React from "react";
import { useTheme } from "@mui/material/styles";
import "./BrandLockup.css";

const BrandLockup: React.FC = () => {
  const theme = useTheme();
  const logoSrc =
    theme.palette.mode === "dark" ? "/dark-luminous.svg" : "/full-color.svg";

  return (
    <span className="product-brand-lockup">
      <img
        className="product-brand-lockup__mark"
        src={logoSrc}
        alt=""
        aria-hidden="true"
      />
      <span>Orchestrator</span>
    </span>
  );
};

export default BrandLockup;
