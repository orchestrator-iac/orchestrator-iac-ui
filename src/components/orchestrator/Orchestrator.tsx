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
import Snackbar from "@mui/material/Snackbar";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
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
  "org.eclipse.elk.portConstraints" : "FIXED_ORDER",
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

        const layoutNodes = nodes.map((node) => {
          const elkNode = children?.find((n) => n.id === node.id);
          return {
            ...node,
            position: {
              x: elkNode?.x ?? node.position.x,
              y: elkNode?.y ?? node.position.y,
            },
          };
        });

        setNodes(layoutNodes);
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
  const { fitView } = useReactFlow();
  const [searchParams] = useSearchParams();
  const template_type = searchParams.get("template_type");
  const [id] = useDnD();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [initOpen, setInitOpen] = useState(true);
  const [undoStack, setUndoStack] = useState<{
    nodes: Node[];
    edges: Edge[];
  } | null>(null);
  const [snackOpen, setSnackOpen] = useState(false);
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

        // node from backend
        let newNode: any = {
          ...resourceData?.data?.resourceNode,
          id: `${id}-${uuidv4()}`,
          position: { x: 100, y: 100 },
        };

        // use resourceId as canonical domain type
        const resourceType =
          resourceData?.data?.resourceId ?? newNode?.type ?? "unknown";

        if (newNode?.data?.header) {
          newNode = {
            ...newNode,
            data: {
              ...newNode.data,
              __nodeType: resourceType, // keep the real resource type for rules/labels
              header: {
                ...newNode.data.header,
                icon: resourceData?.data?.resourceIcon?.url,
              },
              templateInfo: templateInfo,
              userInfo: user,
            },
          };
        }

        // renderer type
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
    [id, setNodes, dispatch, getLayoutElements, templateInfo, user]
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
    setNodes((nds) =>
      nds.map((n) => {
        const rules = (n.data as any)?.links ?? [];
        if (!Array.isArray(rules) || rules.length === 0) return n;

        const current = (n.data as any)?.values ?? {};
        const nextValues: Record<string, any> = { ...current };
        let changed = false;

        rules.forEach((rule: any) => {
          const edgeKind = rule?.edgeData?.kind ?? rule.bind;
          const incoming = edges.filter(
            (e) => e.target === n.id && (e.data?.kind ?? rule.bind) === edgeKind
          );

          if ((rule.cardinality ?? "1") === "many") {
            const srcs = incoming
              .map((e) => e.source)
              .sort((a: string, b: string) =>
                a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
              );
            const prev = Array.isArray(nextValues[rule.bind])
              ? [...nextValues[rule.bind]].sort((a: string, b: string) =>
                  a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
                )
              : [];
            const same =
              prev.length === srcs.length &&
              prev.every((v, i) => v === srcs[i]);
            if (!same) {
              nextValues[rule.bind] = srcs;
              changed = true;
            }
          } else {
            const src = incoming[0]?.source ?? "";
            if (nextValues[rule.bind] !== src) {
              nextValues[rule.bind] = src;
              changed = true;
            }
          }
        });

        return changed ? { ...n, data: { ...n.data, values: nextValues } } : n;
      })
    );
  }, [edges, setNodes]);

  useEffect(() => {
    apiService
      .get(`/wrapper/${template_type}?template_id=${template_id}`)
      .then((wrapper) => {
        const wrapperData = wrapper?.data?.[0];

        if (wrapperData?.nodes) {
          const updatedNodes = wrapperData.nodes.map((node: any) => {
            const component = components?.[node.component_name];
            const resourceType =
              node?.data?.resourceId ?? node.type ?? "unknown";
            return {
              ...node,
              ...(component ?? {}),
              type: component ? component.type : "customNode",
              data: {
                ...node.data,
                __nodeType: resourceType,
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

  // Drag edge → update target form (values[bind]) + enforce rules
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
      if (!rule) return;

      const edgeKind = rule.edgeData?.kind ?? rule.bind;
      const cardinality = (rule.cardinality ?? "1") as "1" | "many";

      if (cardinality === "1") {
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
        markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12 },
        style: rule.edgeData?.style ?? {
          strokeWidth: 4,
          strokeDasharray: "8 2",
        },
        animated: rule.edgeData?.animated ?? false,
      };

      setEdges((eds) => addEdge(newEdge, eds));

      // mirror into target's bound field immediately
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
          }
          const arr: string[] = Array.isArray(currentValues[rule.bind])
            ? currentValues[rule.bind]
            : [];
          const next = arr.includes(source.id) ? arr : [...arr, source.id];
          return {
            ...n,
            data: {
              ...n.data,
              values: { ...currentValues, [rule.bind]: next },
            },
          };
        })
      );
    },
    [nodes, edges, setNodes, setEdges]
  );

  // Dropdown change → rewire edges & values
  const onLinkFieldChange = useCallback(
    ({
      nodeId,
      bind,
      newSourceId,
    }: {
      nodeId: string;
      bind: string;
      newSourceId: string;
    }) => {
      const target = nodes.find((n) => n.id === nodeId);
      if (!target) return;

      const rules = (target.data as any)?.links ?? [];
      const rule = rules.find((r: any) => r.bind === bind);
      if (!rule) {
        console.warn(`No rule found for bind: ${bind} on node: ${nodeId}`);
        return;
      }
      const edgeKind = rule?.edgeData?.kind ?? bind;
      const cardinality: "1" | "many" = rule?.cardinality ?? "1";

      // remove existing edges for this relation into this target
      setEdges((eds) =>
        eds.filter(
          (e) => !(e.target === nodeId && (e.data?.kind ?? bind) === edgeKind)
        )
      );

      // update values on the node
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n;
          const current = (n.data as any)?.values ?? {};
          if (!newSourceId) {
            return {
              ...n,
              data: {
                ...n.data,
                values: {
                  ...current,
                  [bind]: cardinality === "many" ? [] : "",
                },
              },
            };
          }
          if (cardinality === "many") {
            const arr = Array.isArray(current[bind]) ? current[bind] : [];
            const next = arr.includes(newSourceId)
              ? arr
              : [...arr, newSourceId];
            return {
              ...n,
              data: { ...n.data, values: { ...current, [bind]: next } },
            };
          }
          return {
            ...n,
            data: { ...n.data, values: { ...current, [bind]: newSourceId } },
          };
        })
      );

      // add edge if a source is chosen
      if (newSourceId) {
        const newEdge: Edge = {
          id: `${newSourceId}->${nodeId}:${bind}`,
          source: newSourceId,
          target: nodeId,
          data: rule?.edgeData ?? { kind: bind },
          markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12 },
          style: rule?.edgeData?.style ?? {
            strokeWidth: 4,
            strokeDasharray: "8 2",
          },
          animated: rule?.edgeData?.animated ?? false,
        };
        setEdges((eds) => addEdge(newEdge, eds));
      }
    },
    [nodes, setNodes, setEdges]
  );

  const onCloneNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const original = nds.find((n) => n.id === nodeId);
        if (!original) return nds;
        const cloneId = `${nodeId}-copy-${(Math.random() * 1e5).toFixed(0)}`;
        const offset = { x: 40, y: 40 };
        const clone: Node = {
          ...original,
          id: cloneId,
          position: {
            x: original.position.x + offset.x,
            y: original.position.y + offset.y,
          },
          data: {
            ...original.data,
            // reset values if you want a clean clone:
            // values: {},
          },
        };
        return nds.concat(clone);
      });
    },
    [setNodes]
  );

  const actuallyDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
      );
    },
    [setNodes, setEdges]
  );

  const onDeleteNode = useCallback(
    (nodeId: string) => {
      // snapshot for undo
      setUndoStack({ nodes: [...nodes], edges: [...edges] });
      setSnackOpen(true);
      // perform delete
      actuallyDeleteNode(nodeId);
    },
    [nodes, edges, actuallyDeleteNode]
  );

  // Delete selected edges via keyboard/backspace is automatic if you enable deleteKeyCode,
  // but add this as well so we can snapshot for undo when edges are deleted via UI:
  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      setUndoStack({ nodes: [...nodes], edges: [...edges] });
      setSnackOpen(true);
      setEdges((eds) => eds.filter((e) => !deleted.some((d) => d.id === e.id)));
    },
    [nodes, edges, setEdges]
  );

  // Optional: onNodesDelete for consistency (if you allow multi-select deletions)
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      setUndoStack({ nodes: [...nodes], edges: [...edges] });
      setSnackOpen(true);
      const ids = new Set(deleted.map((n) => n.id));
      setNodes((nds) => nds.filter((n) => !ids.has(n.id)));
      setEdges((eds) =>
        eds.filter((e) => !ids.has(e.source) && !ids.has(e.target))
      );
    },
    [nodes, edges, setNodes, setEdges]
  );

  // Undo handler
  const handleUndo = () => {
    if (!undoStack) return;
    setNodes(undoStack.nodes);
    setEdges(undoStack.edges);
    setUndoStack(null);
    setSnackOpen(false);
  };

  // Inject helpers for DynamicForm (dynamic options + dropdown→edge sync)
  const nodesWithHelpers = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          __helpers: {
            ...(n.data as any).__helpers,
            allNodes: nodes,
            allEdges: edges,
            onLinkFieldChange,
            onCloneNode,
            onDeleteNode,
          },
        },
      })),
    [nodes, edges, onLinkFieldChange, onCloneNode, onDeleteNode]
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
          onEdgesDelete={onEdgesDelete}
          onNodesDelete={onNodesDelete}
          connectionMode={ConnectionMode.Loose}
          deleteKeyCode={["Delete", "Backspace"]}
          fitView
        >
          <Panel>
            <Box sx={{ display: "flex", gap: 2, margin: "10px 20px" }}>
              {templateInfo?.templateName && (
                <Chip
                  icon={<DeblurIcon />}
                  label={templateInfo?.templateName}
                  onClick={() => setInitOpen(true)}
                />
              )}
              {templateInfo?.cloud && (
                <Chip
                  icon={<CloudCircleIcon />}
                  label={templateInfo?.cloud.toUpperCase()}
                  onClick={() => setInitOpen(true)}
                />
              )}
              {templateInfo?.region && (
                <Chip
                  icon={<SouthAmericaIcon />}
                  label={templateInfo?.region}
                  onClick={() => setInitOpen(true)}
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
      <Snackbar
        open={snackOpen}
        autoHideDuration={5000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          elevation={3}
          variant="filled"
          sx={{
            bgcolor: theme.palette.background.paper,
            color: theme.palette.textVariants.text1,
            "& .MuiAlert-icon": { color: theme.palette.primary.main },
            "& .MuiAlert-message .MuiButton-root": {
              color: theme.palette.background.paper,
            },
            border: `1px solid ${theme.palette.divider}`,
          }}
          action={
            <Button
              size="small"
              sx={{ color: theme.palette.primary.main }}
              onClick={handleUndo}
            >
              UNDO
            </Button>
          }
          onClose={() => setSnackOpen(false)}
        >
          Changes applied
        </Alert>
      </Snackbar>
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
