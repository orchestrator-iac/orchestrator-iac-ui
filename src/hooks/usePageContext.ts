import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import type { PageContext } from "@/types/chat";

// Lightweight page context derived from router/document and current store state.
//
// `activeSession` only reflects what Maestro itself has driven (a plan it
// generated in this chat session) — it says nothing about a canvas the user
// opened directly (e.g. an existing/custom orchestrator loaded from a link).
// `canvasContext` is published by the page component itself (see
// Orchestrator.tsx) so Maestro can answer "what am I looking at?" questions
// even when the chat session has no plan of its own yet. Canvas context wins
// when both are present, since it reflects what's actually on screen right now.
export default function usePageContext(): PageContext {
  const { activeSession, canvasContext } = useAppSelector((s) => s.chat);

  return useMemo(() => {
    const route =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : undefined;
    const documentTitle = typeof document !== "undefined" ? document.title : undefined;
    const title = canvasContext?.templateName || documentTitle;
    const orchestratorId = canvasContext?.orchestratorId || activeSession?.orchestratorId;
    const pageSummary = canvasContext?.resourceSummary || activeSession?.currentPlan?.summary;

    const metadata: Record<string, unknown> = {};
    if (canvasContext?.templateType) metadata.templateType = canvasContext.templateType;
    if (canvasContext?.cloudProvider) metadata.cloudProvider = canvasContext.cloudProvider;

    const ctx: PageContext = {
      route,
      title,
      orchestratorId: orchestratorId ?? undefined,
      pageSummary,
      metadata: Object.keys(metadata).length ? metadata : undefined,
    };

    return ctx;
  }, [activeSession, canvasContext]);
}
