import React, { useEffect, useRef, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  Node,
  Edge,
} from "@xyflow/react";
import { Box, Typography, useTheme, alpha } from "@mui/material";

import ArchitectureNode from "./ArchitectureNode";
import AnimatedGradientEdge from "./AnimatedGradientEdge";

const nodeTypes = { architectureNode: ArchitectureNode };
const edgeTypes = { animatedGradient: AnimatedGradientEdge };

/**
 * Convert a stored resourceId/nodeType like "aws-vpc" or "aws_rds_instance"
 * to a human-readable label like "VPC" or "RDS Instance".
 */
const formatLabel = (nodeType: string): string => {
  if (!nodeType) return "Resource";
  // Strip cloud provider prefix (aws-, azure-, gcp-)
  const withoutPrefix = nodeType.replace(/^(aws|azure|gcp)[_-]/i, "");
  return withoutPrefix
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

// ── Helper: build an architectureNode from a slim DB node (no API call needed) ──

const buildArchNode = (n: any): Node => {
  const nodeType =
    n.__nodeType ?? n.resourceId ?? (n.id as string).split("-")[0];
  return {
    id: n.id,
    type: "architectureNode",
    position: n.position ?? { x: 0, y: 0 },
    data: {
      header: {
        icon: "",                      // icon URL not available without auth call
        label: formatLabel(nodeType),
        sub_label: nodeType,
      },
      values: n.values ?? {},
      __nodeType: nodeType,
      friendlyId: n.friendlyId ?? n.friendly_id,
      isExpanded: false,
      architectureView: undefined,
      __helpers: undefined,
    },
  };
};

const buildArchEdge = (e: any): Edge => ({ ...e, type: "animatedGradient" });

// ── Inner component (must be inside ReactFlowProvider to use useReactFlow) ──

interface InnerProps {
  rawNodes: any[];
  rawEdges: any[];
  height: number | string;
}

const CanvasPreviewInner: React.FC<InnerProps> = ({ rawNodes, rawEdges, height }) => {
  const { fitView } = useReactFlow();
  const theme = useTheme();
  const fitted = useRef(false);

  // Map slim DB nodes → architectureNode — no auth API calls required.
  // DB nodes contain: id, resourceId, position, values, __nodeType, friendlyId, isExpanded.
  // ArchitectureNode gracefully falls back to header.label when architectureView is absent.
  const nodes = useMemo<Node[]>(() => rawNodes.map(buildArchNode), [rawNodes]);

  // Pass stored edges through directly — no link-rule re-validation needed
  const edges = useMemo<Edge[]>(() => rawEdges.map(buildArchEdge), [rawEdges]);

  // Fit view once nodes are in the DOM
  useEffect(() => {
    if (nodes.length > 0 && !fitted.current) {
      const raf = requestAnimationFrame(() => {
        fitView({ padding: 0.15, duration: 400 });
        fitted.current = true;
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [nodes.length, fitView]);

  if (nodes.length === 0) {
    return (
      <Box
        sx={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 3,
          border: "1px dashed",
          borderColor: "divider",
          backgroundColor:
            theme.palette.mode === "dark"
              ? alpha("#fff", 0.02)
              : alpha("#000", 0.015),
        }}
      >
        <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.5 }}>
          No nodes in this template
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        colorMode={theme.palette.mode}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls showInteractive={false} />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
      </ReactFlow>
    </Box>
  );
};

// ── Public component ──

export interface CanvasPreviewProps {
  rawNodes: any[];
  rawEdges: any[];
  height?: number | string;
}

const CanvasPreview: React.FC<CanvasPreviewProps> = ({ rawNodes, rawEdges, height = 520 }) => (
  <ReactFlowProvider>
    <CanvasPreviewInner rawNodes={rawNodes} rawEdges={rawEdges} height={height} />
  </ReactFlowProvider>
);

export default CanvasPreview;
