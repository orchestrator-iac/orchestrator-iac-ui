import { keyframes } from "@emotion/react";
import Box from "@mui/material/Box";

const loaderAnim = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

type LumaSpinProps = {
  size?: number;
};

const ringSx = {
  position: "absolute",
  inset: 0,
  boxSizing: "border-box",
  border: "2px solid",
  borderColor: "color-mix(in srgb, var(--product-accent) 22%, transparent)",
  borderTopColor: "var(--product-accent-strong)",
  borderRightColor: "var(--product-accent-strong)",
  borderRadius: "50%",
  animation: `${loaderAnim} 900ms cubic-bezier(0.16, 1, 0.3, 1) infinite`,
};

export const LumaSpin = ({ size = 65 }: LumaSpinProps) => (
  <Box
    aria-label="Loading"
    role="progressbar"
    sx={{
      position: "relative",
      display: "block",
      width: size,
      height: size,
      flexShrink: 0,
    }}
  >
    <Box
      component="span"
      sx={ringSx}
    />
  </Box>
);

export default LumaSpin;
