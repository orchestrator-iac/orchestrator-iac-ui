/**
 * Orchestrator data types for saving/loading infrastructure configurations
 */

// Minimal node information stored in DB
export interface OrchestratorNode {
  id: string; // Unique node instance ID
  resourceId: string; // Resource template ID (e.g., "aws-vpc", "aws-subnet")
  position: {
    x: number;
    y: number;
  };
  values: Record<string, any>; // User-provided or default values
  __nodeType?: string; // Resource type for rules/labels
  isExpanded?: boolean; // Accordion expanded/collapsed state
}

// Edge information representing relationships between nodes
export interface OrchestratorEdge {
  id: string;
  source: string; // Source node ID
  target: string; // Target node ID
  sourceHandle?: string | null;
  targetHandle?: string | null;
  data: {
    kind: string; // Field name being linked (e.g., "vpc_id", "routes[0].target_id")
    bindKey: string; // Full bind path for array fields (required by backend)
  };
}

// Template configuration metadata
export interface TemplateInfo {
  templateName: string;
  cloud?: string; // e.g., "aws", "azure", "gcp"
  region?: string;
}

// Complete orchestrator state for saving
export interface SaveOrchestratorRequest {
  name: string; // User-defined name for this configuration
  description?: string;
  templateInfo: TemplateInfo;
  nodes: OrchestratorNode[];
  edges: OrchestratorEdge[];
  metadata?: {
    createdAt?: Date;
    updatedAt?: Date;
    version?: string;
    tags?: string[];
  };
}

// Response from save operation
export interface SaveOrchestratorResponse {
  _id: string;
  name: string;
  description?: string;
  templateInfo: TemplateInfo;
  nodes: OrchestratorNode[];
  edges: OrchestratorEdge[];
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
    tags?: string[];
  };
  userId: string;
}

// List view for saved orchestrations
export interface OrchestratorListItem {
  _id: string;
  name: string;
  description?: string;
  templateInfo: TemplateInfo;
  nodes: OrchestratorNode[];
  edges: OrchestratorEdge[];
  nodeCount: number;
  edgeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Response for listing orchestrations
export interface ListOrchestrationsResponse {
  orchestrations: OrchestratorListItem[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}
