import React, { useCallback, useEffect, useMemo, useState } from "react";
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
          width: node?.measured?.width ?? 450,
          height: node?.measured?.height ?? 500,
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
    cloud: undefined,
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

        // base node coming from backend
        let newNode: any = {
          ...resourceData?.data?.resourceNode,
          id: `${id}-${uuidv4()}`,
          position: { x: 100, y: 100 },
        };

        // Preserve the domain/resource type BEFORE we override with renderer type
        const resourceType = resourceData?.data?.resourceId;

        if (newNode?.data?.header) {
          newNode = {
            ...newNode,
            data: {
              ...newNode.data,
              // 👇 preserve the actual resource type for rule checks
              __nodeType: resourceType,
              header: {
                ...newNode.data.header,
                icon: resourceData?.data?.resourceIcon?.url,
              },
              templateInfo: templateInfo,
              userInfo: user,
            },
          };
        }

        // Ensure renderer type remains "customNode"
        newNode = { ...newNode, type: "customNode" };

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
    [
      id,
      setNodes,
      dispatch,
      getLayoutElements,
      screenToFlowPosition,
      templateInfo,
      user,
    ]
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

            // Preserve domain type on data.__nodeType for rule checks
            const resourceType = node.type;

            return {
              ...node,
              ...(component ?? {}),
              // renderer type (your component map may set this to "customNode")
              type: component ? component.type : "customNode",
              data: {
                ...node.data,
                __nodeType: resourceType, // 👈 keep the real resource type here
              },
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

  /**
   * Schema-driven onConnect:
   * - Reads target.data.links to determine if the connection is allowed
   * - Uses source.data.__nodeType (fallback source.type) to match fromTypes
   * - Enforces cardinality:
   *    - "1": only one edge of that relation to the target (removes old)
   *    - "many": allows multiple (avoids duplicates)
   * - Mirrors the selected link into target.data.values[bind]
   */
  const onConnect = useCallback(
    (conn: any) => {
      const source = nodes.find((n) => n.id === conn.source);
      const target = nodes.find((n) => n.id === conn.target);
      if (!source || !target) return;

      const sourceType = (source.data as any)?.__nodeType ?? source.type;
      const rules = (target.data as any)?.links ?? [];

      const rule = rules.find(
        (r: any) =>
          Array.isArray(r.fromTypes) && r.fromTypes.includes(sourceType)
      );
      if (!rule) return; // disallow unrelated connections

      const edgeKind = rule.edgeData?.kind ?? rule.bind;
      const cardinality = (rule.cardinality ?? "1") as "1" | "many";

      if (cardinality === "1") {
        // remove existing edge(s) of this relation into this target
        setEdges((eds) =>
          eds.filter(
            (e) =>
              !(
                e.target === target.id &&
                (e.data?.kind ?? rule.bind) === edgeKind
              )
          )
        );
      } else {
        // prevent duplicate edge for "many"
        const exists = edges.some(
          (e) =>
            e.source === source.id &&
            e.target === target.id &&
            (e.data?.kind ?? rule.bind) === edgeKind
        );
        if (exists) return;
      }

      const newEdge: Edge = {
        id: `${source.id}->${target.id}:${rule.bind}`,
        source: source.id,
        target: target.id,
        data: rule.edgeData ?? { kind: rule.bind },
        markerEnd: { type: MarkerType.ArrowClosed },
      };

      setEdges((eds) => addEdge(newEdge, eds));

      // mirror into target's bound field
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== target.id) return n;

          const currentValues = (n.data as any)?.values ?? {};
          if (cardinality === "1") {
            return {
              ...n,
              data: {
                ...n.data,
                values: { ...currentValues, [rule.bind]: source.id },
              },
            };
          } else {
            // store as an array for "many" relations
            const currArr: string[] = Array.isArray(currentValues[rule.bind])
              ? currentValues[rule.bind]
              : [];
            const nextArr = currArr.includes(source.id)
              ? currArr
              : [...currArr, source.id];
            return {
              ...n,
              data: {
                ...n.data,
                values: { ...currentValues, [rule.bind]: nextArr },
              },
            };
          }
        })
      );
    },
    [nodes, edges, setNodes, setEdges]
  );

  // (optional) inject helpers into node.data if you later want DynamicForm to build options from graph
  const nodesWithHelpers = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          __helpers: {
            allNodes: nodes,
            allEdges: edges,
          },
        },
      })),
    [nodes, edges]
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
        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          cloudProvider={templateInfo.cloud}
        />
      )}
      <Box
        sx={{
          flexGrow: 1,
          width: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : "100%",
          transition: "width 0.3s ease",
        }}
      >
        <ReactFlow
          nodes={nodesWithHelpers}
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
