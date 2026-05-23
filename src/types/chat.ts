// TypeScript interfaces mirroring the Maestro Python schemas

export type MessageRole = "user" | "assistant";
export type MessageType = "text" | "plan" | "diff" | "system";
export type SessionStatus = "planning" | "implementing" | "active" | "closed";

export interface SecurityNote {
  message: string;
  severity: "info" | "warn" | "error";
}

export interface PlanResource {
  resourceType: string;
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

export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp: string;
  messageType: MessageType;
  plan?: PlanSchema;
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
  updatedPlan?: PlanSchema;
  diffSummary?: string;
  intent: string;
  guardrailTriggered: boolean;
  guardrailReason?: string;
}

export interface ChatSessionsListResponse {
  sessions: ChatSessionListItem[];
  total: number;
}
