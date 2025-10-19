export const getFriendlyId = (
  nodeId: string,
  nodeType?: string | null,
  allNodes?: Array<{ id: string; data?: any }>
): string => {
  if (!nodeType || !Array.isArray(allNodes) || allNodes.length === 0) {
    return "";
  }

  const sameTypeNodes = allNodes.filter((node) => node?.data?.__nodeType === nodeType);
  const index = sameTypeNodes.findIndex((node) => node?.id === nodeId);

  if (index < 0) {
    return "";
  }

  const ordinal = index + 1;
  return `${nodeType}-${String(ordinal).padStart(4, "0")}`;
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
