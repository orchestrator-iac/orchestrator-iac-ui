import { NodeProps } from "@xyflow/react";
import { NodeData } from "../../types/node-info";
import { UserProfile } from "../../types/auth";
import { CloudConfig } from "../../types/clouds-info";

export interface OrchestratorNodeHelpers {
  allNodes?: any[];
  allEdges?: any[];
  onLinkFieldChange?: (
    bind: string,
    newSourceId: string,
    context?: { objectSnapshot?: Record<string, any> }
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
};

export type OrchestratorNodeProps = NodeProps & {
  data: OrchestratorNodeData;
  isOrchestrator?: boolean;
};
