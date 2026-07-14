import { keyframes } from "@emotion/react";
import Box from "@mui/material/Box";

const loaderAnim = keyframes`
  0% {
    inset: 0 35px 35px 0;
  }
  12.5% {
    inset: 0 35px 0 0;
  }
  25% {
    inset: 35px 35px 0 0;
  }
  37.5% {
    inset: 35px 0 0 0;
  }
  50% {
    inset: 35px 0 0 35px;
  }
  62.5% {
    inset: 0 0 0 35px;
  }
  75% {
    inset: 0 0 35px 35px;
  }
  87.5% {
    inset: 0 0 35px 0;
  }
  100% {
    inset: 0 35px 35px 0;
  }
`;

type LumaSpinProps = {
  size?: number;
};

const ringSx = {
  position: "absolute",
  borderRadius: "50px",
  boxShadow: "inset 0 0 0 3px",
  animation: `${loaderAnim} 2.5s infinite`,
};

export const LumaSpin = ({ size = 65 }: LumaSpinProps) => (
  <Box
    aria-label="Loading"
    role="progressbar"
    sx={{
      position: "relative",
      width: size,
      aspectRatio: "1 / 1",
    }}
  >
    <Box
      component="span"
      sx={{
        ...ringSx,
        boxShadowColor: "text.primary",
      }}
    />
    <Box
      component="span"
      sx={{
        ...ringSx,
        boxShadowColor: "text.primary",
        animationDelay: "-1.25s",
      }}
    />
  </Box>
);

export default LumaSpin;
