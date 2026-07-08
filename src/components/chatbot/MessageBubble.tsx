import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import { useTheme, alpha } from "@mui/material/styles";
import ReactMarkdown from "react-markdown";
import type {
  ChatMessage,
  ChatMessageFeedbackRequest,
  MessageFeedbackSentiment,
  PlanImplementationAction,
  PlanSchema,
} from "@/types/chat";
import PlanCard from "./PlanCard";
import MaestroRobot, { type MaestroRobotState } from "./MaestroRobot";
import MessageFeedbackDialog from "./MessageFeedbackDialog";

interface MessageBubbleProps {
  message: ChatMessage;
  sessionId: string;
  linkedOrchestratorId?: string;
  onImplement?: (
    sessionId: string,
    action: PlanImplementationAction,
    plan: PlanSchema,
  ) => void;
  onSubmitFeedback?: (
    messageId: string,
    feedback: ChatMessageFeedbackRequest,
  ) => Promise<void>;
  isImplementing?: boolean;
  assistantAvatarState?: MaestroRobotState;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  sessionId,
  linkedOrchestratorId,
  onImplement,
  onSubmitFeedback,
  isImplementing = false,
  assistantAvatarState = "idle",
}) => {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const prefersNoHover = useMediaQuery("(hover: none)");
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [pendingSentiment, setPendingSentiment] =
    useState<MessageFeedbackSentiment>("positive");
  const robotColor = dark
    ? theme.palette.secondary.light
    : theme.palette.primary.dark;

  const isUser = message.role === "user";
  const isDiff = message.messageType === "diff";
  const isSystem = message.messageType === "system";
  const isPlan = message.messageType === "plan";
  const canCollectFeedback = !isUser && !isSystem;

  const assistantBg = theme.palette.background.paper;
  const diffBg = alpha(theme.palette.warning.main, dark ? 0.13 : 0.1);
  const systemBg = alpha(theme.palette.error.main, dark ? 0.12 : 0.08);

  let bubbleBg = assistantBg;
  if (isDiff) bubbleBg = diffBg;
  else if (isSystem) bubbleBg = systemBg;

  let borderLeft = "none";
  if (isSystem) borderLeft = `3px solid ${theme.palette.error.main}`;
  else if (isDiff) borderLeft = `3px solid ${theme.palette.warning.main}`;

  const selectedSentiment = message.feedback?.sentiment;
  const showMetaRow =
    canCollectFeedback &&
    (prefersNoHover ||
      isHovered ||
      isFocusWithin ||
      feedbackDialogOpen ||
      Boolean(message.feedback));

  const shortTimestamp = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(message.timestamp)),
    [message.timestamp],
  );

  const fullTimestamp = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(new Date(message.timestamp)),
    [message.timestamp],
  );

  const handleFeedbackButtonClick = (sentiment: MessageFeedbackSentiment) => {
    setPendingSentiment(sentiment);
    setFeedbackDialogOpen(true);
  };

  const handleFeedbackSubmit = async (
    feedback: ChatMessageFeedbackRequest,
  ) => {
    if (!onSubmitFeedback) {
      throw new Error("Feedback is not available right now.");
    }
    await onSubmitFeedback(message.id, feedback);
  };

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

  return (
    <>
      <Box
        display="flex"
        alignItems="flex-start"
        mb={1}
        px={1}
        gap={1}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocusCapture={() => setIsFocusWithin(true)}
        onBlurCapture={(event) => {
          const nextTarget = event.relatedTarget as Node | null;
          if (!event.currentTarget.contains(nextTarget)) {
            setIsFocusWithin(false);
          }
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 48,
            bgcolor: "transparent",
            flexShrink: 0,
            mt: 0.25,
            borderRadius: 0,
          }}
        >
          <MaestroRobot
            state={assistantAvatarState}
            size={48}
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
                bgcolor: dark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.05)",
                px: 0.5,
                py: 0.25,
                borderRadius: 0.5,
                fontFamily: "monospace",
                fontSize: "0.85em",
              },
              "& pre": {
                bgcolor: dark
                  ? "rgba(0, 0, 0, 0.3)"
                  : "rgba(0, 0, 0, 0.05)",
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

          {canCollectFeedback && (
            <Box
              sx={{
                maxHeight: showMetaRow ? 56 : 0,
                opacity: showMetaRow ? 1 : 0,
                overflow: "hidden",
                transition: "max-height 0.2s ease, opacity 0.2s ease",
                mt: showMetaRow ? 0.5 : 0,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Tooltip title={fullTimestamp}>
                  <Typography variant="caption" color="text.secondary">
                    {shortTimestamp}
                  </Typography>
                </Tooltip>
                <Stack direction="row" spacing={0.25}>
                  <Tooltip title="Good response">
                    <span>
                      <IconButton
                        size="small"
                        aria-label="Mark response as good"
                        aria-pressed={selectedSentiment === "positive"}
                        onClick={() => handleFeedbackButtonClick("positive")}
                        disabled={!onSubmitFeedback}
                        color={
                          selectedSentiment === "positive"
                            ? "success"
                            : "default"
                        }
                      >
                        {selectedSentiment === "positive" ? (
                          <ThumbUpAltIcon fontSize="small" />
                        ) : (
                          <ThumbUpAltOutlinedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Bad response">
                    <span>
                      <IconButton
                        size="small"
                        aria-label="Mark response as bad"
                        aria-pressed={selectedSentiment === "negative"}
                        onClick={() => handleFeedbackButtonClick("negative")}
                        disabled={!onSubmitFeedback}
                        color={
                          selectedSentiment === "negative"
                            ? "error"
                            : "default"
                        }
                      >
                        {selectedSentiment === "negative" ? (
                          <ThumbDownAltIcon fontSize="small" />
                        ) : (
                          <ThumbDownAltOutlinedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Stack>
            </Box>
          )}
        </Box>
      </Box>

      {canCollectFeedback && (
        <MessageFeedbackDialog
          open={feedbackDialogOpen}
          sentiment={pendingSentiment}
          existingFeedback={message.feedback}
          onClose={() => setFeedbackDialogOpen(false)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </>
  );
};

export default MessageBubble;
