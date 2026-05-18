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

  sendMessage: (id: string, message: string): Promise<ChatSendResponse> =>
    apiService.post(`${BASE}/sessions/${id}/message`, { message }),

  closeSession: (id: string): Promise<void> =>
    apiService.delete(`${BASE}/sessions/${id}`),
};
