import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddCommentIcon from "@mui/icons-material/AddComment";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import SendIcon from "@mui/icons-material/Send";

import NotesList from "@/components/notes/NotesList";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  appendLocalMessage,
  clearActiveSession,
  clearSendError,
  createSession,
  sendMessage,
} from "@/store/chatSlice";
import type { ChatMessage } from "@/types/chat";
import MessageBubble from "./MessageBubble";
import DiffAlert from "./DiffAlert";

// ── Typing indicator ───────────────────────────────────────────────────────────

const TypingIndicator: React.FC = () => (
  <Box display="flex" alignItems="center" gap={0.5} px={2} py={0.75}>
    <Avatar sx={{ width: 24, height: 24, bgcolor: "primary.dark", fontSize: "0.6rem" }}>M</Avatar>
    <Stack direction="row" spacing={0.4} ml={0.5}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            bgcolor: "primary.main",
            animation: "bounce 1.2s infinite",
            animationDelay: `${i * 0.2}s`,
            "@keyframes bounce": {
              "0%, 80%, 100%": { transform: "scale(0.6)" },
              "40%": { transform: "scale(1)" },
            },
          }}
        />
      ))}
    </Stack>
  </Box>
);

// ── Main component ─────────────────────────────────────────────────────────────

const Chatbot: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeSession, activeSessionStatus, isSending, sendError } = useAppSelector((s) => s.chat);

  const [openChat, setOpenChat] = useState(false);
  const [input, setInput] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);
  const [dismissedDiff, setDismissedDiff] = useState<string | null>(null);
  const [isImplementing, setIsImplementing] = useState(false);

  const isCreatingSession = activeSessionStatus === "loading" && !activeSession;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pendingMessageRef = useRef<string | null>(null);

  // ── Auto-create a session on first open ────────────────────────────────────
  useEffect(() => {
    if (openChat && !activeSession && activeSessionStatus === "idle") {
      dispatch(createSession(undefined));
    }
  }, [openChat, activeSession, activeSessionStatus, dispatch]);

  // ── Send any pending message once the session becomes available ────────────
  useEffect(() => {
    if (activeSession && pendingMessageRef.current) {
      const pending = pendingMessageRef.current;
      pendingMessageRef.current = null;
      dispatch(
        appendLocalMessage({
          role: "user",
          content: pending,
          timestamp: new Date().toISOString(),
          messageType: "text",
        }),
      );
      dispatch(sendMessage({ sessionId: activeSession.id, message: pending }));
    }
  }, [activeSession, dispatch]);

  // ── Scroll to bottom whenever messages change ──────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages.length, isSending]);

  // ── Focus input when chat opens ────────────────────────────────────────────
  useEffect(() => {
    if (openChat) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [openChat]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    setInput("");
    // Session still being created — stash the message and send once ready
    if (!activeSession) {
      pendingMessageRef.current = trimmed;
      return;
    }
    // Optimistically show user message before the round-trip
    dispatch(
      appendLocalMessage({
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
        messageType: "text",
      }),
    );
    dispatch(sendMessage({ sessionId: activeSession.id, message: trimmed }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImplement = (_sessionId: string) => {
    // TODO: wire to orchestrator creation + /generate pipeline
    setIsImplementing(true);
    setTimeout(() => setIsImplementing(false), 3000);
  };

  // ── Diff alert — show the latest diff message not yet dismissed ────────────
  const lastDiffMsg = activeSession?.messages
    .slice()
    .reverse()
    .find((m) => m.messageType === "diff");

  const showDiffAlert =
    lastDiffMsg &&
    lastDiffMsg.content !== dismissedDiff &&
    !isSending;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Floating launcher */}
      <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1300 }}>
        <Tooltip title={openChat ? "Close Maestro" : "Open Maestro"}>
          <IconButton
            color="primary"
            onClick={() => setOpenChat((o) => !o)}
            size="large"
            sx={{
              bgcolor: "background.paper",
              boxShadow: 4,
              "&:hover": { boxShadow: 6 },
            }}
          >
            {openChat ? <CloseIcon /> : <ChatIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Chat panel */}
      {openChat && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 90,
            right: 24,
            width: 420,
            height: 520,
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
            zIndex: 1299,
          }}
        >
          {/* ── Header ── */}
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              px: 2,
              py: 1.25,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Avatar
              sx={{
                width: 30,
                height: 30,
                bgcolor: "primary.dark",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              M
            </Avatar>
            <Box flex={1}>
              <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2}>
                Maestro
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Infrastructure planning assistant
              </Typography>
            </Box>
            <Tooltip title="New chat">
              <IconButton
                size="small"
                color="inherit"
                onClick={() => {
                  dispatch(clearActiveSession());
                  // useEffect will fire createSession once status resets to "idle"
                }}
              >
                <AddCommentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notes">
              <IconButton
                size="small"
                color="inherit"
                onClick={() => setNotesOpen(true)}
              >
                <DescriptionIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setOpenChat(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Divider />

          {/* ── Diff alert ── */}
          {showDiffAlert && lastDiffMsg && (
            <DiffAlert
              summary={lastDiffMsg.content}
              onDismiss={() => setDismissedDiff(lastDiffMsg.content)}
            />
          )}

          {/* ── Message list ── */}
          <Box
            flex={1}
            overflow="auto"
            py={1}
            sx={{ bgcolor: "background.default" }}
          >
            {(!activeSession || activeSession.messages.length === 0) &&
              !isSending && (
                <Box textAlign="center" px={3} mt={3}>
                  <Typography variant="body2" color="text.secondary">
                    Hi! I'm <strong>Maestro</strong>. Describe the cloud
                    infrastructure you'd like to build and I'll create a plan
                    for you.
                  </Typography>
                </Box>
              )}

            {activeSession?.messages.map((msg, idx) => (
              <MessageBubble
                key={idx}
                message={msg}
                sessionId={activeSession.id}
                onImplement={handleImplement}
                isImplementing={isImplementing}
              />
            ))}

            {isSending && <TypingIndicator />}

            {sendError && (
              <Box px={2} py={0.5}>
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ cursor: "pointer" }}
                  onClick={() => dispatch(clearSendError())}
                >
                  ⚠ {sendError} (click to dismiss)
                </Typography>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          <Divider />

          {/* ── Input bar ── */}
          <Box sx={{ px: 1.5, py: 1, bgcolor: "background.paper" }}>
            <TextField
              inputRef={inputRef}
              fullWidth
              multiline
              maxRows={3}
              size="small"
              placeholder="Ask Maestro to plan your infrastructure…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              InputProps={{
                sx: { borderRadius: 3 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={handleSend}
                      disabled={!input.trim() || isSending || isCreatingSession}
                    >
                      {isSending ? (
                        <CircularProgress size={18} />
                      ) : (
                        <SendIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Paper>
      )}

      {/* Notes modal — preserved for backward compatibility */}
      <Dialog
        open={notesOpen}
        onClose={() => setNotesOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Notes
          <IconButton
            onClick={() => setNotesOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <NotesList />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Chatbot;
