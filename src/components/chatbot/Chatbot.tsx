import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Snackbar,
  Alert,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddCommentIcon from "@mui/icons-material/AddComment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import DescriptionIcon from "@mui/icons-material/Description";
import HistoryIcon from "@mui/icons-material/History";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";

import NotesList from "@/components/notes/NotesList";
import { useChatLayout } from "@/context/ChatLayoutContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  appendLocalMessage,
  clearActiveSession,
  clearSendError,
  createSession,
  fetchSession,
  fetchSessions,
  deleteSession,
  sendMessage,
} from "@/store/chatSlice";
import { fetchResources } from "@/store/resourcesSlice";
import MessageBubble from "./MessageBubble";
import DiffAlert from "./DiffAlert";
import usePageContext from "@/hooks/usePageContext";

// ── Typing indicator ───────────────────────────────────────────────────────────

const TypingIndicator: React.FC = () => (
  <Box display="flex" alignItems="center" gap={0.5} px={2} py={0.75}>
    <Avatar
      sx={{
        width: 24,
        height: 24,
        bgcolor: "primary.dark",
        fontSize: "0.6rem",
      }}
    >
      M
    </Avatar>
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

// ── Drag handle for split-view resize ───────────────────────────────────────────

const DragHandle: React.FC = () => {
  const { splitWidth, setSplitWidth, setIsDragging } = useChatLayout();
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = splitWidth;
    setIsDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const deltaX = e.clientX - startXRef.current;
      setSplitWidth(startWidthRef.current - deltaX);
    };
    const onMouseUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [setSplitWidth, setIsDragging]);

  return (
    <Box
      onMouseDown={onMouseDown}
      sx={{
        width: "6px",
        cursor: "col-resize",
        flexShrink: 0,
        bgcolor: "transparent",
        "&:hover": { bgcolor: "primary.main", opacity: 0.4 },
        transition: "background-color 0.15s",
      }}
    />
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const Chatbot: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isSplitView, toggleSplitView, setSplitView, splitWidth } =
    useChatLayout();
  const {
    activeSession,
    activeSessionStatus,
    isSending,
    sendError,
    sessions,
    sessionsStatus,
  } = useAppSelector((s) => s.chat);
  const { data: resourceCatalog, status: catalogStatus } = useAppSelector(
    (s) => s.resources,
  );

  const [openChat, setOpenChat] = useState(false);
  const [input, setInput] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [dismissedDiff, setDismissedDiff] = useState<string | null>(null);
  const [isImplementing, setIsImplementing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null,
  );
  const [deletingSessionLabel, setDeletingSessionLabel] = useState<
    string | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<
    "success" | "info" | "warning" | "error"
  >("info");

  const pageContext = usePageContext();

  const isCreatingSession = activeSessionStatus === "loading" && !activeSession;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingMessageRef = useRef<string | null>(null);
  // Set to true when the user explicitly clicks "New chat" so the session-load
  // effect creates a fresh session instead of reloading the latest one.
  const wantsNewSessionRef = useRef(false);

  // ── Load resource catalog once (needed by handleImplement) ────────────────
  useEffect(() => {
    if (catalogStatus === "idle") {
      dispatch(fetchResources());
    }
  }, [catalogStatus, dispatch]);

  // ── Split view isn't supported on small screens ────────────────────────────
  useEffect(() => {
    if (isMobile && isSplitView) {
      setSplitView(false);
    }
  }, [isMobile, isSplitView, setSplitView]);

  const handleToggleSplitView = () => {
    if (!isSplitView) {
      setOpenChat(true);
    }
    toggleSplitView();
  };

  // ── On open: load latest existing session, or create a new one ────────────────
  useEffect(() => {
    if (!openChat || activeSession || activeSessionStatus === "loading") return;

    if (sessionsStatus === "idle") {
      dispatch(fetchSessions());
    } else if (sessionsStatus === "succeeded") {
      if (wantsNewSessionRef.current) {
        // User clicked "New chat" — always create a fresh session
        wantsNewSessionRef.current = false;
        dispatch(createSession(undefined));
      } else if (sessions.length > 0) {
        dispatch(fetchSession(sessions[0].id));
      } else {
        dispatch(createSession(undefined));
      }
    }
  }, [
    openChat,
    activeSession,
    activeSessionStatus,
    sessions,
    sessionsStatus,
    dispatch,
  ]);

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
      dispatch(
        sendMessage({ sessionId: activeSession.id, message: pending, pageContext: pageContext }),
      );
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
    dispatch(
      sendMessage({ sessionId: activeSession.id, message: trimmed, pageContext: pageContext }),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showToast = (
    msg: string,
    severity: "success" | "info" | "warning" | "error" = "info",
  ) => {
    setToastMessage(msg);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleToastClose = (
    _?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setToastOpen(false);
  };

  const handleImplement = async (sessionId: string) => {
    if (activeSession?.id !== sessionId) return;

    const plan =
      activeSession.currentPlan ||
      activeSession.messages
        .slice()
        .reverse()
        .find((m) => m.messageType === "plan")?.plan;

    if (!plan) {
      // No plan available
      showToast("No Maestro plan found to implement.", "warning");
      return;
    }

    setIsImplementing(true);
    try {
      const normalize = (s: string) =>
        s.toLowerCase().replace(/[^a-z0-9]+/g, "_");

      // Build a lookup: normalized resourceId -> catalog entry
      const catalogLookup = new Map<string, any>();
      for (const entry of resourceCatalog) {
        // Key by the type string (resourceId field, e.g. "vpc", "nat_gateway")
        const key = normalize(entry.resourceId || entry.resourceName || "");
        catalogLookup.set(key, entry);
      }

      // Build nodes using the exact same convention as onDrop:
      //   - node.id = `${mongodb_id}-${uuidv4()}` so saved orchestrators load correctly
      //   - resourceId = type string (e.g. "vpc") stored in DB and used as __nodeType
      //   - __nodeType = type string (what all rules/links use)
      const nodes = plan.resources.map((res, idx) => {
        const type = normalize(res.resourceType || `resource${idx}`);
        const catalogEntry = catalogLookup.get(type);
        // MongoDB _id used as node ID prefix — identical to onDrop convention
        const mongoId = catalogEntry?._id ?? type;
        const id = `${mongoId}-${uuidv4()}`;
        // resourceId stored in DB = canonical type string (not MongoDB _id)
        const resourceId = catalogEntry?.resourceId ?? type;
        const friendlyId = `${type}-${String(idx + 1).padStart(4, "0")}`;
        return {
          id,
          resourceId, // canonical type string ("vpc") — used as __nodeType on load
          position: { x: idx * 220, y: 0 },
          values: res.config || {},
          __nodeType: resourceId, // same type string, consistent with onDrop
          friendlyId,
          isExpanded: true,
          // Kept for fallback rendering only — not used by fetchResourceById
          previewIcon: catalogEntry?.resourceIcon?.url ?? undefined,
          resourceName: catalogEntry?.resourceName ?? type,
        };
      });
      // Build edge lookup keyed by __nodeType (the type string, e.g. "vpc")
      const lookup = new Map<string, string>();
      nodes.forEach((n) => lookup.set(n.__nodeType, n.id));

      // Edge direction convention (matches the existing Orchestrator edge rules):
      //   source = the PROVIDER (the dependency)
      //   target = the CONSUMER (the resource that needs the dependency)
      // So if nat_gateway.dependencies = ["subnet"], edge = source:subnet → target:nat_gateway
      const edges: any[] = [];
      plan.resources.forEach((res, idx) => {
        const consumerId = nodes[idx].id; // the resource that has dependencies
        (res.dependencies || []).forEach((dep) => {
          const depKey = normalize(dep);
          const providerId = lookup.get(depKey); // the resource being depended on
          if (providerId && providerId !== consumerId) {
            edges.push({
              id: `${providerId}->${consumerId}`,
              source: providerId, // provider (e.g., vpc)
              target: consumerId, // consumer (e.g., subnet)
            });
          }
        });
      });

      const templateInfo = {
        templateName:
          plan.templateName?.trim() ||
          plan.summary?.split(".")[0]?.trim() ||
          "Maestro Infrastructure Plan",
        description: plan.summary,
        cloud: plan.resources[0]?.cloudProvider ?? undefined,
      };

      const saveReq = {
        templateInfo,
        nodes,
        edges,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: "1.0",
        },
      };

      // Prefill the Orchestrator editor: store in sessionStorage and navigate in-place.
      // Chatbot is rendered outside <Routes> so the conversation stays visible.
      try {
        sessionStorage.setItem("maestro_prefill", JSON.stringify(saveReq));
        navigate("/orchestrator/new?template_type=custom");
      } catch (e) {
        console.error("Failed to open orchestrator editor:", e);
        showToast("Failed to open orchestrator editor", "error");
      }
    } catch (err) {
      console.error("Failed to create orchestrator:", err);
      showToast(
        "Failed to create orchestrator: " +
          (err instanceof Error ? err.message : String(err)),
        "error",
      );
    } finally {
      setIsImplementing(false);
    }
  };

  const openDeleteDialog = (
    e: React.MouseEvent,
    sessionId: string,
    label?: string,
  ) => {
    e.stopPropagation();
    setDeletingSessionId(sessionId);
    setDeletingSessionLabel(label ?? null);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingSessionId(null);
    setDeletingSessionLabel(null);
    setIsDeleting(false);
  };

  const confirmDelete = async () => {
    if (!deletingSessionId) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteSession(deletingSessionId)).unwrap();
      if (activeSession?.id === deletingSessionId) {
        dispatch(clearActiveSession());
      }
      showToast("Conversation deleted", "success");
      closeDeleteDialog();
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      showToast("Failed to delete conversation", "error");
      setIsDeleting(false);
    }
  };

  // ── Diff alert — show the latest diff message not yet dismissed ────────────
  const lastDiffMsg = activeSession?.messages
    .slice()
    .reverse()
    .find((m) => m.messageType === "diff");

  const showDiffAlert =
    lastDiffMsg && lastDiffMsg.content !== dismissedDiff && !isSending;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Floating launcher */}
      {!isSplitView && (
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
      )}

      {/* Chat panel */}
      {(openChat || isSplitView) && (
        <Box
          sx={{
            display: "flex",
            height: isSplitView ? "100%" : "auto",
            width: isSplitView ? splitWidth : "auto",
            flexShrink: 0,
          }}
        >
          {isSplitView && <DragHandle />}
          <Paper
            elevation={isSplitView ? 0 : 8}
            sx={
              isSplitView
                ? {
                    position: "relative",
                    height: "100%",
                    width: "100%",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 0,
                    overflow: "hidden",
                    boxShadow: "none",
                    borderLeft: (t) => `1px solid ${t.palette.divider}`,
                  }
                : {
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
                  }
            }
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
                  wantsNewSessionRef.current = true;
                  setShowHistory(false);
                  dispatch(clearActiveSession());
                }}
              >
                <AddCommentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={showHistory ? "Back to chat" : "Chat history"}>
              <IconButton
                size="small"
                color="inherit"
                onClick={() => {
                  if (!showHistory && sessionsStatus !== "loading") {
                    dispatch(fetchSessions());
                  }
                  setShowHistory((v) => !v);
                }}
              >
                {showHistory ? (
                  <ArrowBackIcon fontSize="small" />
                ) : (
                  <HistoryIcon fontSize="small" />
                )}
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
            {!isMobile && (
              <Tooltip
                title={
                  isSplitView ? "Restore floating chat" : "Expand to split view"
                }
              >
                <IconButton
                  size="small"
                  color="inherit"
                  onClick={handleToggleSplitView}
                >
                  {isSplitView ? (
                    <CloseFullscreenIcon fontSize="small" />
                  ) : (
                    <OpenInFullIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            )}
            <IconButton
              size="small"
              color="inherit"
              onClick={() => {
                if (isSplitView) setSplitView(false);
                setOpenChat(false);
              }}
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

          {/* ── Session history panel ── */}
          {showHistory ? (
            <Box flex={1} overflow="auto">
              <Box px={2} py={1.5}>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="text.secondary"
                >
                  Previous conversations
                </Typography>
              </Box>
              <Divider />
              {sessionsStatus === "loading" && (
                <Box display="flex" justifyContent="center" pt={4}>
                  <CircularProgress size={24} />
                </Box>
              )}
              {sessionsStatus === "succeeded" && sessions.length === 0 && (
                <Box textAlign="center" px={3} mt={4}>
                  <Typography variant="body2" color="text.secondary">
                    No previous conversations.
                  </Typography>
                </Box>
              )}
              {sessionsStatus === "succeeded" && sessions.length > 0 && (
                <List dense disablePadding>
                  {sessions.map((s) => {
                    const isActive = activeSession?.id === s.id;
                    const updated = new Date(s.updatedAt);
                    const dateLabel = updated.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    const timeLabel = updated.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const label =
                      s.title?.trim() ||
                      s.preview?.trim() ||
                      `Chat — ${dateLabel}`;
                    const secondaryNode = (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        component="div"
                      >
                        {`${s.messageCount} message${s.messageCount === 1 ? "" : "s"}`}{" "}
                        · {dateLabel} at {timeLabel}
                      </Typography>
                    );
                    return (
                      <ListItem
                        key={s.id}
                        disablePadding
                        divider
                        secondaryAction={
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={(e) => openDeleteDialog(e, s.id, label)}
                            aria-label="Delete conversation"
                          >
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        }
                      >
                        <ListItemButton
                          selected={isActive}
                          onClick={() => {
                            if (!isActive) {
                              dispatch(fetchSession(s.id));
                            }
                            setShowHistory(false);
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight={isActive ? 700 : 400} noWrap>
                                {label}
                              </Typography>
                            }
                            secondary={secondaryNode}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          ) : (
            /* ── Message list ── */
            <Box flex={1} overflow="auto" py={1}>
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
                  key={`${msg.timestamp}-${idx}`}
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
          )}

          <Divider />

          {/* ── Input bar (hidden when browsing history) ── */}
          {showHistory ? null : (
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
                slotProps={{
                  input: {
                    sx: { borderRadius: 3 },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={handleSend}
                          disabled={
                            !input.trim() || isSending || isCreatingSession
                          }
                        >
                          {isSending ? (
                            <CircularProgress size={18} />
                          ) : (
                            <SendIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
          )}
          </Paper>
        </Box>
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

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete conversation</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Are you sure you want to delete this conversation? It will be
            removed from your chat history.
          </Typography>
          {deletingSessionLabel && (
            <Box mt={1}>
              <Typography variant="body2" color="text.primary" noWrap>
                {deletingSessionLabel}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={toastOpen}
        autoHideDuration={6000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleToastClose}
          severity={toastSeverity}
          sx={{ width: "100%" }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Chatbot;
