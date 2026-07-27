import apiService from "./apiService";
import type {
  ChatMessage,
  ChatMessageFeedbackRequest,
  ChatSessionUpdateRequest,
  ChatSessionResponse,
  ChatSendResponse,
  ChatSessionsListResponse,
  TranscriptionResponse,
} from "@/types/chat";

const BASE = "/maestro";

export const chatService = {
  createSession: (title?: string): Promise<ChatSessionResponse> =>
    apiService.post(`${BASE}/sessions`, { title }),

  listSessions: (
    page = 1,
    size = 20,
  ): Promise<ChatSessionsListResponse> =>
    apiService.get(`${BASE}/sessions`, { params: { page, size } }),

  getSession: (id: string): Promise<ChatSessionResponse> =>
    apiService.get(`${BASE}/sessions/${id}`),

  updateSession: (
    id: string,
    updates: ChatSessionUpdateRequest,
  ): Promise<ChatSessionResponse> => apiService.patch(`${BASE}/sessions/${id}`, updates),

  upsertMessageFeedback: (
    sessionId: string,
    messageId: string,
    feedback: ChatMessageFeedbackRequest,
  ): Promise<ChatMessage> =>
    apiService.put(`${BASE}/sessions/${sessionId}/messages/${messageId}/feedback`, feedback),

  sendMessage: (id: string, message: string, pageContext?: any): Promise<ChatSendResponse> =>
    apiService.post(
      `${BASE}/sessions/${id}/message`,
      { message, pageContext },
      { timeout: 200_000 },
    ),

  transcribeAudio: (audio: File): Promise<TranscriptionResponse> => {
    const formData = new FormData();
    formData.append("audio", audio);

    return apiService.post(`${BASE}/transcriptions`, formData, {
      timeout: 200_000,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  closeSession: (id: string): Promise<void> =>
    apiService.delete(`${BASE}/sessions/${id}`),
};
