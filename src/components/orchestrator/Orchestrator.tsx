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
import { useDispatch, useSelector } from "react-redux";
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

import CustomNode from "./CustomNode";
import ArchitectureNode from "./ArchitectureNode";
import { OrchestratorMenu } from "./menu";

import Sidebar from "./sidebar/Sidebar";
import { useDnD } from "./sidebar/DnDContext";

import { AppDispatch, RootState } from "../../store";
import { fetchResourceById } from "../../store/resourceSlice";
import InitPopup from "./orchestrator-info/InitPopup";
import { useAuth } from "../../context/AuthContext";
import { CloudConfig } from "../../types/clouds-info";
import { fetchOrchestrators } from "@/store/orchestratorsSlice";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];
const elk = new ELK();
const defaultOptions: Record<string, string> = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.spacing.nodeNode": "80",
  "org.eclipse.elk.portConstraints": "FIXED_ORDER",
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
  const [initOpen, setInitOpen] = useState(false);
  const [isArchitectureMode, setIsArchitectureMode] = useState(false);
  const [undoStack, setUndoStack] = useState<{
    nodes: Node[];
    edges: Edge[];
  } | null>(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const [templateInfo, setTemplateInfo] = useState<CloudConfig>({
    templateName: "",
    description: "",
    cloud: undefined,
    region: "",
  });
  const [currentOrchestratorId, setCurrentOrchestratorId] = useState<
    string | null
  >(null);

  const { data: orchestrators, status: orchestratorsStatus } = useSelector(
    (state: RootState) => state.orchestrators
  );

  const drawerWidth = 240;

  useEffect(() => {
    if (orchestratorsStatus === "idle") dispatch(fetchOrchestrators({}));
  }, [dispatch, orchestratorsStatus]);

  useEffect(() => {
    if (!isArchitectureMode) return;
    setNodes((nds) =>
      nds.map((node) => (node.selected ? { ...node, selected: false } : node))
    );
    setEdges((eds) =>
      eds.map((edge) => (edge.selected ? { ...edge, selected: false } : edge))
    );
  }, [isArchitectureMode, setNodes, setEdges]);

  const handleInitSubmit = (data: any) => {
    setTemplateInfo(data);
    setInitOpen(false);
  };

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      if (!id || isArchitectureMode) return;

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
            type: "customNode",
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
      isArchitectureMode,
      setNodes,
      dispatch,
      getLayoutElements,
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
    document.body.dataset.theme = theme.palette.mode;
    // Disable body scroll on Orchestrator page
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [theme.palette.mode]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        const rules = (n.data as any)?.links ?? [];
        if (!Array.isArray(rules) || rules.length === 0) return n;

        const current = (n.data as any)?.values ?? {};
        const nextValues: Record<string, any> = { ...current };
        let changed = false;

        const isEqualObjectArray = (
          left: Array<Record<string, any>>,
          right: Array<Record<string, any>>
        ) => {
          if (left.length !== right.length) return false;
          for (let i = 0; i < left.length; i += 1) {
            const a = left[i] ?? {};
            const b = right[i] ?? {};
            const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
            for (const key of keys) {
              if ((a as any)[key] !== (b as any)[key]) return false;
            }
          }
          return true;
        };

        rules.forEach((rule: any) => {
          const edgeKind = rule?.edgeData?.kind ?? rule.bind;
          const incoming = edges.filter(
            (e) => e.target === n.id && (e.data?.kind ?? rule.bind) === edgeKind
          );

          if ((rule.cardinality ?? "1") === "many") {
            const incomingWithBindKey = incoming.filter(
              (edge) => typeof edge.data?.bindKey === "string"
            );
            const hasObjectSyntax = incomingWithBindKey.some((edge) =>
              /\[\d+\]\.[^.]+$/.test(edge.data?.bindKey as string)
            );
            const existingValue = nextValues[rule.bind];
            const existingHasObjects = Array.isArray(existingValue)
              ? existingValue.some(
                  (item) =>
                    item != null &&
                    typeof item === "object" &&
                    !Array.isArray(item)
                )
              : false;

            if (hasObjectSyntax || existingHasObjects) {
              const baseArray: Array<Record<string, any>> = Array.isArray(
                existingValue
              )
                ? existingValue.map((item) =>
                    item != null &&
                    typeof item === "object" &&
                    !Array.isArray(item)
                      ? { ...item }
                      : {}
                  )
                : [];

              for (const edge of incomingWithBindKey) {
                const bindKey = edge.data?.bindKey as string | undefined;
                if (!bindKey) return;
                const match = /^(.+)\[(\d+)\]\.([^.]+)$/.exec(bindKey);
                if (!match) return;
                const idx = Number.parseInt(match[2], 10);
                const key = match[3];
                while (baseArray.length <= idx) baseArray.push({});
                const currentObj = { ...baseArray[idx] };
                if (currentObj[key] !== edge.source) {
                  currentObj[key] = edge.source;
                  baseArray[idx] = currentObj;
                }
              }

              const snapshotArray = Array.isArray(existingValue)
                ? existingValue.map((item) =>
                    item != null &&
                    typeof item === "object" &&
                    !Array.isArray(item)
                      ? { ...item }
                      : {}
                  )
                : [];

              if (!isEqualObjectArray(snapshotArray, baseArray)) {
                nextValues[rule.bind] = baseArray;
                changed = true;
              }
            } else {
              const srcs = incoming.map((e) => e.source); // keep order of addition
              const existingList: string[] = Array.isArray(existingValue)
                ? existingValue
                : [];
              // Merge: keep all current edge sources first, then retain any blanks or manual placeholders not yet connected
              const merged = [
                ...srcs,
                ...existingList.filter((v) => v === "" || !srcs.includes(v)),
              ];
              const same =
                existingList.length === merged.length &&
                existingList.every((v, i) => v === merged[i]);
              if (!same) {
                nextValues[rule.bind] = merged;
                changed = true;
              }
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
    if (!template_id || !template_type) return;
    else if (template_id === "new") {
      setInitOpen(true);
    } else {
      setInitOpen(false);
      // Find orchestrator data from Redux store
      setCurrentOrchestratorId(template_id);
      const orchestratorData = orchestrators.find((o) => o._id === template_id);

      if (orchestratorData) {
        // Pre-fill template info from orchestrator data
        const templateInfo = {
          templateName: orchestratorData.templateInfo?.templateName,
          description: orchestratorData.templateInfo?.description || "",
          cloud: orchestratorData.templateInfo?.cloud as any,
          region: orchestratorData.templateInfo?.region || "",
        };
        setTemplateInfo(templateInfo);
        const customNodes = [];
        const resourceNodes: Node[] = [];
        for (const node of orchestratorData?.nodes || []) {
          const id = node.id.split("-")[0];
          customNodes.push(dispatch(fetchResourceById(id)));
        }
        Promise.all(customNodes).then((results) => {
          for (let i = 0; i < results.length; i += 1) {
            const resultAction = results[i];
            const dbNode = orchestratorData.nodes[i];
            if (fetchResourceById.fulfilled.match(resultAction)) {
              const resourceData = resultAction.payload;
              const reconstructedNode: Node = {
                id: dbNode.id,
                type: "customNode",
                position: dbNode.position,
                data: {
                  ...resourceData?.data?.resourceNode?.data,
                  values: dbNode.values,
                  __nodeType: dbNode.__nodeType || dbNode.resourceId,
                  __resourceId: dbNode.resourceId,
                  isExpanded: dbNode.isExpanded ?? true, // Restore accordion state
                  friendlyId: dbNode.friendlyId ?? (dbNode as any)?.friendly_id,
                  header: {
                    ...resourceData?.data?.resourceNode?.data?.header,
                    icon: resourceData?.data?.resourceIcon?.url,
                  },
                  templateInfo,
                  userInfo: user,
                },
              };
              resourceNodes.push(reconstructedNode);
              // Only add node if it doesn't already exist
              setNodes((nds) => {
                const exists = nds.some((n) => n.id === reconstructedNode.id);
                return exists ? nds : nds.concat(reconstructedNode);
              });
            }
          }

          for (const dbEdge of orchestratorData?.edges || []) {
            const source = resourceNodes.find((n) => n.id === dbEdge.source);
            const target = resourceNodes.find((n) => n.id === dbEdge.target);
            if (!source || !target) continue;

            const sourceType = (source.data as any)?.__nodeType ?? source.type;
            const rules = (target.data as any)?.links ?? [];

            const rule = rules.find(
              (r: any) =>
                Array.isArray(r.fromTypes) && r.fromTypes.includes(sourceType)
            );
            if (!rule) continue;

            const newEdge: Edge = {
              id: `${source.id}->${target.id}:${rule.bind}`,
              source: source.id,
              target: target.id,
              data: rule.edgeData ?? { kind: rule.bind },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 12,
                height: 12,
              },
              style: rule.edgeData?.style ?? {
                strokeWidth: 4,
                strokeDasharray: "8 2",
              },
              animated: rule.edgeData?.animated ?? false,
            };

            setEdges((eds) => addEdge(newEdge, eds));
          }
        });
      }
    }
  }, [
    template_id,
    template_type,
    orchestrators,
    setNodes,
    setEdges,
    getLayoutElements,
  ]);

  // Drag edge → update target form (values[bind]) + enforce rules
  const onConnect = useCallback(
    (conn: any) => {
      if (isArchitectureMode) return;
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
    [nodes, edges, setNodes, setEdges, isArchitectureMode]
  );

  // Dropdown change → rewire edges & values
  const onLinkFieldChange = useCallback(
    ({
      nodeId,
      bind,
      newSourceId,
      context,
    }: {
      nodeId: string;
      bind: string;
      newSourceId: string;
      context?: {
        objectSnapshot?: Record<string, any>;
      };
    }) => {
      if (isArchitectureMode) return;
      if (bind == null) return;
      const bindStr: string = typeof bind === "string" ? bind : String(bind);

      // Ensure newSourceId is always a string (handle cases where object is passed)
      let sourceId = "";
      if (typeof newSourceId === "string") {
        sourceId = newSourceId;
      } else if (typeof newSourceId === "object" && newSourceId !== null) {
        // Extract ID from object (handle cases like {id: "...", value: "..."})
        const idObj = newSourceId as any;
        sourceId = String(idObj.id || idObj.value || "");
      } else {
        sourceId = String(newSourceId || "");
      }

      const target = nodes.find((n) => n.id === nodeId);
      if (!target) return;
      const baseBind = bindStr.includes("[") ? bindStr.split("[")[0] : bindStr;
      const rules = (target.data as any)?.links ?? [];
      const rule = rules.find((r: any) => r.bind === baseBind);
      if (!rule) {
        console.warn(
          `No rule found for bind: ${bindStr} (base: ${baseBind}) on node: ${nodeId}`
        );
        return;
      }
      const edgeKind = rule?.edgeData?.kind ?? baseBind;
      const cardinality: "1" | "many" =
        rule?.cardinality === "many" ? "many" : "1";

      // Support array-of-objects syntax: fieldName[index].key
      const arrayObjMatch = /^(.+)\[(\d+)\]\.([^.]+)$/.exec(bindStr);
      const objIndex: number | null = arrayObjMatch
        ? Number.parseInt(arrayObjMatch[2], 10)
        : null;
      const objKey: string | null = arrayObjMatch ? arrayObjMatch[3] : null;

      // Parse synthetic index if present: fieldName[3]
      const indexMatch = /^(.*)\[(\d+)\]$/.exec(bindStr);
      const syntheticIndex = indexMatch
        ? Number.parseInt(indexMatch[2], 10)
        : null;

      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n;
          const current = (n.data as any)?.values ?? {};

          if (cardinality === "1") {
            // Single relation: set or clear directly
            return {
              ...n,
              data: {
                ...n.data,
                values: {
                  ...current,
                  [baseBind]: sourceId || "",
                },
              },
            };
          }

          // MANY cardinality
          // Case 1: array of objects with key path: fieldName[index].key
          if (objIndex !== null && objKey) {
            const prevArrObjs: Array<Record<string, any>> = Array.isArray(
              current[baseBind]
            )
              ? [...current[baseBind]]
              : [];

            // Ensure array and object at index exist
            while (prevArrObjs.length <= objIndex) prevArrObjs.push({});
            const objAtIndexBase = context?.objectSnapshot
              ? { ...context.objectSnapshot }
              : { ...prevArrObjs[objIndex] };
            const objAtIndex = { ...objAtIndexBase };

            if (sourceId) {
              objAtIndex[objKey] = sourceId;
              prevArrObjs[objIndex] = objAtIndex;

              // Remove duplicate occurrences of the same id for this key across other indices
              for (let i = prevArrObjs.length - 1; i >= 0; i--) {
                if (i !== objIndex) {
                  const item = prevArrObjs[i] ?? {};
                  if (item && item[objKey] === sourceId) {
                    const rest = { ...item };
                    delete rest[objKey];
                    prevArrObjs[i] = rest;
                  }
                }
              }
            } else {
              // Clearing this field keeps placeholder so UI row persists
              objAtIndex[objKey] = "";
              prevArrObjs[objIndex] = objAtIndex;
            }

            return {
              ...n,
              data: {
                ...n.data,
                values: { ...current, [baseBind]: prevArrObjs },
              },
            };
          }

          // Case 2: array of scalar values with indexed semantics
          const prevArr: string[] = Array.isArray(current[baseBind])
            ? [...current[baseBind]]
            : [];

          if (syntheticIndex === null) {
            // Fallback (no index provided): behave like set/append unique
            if (sourceId) {
              if (!prevArr.includes(sourceId)) prevArr.push(sourceId);
            }
          } else {
            // Ensure array large enough
            while (prevArr.length <= syntheticIndex) prevArr.push("");
            if (sourceId) {
              // Replace value at index (respect ordering)
              prevArr[syntheticIndex] = sourceId;
              // Remove duplicate occurrences of same id beyond this index
              for (let i = prevArr.length - 1; i >= 0; i--) {
                if (i !== syntheticIndex && prevArr[i] === sourceId)
                  prevArr.splice(i, 1);
              }
            } else {
              // Clearing this slot keeps placeholder so UI row persists
              prevArr[syntheticIndex] = "";
            }
          }

          return {
            ...n,
            data: { ...n.data, values: { ...current, [baseBind]: prevArr } },
          };
        })
      );

      setEdges((eds) => {
        let working = eds;
        if (cardinality === "1") {
          working = working.filter(
            (e) =>
              !(e.target === nodeId && (e.data?.kind ?? baseBind) === edgeKind)
          );
        } else {
          // Remove existing edge for this specific synthetic bind (if any)
          working = working.filter((e) => {
            if (e.target !== nodeId) return true;
            const sameKind = (e.data?.kind ?? baseBind) === edgeKind;
            if (!sameKind) return true;
            if (e.data?.bindKey && e.data.bindKey === bindStr) return false;
            return true;
          });

          if (sourceId && objKey != null && objIndex != null) {
            working = working.filter((e) => {
              if (e.target !== nodeId) return true;
              if (e.source !== sourceId) return true;
              if ((e.data?.kind ?? baseBind) !== edgeKind) return true;
              const otherBindKey = e.data?.bindKey;
              if (typeof otherBindKey !== "string") return true;
              const match = /^(.+)\[(\d+)\]\.([^.]+)$/.exec(otherBindKey);
              if (!match) return true;
              const otherIdx = Number.parseInt(match[2], 10);
              const otherKey = match[3];
              if (otherKey !== objKey) return true;
              return otherIdx === objIndex;
            });
          }
        }
        if (sourceId) {
          const duplicate = working.some(
            (e) =>
              e.source === sourceId &&
              e.target === nodeId &&
              (e.data?.kind ?? baseBind) === edgeKind &&
              (cardinality === "1" || e.data?.bindKey === bindStr)
          );
          if (!duplicate) {
            const newEdge: Edge = {
              id: `${sourceId}->${nodeId}:${bindStr}`,
              source: sourceId,
              target: nodeId,
              data: {
                ...(rule?.edgeData ?? { kind: baseBind }),
                kind: edgeKind,
                bindKey: bindStr,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 12,
                height: 12,
              },
              style: rule?.edgeData?.style ?? {
                strokeWidth: 4,
                strokeDasharray: "8 2",
              },
              animated: rule?.edgeData?.animated ?? false,
            };
            working = addEdge(newEdge, working);
          }
        }
        return working;
      });
    },
    [nodes, setNodes, setEdges, isArchitectureMode]
  );

  const onCloneNode = useCallback(
    (nodeId: string) => {
      if (isArchitectureMode) return;
      setNodes((nds) => {
        const original = nds.find((n) => n.id === nodeId);
        if (!original) return nds;
        const cloneId = `${nodeId}-copy-${(Math.random() * 1e5).toFixed(0)}`;
        const offset = { x: 40, y: 40 };
        const restData: Record<string, any> = {
          ...(original.data as Record<string, any>),
        };
        delete restData.friendlyId;
        const clone: Node = {
          ...original,
          id: cloneId,
          position: {
            x: original.position.x + offset.x,
            y: original.position.y + offset.y,
          },
          data: {
            ...restData,
            // reset values if you want a clean clone:
            // values: {},
          },
        };
        return nds.concat(clone);
      });
    },
    [setNodes, isArchitectureMode]
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
      if (isArchitectureMode) return;
      // snapshot for undo
      setUndoStack({ nodes: [...nodes], edges: [...edges] });
      setSnackOpen(true);
      // perform delete
      actuallyDeleteNode(nodeId);
    },
    [nodes, edges, actuallyDeleteNode, isArchitectureMode]
  );

  // Delete selected edges via keyboard/backspace is automatic if you enable deleteKeyCode,
  // but add this as well so we can snapshot for undo when edges are deleted via UI:
  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      if (isArchitectureMode) return;
      setUndoStack({ nodes: [...nodes], edges: [...edges] });
      setSnackOpen(true);
      setEdges((eds) => eds.filter((e) => !deleted.some((d) => d.id === e.id)));
    },
    [nodes, edges, setEdges, isArchitectureMode]
  );

  // Optional: onNodesDelete for consistency (if you allow multi-select deletions)
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      if (isArchitectureMode) return;
      setUndoStack({ nodes: [...nodes], edges: [...edges] });
      setSnackOpen(true);
      const ids = new Set(deleted.map((n) => n.id));
      setNodes((nds) => nds.filter((n) => !ids.has(n.id)));
      setEdges((eds) =>
        eds.filter((e) => !ids.has(e.source) && !ids.has(e.target))
      );
    },
    [nodes, edges, setNodes, setEdges, isArchitectureMode]
  );

  // Undo handler
  const handleUndo = () => {
    if (!undoStack) return;
    setNodes(undoStack.nodes);
    setEdges(undoStack.edges);
    setUndoStack(null);
    setSnackOpen(false);
  };

  // Update node values
  const onValuesChange = useCallback(
    (nodeId: string, name: string, value: any) => {
      if (isArchitectureMode) return;
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n;

          // Special handling for accordion state
          if (name === "__isExpanded") {
            return {
              ...n,
              data: {
                ...n.data,
                isExpanded: value,
                values: { ...(n.data as any)?.values, [name]: value },
              },
            };
          }

          // Regular field update
          return {
            ...n,
            data: {
              ...n.data,
              values: { ...(n.data as any)?.values, [name]: value },
            },
          };
        })
      );
    },
    [setNodes, isArchitectureMode]
  );

  // Handler for when orchestrator is successfully saved
  const handleOrchestrationSaved = useCallback((orchestratorId: string) => {
    setCurrentOrchestratorId(orchestratorId);
  }, []);

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      if (isArchitectureMode) return;
      onNodesChange(changes);
    },
    [isArchitectureMode, onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      if (isArchitectureMode) return;
      onEdgesChange(changes);
    },
    [isArchitectureMode, onEdgesChange]
  );

  // Inject helpers for DynamicForm (dynamic options + dropdown→edge sync)
  const nodesWithHelpers = useMemo(
    () =>
      nodes.map((n) => {
        const baseType = n.type ?? "customNode";
        return {
          ...n,
          type: isArchitectureMode ? "architectureNode" : baseType,
          data: {
            ...n.data,
            __helpers: {
              ...(n.data as any).__helpers,
              allNodes: nodes,
              allEdges: edges,
              // Adapter so child components can call (bind, newSourceId)
              onLinkFieldChange: (
                bind: string,
                newSourceId: string,
                context?: { objectSnapshot?: Record<string, any> }
              ) =>
                onLinkFieldChange({ nodeId: n.id, bind, newSourceId, context }),
              onValuesChange: (name: string, value: any) =>
                onValuesChange(n.id, name, value),
              onCloneNode,
              onDeleteNode,
            },
            __viewMode: isArchitectureMode ? "architecture" : "detailed",
          },
        };
      }),
    [
      nodes,
      edges,
      isArchitectureMode,
      onLinkFieldChange,
      onValuesChange,
      onCloneNode,
      onDeleteNode,
    ]
  );

  return (
    <Box
      sx={{
        height: "calc(100vh - 72px)",
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
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          colorMode={theme.palette.mode}
          nodeTypes={{
            customNode: CustomNode,
            architectureNode: ArchitectureNode,
          }}
          proOptions={{ hideAttribution: true }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onEdgesDelete={onEdgesDelete}
          onNodesDelete={onNodesDelete}
          nodesDraggable={!isArchitectureMode}
          nodesConnectable={!isArchitectureMode}
          elementsSelectable={!isArchitectureMode}
          selectionOnDrag={!isArchitectureMode}
          connectionMode={ConnectionMode.Loose}
          deleteKeyCode={["Delete", "Backspace"]}
          fitView
        >
          <Panel position="top-left">
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
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
          <Panel position="top-right">
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 1,
              }}
            >
              <OrchestratorMenu
                nodes={nodes}
                edges={edges}
                templateInfo={templateInfo}
                currentOrchestratorId={currentOrchestratorId}
                onSaveSuccess={handleOrchestrationSaved}
                orchestratorName={templateInfo?.templateName}
                isArchitectureMode={isArchitectureMode}
                onArchitectureModeChange={(value) =>
                  setIsArchitectureMode(value)
                }
              />
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
        templateInfo={templateInfo}
        setTemplateInfo={setTemplateInfo}
        onClose={() => setInitOpen(false)}
        onSubmit={handleInitSubmit}
      />

      {/* Undo Snackbar */}
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
