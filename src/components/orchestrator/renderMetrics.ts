import React from "react";

type OrchestratorRenderKind =
  | "CustomNode"
  | "ArchitectureNode"
  | "AnimatedGradientEdge";

export type OrchestratorRenderMetricsSnapshot = {
  enabled: boolean;
  memoizationDisabled: boolean;
  startedAt: string;
  totalRenders: number;
  rendersByType: Record<string, number>;
  rendersById: Record<string, number>;
};

type OrchestratorRenderMetricsApi = {
  get: () => OrchestratorRenderMetricsSnapshot;
  reset: () => void;
};

declare global {
  interface Window {
    __orchestratorRenderMetrics?: OrchestratorRenderMetricsApi;
  }
}

const searchParams =
  typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : undefined;

const metricsEnabled =
  import.meta.env.DEV || searchParams?.get("orchestratorMetrics") === "1";
const memoizationDisabled = searchParams?.get("orchestratorMetricsMemo") === "off";

let startedAt = new Date().toISOString();
let totalRenders = 0;
let rendersByType: Record<string, number> = {};
let rendersById: Record<string, number> = {};

const getSnapshot = (): OrchestratorRenderMetricsSnapshot => ({
  enabled: metricsEnabled,
  memoizationDisabled,
  startedAt,
  totalRenders,
  rendersByType: { ...rendersByType },
  rendersById: { ...rendersById },
});

const resetMetrics = (): void => {
  startedAt = new Date().toISOString();
  totalRenders = 0;
  rendersByType = {};
  rendersById = {};
};

export const recordOrchestratorRender = (
  kind: OrchestratorRenderKind,
  id: string,
): void => {
  if (!metricsEnabled) {
    return;
  }

  totalRenders += 1;
  rendersByType[kind] = (rendersByType[kind] ?? 0) + 1;
  const renderKey = `${kind}:${id}`;
  rendersById[renderKey] = (rendersById[renderKey] ?? 0) + 1;
};

export const memoizeOrchestratorComponent = <Props extends object>(
  component: React.FunctionComponent<Props>,
  areEqual?: (
    previous: Readonly<Props>,
    next: Readonly<Props>,
  ) => boolean,
): React.FunctionComponent<Props> =>
  memoizationDisabled
    ? component
    : (React.memo(component, areEqual) as React.FunctionComponent<Props>);

if (metricsEnabled && typeof window !== "undefined") {
  window.__orchestratorRenderMetrics = {
    get: getSnapshot,
    reset: resetMetrics,
  };
}
