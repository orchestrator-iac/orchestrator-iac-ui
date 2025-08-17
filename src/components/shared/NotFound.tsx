import { Box, Typography } from "@mui/material";

export default function NotFound() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="calc(100vh - 65px);"
    >
      <Typography variant="h3" color="textSecondary">
        404 - Page Not Found
      </Typography>
      <Typography variant="body1" color="textSecondary">
        The page you are looking for doesn't exist.
      </Typography>
    </Box>
  );
}
