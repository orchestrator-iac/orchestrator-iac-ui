import type { Edge, Node } from "@xyflow/react";

type Data = Record<string, unknown>;
const record = (value: unknown): Data =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Data)
    : {};

// Apply catalog metadata, retaining fields changed since the shell was painted.
function mergeData(current: Data, initial: Data, hydrated: Data): Data {
  const next = { ...hydrated };
  for (const key of Object.keys(current)) {
    if (!(key in initial) || !Object.is(current[key], initial[key])) {
      next[key] = current[key];
    }
  }
  for (const key of Object.keys(initial)) {
    if (!(key in current)) delete next[key];
  }
  return next;
}

export function mergeHydratedNodes(
  current: Node[],
  initial: Node[],
  hydrated: Node[],
): Node[] {
  const initialById = new Map(initial.map((node) => [node.id, node]));
  const hydratedById = new Map(hydrated.map((node) => [node.id, node]));
  return current.map((node) => {
    const before = initialById.get(node.id);
    const loaded = hydratedById.get(node.id);
    if (
      !before ||
      !loaded ||
      node.type !== before.type ||
      node.data.__configId !== before.data.__configId ||
      node.data.__nodeType !== before.data.__nodeType
    )
      return node;
    const data = mergeData(node.data, before.data, loaded.data);
    data.header = mergeData(
      record(node.data.header),
      record(before.data.header),
      record(loaded.data.header),
    );
    return { ...node, data };
  });
}

export function mergeHydratedEdges(
  current: Edge[],
  initial: Edge[],
  hydrated: Edge[],
): Edge[] {
  const initialById = new Map(initial.map((edge) => [edge.id, edge]));
  const hydratedById = new Map(hydrated.map((edge) => [edge.id, edge]));
  return current.map((edge) => {
    const before = initialById.get(edge.id);
    const loaded = hydratedById.get(edge.id);
    if (
      !before ||
      !loaded ||
      edge.source !== before.source ||
      edge.target !== before.target
    )
      return edge;
    return {
      ...edge,
      data: mergeData(edge.data ?? {}, before.data ?? {}, loaded.data ?? {}),
    };
  });
}
