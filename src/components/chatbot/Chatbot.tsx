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
  TextField,
  Tooltip,
  Typography,
  Snackbar,
  Alert,
  Button,
  Checkbox,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddCommentIcon from "@mui/icons-material/AddComment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import DescriptionIcon from "@mui/icons-material/Description";
import HistoryIcon from "@mui/icons-material/History";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";

import NotesList from "@/components/notes/NotesList";
import { useChatLayout } from "@/context/ChatLayoutContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  appendLocalMessage,
  clearActiveSession,
  clearSendError,
  createSession,
  deleteSession,
  fetchSession,
  fetchSessions,
  sendMessage,
  upsertMessageFeedback,
  updateSession,
} from "@/store/chatSlice";
import { fetchResources } from "@/store/resourcesSlice";
import { chatService } from "@/services/chatService";
import type {
  ChatMessageFeedbackRequest,
  PlanImplementationAction,
  PlanSchema,
} from "@/types/chat";
import { writeMaestroDraft } from "@/utils/maestroDraft";
import MessageBubble from "./MessageBubble";
import DiffAlert from "./DiffAlert";
import MicLevelVisualizer from "./MicLevelVisualizer";
import usePageContext from "@/hooks/usePageContext";
import MaestroRobot, { type MaestroRobotState } from "./MaestroRobot";
import { IoMdClose } from "react-icons/io";

// ── Typing indicator ───────────────────────────────────────────────────────────

const TALKING_STATE_MS = 1600;

// Axios surfaces failed requests as a generic "Request failed with status
// code 500"-style message, which hides the actual, user-friendly reason the
// backend already computed (e.g. "no speech detected"). Prefer the FastAPI
// error body's `detail` field whenever present.
const getTranscriptionErrorMessage = (error: unknown): string => {
  const axiosError = error as {
    response?: { data?: { detail?: string }; status?: number };
    message?: string;
  };
  const detail = axiosError?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  if (axiosError?.response?.status === 413) {
    return "That recording is too large to transcribe. Please try a shorter voice message.";
  }
  if (error instanceof Error && error.message === "Recorded audio was empty.") {
    return "We didn't capture any audio. Please try recording again.";
  }
  return "We couldn't transcribe that recording. Please try again.";
};

const TypingIndicator: React.FC = () => {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const robotColor = dark
    ? theme.palette.secondary.light
    : theme.palette.primary.dark;

  return (
    <Box display="flex" alignItems="center" gap={1} px={2} py={0.75}>
      <Box
        sx={{
          width: 50,
          height: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <MaestroRobot
          state="thinking"
          size={36}
          decorative
          robotColor={robotColor}
        />
      </Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        Maestro is thinking...
      </Typography>
    </Box>
  );
};

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
  const dark = theme.palette.mode === "dark";
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
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<
    "success" | "info" | "warning" | "error"
  >("info");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [talkingMessageKey, setTalkingMessageKey] = useState<string | null>(
    null,
  );

  const pageContext = usePageContext();

  const isCreatingSession = activeSessionStatus === "loading" && !activeSession;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingMessageRef = useRef<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const skipTranscriptionRef = useRef(false);
  // Created inside handleStartRecording (i.e. within the click gesture's call
  // stack) so the AudioContext reliably starts "running" instead of
  // "suspended" — creating it later inside a useEffect risks the browser's
  // user-activation window having already expired, leaving resume() a no-op
  // and the analyser permanently reading silence.
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [micAnalyser, setMicAnalyser] = useState<AnalyserNode | null>(null);
  // Set to true when the user explicitly clicks "New chat" so the session-load
  // effect creates a fresh session instead of reloading the latest one.
  const wantsNewSessionRef = useRef(false);
  const previousSessionIdRef = useRef<string | null>(null);
  const previousMessageCountRef = useRef(0);

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

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      analyserRef.current?.disconnect();
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => undefined);
      }
    };
  }, []);

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
          id: `local_${uuidv4()}`,
          role: "user",
          content: pending,
          timestamp: new Date().toISOString(),
          messageType: "text",
        }),
      );
      dispatch(
        sendMessage({
          sessionId: activeSession.id,
          message: pending,
          pageContext: pageContext,
        }),
      );
    }
  }, [activeSession, dispatch]);

  // ── Scroll to bottom whenever messages change ──────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages.length, isSending]);

  // ── Scroll to the latest message when Maestro opens ───────────────────────
  useEffect(() => {
    if ((openChat || isSplitView) && activeSession && !showHistory) {
      const rafId = window.requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      });

      return () => window.cancelAnimationFrame(rafId);
    }

    return undefined;
  }, [openChat, isSplitView, activeSession?.id, showHistory]);

  // ── Focus input when chat opens ────────────────────────────────────────────
  useEffect(() => {
    if (openChat) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [openChat]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (showHistory) {
      setIsInputFocused(false);
      setTalkingMessageKey(null);
    }
  }, [showHistory]);

  useEffect(() => {
    if (selectedSessionIds.length === 0) return;
    const sessionIdSet = new Set(sessions.map((session) => session.id));
    setSelectedSessionIds((current) =>
      current.filter((sessionId) => sessionIdSet.has(sessionId)),
    );
  }, [sessions, selectedSessionIds.length]);

  useEffect(() => {
    const sessionId = activeSession?.id ?? null;
    const messages = activeSession?.messages ?? [];

    if (sessionId !== previousSessionIdRef.current) {
      previousSessionIdRef.current = sessionId;
      previousMessageCountRef.current = messages.length;
      setTalkingMessageKey(null);
      return;
    }

    if (messages.length <= previousMessageCountRef.current) {
      previousMessageCountRef.current = messages.length;
      return;
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant") {
      setTalkingMessageKey(lastMessage.id);
    }

    previousMessageCountRef.current = messages.length;
  }, [activeSession]);

  useEffect(() => {
    if (!talkingMessageKey || isSending || showHistory) return;

    const timeoutId = window.setTimeout(() => {
      setTalkingMessageKey((current) =>
        current === talkingMessageKey ? null : current,
      );
    }, TALKING_STATE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [talkingMessageKey, isSending, showHistory]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isSending || Boolean(pendingMessageRef.current)) return;
    setInput("");
    // Session still being created — stash the message and send once ready
    if (!activeSession) {
      pendingMessageRef.current = trimmed;
      return;
    }
    // Optimistically show user message before the round-trip
    dispatch(
      appendLocalMessage({
        id: `local_${uuidv4()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
        messageType: "text",
      }),
    );
    dispatch(
      sendMessage({
        sessionId: activeSession.id,
        message: trimmed,
        pageContext: pageContext,
      }),
    );
  };

  const stopRecordingAudio = () => {
    mediaRecorderRef.current?.stop();
  };

  const handleCancelRecording = () => {
    skipTranscriptionRef.current = true;
    mediaRecorderRef.current?.stop();
  };

  const clearAudioResources = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    analyserRef.current?.disconnect();
    analyserRef.current = null;
    setMicAnalyser(null);
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => undefined);
    }
    audioContextRef.current = null;
  };

  const handleTranscribeBlob = async (audioBlob: Blob) => {
    if (!audioBlob.size) {
      throw new Error("Recorded audio was empty.");
    }

    const file = new File([audioBlob], `maestro-voice-${Date.now()}.webm`, {
      type: audioBlob.type || "audio/webm",
    });

    const response = await chatService.transcribeAudio(file);
    setInput(response.transcript);
    setTranscriptionError(null);
    inputRef.current?.focus();
  };

  const handleStartRecording = async () => {
    if (isRecordingAudio || isTranscribingAudio || isSending) return;

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setTranscriptionError("Audio recording is not supported in this browser.");
      return;
    }

    try {
      setTranscriptionError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      // Build the analyser graph here, still within the click handler's async
      // chain, so the AudioContext starts "running" rather than "suspended".
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      if (audioContext.state === "suspended") {
        await audioContext.resume().catch(() => undefined);
      }
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setMicAnalyser(analyser);

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      setIsRecordingAudio(true);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setTranscriptionError("Audio recording failed.");
        setIsRecordingAudio(false);
        clearAudioResources();
      };

      recorder.onstop = async () => {
        setIsRecordingAudio(false);

        if (skipTranscriptionRef.current) {
          skipTranscriptionRef.current = false;
          clearAudioResources();
          return;
        }

        setIsTranscribingAudio(true);

        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        try {
          await handleTranscribeBlob(audioBlob);
          setToastMessage("Voice note transcribed and added to the message box.");
          setToastSeverity("success");
          setToastOpen(true);
        } catch (error) {
          const message = getTranscriptionErrorMessage(error);
          setTranscriptionError(message);
          setToastMessage(message);
          setToastSeverity("error");
          setToastOpen(true);
        } finally {
          setIsTranscribingAudio(false);
          clearAudioResources();
        }
      };

      recorder.start();
      setToastMessage("Recording started. Click stop when you're done speaking.");
      setToastSeverity("info");
      setToastOpen(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start recording.";
      setTranscriptionError(message);
      setToastMessage(message);
      setToastSeverity("error");
      setToastOpen(true);
      clearAudioResources();
      setIsRecordingAudio(false);
    }
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

  const handleSubmitMessageFeedback = async (
    messageId: string,
    feedback: ChatMessageFeedbackRequest,
  ) => {
    if (!activeSession) {
      throw new Error("No active Maestro session found.");
    }

    await dispatch(
      upsertMessageFeedback({
        sessionId: activeSession.id,
        messageId,
        feedback,
      }),
    ).unwrap();
  };

  const handleImplement = async (
    sessionId: string,
    action: PlanImplementationAction,
    planOverride?: PlanSchema,
  ) => {
    if (activeSession?.id !== sessionId) return;

    const plan =
      planOverride ||
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

      // Maestro's plan config sometimes represents a reference field (e.g.
      // "Virtual network") as an object like {value, label} or {id, name}
      // instead of a plain scalar ID. Stored as-is, that object ends up in a
      // text/select input and renders as the literal string "[object Object]".
      // Unwrap any such object down to its underlying scalar before it's
      // written into node values.
      const normalizeConfigValue = (v: unknown): unknown => {
        if (v !== null && typeof v === "object" && !Array.isArray(v)) {
          const obj = v as Record<string, unknown>;
          const scalar = obj.value ?? obj.id ?? obj.name ?? obj.label;
          return scalar !== undefined ? scalar : v;
        }
        return v;
      };
      const normalizeConfig = (
        config: Record<string, unknown> | undefined
      ): Record<string, unknown> => {
        if (!config) return {};
        const result: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(config)) {
          result[key] = normalizeConfigValue(val);
        }
        return result;
      };

      // Build a lookup: catalog entry, keyed primarily by "cloud:resourceId"
      // since the same resourceId (e.g. "subnet") can exist once per cloud
      // provider with entirely different fields/schema. A plain resourceId
      // key is also kept as a fallback for resource types that aren't
      // cloud-specific — but the compound key must win when both exist,
      // otherwise the last-iterated cloud's entry silently shadows the
      // others (e.g. an Azure plan's "subnet" nodes resolving to the AWS
      // subnet's schema, which has completely different config fields).
      const catalogLookup = new Map<string, any>();
      for (const entry of resourceCatalog) {
        const key = normalize(entry.resourceId || entry.resourceName || "");
        const cloud = String(entry.cloudProvider || "").toLowerCase();
        catalogLookup.set(`${cloud}:${key}`, entry);
        if (!catalogLookup.has(key)) {
          catalogLookup.set(key, entry);
        }
      }

      // Build nodes using the exact same convention as onDrop:
      //   - node.id = `${mongodb_id}-${uuidv4()}` so saved orchestrators load correctly
      //   - resourceId = type string (e.g. "vpc") stored in DB and used as __nodeType
      //   - __nodeType = type string (what all rules/links use)
      const nodes = plan.resources.map((res, idx) => {
        const type = normalize(res.resourceType || `resource${idx}`);
        const cloud = String(res.cloudProvider || "").toLowerCase();
        const catalogEntry =
          catalogLookup.get(`${cloud}:${type}`) ?? catalogLookup.get(type);
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
          values: normalizeConfig(res.config),
          __nodeType: resourceId, // same type string, consistent with onDrop
          friendlyId,
          isExpanded: true,
          // Kept for fallback rendering only — not used by fetchResourceById
          previewIcon:
            catalogEntry?.resourceIcon?.url ??
            catalogEntry?.resourceIcon?.sprite?.sheetUrl ??
            undefined,
          resourceName: catalogEntry?.resourceName ?? type,
        };
      });

      // Build two lookups for resolving a `dependencies` entry to a node:
      //   1. idLookup: Maestro's per-resource `id` (e.g. "vpc_2") -> node.id
      //      Preferred whenever the plan tags a specific instance.
      //   2. typeLookup: normalized resourceType -> ALL node ids of that type
      //      Fallback for legacy plans / single-instance types where a dependency
      //      is just the bare resourceType (e.g. "vpc"). If more than one node of
      //      that type exists, resolving by bare type is ambiguous — we warn and
      //      use the first instance rather than silently collapsing every consumer
      //      onto the same (last) provider node.
      const idLookup = new Map<string, string>();
      const typeLookup = new Map<string, string[]>();
      plan.resources.forEach((res, idx) => {
        const nodeId = nodes[idx].id;
        if (res.id) {
          idLookup.set(res.id, nodeId);
        }
        const typeKey = normalize(res.resourceType || "");
        const existing = typeLookup.get(typeKey) ?? [];
        existing.push(nodeId);
        typeLookup.set(typeKey, existing);
      });

      // Edge direction convention (matches the existing Orchestrator edge rules):
      //   source = the PROVIDER (the dependency)
      //   target = the CONSUMER (the resource that needs the dependency)
      // So if nat_gateway.dependencies = ["subnet"], edge = source:subnet → target:nat_gateway
      const edges: any[] = [];
      plan.resources.forEach((res, idx) => {
        const consumerId = nodes[idx].id; // the resource that has dependencies
        (res.dependencies || []).forEach((dep) => {
          // Prefer an exact match against another resource's explicit `id`.
          let providerId = idLookup.get(dep);

          if (!providerId) {
            const candidates = typeLookup.get(normalize(dep)) ?? [];
            if (candidates.length > 1) {
              console.warn(
                `[Maestro] Ambiguous dependency "${dep}" on resource #${idx} ` +
                  `(${candidates.length} "${dep}" resources in plan, no matching id) — ` +
                  "defaulting to the first instance. Ask Maestro to use unique ids " +
                  "for duplicate resource types to avoid this.",
              );
            }
            providerId = candidates[0];
          }

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

      const linkedOrchestratorId = activeSession.orchestratorId;
      const draftAction =
        action === "update" && linkedOrchestratorId ? "update" : "create";

      try {
        await dispatch(
          updateSession({
            id: sessionId,
            updates: { status: "implementing" },
          }),
        ).unwrap();
      } catch (e) {
        console.error("Failed to update Maestro session state:", e);
        showToast(
          "Opened the draft, but Maestro could not update the session state.",
          "warning",
        );
      }

      try {
        const draftToken = uuidv4();
        writeMaestroDraft({
          token: draftToken,
          sessionId,
          action: draftAction,
          targetOrchestratorId:
            draftAction === "update" ? linkedOrchestratorId : null,
          summary: plan.summary,
          saveRequest: saveReq,
        });

        const targetPath =
          draftAction === "update" && linkedOrchestratorId
            ? `/orchestrator/${linkedOrchestratorId}`
            : "/orchestrator/new";

        navigate(
          `${targetPath}?template_type=custom&maestro_draft=${draftToken}`,
        );
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

  const openDeleteDialog = (e: React.MouseEvent, sessionIds: string[]) => {
    e.stopPropagation();
    setDeleteTargetIds(sessionIds);
    setDeleteDialogOpen(true);
  };

  const openSingleDeleteDialog = (e: React.MouseEvent, sessionId: string) => {
    openDeleteDialog(e, [sessionId]);
  };

  const openBulkDeleteDialog = () => {
    if (selectedSessionIds.length === 0) return;
    setDeleteTargetIds([...selectedSessionIds]);
    setDeleteDialogOpen(true);
  };

  const toggleSessionSelection = (sessionId: string) => {
    setSelectedSessionIds((current) =>
      current.includes(sessionId)
        ? current.filter((id) => id !== sessionId)
        : [...current, sessionId],
    );
  };

  const toggleSelectAllSessions = () => {
    if (sessions.length === 0) return;
    setSelectedSessionIds((current) =>
      current.length === sessions.length
        ? []
        : sessions.map((session) => session.id),
    );
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteTargetIds([]);
    setIsDeleting(false);
  };

  const confirmDelete = async () => {
    if (deleteTargetIds.length === 0) return;
    setIsDeleting(true);
    try {
      for (const sessionId of deleteTargetIds) {
        await dispatch(deleteSession(sessionId)).unwrap();
      }

      if (deleteTargetIds.includes(activeSession?.id ?? "")) {
        dispatch(clearActiveSession());
      }
      showToast("Conversation deleted", "success");
      setSelectedSessionIds((current) =>
        current.filter((sessionId) => !deleteTargetIds.includes(sessionId)),
      );
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

  const isWaitingForSessionSend =
    isCreatingSession && Boolean(pendingMessageRef.current);
  const hasDraftInput = input.trim().length > 0;
  const launcherRobotColor = dark ? theme.palette.secondary.light : undefined;
  const headerAvatarBg = dark ? theme.palette.tertiary.dark : "primary.dark";
  const headerRobotColor = dark
    ? theme.palette.secondary.light
    : theme.palette.primary.light;

  let maestroState: MaestroRobotState = "idle";
  if (!showHistory) {
    if (isSending || isWaitingForSessionSend) maestroState = "thinking";
    else if (talkingMessageKey) maestroState = "talking";
    else if (isInputFocused || hasDraftInput) maestroState = "listening";
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Floating launcher */}
      {!isSplitView && (
        <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1300 }}>
          <Tooltip title={openChat ? "Close Maestro" : "Open Maestro"}>
            <IconButton
              aria-label={openChat ? "Close Maestro" : "Open Maestro"}
              color="primary"
              onClick={() => setOpenChat((o) => !o)}
              size="large"
              sx={{
                bgcolor: "background.paper",
                boxShadow: 4,
                "&:hover": { boxShadow: 6 },
              }}
            >
              {openChat ? (
                <IoMdClose size={36} />
              ) : (
                <MaestroRobot
                  state={maestroState}
                  size={36}
                  decorative
                  robotColor={launcherRobotColor}
                />
              )}
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
                    width: 560,
                    height: 640,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    overflow: "hidden",
                    zIndex: 1299,
                  }
            }
          >
            {/* ── Header ── */}
            {/* In split view the app header already shows branding, so this row
              is reduced to just the action icons rather than duplicating it. */}
            <Box
              sx={
                isSplitView
                  ? {
                      bgcolor: "background.paper",
                      borderBottom: 1,
                      borderColor: "divider",
                      px: 1,
                      py: 0.75,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }
                  : {
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      px: 2,
                      py: 1.25,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }
              }
            >
              {!isSplitView && (
                <>
                  <Avatar
                    sx={{
                      width: 50,
                      height: 50,
                      bgcolor: headerAvatarBg,
                    }}
                  >
                    <MaestroRobot
                      state={maestroState}
                      size={38}
                      decorative
                      robotColor={headerRobotColor}
                    />
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="body1" fontWeight={700}>
                      Maestro
                    </Typography>
                    <Typography variant="caption">
                      Infrastructure planning assistant
                    </Typography>
                  </Box>
                </>
              )}
              {isSplitView && <Box flex={1} />}
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
                    isSplitView
                      ? "Restore floating chat"
                      : "Expand to split view"
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
                <Box
                  px={2}
                  py={1.5}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={1}
                >
                  <Box display="flex" alignItems="center" gap={1} minWidth={0}>
                    {sessions.length > 0 && (
                      <Tooltip title="Select or clear all conversations">
                        <Checkbox
                          size="small"
                          checked={
                            selectedSessionIds.length === sessions.length
                          }
                          indeterminate={
                            selectedSessionIds.length > 0 &&
                            selectedSessionIds.length < sessions.length
                          }
                          onChange={toggleSelectAllSessions}
                          slotProps={{
                            input: {
                              "aria-label": "Select all conversations",
                            },
                          }}
                        />
                      </Tooltip>
                    )}
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color="text.secondary"
                    >
                      Previous conversations
                    </Typography>
                  </Box>
                  <Tooltip
                    title={
                      selectedSessionIds.length > 0
                        ? `Delete ${selectedSessionIds.length} selected conversation${selectedSessionIds.length === 1 ? "" : "s"}`
                        : "Select conversations to delete"
                    }
                  >
                    <span>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={openBulkDeleteDialog}
                        disabled={selectedSessionIds.length === 0}
                      >
                        Delete selected
                      </Button>
                    </span>
                  </Tooltip>
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
                      const isSelected = selectedSessionIds.includes(s.id);
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
                              onClick={(e) => openSingleDeleteDialog(e, s.id)}
                              aria-label="Delete conversation"
                            >
                              <DeleteIcon fontSize="small" color="error" />
                            </IconButton>
                          }
                        >
                          <ListItemButton
                            selected={isActive || isSelected}
                            onClick={() => {
                              if (!isActive) {
                                dispatch(fetchSession(s.id));
                              }
                              setShowHistory(false);
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => toggleSessionSelection(s.id)}
                              inputProps={{
                                "aria-label": `Select conversation ${label}`,
                              }}
                              sx={{ mr: 1 }}
                            />
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body2"
                                  fontWeight={isActive ? 700 : 400}
                                  noWrap
                                >
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
                  !isSending &&
                  !isWaitingForSessionSend && (
                    <Box textAlign="center" px={3} mt={3}>
                      <Typography variant="body2" color="text.secondary">
                        Hi! I'm <strong>Maestro</strong>. Describe the cloud
                        infrastructure you'd like to build and I'll create a
                        plan for you.
                      </Typography>
                    </Box>
                  )}

                {activeSession?.messages.map((msg) => {
                  const messageKey = msg.id;
                  return (
                    <MessageBubble
                      key={messageKey}
                      message={msg}
                      sessionId={activeSession.id}
                      linkedOrchestratorId={activeSession.orchestratorId}
                      onImplement={handleImplement}
                      onSubmitFeedback={handleSubmitMessageFeedback}
                      isImplementing={isImplementing}
                      assistantAvatarState={"talking"}
                    />
                  );
                })}

                {(isSending || isWaitingForSessionSend) && <TypingIndicator />}

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
              <Box sx={{ bgcolor: "background.paper" }}>
                {isRecordingAudio ? (
                  /* ── Dictation mode: textbox + send icon are replaced by a
                     ChatGPT-dictate-style bar — cancel (X), live waveform,
                     stop-and-transcribe button. ── */
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1.5,
                      py: 1.25,
                    }}
                  >
                    <Tooltip title="Cancel recording">
                      <IconButton
                        size="small"
                        onClick={handleCancelRecording}
                        sx={{
                          color: theme.palette.text.secondary,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <MicLevelVisualizer
                        analyser={micAnalyser}
                        active={isRecordingAudio}
                      />
                    </Box>

                    <Tooltip title="Stop and transcribe">
                      <IconButton
                        size="small"
                        onClick={stopRecordingAudio}
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                          "&:hover": {
                            bgcolor: theme.palette.primary.dark,
                          },
                        }}
                      >
                        <StopIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ) : (
                  <TextField
                    inputRef={inputRef}
                    fullWidth
                    multiline
                    maxRows={5}
                    size="small"
                    placeholder="Ask Maestro to plan your infrastructure…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    disabled={isSending || isWaitingForSessionSend || isTranscribingAudio}
                    sx={{
                      px: 0,
                      py: 1,
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                                mr: 0.5,
                              }}
                            >
                              <Tooltip title="Record voice message">
                                <span>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={handleStartRecording}
                                    disabled={
                                      isWaitingForSessionSend ||
                                      isSending ||
                                      isTranscribingAudio
                                    }
                                    sx={{
                                      border: `1px solid ${theme.palette.divider}`,
                                      ml: 0.25,
                                    }}
                                  >
                                    <MicIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={handleSend}
                                disabled={
                                  !input.trim() ||
                                  isSending ||
                                  isCreatingSession ||
                                  isTranscribingAudio
                                }
                                sx={{
                                  border: `1px solid ${theme.palette.divider}`,
                                }}
                              >
                                {isSending || isTranscribingAudio ? (
                                  <CircularProgress size={18} />
                                ) : (
                                  <SendIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Box>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
                {transcriptionError && (
                  <Box px={2} pb={1}>
                    <Typography variant="caption" color="error">
                      {transcriptionError}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* Notes modal — preserved for backward compatibility */}
      <Dialog
        open={notesOpen}
        onClose={() => setNotesOpen(false)}
        maxWidth="lg"
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
        <DialogTitle color="error">
          {deleteTargetIds.length > 1
            ? "Delete Conversations"
            : "Delete Conversation"}
        </DialogTitle>
        <DialogContent dividers>
          <Typography>
            {deleteTargetIds.length > 1
              ? `Are you sure you want to delete ${deleteTargetIds.length} conversations? They will be removed from your chat history.`
              : "Are you sure you want to delete this conversation? It will be removed from your chat history."}
          </Typography>
          {deleteTargetIds.length > 0 && (
            <Box mt={1}>
              {deleteTargetIds.map((sessionId) => {
                const session = sessions.find((item) => item.id === sessionId);
                const label =
                  session?.title?.trim() ||
                  session?.preview?.trim() ||
                  "Untitled conversation";
                return (
                  <Typography
                    key={sessionId}
                    variant="body2"
                    color="text.primary"
                    noWrap
                  >
                    {label}
                  </Typography>
                );
              })}
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
