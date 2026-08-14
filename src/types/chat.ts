// TypeScript interfaces mirroring the Maestro Python schemas

export type MessageRole = "user" | "assistant";
export type MessageType = "text" | "plan" | "diff" | "system";
export type SessionStatus = "planning" | "implementing" | "active" | "closed";
export type PlanImplementationAction = "create" | "update";
export type MessageFeedbackSentiment = "positive" | "negative";

export interface SecurityNote {
  message: string;
  severity: "info" | "warn" | "error";
}

export interface PlanResource {
  id?: string;
  resourceType: string;
  resourceName?: string;
  cloudProvider: string;
  intent: string;
  config: Record<string, unknown>;
  dependencies: string[];
}

export interface PlanSchema {
  templateName?: string;
  resources: PlanResource[];
  summary: string;
  securityNotes: SecurityNote[];
  estimatedMonthlyUSD?: number | null;
}

export interface ChatMessageFeedback {
  sentiment: MessageFeedbackSentiment;
  reasons: string[];
  details?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageFeedbackRequest {
  sentiment: MessageFeedbackSentiment;
  reasons?: string[];
  details?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  messageType: MessageType;
  plan?: PlanSchema;
  feedback?: ChatMessageFeedback;
}

export interface PageContext {
  route?: string;
  title?: string;
  orchestratorId?: string;
  selectedResourceId?: string;
  pageSummary?: string;
  // free-form metadata (should be sanitized before sending)
  metadata?: Record<string, unknown>;
}

// Snapshot of what's actually on the orchestrator canvas right now, published
// by the Orchestrator page so Maestro can answer "what am I looking at?"
// questions even when no chat-driven plan exists for this session yet.
export interface CanvasContext {
  orchestratorId?: string | null;
  templateType?: string | null;
  templateName?: string;
  cloudProvider?: string;
  resourceSummary?: string;
}

export interface ChatSessionListItem {
  id: string;
  title?: string;
  preview?: string;
  status: SessionStatus;
  orchestratorId?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSessionResponse {
  id: string;
  userId: string;
  orchestratorId?: string;
  status: SessionStatus;
  title?: string;
  currentPlan?: PlanSchema;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatSendResponse {
  sessionId: string;
  botResponse: string;
  messageType: MessageType;
  assistantMessage: ChatMessage;
  updatedPlan?: PlanSchema;
  diffSummary?: string;
  intent: string;
  guardrailTriggered: boolean;
  guardrailReason?: string;
}

export interface TranscriptionJobResponse {
  jobId: string;
  status: "processing" | "done" | "error";
}

export interface TranscriptionStatusResponse {
  jobId: string;
  status: "processing" | "done" | "error";
  transcript?: string | null;
  modelName?: string | null;
  language?: string | null;
  languageProbability?: number | null;
  detail?: string | null;
}

export interface ChatSessionsListResponse {
  sessions: ChatSessionListItem[];
  total: number;
}

export interface ChatSessionUpdateRequest {
  orchestratorId?: string | null;
  status?: SessionStatus;
}
