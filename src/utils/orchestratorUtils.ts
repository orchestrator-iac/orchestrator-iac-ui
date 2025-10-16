import { Node, Edge } from "@xyflow/react";
import {
  OrchestratorNode,
  OrchestratorEdge,
  SaveOrchestratorRequest,
  TemplateInfo,
} from "../types/orchestrator";

/**
 * Transform React Flow node to minimal database format
 * Extracts only the essential data needed to reconstruct the node
 * @param node - React Flow node instance
 * @returns Minimal node data for DB storage
 */
export const transformNodeForDB = (node: Node): OrchestratorNode => {
  const resourceId = (node.data?.__resourceId || node.data?.__nodeType || node.type) as string;
  
  return {
    id: node.id,
    resourceId: resourceId,
    position: {
      x: node.position.x,
      y: node.position.y,
    },
    values: node.data?.values || {},
    __nodeType: node.data?.__nodeType as string | undefined,
  };
};

/**
 * Transform React Flow edge to minimal database format
 * Preserves relationship metadata (bindKey for array fields)
 * @param edge - React Flow edge instance
 * @returns Minimal edge data for DB storage
 */
export const transformEdgeForDB = (edge: Edge): OrchestratorEdge => {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    data: {
      kind: edge.data?.kind as string | undefined,
      bindKey: edge.data?.bindKey as string | undefined,
    },
  };
};

/**
 * Prepare complete orchestrator data for saving to database
 * Transforms all nodes and edges to minimal format
 * @param nodes - Array of React Flow nodes
 * @param edges - Array of React Flow edges
 * @param templateInfo - Template configuration metadata
 * @param name - User-defined name for this configuration
 * @param description - Optional description
 * @returns Complete orchestrator save request
 */
export const prepareOrchestratorForSave = (
  nodes: Node[],
  edges: Edge[],
  templateInfo: TemplateInfo,
  name: string,
  description?: string
): SaveOrchestratorRequest => {
  return {
    name,
    description,
    templateInfo,
    nodes: nodes.map(transformNodeForDB),
    edges: edges.map(transformEdgeForDB),
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: "1.0",
    },
  };
};

/**
 * Reconstruct React Flow node from database format
 * Will need to fetch resource template to get full schema/UI config
 * @param dbNode - Minimal node from database
 * @param resourceTemplate - Full resource template fetched by resourceId
 * @returns React Flow node with complete data structure
 */
export const reconstructNodeFromDB = (
  dbNode: OrchestratorNode,
  resourceTemplate: any // Will be fetched from API using dbNode.resourceId
): Node => {
  return {
    id: dbNode.id,
    type: "customNode",
    position: dbNode.position,
    data: {
      ...resourceTemplate?.resourceNode?.data,
      values: dbNode.values,
      __nodeType: dbNode.__nodeType || dbNode.resourceId,
      __resourceId: dbNode.resourceId,
    },
  };
};

/**
 * Reconstruct React Flow edge from database format
 * @param dbEdge - Minimal edge from database
 * @returns React Flow edge with complete configuration
 */
export const reconstructEdgeFromDB = (dbEdge: OrchestratorEdge): Edge => {
  return {
    id: dbEdge.id,
    source: dbEdge.source,
    target: dbEdge.target,
    sourceHandle: dbEdge.sourceHandle || undefined,
    targetHandle: dbEdge.targetHandle || undefined,
    type: "smoothstep",
    animated: true,
    markerEnd: {
      type: "arrowclosed" as any,
    },
    data: {
      kind: dbEdge.data?.kind,
      bindKey: dbEdge.data?.bindKey,
    },
  };
};

/**
 * Validate orchestrator data before saving
 * @param nodes - Array of nodes to validate
 * @param edges - Array of edges to validate
 * @returns Validation result with errors if any
 */
export const validateOrchestratorData = (
  nodes: Node[],
  edges: Edge[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check for empty configuration
  if (nodes.length === 0) {
    errors.push("Cannot save empty orchestrator (no nodes)");
  }

  // Validate node IDs are unique
  const nodeIds = new Set<string>();
  for (const node of nodes) {
    if (nodeIds.has(node.id)) {
      errors.push(`Duplicate node ID found: ${node.id}`);
    }
    nodeIds.add(node.id);
  }

  // Validate edges reference existing nodes
  for (const edge of edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge ${edge.id} references non-existent source node: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge ${edge.id} references non-existent target node: ${edge.target}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Extract metadata summary for orchestrator list view
 * @param nodes - Array of nodes
 * @param edges - Array of edges
 * @returns Summary statistics
 */
export const extractOrchestratorSummary = (nodes: Node[], edges: Edge[]) => {
  const resourceTypes = new Set<string>();
  
  for (const node of nodes) {
    const type = (node.data?.__nodeType || node.type) as string;
    if (type && typeof type === 'string') {
      resourceTypes.add(type);
    }
  }

  return {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    resourceTypes: Array.from(resourceTypes),
  };
};
