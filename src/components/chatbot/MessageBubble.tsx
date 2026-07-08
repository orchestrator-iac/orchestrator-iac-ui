import React from "react";
import { Avatar, Box, Typography } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import ReactMarkdown from "react-markdown";
import type {
  ChatMessage,
  PlanImplementationAction,
  PlanSchema,
} from "@/types/chat";
import PlanCard from "./PlanCard";
import MaestroRobot, { type MaestroRobotState } from "./MaestroRobot";

interface MessageBubbleProps {
  message: ChatMessage;
  sessionId: string;
  linkedOrchestratorId?: string;
  onImplement?: (
    sessionId: string,
    action: PlanImplementationAction,
    plan: PlanSchema,
  ) => void;
  isImplementing?: boolean;
  assistantAvatarState?: MaestroRobotState;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  sessionId,
  linkedOrchestratorId,
  onImplement,
  isImplementing = false,
  assistantAvatarState = "idle",
}) => {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const avatarBg = dark
    ? theme.palette.tertiary.dark
    : alpha(theme.palette.primary.main, 0.1);
  const avatarBorder = dark
    ? `1px solid ${alpha(theme.palette.primary.light, 0.32)}`
    : `1px solid ${alpha(theme.palette.primary.main, 0.14)}`;
  const robotColor = dark
    ? theme.palette.secondary.light
    : theme.palette.primary.dark;

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
            borderRadius: "8px 8px 0px 8px",
            p: 0.75,
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
          width: 32,
          height: 32,
          bgcolor: avatarBg,
          border: avatarBorder,
          flexShrink: 0,
          mt: 0.25,
        }}
      >
        <MaestroRobot
          state={assistantAvatarState}
          size={20}
          decorative
          robotColor={robotColor}
        />
      </Avatar>

      <Box
        sx={{
          bgcolor: bubbleBg,
          borderRadius: "0px 8px 8px 8px",
          p: 0.75,
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

        <Box
          sx={{
            fontSize: "0.875rem",
            lineHeight: 1.5,
            "& > *": { my: 0.5 },
            "& h1, & h2, & h3, & h4, & h5, & h6": {
              fontWeight: 700,
              my: 0.75,
              fontSize: "inherit",
            },
            "& h1": { fontSize: "1.2rem" },
            "& h2": { fontSize: "1.1rem" },
            "& h3": { fontSize: "1rem" },
            "& strong": { fontWeight: 700 },
            "& em": { fontStyle: "italic" },
            "& ul, & ol": { pl: 2, my: 0.5 },
            "& li": { my: 0.25 },
            "& code": {
              bgcolor: dark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
              px: 0.5,
              py: 0.25,
              borderRadius: 0.5,
              fontFamily: "monospace",
              fontSize: "0.85em",
            },
            "& pre": {
              bgcolor: dark ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.05)",
              p: 1,
              borderRadius: 1,
              overflow: "auto",
              my: 0.5,
            },
            "& pre code": {
              bgcolor: "transparent",
              px: 0,
              py: 0,
            },
            "& blockquote": {
              borderLeft: `3px solid ${theme.palette.divider}`,
              pl: 1,
              ml: 0,
              my: 0.5,
              opacity: 0.8,
            },
            "& a": {
              color: theme.palette.primary.main,
              textDecoration: "underline",
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8,
              },
            },
          }}
        >
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </Box>

        {isPlan && message.plan && (
          <PlanCard
            plan={message.plan}
            sessionId={sessionId}
            linkedOrchestratorId={linkedOrchestratorId}
            onImplement={onImplement}
            isImplementing={isImplementing}
          />
        )}
      </Box>
    </Box>
  );
};

export default MessageBubble;

