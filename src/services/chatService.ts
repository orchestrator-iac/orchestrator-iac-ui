import apiService from "./apiService";
import type {
  ChatSessionResponse,
  ChatSendResponse,
  ChatSessionsListResponse,
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

  sendMessage: (id: string, message: string, pageContext?: any): Promise<ChatSendResponse> =>
    apiService.post(
      `${BASE}/sessions/${id}/message`,
      { message, pageContext },
      { timeout: 200_000 },
    ),

  closeSession: (id: string): Promise<void> =>
    apiService.delete(`${BASE}/sessions/${id}`),
};
