import React from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface DiffAlertProps {
  summary: string;
  onDismiss: () => void;
}

/**
 * Yellow drift-notification banner shown when Maestro detects that the user
 * has manually changed the canvas since the last conversation.
 */
const DiffAlert: React.FC<DiffAlertProps> = ({ summary, onDismiss }) => (
  <Alert
    severity="warning"
    icon={<InfoOutlinedIcon fontSize="small" />}
    sx={{ mx: 1, my: 0.5, fontSize: "0.75rem", alignItems: "flex-start" }}
    action={
      <Button color="inherit" size="small" onClick={onDismiss} sx={{ whiteSpace: "nowrap" }}>
        Acknowledged
      </Button>
    }
  >
    <Box>
      <Typography variant="caption" fontWeight={700} display="block">
        Canvas Changes Detected
      </Typography>
      <Typography variant="caption">{summary}</Typography>
    </Box>
  </Alert>
);

export default DiffAlert;
