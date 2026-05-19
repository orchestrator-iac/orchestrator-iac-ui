import React from "react";
import { Avatar, Box, Typography } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import type { ChatMessage } from "@/types/chat";
import PlanCard from "./PlanCard";

interface MessageBubbleProps {
  message: ChatMessage;
  sessionId: string;
  onImplement?: (sessionId: string) => void;
  isImplementing?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  sessionId,
  onImplement,
  isImplementing = false,
}) => {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";

  const isUser = message.role === "user";
  const isDiff = message.messageType === "diff";
  const isSystem = message.messageType === "system";
  const isPlan = message.messageType === "plan";

  // Theme-aware surface colours
  const assistantBg = theme.palette.background.paper;
  const diffBg = alpha(theme.palette.warning.main, dark ? 0.13 : 0.1);
  const systemBg = alpha(theme.palette.error.main, dark ? 0.12 : 0.08);

  let bubbleBg = assistantBg;
  if (isDiff) bubbleBg = diffBg;
  else if (isSystem) bubbleBg = systemBg;

  let borderLeft = "none";
  if (isSystem) borderLeft = `3px solid ${theme.palette.error.main}`;
  else if (isDiff) borderLeft = `3px solid ${theme.palette.warning.main}`;

  if (isUser) {
    return (
      <Box display="flex" justifyContent="flex-end" mb={1} px={1}>
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            borderRadius: "18px 18px 4px 18px",
            px: 1.5,
            py: 0.75,
            maxWidth: "80%",
          }}
        >
          <Typography variant="body2">{message.content}</Typography>
        </Box>
      </Box>
    );
  }

  // Assistant messages
  return (
    <Box display="flex" alignItems="flex-start" mb={1} px={1} gap={1}>
      <Avatar
        sx={{
          width: 28,
          height: 28,
          bgcolor: "primary.dark",
          fontSize: "0.7rem",
          fontWeight: 700,
          flexShrink: 0,
          mt: 0.5,
        }}
      >
        M
      </Avatar>

      <Box
        sx={{
          bgcolor: bubbleBg,
          borderRadius: "4px 18px 18px 18px",
          px: 1.5,
          py: 0.75,
          maxWidth: "85%",
          borderLeft,
        }}
      >
        {isSystem && (
          <Typography
            variant="caption"
            color="error"
            fontWeight={700}
            display="block"
            mb={0.25}
          >
            SAFETY NOTICE
          </Typography>
        )}

        <Typography variant="body2" whiteSpace="pre-wrap">
          {message.content}
        </Typography>

        {isPlan && message.plan && (
          <PlanCard
            plan={message.plan}
            sessionId={sessionId}
            onImplement={onImplement}
            isImplementing={isImplementing}
          />
        )}
      </Box>
    </Box>
  );
};

export default MessageBubble;

