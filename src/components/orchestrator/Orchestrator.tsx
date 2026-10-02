import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useTheme } from "@mui/material/styles";
import DeblurIcon from "@mui/icons-material/Deblur";
import CloudCircleIcon from "@mui/icons-material/CloudCircle";
import SouthAmericaIcon from "@mui/icons-material/SouthAmerica";
import Snackbar from "@mui/material/Snackbar";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { Box, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import CustomNode from "./CustomNode";
import ArchitectureNode from "./ArchitectureNode";
import AnimatedGradientEdge from "./AnimatedGradientEdge";
import { OrchestratorMenu } from "./menu";

import Sidebar from "./sidebar/Sidebar";
import { useDnD } from "./sidebar/DnDContext";

import { AppDispatch, RootState } from "../../store";
import {
  fetchResourceById,
  fetchResourcesByLookups,
  type ResourceBatchItem,
  type ResourceBatchLookup,
} from "../../store/resourceSlice";
import { updateSession, setCanvasContext } from "../../store/chatSlice";
import InitPopup from "./orchestrator-info/InitPopup";
import { useAuth } from "../../context/AuthContext";
import { CloudConfig, CloudProvider } from "../../types/clouds-info";
import {
  DriftFinding,
  IaCValidationIssue,
  PolicyScanSettings,
  ReconciliationResult,
} from "../../types/orchestrator";
import { orchestratorService } from "../../services/orchestratorService";
import { templateService } from "../../services/templateService";
import { prepareOrchestratorForSave } from "../../utils/orchestratorUtils";
import {
  fetchOrchestratorById,
  fetchOrchestrators,
} from "@/store/orchestratorsSlice";
import {
  clearMaestroDraft,
  readMaestroDraft,
  type MaestroDraftPayload,
} from "@/utils/maestroDraft";
import LumaSpin from "@/components/ui/luma-spin";
import { useGuidedTour } from "../shared/guidance/ProductGuidanceProvider";
import styles from "./Orchestrator.module.css";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];
const elk = new ELK();

// Canvas node ids are always `${catalogId}-${uuidv4()}`. Older catalog ids are
// plain Mongo ObjectIds (no hyphens), but newer catalog entries (all current
// Azure/GCP resources, and some newer AWS ones) use hyphenated UUIDs — so
// splitting on the first "-" truncates those catalog ids. A uuidv4 string is
// always exactly 36 characters, so strip that fixed-length suffix (plus its
// separating hyphen) instead of splitting on the first hyphen.
const UUID_LENGTH = 36;
const extractCatalogId = (nodeId: string): string => {
  const id = String(nodeId);
  return id.length > UUID_LENGTH + 1
    ? id.slice(0, id.length - UUID_LENGTH - 1)
    : id.split("-")[0];
};

const getResourceLookupCandidates = (node: Record<string, any>): string[] =>
  Array.from(
    new Set(
      [node.resourceId, node.__nodeType, node.resourceType, extractCatalogId(node.id)]
        .map((candidate) => String(candidate ?? "").trim())
        .filter(Boolean),
    ),
  );

const getResourceLookupKey = ({
  id,
  cloudProvider,
}: ResourceBatchLookup): string =>
  `${id}|${cloudProvider?.toLowerCase() ?? ""}`;
const defaultOptions: Record<string, string> = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.spacing.nodeNode": "80",
  "org.eclipse.elk.portConstraints": "FIXED_ORDER",
};

type PersistedGraphLike = {
  templateInfo?: {
    templateName?: string;
    description?: string;
    cloud?: string;
    region?: string;
  } | null;
  nodes?: Array<Record<string, any>>;
  edges?: Array<Record<string, any>>;
  policyScan?: PolicyScanSettings | null;
};

const DEFAULT_POLICY_SCAN: PolicyScanSettings = { enabled: true };

const EMPTY_TEMPLATE_INFO: CloudConfig = {
  templateName: "",
  description: "",
  cloud: undefined,
  region: "",
};

const AUTO_SAVE_STORAGE_KEY = "orchestrator-auto-save-enabled";

const normalizeTemplateInfo = (
  templateInfo?: {
    templateName?: string;
    description?: string;
    cloud?: string;
    region?: string;
  } | null,
): CloudConfig => ({
  templateName: templateInfo?.templateName || "",
  description: templateInfo?.description || "",
  cloud: templateInfo?.cloud as CloudProvider | undefined,
  region: templateInfo?.region || "",
});

const buildValidationErrorMap = (issues: IaCValidationIssue[]) =>
  issues.reduce<Record<string, Record<string, string>>>((acc, issue) => {
    acc[issue.nodeId] = {
      ...acc[issue.nodeId],
      [issue.field ?? ""]: issue.message,
    };
    return acc;
  }, {});

const buildDriftMap = (findings: DriftFinding[]) =>
  findings.reduce<Record<string, DriftFinding>>((acc, finding) => {
    acc[finding.nodeId] = finding;
    return acc;
  }, {});

const serializePersistedSnapshot = (graph: PersistedGraphLike): string => {
  const nodes = [...(graph.nodes || [])]
    .map((node) => ({
      id: node.id,
      resourceId: node.resourceId,
      position: node.position || { x: 0, y: 0 },
      values: node.values || {},
      __nodeType: node.__nodeType,
      friendlyId: node.friendlyId,
      isExpanded: node.isExpanded,
    }))
    .sort((left, right) => String(left.id).localeCompare(String(right.id)));

  const edges = [...(graph.edges || [])]
    .map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? null,
      targetHandle: edge.targetHandle ?? null,
      data: edge.data || {},
    }))
    .sort((left, right) => String(left.id).localeCompare(String(right.id)));

  return JSON.stringify({
    templateInfo: normalizeTemplateInfo(graph.templateInfo),
    nodes,
    edges,
    policyScan: graph.policyScan ?? DEFAULT_POLICY_SCAN,
  });
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
    [getNodes, getEdges, setNodes, fitView],
  );

  return { getLayoutElements };
};

// Compares two arrays of plain objects (used to decide whether the
// "array of objects" bind value actually changed before triggering a
// state update). Extracted verbatim from the link-rule sync effect below.
const isEqualObjectArray = (
  left: Array<Record<string, any>>,
  right: Array<Record<string, any>>,
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

// "many" cardinality, array-of-objects case (fieldName[index].key syntax).
// Mutates nextValues[rule.bind] in place when the derived array changes and
// reports whether a change occurred, mirroring the original inline logic.
const applyManyObjectCardinalityRule = (
  rule: any,
  incomingWithBindKey: Edge[],
  existingValue: any,
  nextValues: Record<string, any>,
): boolean => {
  const baseArray: Array<Record<string, any>> = Array.isArray(existingValue)
    ? existingValue.map((item) =>
        item != null && typeof item === "object" && !Array.isArray(item)
          ? { ...item }
          : {},
      )
    : [];

  for (const edge of incomingWithBindKey) {
    const bindKey = edge.data?.bindKey as string | undefined;
    if (!bindKey) return false;
    const match = /^(.+)\[(\d+)\]\.([^.]+)$/.exec(bindKey);
    if (!match) return false;
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
        item != null && typeof item === "object" && !Array.isArray(item)
          ? { ...item }
          : {},
      )
    : [];

  if (!isEqualObjectArray(snapshotArray, baseArray)) {
    nextValues[rule.bind] = baseArray;
    return true;
  }
  return false;
};

// "many" cardinality, scalar array case (plain list of source ids).
const applyManyScalarCardinalityRule = (
  rule: any,
  incoming: Edge[],
  existingValue: any,
  nextValues: Record<string, any>,
): boolean => {
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
    return true;
  }
  return false;
};

// Dispatches to the object-array or scalar-array handling for "many"
// cardinality rules, matching the original nested if/else exactly.
const applyManyCardinalityRule = (
  rule: any,
  incoming: Edge[],
  nextValues: Record<string, any>,
): boolean => {
  const incomingWithBindKey = incoming.filter(
    (edge) => typeof edge.data?.bindKey === "string",
  );
  const hasObjectSyntax = incomingWithBindKey.some((edge) =>
    /\[\d+\]\.[^.]+$/.test(edge.data?.bindKey as string),
  );
  const existingValue = nextValues[rule.bind];
  const existingHasObjects = Array.isArray(existingValue)
    ? existingValue.some(
        (item) =>
          item != null && typeof item === "object" && !Array.isArray(item),
      )
    : false;

  if (hasObjectSyntax || existingHasObjects) {
    return applyManyObjectCardinalityRule(
      rule,
      incomingWithBindKey,
      existingValue,
      nextValues,
    );
  }
  return applyManyScalarCardinalityRule(
    rule,
    incoming,
    existingValue,
    nextValues,
  );
};

// "1" cardinality case: the bound field mirrors the single incoming edge's source.
const applySingleCardinalityRule = (
  rule: any,
  incoming: Edge[],
  nextValues: Record<string, any>,
): boolean => {
  const src = incoming[0]?.source ?? "";
  if (nextValues[rule.bind] !== src) {
    nextValues[rule.bind] = src;
    return true;
  }
  return false;
};

// Processes a single link rule against the current edges for one node,
// mutating nextValues and reporting whether it changed.
const applyLinkRuleToValues = (
  rule: any,
  edges: Edge[],
  nodeId: string,
  nextValues: Record<string, any>,
): boolean => {
  const edgeKind = rule?.edgeData?.kind ?? rule.bind;
  const incoming = edges.filter(
    (e) => e.target === nodeId && (e.data?.kind ?? rule.bind) === edgeKind,
  );

  if ((rule.cardinality ?? "1") === "many") {
    return applyManyCardinalityRule(rule, incoming, nextValues);
  }
  return applySingleCardinalityRule(rule, incoming, nextValues);
};

// Recomputes a node's link-bound values from the current edges. Extracted
// from the "sync edge-driven values" effect to keep nesting/cognitive
// complexity within limits; logic is unchanged from the original inline code.
const applyLinkRulesToNode = (node: Node, edges: Edge[]): Node => {
  const rules = (node.data as any)?.links ?? [];
  if (!Array.isArray(rules) || rules.length === 0) return node;

  const current = (node.data as any)?.values ?? {};
  const nextValues: Record<string, any> = { ...current };
  let changed = false;

  rules.forEach((rule: any) => {
    if (applyLinkRuleToValues(rule, edges, node.id, nextValues)) {
      changed = true;
    }
  });

  return changed
    ? { ...node, data: { ...node.data, values: nextValues } }
    : node;
};

// Removes duplicate occurrences of `sourceId` under `key` from every object
// in `arr` other than `keepIndex`, mutating the array's entries in place.
// Extracted verbatim from the array-of-objects bind-change branch below.
const clearDuplicateObjectBindOccurrences = (
  arr: Array<Record<string, any>>,
  keepIndex: number,
  key: string,
  sourceId: string,
): void => {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (i !== keepIndex) {
      const item = arr[i] ?? {};
      if (item?.[key] === sourceId) {
        const rest = { ...item };
        delete rest[key];
        arr[i] = rest;
      }
    }
  }
};

// Handles the "many" cardinality, array-of-objects bind case
// (fieldName[index].key syntax) for onLinkFieldChange.
const applyManyObjectIndexBind = (
  node: Node,
  current: Record<string, any>,
  baseBind: string,
  objIndex: number,
  objKey: string,
  sourceId: string,
  context?: { objectSnapshot?: Record<string, any> },
): Node => {
  const prevArrObjs: Array<Record<string, any>> = Array.isArray(
    current[baseBind],
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
    clearDuplicateObjectBindOccurrences(prevArrObjs, objIndex, objKey, sourceId);
  } else {
    // Clearing this field keeps placeholder so UI row persists
    objAtIndex[objKey] = "";
    prevArrObjs[objIndex] = objAtIndex;
  }

  return {
    ...node,
    data: {
      ...node.data,
      values: { ...current, [baseBind]: prevArrObjs },
    },
  };
};

// Removes duplicate occurrences of `sourceId` from `arr` other than
// `keepIndex`, mutating the array in place.
const clearDuplicateScalarBindOccurrences = (
  arr: string[],
  keepIndex: number,
  sourceId: string,
): void => {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (i !== keepIndex && arr[i] === sourceId) arr.splice(i, 1);
  }
};

// Handles the "many" cardinality, scalar array bind case (indexed or
// append-unique semantics) for onLinkFieldChange.
const applyManySyntheticIndexBind = (
  node: Node,
  current: Record<string, any>,
  baseBind: string,
  syntheticIndex: number | null,
  sourceId: string,
): Node => {
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
      clearDuplicateScalarBindOccurrences(prevArr, syntheticIndex, sourceId);
    } else {
      // Clearing this slot keeps placeholder so UI row persists
      prevArr[syntheticIndex] = "";
    }
  }

  return {
    ...node,
    data: { ...node.data, values: { ...current, [baseBind]: prevArr } },
  };
};

// Recomputes a single node's values in response to a dropdown/link field
// change. Extracted from onLinkFieldChange's setNodes updater to keep
// nesting/cognitive complexity within limits; logic is unchanged from the
// original inline code.
const computeNodeValuesForLinkChange = (
  node: Node,
  params: {
    nodeId: string;
    cardinality: "1" | "many";
    baseBind: string;
    sourceId: string;
    objIndex: number | null;
    objKey: string | null;
    syntheticIndex: number | null;
    context?: { objectSnapshot?: Record<string, any> };
  },
): Node => {
  const {
    nodeId,
    cardinality,
    baseBind,
    sourceId,
    objIndex,
    objKey,
    syntheticIndex,
    context,
  } = params;

  if (node.id !== nodeId) return node;
  const current = (node.data as any)?.values ?? {};

  if (cardinality === "1") {
    // Single relation: set or clear directly
    return {
      ...node,
      data: {
        ...node.data,
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
    return applyManyObjectIndexBind(
      node,
      current,
      baseBind,
      objIndex,
      objKey,
      sourceId,
      context,
    );
  }

  // Case 2: array of scalar values with indexed semantics
  return applyManySyntheticIndexBind(
    node,
    current,
    baseBind,
    syntheticIndex,
    sourceId,
  );
};

// Full-canvas loading overlay shown while a route-driven orchestrator load
// is in flight. Extracted from OrchestratorReactFlow's render to keep the
// component's own cognitive complexity within limits; markup is unchanged.
const RouteLoadingOverlay: React.FC = () => {
  return (
    <Box
      className={styles.routeLoadingOverlay}
      aria-live="polite"
      role="status"
    >
      <Box
        className={styles.routeLoadingCard}
      >
        <LumaSpin size={56} />
        <Typography
          variant="h6"
          className={styles.routeLoadingTitle}
        >
          Loading orchestrator
        </Typography>
        <Typography
          variant="body2"
          className={styles.routeLoadingDescription}
        >
          Preparing your resources and canvas so the workflow opens cleanly.
        </Typography>
      </Box>
    </Box>
  );
};

// Template name/cloud/region chips (+ read-only badge) shown on the canvas.
// Extracted from OrchestratorReactFlow's render; markup/conditions unchanged.
const TemplateInfoChips: React.FC<{
  templateInfo: CloudConfig;
  isViewMode: boolean;
  onOpenInit: () => void;
}> = ({ templateInfo, isViewMode, onOpenInit }) => (
  <Box className={styles.canvasMeta}>
    {templateInfo?.templateName && (
      <Chip
        className={styles.templateChip}
        icon={<DeblurIcon />}
        label={templateInfo?.templateName}
        onClick={isViewMode ? undefined : onOpenInit}
      />
    )}
    {templateInfo?.cloud && (
      <Chip
        className={styles.templateChip}
        icon={<CloudCircleIcon />}
        label={templateInfo?.cloud.toUpperCase()}
        onClick={isViewMode ? undefined : onOpenInit}
      />
    )}
    {templateInfo?.region && (
      <Chip
        className={styles.templateChip}
        icon={<SouthAmericaIcon />}
        label={templateInfo?.region}
        onClick={isViewMode ? undefined : onOpenInit}
      />
    )}
    {isViewMode && (
      <Chip
        className={styles.readOnlyChip}
        label="Read-only preview"
        size="small"
        variant="outlined"
        sx={{ opacity: 0.7, fontSize: "0.75rem" }}
      />
    )}
  </Box>
);

// Banner shown when a Maestro draft has been loaded onto the canvas.
// Extracted from OrchestratorReactFlow's render; markup/conditions unchanged.
const MaestroDraftBanner: React.FC<{
  draft: MaestroDraftPayload;
  onDismiss: () => void;
}> = ({ draft, onDismiss }) => (
  <Alert
    className={styles.maestroDraftBanner}
    severity="info"
    action={
      <IconButton
        aria-label="Dismiss Maestro draft message"
        color="inherit"
        size="small"
        onClick={onDismiss}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    }
  >
    {draft.action === "update"
      ? "Maestro loaded a workflow update draft. Review the proposed graph changes, then save to apply them to this workflow."
      : "Maestro loaded a new workflow draft. Review it and save when you are ready to create the workflow."}
  </Alert>
);

const EmptyCanvasState: React.FC = () => (
  <Box className={styles.emptyCanvasState} aria-live="polite">
    <Box className={styles.emptyCanvasCard}>
      <DeblurIcon className={styles.emptyCanvasIcon} aria-hidden="true" />
      <Typography component="h2" className={styles.emptyCanvasTitle}>
        Shape the first move.
      </Typography>
      <Typography component="p" className={styles.emptyCanvasDescription}>
        Drag a resource from the palette into the canvas, then connect the
        pieces that make the workflow real.
      </Typography>
    </Box>
  </Box>
);

const OrchestratorReactFlow: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { template_id } = useParams<{ template_id: string }>();
  const { getLayoutElements } = useLayoutElements();
  const { fitView, screenToFlowPosition } = useReactFlow();
  const [searchParams, setSearchParams] = useSearchParams();
  const template_type = searchParams.get("template_type");
  const maestroDraftToken = searchParams.get("maestro_draft");
  const isViewMode = template_type === "template";
  const isCustomTemplateFlow = template_type === "custom";
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
  const [templateInfo, setTemplateInfo] =
    useState<CloudConfig>(EMPTY_TEMPLATE_INFO);
  const [policyScan, setPolicyScan] = useState<PolicyScanSettings>(
    DEFAULT_POLICY_SCAN,
  );
  const [currentOrchestratorId, setCurrentOrchestratorId] = useState<
    string | null
  >(null);
  const [baselineSnapshot, setBaselineSnapshot] = useState<string | null>(null);
  const [validationErrorsByNode, setValidationErrorsByNode] = useState<
    Record<string, Record<string, string>>
  >({});
  const [driftByNode, setDriftByNode] = useState<Record<string, DriftFinding>>(
    {},
  );
  const [maestroReviewDraft, setMaestroReviewDraft] =
    useState<MaestroDraftPayload | null>(null);
  const [isMaestroReviewDraftBannerDismissed, setIsMaestroReviewDraftBannerDismissed] =
    useState(false);
  const [pendingMaestroDraft, setPendingMaestroDraft] =
    useState<MaestroDraftPayload | null>(null);
  const [replaceDraftDialogOpen, setReplaceDraftDialogOpen] = useState(false);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(AUTO_SAVE_STORAGE_KEY) === "true";
  });
  const requestedOrchestratorIdsRef = useRef<Set<string>>(new Set());
  const requestedTemplateIdsRef = useRef<Set<string>>(new Set());
  const loadedOrchestratorIdRef = useRef<string | null>(null);
  const routeLoadCountRef = useRef(0);
  const graphNodesRef = useRef<Node[]>(nodes);
  const graphEdgesRef = useRef<Edge[]>(edges);
  graphNodesRef.current = nodes;
  graphEdgesRef.current = edges;

  const getAllNodes = useCallback(() => graphNodesRef.current, []);

  const fetchCatalogResources = useCallback(
    async (lookups: ResourceBatchLookup[]) => {
      const result = await dispatch(fetchResourcesByLookups(lookups));
      if (!fetchResourcesByLookups.fulfilled.match(result)) {
        return null;
      }

      return new Map<string, ResourceBatchItem>(
        result.payload.items.map((item: ResourceBatchItem) => [
          getResourceLookupKey(item),
          item,
        ]),
      );
    },
    [dispatch],
  );

  useGuidedTour(
    "orchestrator",
    isCustomTemplateFlow && Boolean(templateInfo.cloud) && !initOpen,
  );

  const { data: orchestrators, status: orchestratorsStatus } = useSelector(
    (state: RootState) => state.orchestrators,
  );

  const drawerWidth = 240;

  const clearMaestroDraftQuery = useCallback(() => {
    if (!searchParams.has("maestro_draft")) {
      return;
    }
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("maestro_draft");
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const beginRouteLoad = useCallback(() => {
    routeLoadCountRef.current += 1;
    if (routeLoadCountRef.current === 1) {
      setIsRouteLoading(true);
    }
  }, []);

  const endRouteLoad = useCallback(() => {
    routeLoadCountRef.current = Math.max(0, routeLoadCountRef.current - 1);
    if (routeLoadCountRef.current === 0) {
      setIsRouteLoading(false);
    }
  }, []);

  const runWithRouteLoading = useCallback(
    async <T,>(work: () => Promise<T>) => {
      beginRouteLoad();
      try {
        return await work();
      } finally {
        endRouteLoad();
      }
    },
    [beginRouteLoad, endRouteLoad],
  );

  const loadSerializedGraph = useCallback(
    async (
      serializedNodes: Array<Record<string, any>>,
      serializedEdges: Array<Record<string, any>>,
      appliedTemplateInfo: CloudConfig,
    ) =>
      runWithRouteLoading(async () => {
        const candidateLists = (serializedNodes || []).map((dbNode) =>
          getResourceLookupCandidates(dbNode).map((id) => ({
            id,
            cloudProvider: appliedTemplateInfo.cloud,
          })),
        );
        const batchLookups = Array.from(
          new Map(
            candidateLists
              .flat()
              .map((lookup) => [getResourceLookupKey(lookup), lookup]),
          ).values(),
        );
        const batchResources = await fetchCatalogResources(batchLookups);
        const resourceDataByNode = await Promise.all(
          candidateLists.map(async (candidates) => {
            if (batchResources) {
              for (const candidate of candidates) {
                const item = batchResources.get(getResourceLookupKey(candidate));
                if (item?.data?.resourceNode?.data) return item.data;
              }
              return null;
            }

            // Keep the existing per-resource path as a resilience fallback
            // while older deployments are being rolled forward.
            for (const candidate of candidates) {
              const result = await dispatch(fetchResourceById(candidate));
              if (
                fetchResourceById.fulfilled.match(result) &&
                result.payload.data?.resourceNode?.data
              ) {
                return result.payload.data;
              }
            }
            return null;
          }),
        );
        const resourceNodes: Node[] = [];

        for (let i = 0; i < resourceDataByNode.length; i += 1) {
          const resourceData = resourceDataByNode[i];
          const dbNode = serializedNodes[i];

          if (resourceData?.resourceNode?.data) {
            const catalogResourceId =
              resourceData.resourceId ||
              dbNode.__nodeType ||
              dbNode.resourceId;
            resourceNodes.push({
              id: dbNode.id,
              type: "customNode",
              position: dbNode.position || { x: 0, y: 0 },
              data: {
                ...resourceData.resourceNode.data,
                values: dbNode.values || {},
                __nodeType:
                  dbNode.__nodeType ||
                  dbNode.resourceType ||
                  catalogResourceId,
                __resourceId: catalogResourceId,
                isExpanded: dbNode.isExpanded ?? true,
                friendlyId: dbNode.friendlyId ?? dbNode.friendly_id,
                header: {
                  ...resourceData.resourceNode.data.header,
                  icon: resourceData.resourceIcon,
                },
                templateInfo: appliedTemplateInfo,
                userInfo: user,
              },
            });
            continue;
          }

          resourceNodes.push({
            id: dbNode.id,
            type: "customNode",
            position: dbNode.position || { x: 0, y: 0 },
            data: {
              values: dbNode.values || {},
              __nodeType:
                dbNode.__nodeType || dbNode.resourceType || dbNode.resourceId,
              __resourceId: dbNode.resourceId,
              isExpanded: dbNode.isExpanded ?? true,
              friendlyId: dbNode.friendlyId ?? dbNode.friendly_id,
              header: {
                label:
                  dbNode.resourceName ||
                  dbNode.__nodeType ||
                  dbNode.resourceId ||
                  "Unknown Resource",
                icon: dbNode.previewIcon,
              },
              handles: [],
              links: [],
              templateInfo: appliedTemplateInfo,
              userInfo: user,
            },
          });
        }

        const nextEdges: Edge[] = [];
        for (const dbEdge of serializedEdges || []) {
          const source = resourceNodes.find(
            (node) => node.id === dbEdge.source,
          );
          const target = resourceNodes.find(
            (node) => node.id === dbEdge.target,
          );
          if (!source || !target) {
            continue;
          }

          const sourceType = (source.data as any)?.__nodeType ?? source.type;
          const rules = (target.data as any)?.links ?? [];
          const rule = rules.find(
            (candidate: any) =>
              Array.isArray(candidate.fromTypes) &&
              candidate.fromTypes.includes(sourceType),
          );

          nextEdges.push({
            id: rule
              ? `${source.id}->${target.id}:${rule.bind}`
              : dbEdge.id || `${source.id}->${target.id}`,
            source: source.id,
            target: target.id,
            type: "animatedGradient",
            data: rule
              ? {
                  ...(rule.edgeData ?? { kind: rule.bind }),
                  bindKey: dbEdge.data?.bindKey,
                  animated: rule.edgeData?.animated ?? true,
                }
              : {
                  kind: dbEdge.data?.kind || "depends_on",
                  bindKey: dbEdge.data?.bindKey,
                  animated: true,
                },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 12,
              height: 12,
            },
          });
        }

        setTemplateInfo(appliedTemplateInfo);
        setNodes(resourceNodes);
        setEdges(nextEdges);
        setInitOpen(false);

        setTimeout(() => {
          getLayoutElements({
            "elk.algorithm": "layered",
            "elk.direction": "RIGHT",
          });
        }, 150);
      }),
    [
      dispatch,
      fetchCatalogResources,
      getLayoutElements,
      runWithRouteLoading,
      setEdges,
      setNodes,
      user,
    ],
  );

  const buildCurrentCanvasSnapshot = useCallback(() => {
    if (
      nodes.length === 0 &&
      edges.length === 0 &&
      !templateInfo.templateName
    ) {
      return null;
    }

    const saveRequest = prepareOrchestratorForSave(
      nodes,
      edges,
      templateInfo,
      user,
      policyScan,
    );
    return serializePersistedSnapshot(saveRequest);
  }, [edges, nodes, templateInfo, user, policyScan]);

  const isCanvasDirty = useCallback(() => {
    const currentSnapshot = buildCurrentCanvasSnapshot();
    if (!currentSnapshot || !baselineSnapshot) {
      return false;
    }
    return currentSnapshot !== baselineSnapshot;
  }, [baselineSnapshot, buildCurrentCanvasSnapshot]);

  // Publish what's actually on the canvas so Maestro can answer questions
  // about the current page even when this chat session hasn't generated a
  // plan of its own (e.g. the user opened an existing/custom orchestrator
  // directly). Keyed off nodes.length/edges.length rather than the arrays
  // themselves for the same reason as the effects above: those lengths only
  // change on add/remove, not on every keystroke while editing a resource.
  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0 && !templateInfo.templateName) {
      dispatch(setCanvasContext(null));
      return;
    }

    const counts = new Map<string, number>();
    nodes.forEach((node) => {
      const label =
        (node.data as any)?.header?.label ||
        (node.data as any)?.__nodeType ||
        "resource";
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    const resourceList = Array.from(counts.entries())
      .map(([label, count]) => (count > 1 ? `${count}x ${label}` : label))
      .join(", ");

    const nodesCountSuffix = nodes.length === 1 ? "" : "s";
    const edgesCountSuffix = edges.length === 1 ? "" : "s";
    const edgesSummary = edges.length
      ? ` ${edges.length} connection${edgesCountSuffix} between them.`
      : "";
    const resourceSummary = resourceList
      ? `${nodes.length} resource${nodesCountSuffix} on canvas: ${resourceList}.${edgesSummary}`
      : undefined;

    dispatch(
      setCanvasContext({
        orchestratorId: currentOrchestratorId || (template_id !== "new" ? template_id : null),
        templateType: template_type,
        templateName: templateInfo.templateName || undefined,
        cloudProvider: templateInfo.cloud,
        resourceSummary,
      }),
    );
  }, [
    dispatch,
    nodes.length,
    edges.length,
    templateInfo.templateName,
    templateInfo.cloud,
    currentOrchestratorId,
    template_id,
    template_type,
  ]);

  // Clear it on unmount so leaving the canvas doesn't leak stale context into
  // Maestro conversations on other pages.
  useEffect(() => {
    return () => {
      dispatch(setCanvasContext(null));
    };
  }, [dispatch]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      AUTO_SAVE_STORAGE_KEY,
      autoSaveEnabled ? "true" : "false",
    );
  }, [autoSaveEnabled]);

  useEffect(() => {
    if (!autoSaveEnabled || isViewMode) {
      return;
    }

    if (!currentOrchestratorId || !isCanvasDirty()) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const saveRequest = prepareOrchestratorForSave(
        nodes,
        edges,
        templateInfo,
        user,
        policyScan,
      );

      void orchestratorService
        .updateOrchestrator(currentOrchestratorId, saveRequest)
        .then((response) => {
          const savedId = response._id || response.id || currentOrchestratorId;
          setCurrentOrchestratorId(savedId);
          setBaselineSnapshot(serializePersistedSnapshot(saveRequest));
          setValidationErrorsByNode({});
        })
        .catch((error) => {
          console.error("Auto-save failed:", error);
        });
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [
    autoSaveEnabled,
    currentOrchestratorId,
    edges,
    isCanvasDirty,
    isViewMode,
    nodes,
    templateInfo,
    policyScan,
    user,
  ]);

  const applyMaestroDraft = useCallback(
    async (draft: MaestroDraftPayload) => {
      const appliedTemplateInfo = normalizeTemplateInfo(
        draft.saveRequest.templateInfo,
      );

      await loadSerializedGraph(
        draft.saveRequest.nodes as Array<Record<string, any>>,
        draft.saveRequest.edges as Array<Record<string, any>>,
        appliedTemplateInfo,
      );

      setCurrentOrchestratorId(
        draft.action === "update" ? (draft.targetOrchestratorId ?? null) : null,
      );
      setMaestroReviewDraft(draft);
      setIsMaestroReviewDraftBannerDismissed(false);
      setPendingMaestroDraft(null);
      setReplaceDraftDialogOpen(false);
      setBaselineSnapshot(serializePersistedSnapshot(draft.saveRequest));
    },
    [loadSerializedGraph],
  );

  // Legacy prefill path kept inert while the new Maestro draft flow below owns routing.
  useEffect(() => {
    if (orchestratorsStatus === "idle") dispatch(fetchOrchestrators({}));
  }, [dispatch, orchestratorsStatus]);

  useEffect(() => {
    if (!isArchitectureMode) return;
    setNodes((nds) =>
      nds.map((node) => (node.selected ? { ...node, selected: false } : node)),
    );
    setEdges((eds) =>
      eds.map((edge) => (edge.selected ? { ...edge, selected: false } : edge)),
    );
  }, [isArchitectureMode, setNodes, setEdges]);

  const handleInitSubmit = useCallback(
    async (data: {
      templateName: string;
      description: string;
      cloud: string;
      region: string;
      team: Array<{ id?: string; email: string; role?: string }>;
    }) => {
      const appliedTemplateInfo = {
        templateName: data.templateName,
        description: data.description,
        cloud: data.cloud as CloudProvider,
        region: data.region,
      };

      setTemplateInfo(appliedTemplateInfo);

      if (template_id !== "new") {
        setInitOpen(false);
        return;
      }

      // Create the orchestrator in the backend right away, even with zero
      // nodes, so currentOrchestratorId is available immediately instead of
      // waiting for the user's first manual Save (this unblocks actions like
      // Reconcile State and Delete that depend on a saved id).
      const saveRequest = prepareOrchestratorForSave(
        nodes,
        edges,
        appliedTemplateInfo,
        user,
        policyScan,
      );
      const response = await orchestratorService.saveOrchestrator(saveRequest);
      const newId = response._id || response.id;
      if (!newId) {
        throw new Error("Backend did not return an orchestrator id");
      }

      setCurrentOrchestratorId(newId);
      // Must mirror handleOrchestrationSaved's baseline-snapshot update, or
      // autosave's isCanvasDirty() check stays permanently false (it
      // short-circuits whenever baselineSnapshot is falsy) for this
      // orchestrator's entire lifetime.
      setBaselineSnapshot(serializePersistedSnapshot(saveRequest));
      setMaestroReviewDraft(null);
      setPendingMaestroDraft(null);
      setReplaceDraftDialogOpen(false);
      setInitOpen(false);

      // Must navigate off the "new" route sentinel now: the route-driven
      // effect that watches template_id === "new" unconditionally resets
      // currentOrchestratorId back to null otherwise.
      navigate(`/orchestrator/${newId}?template_type=custom`, {
        replace: true,
      });
    },
    [setTemplateInfo, template_id, nodes, edges, user, policyScan, navigate],
  );

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      if (!id || isArchitectureMode) return;

      const resultAction = await dispatch(
        fetchResourceById({ id, cloudProvider: templateInfo.cloud }),
      );

      if (fetchResourceById.fulfilled.match(resultAction)) {
        const resourceData = resultAction.payload;
        const resourceNode = resourceData?.data?.resourceNode;

        if (!resourceNode?.data) {
          console.error(
            "Failed to add resource to canvas: resourceNode.data is missing.",
            { resourceId: id },
          );
          return;
        }

        const dropPosition = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        // node from backend
        let newNode: any = {
          ...resourceNode,
          id: `${id}-${uuidv4()}`,
          position: dropPosition,
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
                icon: resourceData?.data?.resourceIcon,
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
      screenToFlowPosition,
    ],
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
    setNodes((nds) => nds.map((n) => applyLinkRulesToNode(n, edges)));
  }, [edges, setNodes]);

  useEffect(() => {
    if (!template_id || !template_type || searchParams.has("template_type"))
      return;
    else if (template_id === "new") {
      // Check for prefill payload placed by Maestro (via sessionStorage)
      const prefillRaw = sessionStorage.getItem("maestro_prefill");
      if (prefillRaw) {
        try {
          const prefill = JSON.parse(prefillRaw);
          sessionStorage.removeItem("maestro_prefill");

          const appliedTemplateInfo = {
            templateName: prefill.templateInfo?.templateName || "",
            description: prefill.templateInfo?.description || "",
            cloud: prefill.templateInfo?.cloud,
            region: prefill.templateInfo?.region || "",
          };

          setTemplateInfo(appliedTemplateInfo);
          setInitOpen(false);

          // Fetch all resource templates in one catalog request. Keep the
          // single-resource path below as a rollout fallback.
          const prefillNodes = prefill.nodes || [];
          const lookups: ResourceBatchLookup[] = prefillNodes.map((dbNode: any) => ({
            id: extractCatalogId(dbNode.id),
            cloudProvider: appliedTemplateInfo.cloud,
          }));

          void (async () => {
            const batchResources = await fetchCatalogResources(lookups);
            const results = batchResources
              ? lookups.map(
                  (lookup) =>
                    batchResources.get(getResourceLookupKey(lookup))?.data ?? null,
                )
              : await Promise.all(
                  lookups.map(async (lookup) => {
                    const result = await dispatch(fetchResourceById(lookup));
                    return fetchResourceById.fulfilled.match(result)
                      ? result.payload.data
                      : null;
                  }),
                );
            const resourceNodes: Node[] = [];

            for (let i = 0; i < results.length; i++) {
              const resourceData = results[i];
              const dbNode = prefillNodes[i];

              let reconstructedNode: Node;

              if (resourceData?.resourceNode?.data) {
                // We have the full resource template — build a proper node identical to the saved-orchestrator path
                reconstructedNode = {
                  id: dbNode.id,
                  type: "customNode",
                  position: dbNode.position || { x: 0, y: 0 },
                  data: {
                    ...resourceData.resourceNode.data,
                    values: dbNode.values || {},
                    __nodeType:
                      dbNode.__nodeType ||
                      dbNode.resourceType ||
                      dbNode.resourceId,
                    __resourceId: dbNode.resourceId,
                    isExpanded: dbNode.isExpanded ?? true,
                    friendlyId: dbNode.friendlyId,
                    header: {
                      ...resourceData.resourceNode.data.header,
                      icon: resourceData.resourceIcon,
                    },
                    templateInfo: appliedTemplateInfo,
                    userInfo: user,
                  },
                };
              } else {
                // Fallback — resource not in catalog, render minimal node so the user can still see it
                reconstructedNode = {
                  id: dbNode.id,
                  type: "customNode",
                  position: dbNode.position || { x: 0, y: 0 },
                  data: {
                    values: dbNode.values || {},
                    __nodeType:
                      dbNode.__nodeType ||
                      dbNode.resourceType ||
                      dbNode.resourceId,
                    __resourceId: dbNode.resourceId,
                    isExpanded: dbNode.isExpanded ?? true,
                    friendlyId: dbNode.friendlyId,
                    header: {
                      label:
                        dbNode.resourceName ||
                        dbNode.__nodeType ||
                        dbNode.resourceId,
                      icon: dbNode.previewIcon,
                    },
                    handles: [],
                    links: [],
                    templateInfo: appliedTemplateInfo,
                    userInfo: user,
                  },
                };
              }

              resourceNodes.push(reconstructedNode);
            }

            // Reconstruct edges using the same rule-lookup as the saved orchestrator path
            const nextEdges: Edge[] = [];
            for (const dbEdge of prefill.edges || []) {
              const source = resourceNodes.find((n) => n.id === dbEdge.source);
              const target = resourceNodes.find((n) => n.id === dbEdge.target);
              if (!source || !target) continue;

              const sourceType =
                (source.data as any)?.__nodeType ?? source.type;
              const rules = (target.data as any)?.links ?? [];
              const rule = rules.find(
                (r: any) =>
                  Array.isArray(r.fromTypes) &&
                  r.fromTypes.includes(sourceType),
              );

              nextEdges.push({
                id: rule
                  ? `${source.id}->${target.id}:${rule.bind}`
                  : dbEdge.id || `${source.id}->${target.id}`,
                source: source.id,
                target: target.id,
                type: "animatedGradient",
                data: rule
                  ? {
                      ...(rule.edgeData ?? { kind: rule.bind }),
                      animated: rule.edgeData?.animated ?? true,
                    }
                  : { kind: "depends_on", animated: true },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 12,
                  height: 12,
                },
              });
            }

            setNodes((nds) => {
              const existingIds = new Set(nds.map((node) => node.id));
              return nds.concat(
                resourceNodes.filter((node) => !existingIds.has(node.id)),
              );
            });
            setEdges((eds) => {
              const existingIds = new Set(eds.map((edge) => edge.id));
              return eds.concat(
                nextEdges.filter((edge) => !existingIds.has(edge.id)),
              );
            });

            // Auto-layout after all nodes are placed
            setTimeout(() => {
              getLayoutElements({
                "elk.algorithm": "layered",
                "elk.direction": "RIGHT",
              });
            }, 150);
          })();
        } catch (err) {
          console.error("Failed to apply Maestro prefill:", err);
          setInitOpen(true);
        }
      } else {
        setInitOpen(true);
      }
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
        setPolicyScan(orchestratorData.policyScan || DEFAULT_POLICY_SCAN);
        const resourceNodes: Node[] = [];
        const loadSavedResources = async () => {
          const savedNodes = orchestratorData?.nodes || [];
          const lookups = savedNodes.map((node) => ({
            id: extractCatalogId(node.id),
            cloudProvider: templateInfo.cloud,
          }));
          const batchResources = await fetchCatalogResources(lookups);
          const resourceData = batchResources
            ? lookups.map(
                (lookup) =>
                  batchResources.get(getResourceLookupKey(lookup))?.data ?? null,
              )
            : await Promise.all(
                lookups.map(async (lookup) => {
                  const result = await dispatch(fetchResourceById(lookup));
                  return fetchResourceById.fulfilled.match(result)
                    ? result.payload.data
                    : null;
                }),
              );

          for (let i = 0; i < resourceData.length; i += 1) {
            const resourceDataForNode = resourceData[i];
            const dbNode = orchestratorData.nodes[i];
            if (resourceDataForNode?.resourceNode?.data) {
              const reconstructedNode: Node = {
                id: dbNode.id,
                type: "customNode",
                position: dbNode.position,
                data: {
                  ...resourceDataForNode.resourceNode.data,
                  values: dbNode.values,
                  __nodeType: dbNode.__nodeType || dbNode.resourceId,
                  __resourceId: dbNode.resourceId,
                  isExpanded: dbNode.isExpanded ?? true, // Restore accordion state
                  friendlyId: dbNode.friendlyId ?? (dbNode as any)?.friendly_id,
                  header: {
                    ...resourceDataForNode.resourceNode.data.header,
                    icon: resourceDataForNode.resourceIcon,
                  },
                  templateInfo,
                  userInfo: user,
                },
              };
              resourceNodes.push(reconstructedNode);
            }
          }

          const nextEdges: Edge[] = [];
          for (const dbEdge of orchestratorData?.edges || []) {
            const source = resourceNodes.find((n) => n.id === dbEdge.source);
            const target = resourceNodes.find((n) => n.id === dbEdge.target);
            if (!source || !target) continue;

            const sourceType = (source.data as any)?.__nodeType ?? source.type;
            const rules = (target.data as any)?.links ?? [];

            const rule = rules.find(
              (r: any) =>
                Array.isArray(r.fromTypes) && r.fromTypes.includes(sourceType),
            );
            if (!rule) continue;

            nextEdges.push({
              id: `${source.id}->${target.id}:${rule.bind}`,
              source: source.id,
              target: target.id,
              type: "animatedGradient",
              data: {
                ...(rule.edgeData ?? { kind: rule.bind }),
                animated: rule.edgeData?.animated ?? true,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 12,
                height: 12,
              },
            });
          }

          setNodes((nds) => {
            const existingIds = new Set(nds.map((node) => node.id));
            return nds.concat(
              resourceNodes.filter((node) => !existingIds.has(node.id)),
            );
          });
          setEdges((eds) => {
            const existingIds = new Set(eds.map((edge) => edge.id));
            return eds.concat(
              nextEdges.filter((edge) => !existingIds.has(edge.id)),
            );
          });
        };
        void loadSavedResources();
      }
    }
  }, [
    template_id,
    template_type,
    orchestrators,
    fetchCatalogResources,
    searchParams,
    setNodes,
    setEdges,
    getLayoutElements,
    user,
  ]);

  useEffect(() => {
    if (!template_id || !template_type || !maestroDraftToken) {
      return;
    }

    const draft = readMaestroDraft();
    clearMaestroDraft();
    clearMaestroDraftQuery();

    if (!draft || draft.token !== maestroDraftToken) {
      return;
    }

    const matchesRoute =
      draft.action === "update"
        ? template_id !== "new" && draft.targetOrchestratorId === template_id
        : template_id === "new";

    if (!matchesRoute) {
      return;
    }

    if (isCanvasDirty()) {
      setPendingMaestroDraft(draft);
      setReplaceDraftDialogOpen(true);
      return;
    }

    applyMaestroDraft(draft).catch((error) => {
      console.error("Failed to apply Maestro draft:", error);
      setInitOpen(template_id === "new");
    });
  }, [
    applyMaestroDraft,
    clearMaestroDraftQuery,
    isCanvasDirty,
    maestroDraftToken,
    template_id,
    template_type,
  ]);

  // "New" template route: show the init dialog when the canvas is still
  // empty. This intentionally reacts to nodes.length/edges.length so the
  // dialog opens/closes as the user starts building on a blank canvas.
  useEffect(() => {
    if (!template_id || !template_type || maestroDraftToken) {
      return;
    }

    if (template_id !== "new") {
      return;
    }

    setCurrentOrchestratorId(null);
    if (
      nodes.length === 0 &&
      edges.length === 0 &&
      !templateInfo.templateName &&
      !templateInfo.cloud
    ) {
      setInitOpen(true);
    }
  }, [
    edges.length,
    maestroDraftToken,
    nodes.length,
    templateInfo.cloud,
    templateInfo.templateName,
    template_id,
    template_type,
  ]);

  // Load an existing orchestrator's saved graph when navigating to its
  // route. This must NOT depend on nodes.length/edges.length: those change
  // on every local edit (e.g. dropping a resource onto the canvas), and
  // re-running loadSerializedGraph would overwrite in-progress edits with
  // the last-saved snapshot, making just-dropped nodes vanish. Guard with
  // loadedOrchestratorIdRef so the graph is (re)loaded only on an actual
  // route/template change, not on every canvas mutation.
  useEffect(() => {
    if (!template_id || !template_type || maestroDraftToken) {
      return;
    }

    if (template_id === "new") {
      return;
    }

    if (isViewMode) {
      if (requestedTemplateIdsRef.current.has(template_id)) {
        return;
      }

      requestedTemplateIdsRef.current.add(template_id);
      void runWithRouteLoading(async () => {
        const template = await templateService.getTemplate(template_id);
        const appliedTemplateInfo = normalizeTemplateInfo({
          templateName: template.templateName,
          description: template.description,
          cloud: template.cloud,
          region: template.region,
        });

        setCurrentOrchestratorId(null);
        setPolicyScan(DEFAULT_POLICY_SCAN);
        setMaestroReviewDraft(null);
        setIsMaestroReviewDraftBannerDismissed(false);
        setPendingMaestroDraft(null);
        setReplaceDraftDialogOpen(false);

        await loadSerializedGraph(
          template.nodes || [],
          template.edges || [],
          appliedTemplateInfo,
        );
      }).catch((error) => {
        requestedTemplateIdsRef.current.delete(template_id);
        console.error("Failed to fetch template by id:", error);
      });
      return;
    }

    const orchestratorData = orchestrators.find(
      (item) => item._id === template_id,
    );
    if (!orchestratorData) {
      if (requestedOrchestratorIdsRef.current.has(template_id)) {
        return;
      }

      requestedOrchestratorIdsRef.current.add(template_id);
      void runWithRouteLoading(async () =>
        dispatch(fetchOrchestratorById(template_id)).unwrap(),
      ).catch((error) => {
        requestedOrchestratorIdsRef.current.delete(template_id);
        console.error("Failed to fetch orchestrator by id:", error);
      });
      return;
    }

    requestedOrchestratorIdsRef.current.delete(template_id);

    if (loadedOrchestratorIdRef.current === template_id) {
      return;
    }
    loadedOrchestratorIdRef.current = template_id;

    const appliedTemplateInfo = normalizeTemplateInfo(
      orchestratorData.templateInfo,
    );
    setCurrentOrchestratorId(template_id);
    setMaestroReviewDraft(null);
    setIsMaestroReviewDraftBannerDismissed(false);
    setPendingMaestroDraft(null);
    setReplaceDraftDialogOpen(false);

    loadSerializedGraph(
      orchestratorData.nodes as Array<Record<string, any>>,
      orchestratorData.edges as Array<Record<string, any>>,
      appliedTemplateInfo,
    )
      .then(() => {
        setBaselineSnapshot(
          serializePersistedSnapshot({
            templateInfo: orchestratorData.templateInfo,
            nodes: orchestratorData.nodes as Array<Record<string, any>>,
            edges: orchestratorData.edges as Array<Record<string, any>>,
          }),
        );
      })
      .catch((error) => {
        console.error("Failed to load orchestrator graph:", error);
      });
  }, [
    dispatch,
    fetchCatalogResources,
    loadSerializedGraph,
    maestroDraftToken,
    orchestrators,
    runWithRouteLoading,
    isViewMode,
    template_id,
    template_type,
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
          Array.isArray(r.fromTypes) && r.fromTypes.includes(sourceType),
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
              ),
          ),
        );
      } else {
        const exists = edges.some(
          (e) =>
            e.source === source.id &&
            e.target === target.id &&
            (e.data?.kind ?? rule.bind) === edgeKind,
        );
        if (exists) return;
      }

      const newEdge: Edge = {
        id: `${source.id}->${target.id}:${rule.bind}`,
        source: source.id,
        target: target.id,
        type: "animatedGradient",
        data: {
          ...(rule.edgeData ?? { kind: rule.bind }),
          animated: rule.edgeData?.animated ?? true,
        },
        markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12 },
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
        }),
      );
    },
    [nodes, edges, setNodes, setEdges, isArchitectureMode],
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

      const currentNodes = graphNodesRef.current;
      const sourceNodeExists = currentNodes.some((n) => n.id === sourceId);
      const target = currentNodes.find((n) => n.id === nodeId);
      if (!target) return;
      const baseBind = bindStr.includes("[") ? bindStr.split("[")[0] : bindStr;
      const rules = (target.data as any)?.links ?? [];
      const rule = rules.find((r: any) => r.bind === baseBind);
      if (!rule) {
        console.warn(
          `No rule found for bind: ${bindStr} (base: ${baseBind}) on node: ${nodeId}`,
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
        nds.map((n) =>
          computeNodeValuesForLinkChange(n, {
            nodeId,
            cardinality,
            baseBind,
            sourceId,
            objIndex,
            objKey,
            syntheticIndex,
            context,
          }),
        ),
      );

      setEdges((eds) => {
        let working = eds;
        if (cardinality === "1") {
          working = working.filter(
            (e) =>
              !(e.target === nodeId && (e.data?.kind ?? baseBind) === edgeKind),
          );
        } else {
          // Remove existing edge for this specific synthetic bind (if any)
          working = working.filter((e) => {
            if (e.target !== nodeId) return true;
            const sameKind = (e.data?.kind ?? baseBind) === edgeKind;
            if (!sameKind) return true;
            if (e.data?.bindKey === bindStr) return false;
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
        if (sourceId && sourceNodeExists) {
          const duplicate = working.some(
            (e) =>
              e.source === sourceId &&
              e.target === nodeId &&
              (e.data?.kind ?? baseBind) === edgeKind &&
              (cardinality === "1" || e.data?.bindKey === bindStr),
          );
          if (!duplicate) {
            const newEdge: Edge = {
              id: `${sourceId}->${nodeId}:${bindStr}`,
              source: sourceId,
              target: nodeId,
              type: "animatedGradient",
              data: {
                ...(rule?.edgeData ?? { kind: baseBind }),
                kind: edgeKind,
                bindKey: bindStr,
                animated: rule?.edgeData?.animated ?? true,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 12,
                height: 12,
              },
            };
            working = addEdge(newEdge, working);
          }
        }
        return working;
      });
    },
    [setNodes, setEdges, isArchitectureMode],
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
    [setNodes, isArchitectureMode],
  );

  const actuallyDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId),
      );
    },
    [setNodes, setEdges],
  );

  const onDeleteNode = useCallback(
    (nodeId: string) => {
      if (isArchitectureMode) return;
      // snapshot for undo
      setUndoStack({
        nodes: [...graphNodesRef.current],
        edges: [...graphEdgesRef.current],
      });
      setSnackOpen(true);
      // perform delete
      actuallyDeleteNode(nodeId);
    },
    [actuallyDeleteNode, isArchitectureMode],
  );

  // Delete selected edges via keyboard/backspace is automatic if you enable deleteKeyCode,
  // but add this as well so we can snapshot for undo when edges are deleted via UI:
  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      if (isArchitectureMode) return;
      setUndoStack({
        nodes: [...graphNodesRef.current],
        edges: [...graphEdgesRef.current],
      });
      setSnackOpen(true);
      setEdges((eds) => eds.filter((e) => !deleted.some((d) => d.id === e.id)));
    },
    [setEdges, isArchitectureMode],
  );

  // Optional: onNodesDelete for consistency (if you allow multi-select deletions)
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      if (isArchitectureMode) return;
      setUndoStack({
        nodes: [...graphNodesRef.current],
        edges: [...graphEdgesRef.current],
      });
      setSnackOpen(true);
      const ids = new Set(deleted.map((n) => n.id));
      setNodes((nds) => nds.filter((n) => !ids.has(n.id)));
      setEdges((eds) =>
        eds.filter((e) => !ids.has(e.source) && !ids.has(e.target)),
      );
    },
    [setNodes, setEdges, isArchitectureMode],
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
      setValidationErrorsByNode((prev) => {
        const nodeErrors = prev[nodeId];
        if (!nodeErrors?.[name]) {
          return prev;
        }

        const nextNodeErrors = { ...nodeErrors };
        delete nextNodeErrors[name];

        if (Object.keys(nextNodeErrors).length === 0) {
          const rest = { ...prev };
          delete rest[nodeId];
          return rest;
        }

        return {
          ...prev,
          [nodeId]: nextNodeErrors,
        };
      });

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
        }),
      );
    },
    [setNodes, isArchitectureMode],
  );

  const handleValidationIssuesChange = useCallback(
    (issues: IaCValidationIssue[]) => {
      setValidationErrorsByNode(buildValidationErrorMap(issues));

      if (issues.length === 0) {
        return;
      }

      const affectedNodeIds = new Set(issues.map((issue) => issue.nodeId));
      setNodes((nds) =>
        nds.map((node) =>
          affectedNodeIds.has(node.id)
            ? {
                ...node,
                data: {
                  ...node.data,
                  isExpanded: true,
                },
              }
            : node,
        ),
      );
    },
    [setNodes],
  );

  const handleReconciliationChange = useCallback(
    (result: ReconciliationResult | null) => {
      setDriftByNode(buildDriftMap(result?.findings ?? []));
    },
    [],
  );

  const handleConfirmDraftReplace = useCallback(() => {
    if (!pendingMaestroDraft) {
      setReplaceDraftDialogOpen(false);
      return;
    }

    applyMaestroDraft(pendingMaestroDraft).catch((error) => {
      console.error("Failed to replace canvas with Maestro draft:", error);
    });
  }, [applyMaestroDraft, pendingMaestroDraft]);

  const handleCancelDraftReplace = useCallback(() => {
    setPendingMaestroDraft(null);
    setReplaceDraftDialogOpen(false);
  }, []);

  const handleDismissMaestroReviewDraftBanner = useCallback(() => {
    setIsMaestroReviewDraftBannerDismissed(true);
  }, []);

  // Handler for when orchestrator is successfully saved
  const handleOrchestrationSaved = useCallback(
    (orchestratorId: string) => {
      setCurrentOrchestratorId(orchestratorId);
      void dispatch(fetchOrchestratorById(orchestratorId));

      const currentSnapshot = buildCurrentCanvasSnapshot();
      if (currentSnapshot) {
        setBaselineSnapshot(currentSnapshot);
      }

      if (template_id === "new") {
        navigate(`/orchestrator/${orchestratorId}?template_type=custom`, {
          replace: true,
        });
      }

      if (maestroReviewDraft?.sessionId) {
        void dispatch(
          updateSession({
            id: maestroReviewDraft.sessionId,
            updates: {
              orchestratorId,
              status: "active",
            },
          }),
        )
          .unwrap()
          .catch((error) => {
            console.error("Failed to sync Maestro session after save:", error);
          });
      }

      setMaestroReviewDraft(null);
      setPendingMaestroDraft(null);
      setReplaceDraftDialogOpen(false);
    },
    [
      buildCurrentCanvasSnapshot,
      dispatch,
      maestroReviewDraft,
      navigate,
      template_id,
    ],
  );

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      if (isArchitectureMode) return;
      onNodesChange(changes);
    },
    [isArchitectureMode, onNodesChange],
  );

  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      if (isArchitectureMode) return;
      onEdgesChange(changes);
    },
    [isArchitectureMode, onEdgesChange],
  );

  // Inject helpers for DynamicForm (dynamic options + dropdown→edge sync)
  const nodeTypes = useMemo(
    () => ({
      customNode: CustomNode,
      architectureNode: ArchitectureNode,
    }),
    [],
  );

  const edgeTypes = useMemo(
    () => ({
      animatedGradient: AnimatedGradientEdge,
    }),
    [],
  );

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
              getAllNodes,
              // Adapter so child components can call (bind, newSourceId)
              onLinkFieldChange: (
                bind: string,
                newSourceId: string,
                context?: { objectSnapshot?: Record<string, any> },
              ) =>
                onLinkFieldChange({ nodeId: n.id, bind, newSourceId, context }),
              onValuesChange: (name: string, value: any) =>
                onValuesChange(n.id, name, value),
              onCloneNode,
              onDeleteNode,
            },
            __viewMode: isArchitectureMode ? "architecture" : "detailed",
            __validationErrors: validationErrorsByNode[n.id],
            __driftStatus: driftByNode[n.id]?.status,
            __driftFindings: driftByNode[n.id] ? [driftByNode[n.id]] : undefined,
          },
        };
      }),
    [
      nodes,
      getAllNodes,
      isArchitectureMode,
      onLinkFieldChange,
      onValuesChange,
      onCloneNode,
      onDeleteNode,
      validationErrorsByNode,
      driftByNode,
    ],
  );

  return (
    <Box className={styles.editorShell}>
      {!isViewMode && templateInfo?.cloud && (
        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          cloudProvider={templateInfo.cloud}
        />
      )}
      <Box
        className={styles.canvasSurface}
        sx={{
          flexGrow: 1,
          height: "100%",
          minWidth: 0,
          width:
            !isViewMode && sidebarOpen
              ? `calc(100% - ${drawerWidth}px)`
              : "100%",
          transition: "width 0.3s ease",
        }}
        data-tour="orchestrator-canvas"
        position="relative"
      >
        {isRouteLoading && <RouteLoadingOverlay />}
        <ReactFlow
          nodes={nodesWithHelpers}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={isViewMode ? undefined : onConnect}
          colorMode={theme.palette.mode}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          className={styles.reactFlowSurface}
          proOptions={{ hideAttribution: true }}
          onDrop={isViewMode ? undefined : onDrop}
          onDragOver={isViewMode ? undefined : onDragOver}
          onEdgesDelete={isViewMode ? undefined : onEdgesDelete}
          onNodesDelete={isViewMode ? undefined : onNodesDelete}
          nodesDraggable={!isArchitectureMode && !isViewMode}
          nodesConnectable={!isArchitectureMode && !isViewMode}
          elementsSelectable={!isArchitectureMode && !isViewMode}
          selectionOnDrag={!isArchitectureMode && !isViewMode}
          connectionMode={ConnectionMode.Loose}
          deleteKeyCode={["Delete", "Backspace"]}
          fitView
        >
          <Panel
            position="top-left"
            className={[
              styles.canvasPanel,
              !isViewMode && templateInfo?.cloud
                ? styles.canvasPanelSidebarOffset
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Box className={styles.canvasPanelStack}>
              <TemplateInfoChips
                templateInfo={templateInfo}
                isViewMode={isViewMode}
                onOpenInit={() => setInitOpen(true)}
              />
              {maestroReviewDraft &&
                !isViewMode &&
                !isMaestroReviewDraftBannerDismissed && (
                  <MaestroDraftBanner
                    draft={maestroReviewDraft}
                    onDismiss={handleDismissMaestroReviewDraftBanner}
                  />
                )}
            </Box>
          </Panel>
          <Panel position="top-right" className={styles.canvasPanel}>
            <Box className={styles.canvasCommandPanel}>
              {!isViewMode && (
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
                  onValidationIssuesChange={handleValidationIssuesChange}
                  onReconciliationChange={handleReconciliationChange}
                  autoSaveEnabled={autoSaveEnabled}
                  onAutoSaveEnabledChange={setAutoSaveEnabled}
                  policyScan={policyScan}
                  onPolicyScanChange={setPolicyScan}
                />
              )}
            </Box>
          </Panel>

          <Background color="var(--product-line-subtle)" gap={24} size={1} />
          <Controls
            className={styles.flowControls}
            onFitView={() =>
              getLayoutElements({
                "elk.algorithm": "layered",
                "elk.direction": "RIGHT",
              })
            }
          />
          <MiniMap
            className={styles.flowMiniMap}
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
        </ReactFlow>
        {!isRouteLoading &&
          !initOpen &&
          !isViewMode &&
          nodes.length === 0 && <EmptyCanvasState />}
      </Box>
      <InitPopup
        open={initOpen}
        templateInfo={templateInfo}
        setTemplateInfo={setTemplateInfo}
        onClose={() => setInitOpen(false)}
        onBackToHome={
          template_id === "new"
            ? () => navigate("/home", { replace: true })
            : undefined
        }
        onSubmit={handleInitSubmit}
      />

      <Dialog
        open={replaceDraftDialogOpen}
        onClose={handleCancelDraftReplace}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Replace Unsaved Changes?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 1 }}>
            You have unsaved canvas edits. Loading the new Maestro draft will
            replace those local changes.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDraftReplace}>
            Keep Current Canvas
          </Button>
          <Button
            onClick={handleConfirmDraftReplace}
            variant="contained"
            color="warning"
          >
            Load Maestro Draft
          </Button>
        </DialogActions>
      </Dialog>

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
