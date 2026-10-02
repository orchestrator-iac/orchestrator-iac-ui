import { NodeProps } from "@xyflow/react";
import { NodeData } from "../../types/node-info";
import { UserProfile } from "../../types/auth";
import { CloudConfig } from "../../types/clouds-info";
import { DriftFinding, DriftStatus } from "../../types/orchestrator";

export interface OrchestratorNodeHelpers {
  getAllNodes?: () => any[];
  onLinkFieldChange?: (
    bind: string,
    newSourceId: string,
    context?: { objectSnapshot?: Record<string, any> },
  ) => void;
  onValuesChange?: (name: string, value: any) => void;
  onCloneNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
}

export type OrchestratorNodeData = NodeData & {
  __helpers?: OrchestratorNodeHelpers;
  __nodeType?: string;
  resourceId?: string;
  userInfo?: UserProfile;
  templateInfo?: CloudConfig;
  __viewMode?: "architecture" | "detailed";
  __validationErrors?: Record<string, string>;
  __driftStatus?: DriftStatus;
  __driftFindings?: DriftFinding[];
};

export type OrchestratorNodeProps = NodeProps & {
  data: OrchestratorNodeData;
  isOrchestrator?: boolean;
};

const sameRenderableData = (
  previous: OrchestratorNodeData,
  next: OrchestratorNodeData,
): boolean =>
  previous === next ||
  (previous?.header === next?.header &&
    previous?.footer === next?.footer &&
    previous?.fields === next?.fields &&
    previous?.links === next?.links &&
    previous?.values === next?.values &&
    previous?.architectureView === next?.architectureView &&
    previous?.templateInfo === next?.templateInfo &&
    previous?.userInfo === next?.userInfo &&
    previous?.isExpanded === next?.isExpanded &&
    previous?.__nodeType === next?.__nodeType &&
    previous?.__viewMode === next?.__viewMode &&
    previous?.__validationErrors === next?.__validationErrors &&
    previous?.__driftStatus === next?.__driftStatus &&
    previous?.__driftFindings === next?.__driftFindings &&
    (previous as any)?.friendlyId === (next as any)?.friendlyId);

export const areOrchestratorNodePropsEqual = (
  previous: Readonly<OrchestratorNodeProps>,
  next: Readonly<OrchestratorNodeProps>,
): boolean =>
  previous.id === next.id &&
  previous.type === next.type &&
  previous.isOrchestrator === next.isOrchestrator &&
  previous.isConnectable === next.isConnectable &&
  previous.selected === next.selected &&
  previous.dragging === next.dragging &&
  sameRenderableData(previous.data, next.data);
