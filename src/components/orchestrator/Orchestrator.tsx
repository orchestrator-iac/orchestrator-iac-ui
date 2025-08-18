import React, { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  Node,
  Edge,
} from "@xyflow/react";
import ELK from "elkjs/lib/elk.bundled.js";
import { useParams, useSearchParams } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import apiService from "./../../services/apiService";
import CustomNode from "./CustomNode";
import { components } from "./../../initial-elements";
import { useTheme } from "@mui/material/styles";

import { Box } from "@mui/material";
import Sidebar from "./sidebar/Sidebar";
import { useDnD } from "./sidebar/DnDContext";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];
const elk = new ELK();

const useLayoutedElements = () => {
  const { getNodes, setNodes, getEdges, fitView } = useReactFlow();

  const defaultOptions = {
    "elk.algorithm": "layered",
    "elk.layered.spacing.nodeNodeBetweenLayers": 100,
    "elk.spacing.nodeNode": 80,
  };

  const getLayoutedElements = useCallback(
    (options = {}) => {
      const layoutOptions = { ...defaultOptions, ...options };

      const graph = {
        id: "root",
        layoutOptions,
        children: getNodes().map((node) => ({
          ...node,
          width: 180,
          height: 40,
        })),
        edges: getEdges(),
      };

      elk.layout(graph).then(({ children }) => {
        children.forEach((node) => {
          node.position = { x: node.x, y: node.y };
        });

        setNodes(children);
        window.requestAnimationFrame(() => {
          fitView();
        });
      });
    },
    [getNodes, getEdges, setNodes, fitView]
  );

  return { getLayoutedElements };
};

const OrchestratorReactFlow: React.FC = () => {
  const theme = useTheme();
  const { template_id } = useParams<{ template_id: string }>();
  const [searchParams] = useSearchParams();
  const template_type = searchParams.get("template_type");

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { getLayoutedElements } = useLayoutedElements();
  const drawerWidth = 240;
  const { fitView, screenToFlowPosition } = useReactFlow();
  const [id] = useDnD();

  // Dummy handlers to avoid errors
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    console.log("onDrop");
    if (!id) {
      return;
    }
    console.log(id)
    const node = components?.[id]
    node["id"] = `${id}-${uuidv4()}`
    node["position"] = { x: 100, y: 100 }
    setNodes((nds) => nds.concat(node));
  }, [screenToFlowPosition, id]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    console.log("onDragOver");
    event.dataTransfer.dropEffect = "move";
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fitView();
    }, 300);
    return () => clearTimeout(timeout);
  }, [sidebarOpen, fitView]);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme.palette.mode);
  }, [theme.palette.mode]);

  useEffect(() => {
    apiService
      .get(`/wrapper/${template_type}?template_id=${template_id}`)
      .then((wrapper) => {
        const wrapperData = wrapper?.data?.[0];

        if (wrapperData?.nodes) {
          const updatedNodes = wrapperData.nodes.map((node: any) => {
            const component = components?.[node.component_name];
            return {
              ...node,
              ...(component ?? {}),
              type: component ? component.type : "customNode",
            };
          });

          setNodes(updatedNodes);
        }

        setEdges(wrapperData?.edges ?? []);

        setTimeout(() => {
          getLayoutedElements({
            "elk.algorithm": "layered",
            "elk.direction": "DOWN",
          });
        }, 100);
      });
  }, [template_id, template_type, setNodes, setEdges, getLayoutedElements]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <Box
      sx={{
        height: "calc(100vh - 65px)",
        display: "flex",
        flexDirection: "row",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <Box
        sx={{
          flexGrow: 1,
          width: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : "100%",
          transition: "width 0.3s ease",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          colorMode={theme.palette.mode}
          nodeTypes={{ customNode: CustomNode }}
          proOptions={{ hideAttribution: true }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
        </ReactFlow>
      </Box>
    </Box>
  );
};

const Orchestrator: React.FC = () => {
  return (
    <ReactFlowProvider>
      <OrchestratorReactFlow />
    </ReactFlowProvider>
  );
};

export default Orchestrator;
