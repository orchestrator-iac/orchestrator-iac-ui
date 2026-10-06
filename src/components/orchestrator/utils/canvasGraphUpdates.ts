import type { Edge, Node } from "@xyflow/react";

const getLinkEdgeSignature = (edge: Edge): string =>
  [
    edge.source,
    edge.target,
    edge.data?.kind ?? "",
    edge.data?.bindKey ?? "",
  ].join("\u0000");

export const buildIncomingEdgesByTarget = (
  edges: Edge[],
): Map<string, Edge[]> => {
  const incomingEdgesByTarget = new Map<string, Edge[]>();
  for (const edge of edges) {
    const incoming = incomingEdgesByTarget.get(edge.target);
    if (incoming) {
      incoming.push(edge);
    } else {
      incomingEdgesByTarget.set(edge.target, [edge]);
    }
  }
  return incomingEdgesByTarget;
};

export const getChangedEdgeTargetIds = (
  previousEdges: Edge[],
  nextEdges: Edge[],
): Set<string> => {
  const previousById = new Map(
    previousEdges.map((edge) => [edge.id, getLinkEdgeSignature(edge)]),
  );
  const nextById = new Map(
    nextEdges.map((edge) => [edge.id, getLinkEdgeSignature(edge)]),
  );
  const previousEdgesById = new Map(
    previousEdges.map((edge) => [edge.id, edge]),
  );
  const nextEdgesById = new Map(nextEdges.map((edge) => [edge.id, edge]));
  const changedTargetIds = new Set<string>();

  for (const [edgeId, nextSignature] of nextById) {
    if (previousById.get(edgeId) !== nextSignature) {
      const previousEdge = previousEdgesById.get(edgeId);
      const nextEdge = nextEdgesById.get(edgeId);
      if (previousEdge) changedTargetIds.add(previousEdge.target);
      if (nextEdge) changedTargetIds.add(nextEdge.target);
    }
  }

  for (const [edgeId, previousSignature] of previousById) {
    if (!nextById.has(edgeId) || nextById.get(edgeId) !== previousSignature) {
      const previousEdge = previousEdgesById.get(edgeId);
      if (previousEdge) changedTargetIds.add(previousEdge.target);
    }
  }

  return changedTargetIds;
};

export const updateNodeById = (
  nodes: Node[],
  nodeId: string,
  update: (node: Node) => Node,
): Node[] => {
  const nodeIndex = nodes.findIndex((node) => node.id === nodeId);
  if (nodeIndex < 0) return nodes;

  const currentNode = nodes[nodeIndex];
  const nextNode = update(currentNode);
  if (nextNode === currentNode) return nodes;

  const nextNodes = [...nodes];
  nextNodes[nodeIndex] = nextNode;
  return nextNodes;
};

export const updateNodesByIds = (
  nodes: Node[],
  nodeIds: Iterable<string>,
  update: (node: Node) => Node,
): Node[] => {
  let nextNodes: Node[] | null = null;

  for (const nodeId of nodeIds) {
    const currentNodes = nextNodes ?? nodes;
    const nodeIndex = currentNodes.findIndex((node) => node.id === nodeId);
    if (nodeIndex < 0) continue;

    const currentNode = currentNodes[nodeIndex];
    const nextNode = update(currentNode);
    if (nextNode === currentNode) continue;

    if (!nextNodes) nextNodes = [...nodes];
    nextNodes[nodeIndex] = nextNode;
  }

  return nextNodes ?? nodes;
};
