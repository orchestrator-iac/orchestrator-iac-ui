import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import type { PageContext } from "@/types/chat";

// Lightweight page context derived from router/document and current store state.
export default function usePageContext(): PageContext {
  const { activeSession } = useAppSelector((s) => s.chat);

  return useMemo(() => {
    const route = typeof window !== "undefined" ? window.location.pathname : undefined;
    const title = typeof document !== "undefined" ? document.title : undefined;
    const orchestratorId = activeSession?.orchestratorId;
    const pageSummary = activeSession?.currentPlan?.summary;

    const ctx: PageContext = {
      route,
      title,
      orchestratorId,
      pageSummary,
    };

    return ctx;
  }, [activeSession]);
}
