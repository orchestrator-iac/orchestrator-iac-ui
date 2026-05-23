import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { chatService } from "@/services/chatService";
import type {
  ChatMessage,
  ChatSessionListItem,
  ChatSessionResponse,
  MessageType,
  PlanSchema,
} from "@/types/chat";

// ── State ──────────────────────────────────────────────────────────────────────

interface ChatState {
  sessions: ChatSessionListItem[];
  sessionsStatus: "idle" | "loading" | "succeeded" | "failed";
  activeSessionId: string | null;
  activeSession: ChatSessionResponse | null;
  activeSessionStatus: "idle" | "loading" | "succeeded" | "failed";
  isSending: boolean;
  sendError: string | null;
}

const initialState: ChatState = {
  sessions: [],
  sessionsStatus: "idle",
  activeSessionId: null,
  activeSession: null,
  activeSessionStatus: "idle",
  isSending: false,
  sendError: null,
};

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchSessions = createAsyncThunk(
  "chat/fetchSessions",
  async (_, { rejectWithValue }) => {
    try {
      const data = await chatService.listSessions();
      return data.sessions;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load sessions";
      return rejectWithValue(msg);
    }
  },
);

export const createSession = createAsyncThunk(
  "chat/createSession",
  async (title: string | undefined, { rejectWithValue }) => {
    try {
      return await chatService.createSession(title);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create session";
      return rejectWithValue(msg);
    }
  },
);

export const fetchSession = createAsyncThunk(
  "chat/fetchSession",
  async (id: string, { rejectWithValue }) => {
    try {
      return await chatService.getSession(id);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load session";
      return rejectWithValue(msg);
    }
  },
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (
    { sessionId, message }: { sessionId: string; message: string },
    { rejectWithValue },
  ) => {
    try {
      return await chatService.sendMessage(sessionId, message);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to send message";
      return rejectWithValue(msg);
    }
  },
);

export const deleteSession = createAsyncThunk(
  "chat/deleteSession",
  async (id: string, { rejectWithValue }) => {
    try {
      await chatService.closeSession(id);
      return id;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete session";
      return rejectWithValue(msg);
    }
  },
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveSessionId(state, action: PayloadAction<string | null>) {
      state.activeSessionId = action.payload;
    },
    setActiveSessionOrchestrator(state, action: PayloadAction<string | null>) {
      if (!state.activeSession) return;
      state.activeSession.orchestratorId = action.payload ?? undefined;
    },
    clearActiveSession(state) {
      state.activeSession = null;
      state.activeSessionId = null;
      state.activeSessionStatus = "idle";
    },
    clearSendError(state) {
      state.sendError = null;
    },
    appendLocalMessage(state, action: PayloadAction<ChatMessage>) {
      if (!state.activeSession) return;
      state.activeSession.messages = [
        ...state.activeSession.messages,
        action.payload,
      ];
    },
  },
  extraReducers: (builder) => {
    // fetchSessions
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.sessionsStatus = "loading";
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.sessionsStatus = "succeeded";
        state.sessions = action.payload;
      })
      .addCase(fetchSessions.rejected, (state) => {
        state.sessionsStatus = "failed";
      });

    // createSession
    builder
      .addCase(createSession.pending, (state) => {
        state.activeSessionStatus = "loading";
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.activeSession = action.payload;
        state.activeSessionId = action.payload.id;
        state.activeSessionStatus = "succeeded";
      })
      .addCase(createSession.rejected, (state) => {
        state.activeSessionStatus = "failed";
        state.activeSession = null; // ensure no stale session
      });

    // fetchSession
    builder
      .addCase(fetchSession.pending, (state) => {
        state.activeSessionStatus = "loading";
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.activeSessionStatus = "succeeded";
        state.activeSession = action.payload;
        state.activeSessionId = action.payload.id;
      })
      .addCase(fetchSession.rejected, (state) => {
        state.activeSessionStatus = "failed";
      });

    // sendMessage
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.sendError = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        const resp = action.payload;
        if (!state.activeSession) return;

        // Append assistant reply to the local message list
        const botMsg: ChatMessage = {
          role: "assistant",
          content: resp.botResponse,
          timestamp: new Date().toISOString(),
          messageType: (resp.messageType as MessageType) || "text",
          plan: resp.updatedPlan,
        };
        state.activeSession.messages = [
          ...state.activeSession.messages,
          botMsg,
        ];

        // Update the stored plan if Maestro returned one
        if (resp.updatedPlan) {
          state.activeSession.currentPlan = resp.updatedPlan as PlanSchema;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.sendError = action.payload as string;
      });

    // deleteSession
    builder.addCase(deleteSession.fulfilled, (state, action) => {
      const id = action.payload as string;
      state.sessions = state.sessions.filter((s) => s.id !== id);
      if (state.activeSession?.id === id) {
        state.activeSession = null;
        state.activeSessionId = null;
        state.activeSessionStatus = "idle";
      }
    });
  },
});

export const {
  setActiveSessionId,
  setActiveSessionOrchestrator,
  clearActiveSession,
  clearSendError,
  appendLocalMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
