import type { SaveOrchestratorRequest } from "@/types/orchestrator";

export type MaestroDraftAction = "create" | "update";

export interface MaestroDraftPayload {
  token: string;
  sessionId: string;
  action: MaestroDraftAction;
  targetOrchestratorId?: string | null;
  summary?: string;
  saveRequest: SaveOrchestratorRequest;
}

const STORAGE_KEY = "maestro_prefill";

export const writeMaestroDraft = (payload: MaestroDraftPayload): void => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const readMaestroDraft = (): MaestroDraftPayload | null => {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as MaestroDraftPayload;
  } catch (error) {
    console.error("Failed to parse Maestro draft payload", error);
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const clearMaestroDraft = (): void => {
  sessionStorage.removeItem(STORAGE_KEY);
};
