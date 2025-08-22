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
  ConnectionMode,
  MarkerType,
  Panel,
} from "@xyflow/react";
import { useDispatch } from "react-redux";
import ELK, { ElkNode } from "elkjs/lib/elk.bundled.js";
import { useParams, useSearchParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useTheme } from "@mui/material/styles";
import DeblurIcon from "@mui/icons-material/Deblur";
import CloudCircleIcon from "@mui/icons-material/CloudCircle";
import SouthAmericaIcon from "@mui/icons-material/SouthAmerica";
import { Box, Chip } from "@mui/material";

import apiService from "./../../services/apiService";
import CustomNode from "./CustomNode";
import { components } from "./../../initial-elements";

import Sidebar from "./sidebar/Sidebar";
import { useDnD } from "./sidebar/DnDContext";

import { AppDispatch } from "../../store";
import { fetchResourceById } from "../../store/resourceSlice";
import InitPopup from "./orchestrator-info/InitPopup";
import { useAuth } from "../../context/AuthContext";
import { CloudConfig } from "../../types/clouds-info";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];
const elk = new ELK();
const defaultOptions: Record<string, string> = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.spacing.nodeNode": "80",
};

const useLayoutElements = () => {
  const { getNodes, setNodes, getEdges, fitView } = useReactFlow();

  const getLayoutElements = useCallback(
    async (options: Record<string, string> = {}) => {
      const layoutOptions = { ...defaultOptions, ...options };

      const nodes = getNodes();
      const edges = getEdges();

      const graph: ElkNode = {
        id: "root",
        layoutOptions,
        children: nodes.map((node) => ({
          id: node.id,
          width: node.measured.width || 450,
          height: node.measured.height || 500,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          sources: [edge.source],
          targets: [edge.target],
        })),
      };

      try {
        const { children } = await elk.layout(graph);

        const layoutedNodes = nodes.map((node) => {
          const elkNode = children?.find((n) => n.id === node.id);
          return {
            ...node,
            position: {
              x: elkNode?.x ?? node.position.x,
              y: elkNode?.y ?? node.position.y,
            },
          };
        });

        setNodes(layoutedNodes);
        requestAnimationFrame(() => fitView({ padding: 0.2 }));
      } catch (err) {
        console.error("ELK layout error:", err);
      }
    },
    [getNodes, getEdges, setNodes, fitView]
  );

  return { getLayoutElements };
};

const OrchestratorReactFlow: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { template_id } = useParams<{ template_id: string }>();
  const { getLayoutElements } = useLayoutElements();
  const { fitView, screenToFlowPosition } = useReactFlow();
  const [searchParams] = useSearchParams();
  const template_type = searchParams.get("template_type");
  const [id] = useDnD();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [initOpen, setInitOpen] = useState(true);
  const [templateInfo, setTemplateInfo] = useState<CloudConfig>({
    templateName: "",
    cloud: "aws",
    region: "",
  });

  const drawerWidth = 240;

  const handleInitSubmit = (data: any) => {
    setTemplateInfo(data);
    setInitOpen(false);
  };

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      if (!id) return;

      const resultAction = await dispatch(fetchResourceById(id));

      if (fetchResourceById.fulfilled.match(resultAction)) {
        const resourceData = resultAction.payload;
        let newNode = {
          ...resourceData?.data?.resourceNode,
          id: `${id}-${uuidv4()}`,
          position: { x: 100, y: 100 },
        };
        if (newNode?.data?.header) {
          newNode = {
            ...newNode,
            data: {
              ...newNode.data,
              header: {
                ...newNode.data.header,
                icon: resourceData?.data?.resourceIcon?.url,
              },
              templateInfo: templateInfo,
              userInfo: user,
            },
          };
        }

        setNodes((nds) => nds.concat(newNode));

        setTimeout(() => {
          getLayoutElements({
            "elk.algorithm": "layered",
            "elk.direction": "RIGHT",
          });
        }, 100);
      } else {
        console.error("Failed to fetch resource", resultAction.error);
      }
    },
    [id, setNodes, dispatch, getLayoutElements, screenToFlowPosition]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
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
          getLayoutElements({
            "elk.algorithm": "layered",
            "elk.direction": "RIGHT",
          });
        }, 100);
      });
  }, [template_id, template_type, setNodes, setEdges, getLayoutElements]);

  const onConnect = useCallback(
    (params: any) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      ),
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
      {templateInfo?.cloud && (
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      )}
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
          connectionMode={ConnectionMode.Loose}
          fitView
        >
          <Panel>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                margin: "10px 20px",
              }}
            >
              {templateInfo?.templateName && (
                <Chip
                  icon={<DeblurIcon />}
                  label={templateInfo?.templateName}
                  onClick={() => {
                    setInitOpen(true);
                  }}
                />
              )}
              {templateInfo?.cloud && (
                <Chip
                  icon={<CloudCircleIcon />}
                  label={templateInfo?.cloud.toUpperCase()}
                  onClick={() => {
                    setInitOpen(true);
                  }}
                />
              )}
              {templateInfo?.region && (
                <Chip
                  icon={<SouthAmericaIcon />}
                  label={templateInfo?.region}
                  onClick={() => {
                    setInitOpen(true);
                  }}
                />
              )}
            </Box>
          </Panel>
          <Background />
          <Controls
            onFitView={() =>
              getLayoutElements({
                "elk.algorithm": "layered",
                "elk.direction": "RIGHT",
              })
            }
          />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
        </ReactFlow>
      </Box>
      <InitPopup
        open={initOpen}
        onClose={() => setInitOpen(false)}
        onSubmit={handleInitSubmit}
      />

      <InitPopup
        open={initOpen}
        onClose={() => setInitOpen(false)}
        onSubmit={handleInitSubmit}
      />
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
