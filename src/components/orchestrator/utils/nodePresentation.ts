export const getFriendlyId = (
  nodeId: string,
  nodeType?: string | null,
  allNodes?: Array<{ id: string; data?: any; type?: string }>
): string => {
  if (!Array.isArray(allNodes) || allNodes.length === 0) {
    return "";
  }

  const targetNode = allNodes.find((node) => node?.id === nodeId);
  const persistedFriendlyId =
    (targetNode?.data?.friendlyId as string | undefined) ??
    (targetNode?.data?.friendly_id as string | undefined);
  if (persistedFriendlyId) {
    return persistedFriendlyId;
  }

  const effectiveType =
    targetNode?.data?.__nodeType ?? nodeType ?? targetNode?.type;
  if (!effectiveType) {
    return "";
  }

  const sameTypeNodes = allNodes.filter((node) => {
  const candidateType = node?.data?.__nodeType ?? node?.type;
    return candidateType === effectiveType;
  });

  const index = sameTypeNodes.findIndex((node) => node?.id === nodeId);
  if (index < 0) {
    return "";
  }

  const ordinal = index + 1;
  return `${effectiveType}-${String(ordinal).padStart(4, "0")}`;
};

export const resolveValueByPath = (
  source: Record<string, any> | undefined,
  path?: string | null
): any => {
  if (!source || !path) {
    return undefined;
  }

  const segments = path.split(".").filter(Boolean);
  if (segments.length === 0) {
    return undefined;
  }

  return segments.reduce<any>((acc, segment) => {
    if (acc == null) {
      return undefined;
    }

    if (typeof acc !== "object") {
      return undefined;
    }

    return acc[segment];
  }, source);
};
