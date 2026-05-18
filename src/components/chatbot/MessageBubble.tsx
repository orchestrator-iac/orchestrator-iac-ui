import React from "react";
import { Avatar, Box, Typography } from "@mui/material";
import type { ChatMessage } from "@/types/chat";
import PlanCard from "./PlanCard";

// Colours for different message types
const DIFF_BG = "#fff8e1";     // warm yellow
const SYSTEM_BG = "#fce4ec";   // light red/pink
const USER_BG = "primary.main";
const ASSISTANT_BG = "grey.100";

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
  const isUser = message.role === "user";
  const isDiff = message.messageType === "diff";
  const isSystem = message.messageType === "system";
  const isPlan = message.messageType === "plan";

  if (isUser) {
    return (
      <Box display="flex" justifyContent="flex-end" mb={1} px={1}>
        <Box
          sx={{
            bgcolor: USER_BG,
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
      {/* Maestro avatar */}
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
          bgcolor: isDiff
            ? DIFF_BG
            : isSystem
            ? SYSTEM_BG
            : ASSISTANT_BG,
          borderRadius: "4px 18px 18px 18px",
          px: 1.5,
          py: 0.75,
          maxWidth: "85%",
          borderLeft: isSystem
            ? "3px solid #e91e63"
            : isDiff
            ? "3px solid #f57c00"
            : "none",
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
          {/* For plan messages the text is the summary; the plan card follows */}
          {isPlan && message.plan ? message.content : message.content}
        </Typography>

        {/* Render PlanCard inline for plan messages */}
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
